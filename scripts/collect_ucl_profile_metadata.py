#!/usr/bin/env python3
"""Collect public profile metadata from the UCL Profiles API."""

from concurrent.futures import ThreadPoolExecutor, as_completed
import json
from pathlib import Path
import re
import sys
from urllib.request import Request, urlopen


ROOT = Path(sys.argv[1] if len(sys.argv) > 1 else ".").resolve()
STAFF_PATH = ROOT / "research_staff" / "staff.json"
RAW_PATH = ROOT / "research_staff" / "ucl_profile_metadata.json"


def fetch(staff):
    profile_id = staff.get("uclProfileId")
    if not profile_id:
        return staff["name"], None, "No UCL Profiles ID"
    url = f"https://profiles.ucl.ac.uk/api/users/{profile_id}"
    try:
        request = Request(url, headers={"User-Agent": "UCL Economics Research prototype/1.0"})
        with urlopen(request, timeout=30) as response:
            return staff["name"], json.load(response), ""
    except Exception as exc:
        return staff["name"], None, f"{type(exc).__name__}: {exc}"


def clean_text(value):
    if not value:
        return ""
    if isinstance(value, dict):
        value = value.get("htmlStripped") or value.get("value") or ""
    return re.sub(r"\s+", " ", str(value)).strip()


def choose_webpage(websites):
    excluded = ("linkedin.com", "twitter.com", "x.com/", "facebook.com", "instagram.com",
                "scholar.google.", "maps.app.goo.gl", "profiles.ucl.ac.uk", "sharepoint.com")
    preferred = []
    for item in websites or []:
        url = str(item.get("url") or "").strip()
        label = str(item.get("typeDisplayName") or "").strip().lower()
        if not url or any(domain in url.lower() for domain in excluded):
            continue
        score = 0 if any(word in label for word in ("personal", "homepage", "website", "research")) else 1
        preferred.append((score, url))
    return sorted(preferred)[0][1] if preferred else ""


staff = json.loads(STAFF_PATH.read_text())
raw = {}
errors = {}
with ThreadPoolExecutor(max_workers=8) as pool:
    futures = [pool.submit(fetch, member) for member in staff]
    for future in as_completed(futures):
        name, record, error = future.result()
        if record:
            raw[name] = record
        if error:
            errors[name] = error

for member in staff:
    record = raw.get(member["name"])
    if not record:
        member["uclProfileStatus"] = errors.get(member["name"], "Profile unavailable")
        continue
    member["biography"] = clean_text(record.get("tabSummaryAbout"))
    member["personalUrl"] = choose_webpage(record.get("personalWebsites"))
    explicit_tags = [str(item.get("value") or "").strip() for item in (record.get("tags") or {}).get("explicit", [])]
    implicit_tags = [str(item).strip() for item in (record.get("tags") or {}).get("implicit", [])]
    member["researchKeywords"] = list(dict.fromkeys(item for item in explicit_tags + implicit_tags if item))
    member["researchSummary"] = clean_text(record.get("tabSummaryGrants"))
    member["teaching"] = clean_text(record.get("tabSummaryTeachingActivities"))
    member["uclProfileUpdated"] = record.get("updatedWhen", "")
    member["uclProfileStatus"] = "Downloaded"

STAFF_PATH.write_text(json.dumps(staff, indent=2, ensure_ascii=False) + "\n")
RAW_PATH.write_text(json.dumps(raw, indent=2, ensure_ascii=False) + "\n")
print(json.dumps({"staff": len(staff), "profilesDownloaded": len(raw), "unavailable": len(errors), "errors": errors}, indent=2))
