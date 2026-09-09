#!/usr/bin/env python3
"""Build public publication datasets from UCL Profiles (authoritative source)."""

import json
from pathlib import Path
import re
import sys
import unicodedata

ROOT = Path(sys.argv[1] if len(sys.argv) > 1 else ".").resolve()
RESEARCH = ROOT / "research_staff"
SITE_DATA = ROOT / "site" / "data"
SITE_PUBLIC = ROOT / "site" / "public"


def norm(value):
    value = unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode().lower()
    return re.sub(r"[^a-z0-9]+", " ", value).strip()


def slug(value):
    return re.sub(r"[^a-z0-9]+", "-", norm(value)).strip("-")


PUBLISHERS = re.compile(
    r"(?:Wiley(?:-Blackwell)?|Elsevier(?: BV| Science SA)?|Oxford University Press(?: \(OUP\))?|"
    r"Cambridge University Press(?: \(CUP\))?|University of Chicago Press|"
    r"Massachusetts Institute of Technology Press \(MIT Press\)|MIT Press|"
    r"American Economic Association|AMER ECONOMIC ASSOC|American Statistical Association|"
    r"American Medical Association|American Library Association|Econometric Society|"
    r"Association of the International Journal of Central Banking|Brookings Institution Press|"
    r"University of Wisconsin Press|UNIV CHICAGO PRESS|OXFORD UNIV PRESS|CAMBRIDGE UNIV PRESS|"
    r"MIT Press - Journals|John Wiley and Sons|Berkely Economic Press|"
    r"Springer(?: Nature| Verlag)?|SAGE Publications?|Taylor\s*&\s*Francis|Routledge|"
    r"Palgrave Macmillan|Emerald(?: Group Publishing)?)$",
    re.I,
)


def journal_name(venue):
    """Remove volume, pages, and publisher text concatenated by UCL's card view."""
    value = (venue or "").strip()
    value = PUBLISHERS.sub("", value).strip()
    # Volume metadata begins with a digit immediately after the journal title.
    value = re.sub(r"(?<=[A-Za-z)])\d+(?:\([^)]*\))?(?::.*)?$", "", value).strip()
    # Some records only append a page count rather than a volume number.
    value = re.sub(r"\s*\d+\s+pages?$", "", value, flags=re.I).strip()
    return value


staff = json.loads((RESEARCH / "staff.json").read_text())
profile_records = json.loads((RESEARCH / "ucl_profile_publications.json").read_text())
staff_by_name = {person["name"]: person for person in staff}

# Editorial field assignments that intentionally differ from a staff member's
# primary field. Key these by DOI so regenerating the site preserves the review.
publication_field_overrides = {
    norm("10.1111/obes.70001"): ["Applied"],
}

# The People page uses the same reviewed staff data as the workbook.
(SITE_DATA / "people.json").write_text(json.dumps(staff, indent=2, ensure_ascii=False) + "\n")

# Combine duplicate records that occur on more than one UCL author's profile.
combined = {}
for record in profile_records:
    identity = ("doi", norm(record["doi"])) if record.get("doi") else (
        "title", norm(record["title"]), record.get("year", 0), record.get("outputType", "")
    )
    if identity not in combined:
        combined[identity] = {**record, "staff": [], "paperFields": [], "authors": list(record.get("authors", []))}
    item = combined[identity]
    if record["staffName"] not in item["staff"]:
        item["staff"].append(record["staffName"])
    field = staff_by_name.get(record["staffName"], {}).get("primaryField", "")
    if field and field not in item["paperFields"]:
        item["paperFields"].append(field)
    for author in record.get("authors", []):
        if norm(author) not in {norm(value) for value in item["authors"]}:
            item["authors"].append(author)

publications = []
for item in combined.values():
    if item["category"] not in {"Journal article", "Book"}:
        continue
    paper_fields = publication_field_overrides.get(norm(item.get("doi", "")), item["paperFields"])
    publications.append({
        "id": item["id"], "title": item["title"], "year": item.get("year", 0),
        "date": item.get("dateDisplay", ""), "authors": item.get("authors", []),
        "venue": journal_name(item.get("venue", "")), "doi": item.get("doi", ""), "url": item.get("url", ""),
        "type": item.get("outputType", ""), "sourceType": "UCL Profiles", "topicField": "",
        "isEconomics": True, "category": item["category"], "staff": sorted(item["staff"]),
        "fields": sorted(paper_fields), "paperFields": sorted(paper_fields),
    })
publications.sort(key=lambda p: (-p["year"], p["title"].lower()))
(SITE_PUBLIC / "publications.json").write_text(json.dumps(publications, indent=2, ensure_ascii=False) + "\n")

# Individual pages deliberately use UCL Profile categories only. Personal-site
# candidates remain in the review workbook until an editor approves them.
records_by_staff = {}
for record in profile_records:
    records_by_staff.setdefault(record["staffName"], []).append(record)

pages = []
index = []
for person in staff:
    records = records_by_staff.get(person["name"], [])
    if not records:
        continue
    groups = {"journal": [], "working": [], "other": []}
    seen = set()
    for record in sorted(records, key=lambda p: (-p.get("year", 0), p["title"].lower())):
        identity = (norm(record["title"]), record.get("year", 0), record.get("section", "other"))
        if identity in seen:
            continue
        seen.add(identity)
        group = record.get("section", "other")
        group = group if group in groups else "other"
        groups[group].append({
            "id": record["id"], "title": record["title"], "year": record.get("year", 0),
            "date": record.get("dateDisplay", ""), "authors": record.get("authors", []),
            "venue": journal_name(record.get("venue", "")) if group == "journal" else record.get("venue", ""),
            "url": record.get("url", ""), "type": record.get("outputType", ""),
        })
    person_slug = slug(person["name"])
    count = sum(len(values) for values in groups.values())
    pages.append({"slug": person_slug, "name": person["name"], "title": person["title"],
                  "profileUrl": person.get("profileUrl", ""), "email": person["email"], "publications": groups})
    index.append({"name": person["name"], "slug": person_slug, "count": count})

(SITE_DATA / "person-publications.json").write_text(json.dumps(pages, indent=2, ensure_ascii=False) + "\n")
(SITE_DATA / "people-publication-index.json").write_text(json.dumps(index, indent=2, ensure_ascii=False) + "\n")
print(json.dumps({"mainPublications": len(publications), "staffPublicationPages": len(pages),
                  "individualPublicationRecords": sum(item["count"] for item in index)}, indent=2))
