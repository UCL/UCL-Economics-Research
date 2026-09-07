#!/usr/bin/env python3
"""Turn browser-rendered UCL Profile publication cards into structured data."""

import json
from pathlib import Path
import re
import sys
import unicodedata


ROOT = Path(sys.argv[1] if len(sys.argv) > 1 else ".").resolve()
CAPTURE = ROOT / "research_staff" / "ucl_publications_capture.json"
STAFF = ROOT / "research_staff" / "staff.json"
OUTPUT = ROOT / "research_staff" / "ucl_profile_publications.json"


def ascii_text(value):
    return unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode()


def key(value):
    return re.sub(r"[^a-z0-9]+", " ", ascii_text(value).lower()).strip()


def slug(value):
    return re.sub(r"^-|-$", "", re.sub(r"[^a-z0-9]+", "-", key(value)))


def own_author(author, staff_name):
    author_key = key(author).split()
    name_key = key(staff_name).split()
    if not author_key or not name_key:
        return False
    initial = name_key[0][0]
    surname_tokens = set(name_key[1:]) - {"de", "da", "do", "dos", "van", "neto", "almeida"}
    return initial in "".join(author_key) and bool(surname_tokens.intersection(author_key))


def parse_card(staff_name, card):
    lines = [line.strip() for line in card.get("text", "").splitlines() if line.strip()]
    if len(lines) < 2:
        return None
    output_type, title = lines[0], lines[1]
    metadata = lines[2] if len(lines) > 2 else ""
    # UCL's rendered card often concatenates the year and venue (for example,
    # "2 Jan 2019MIT"), so word boundaries are not reliable here.
    year_match = re.search(r"(?<!\d)(?:19|20)\d{2}(?!\d)", metadata)
    year = int(year_match.group(0)) if year_match else 0
    date_match = re.match(r"((?:\d{1,2}\s+)?[A-Za-z]{3,9}\s+\d{4}|\d{4})", metadata)
    date_display = date_match.group(1) if date_match else ""
    venue = metadata[len(date_display):].strip(" ◆") if date_display else metadata
    authors = []
    if "Co-authors:" in lines:
        index = lines.index("Co-authors:")
        if index + 1 < len(lines):
            authors = [item.strip() for item in lines[index + 1].split(",") if item.strip()]
    authors = [staff_name if own_author(author, staff_name) else author for author in authors]
    if not any(key(author) == key(staff_name) for author in authors):
        authors.append(staff_name)
    links = card.get("links", [])
    doi_link = next((item.get("href", "") for item in links if "doi.org/" in item.get("href", "")), "")
    doi = re.sub(r"^https?://(?:dx\.)?doi\.org/", "", doi_link, flags=re.I)
    title_url = next((item.get("href", "") for item in links if key(item.get("text", "")) == key(title)), "")
    info_url = next((item.get("href", "") for item in links if item.get("text", "").upper() == "VIEW MORE INFO"), "")
    url = doi_link or title_url or info_url
    upper_type = output_type.upper()
    category = "Journal article" if upper_type == "JOURNAL ARTICLE" else "Book" if upper_type == "BOOK" else "Other"
    section = "journal" if category == "Journal article" else "working" if ("WORKING" in upper_type or "PREPRINT" in upper_type) else "other"
    return {
        "id": slug(doi or f"{staff_name}-{title}-{year}"),
        "staffName": staff_name,
        "outputType": output_type.title(),
        "title": title,
        "year": year,
        "dateDisplay": date_display,
        "authors": authors,
        "venue": venue,
        "doi": doi,
        "url": url,
        "category": category,
        "section": section,
        "source": "UCL Profiles",
    }


captures = json.loads(CAPTURE.read_text())
staff = json.loads(STAFF.read_text())
staff_by_name = {item["name"]: item for item in staff}
records = []
seen = set()
for page in captures:
    for card in page.get("records", []):
        record = parse_card(page["staffName"], card)
        if not record:
            continue
        identity = (record["staffName"], key(record["title"]), record["year"], record["outputType"])
        if identity in seen:
            continue
        seen.add(identity)
        member = staff_by_name.get(record["staffName"], {})
        record["primaryField"] = member.get("primaryField", "")
        records.append(record)

records.sort(key=lambda item: (item["staffName"], -item["year"], item["title"].lower()))
OUTPUT.write_text(json.dumps(records, indent=2, ensure_ascii=False) + "\n")
print(json.dumps({
    "records": len(records),
    "staffWithPublications": len({item["staffName"] for item in records}),
    "journalArticles": sum(item["category"] == "Journal article" for item in records),
    "books": sum(item["category"] == "Book" for item in records),
    "workingPapersInProfiles": sum(item["section"] == "working" for item in records),
}, indent=2))
