import json
import re
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PUBLICATIONS = json.loads((ROOT / "research_staff" / "publications.json").read_text())
PEOPLE = json.loads((ROOT / "site" / "data" / "people.json").read_text())


def ascii_text(value):
    return unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode()


def slug(value):
    return re.sub(r"^-|-$", "", re.sub(r"[^a-z0-9]+", "-", ascii_text(value).lower()))


def title_key(value):
    return re.sub(r"[^a-z0-9]+", " ", ascii_text(value).lower()).strip()


def section(item):
    if item.get("category") == "Journal article":
        return "journal"
    venue = item.get("venue", "").lower()
    if (
        item.get("type") in {"preprint", "report"}
        or (item.get("sourceType") == "repository" and item.get("type") == "article")
        or any(term in venue for term in ("working paper", "discussion paper", "repec", "ssrn", "national bureau of economic research"))
    ):
        return "working"
    return "other"


def compact(item):
    return {
        "id": item["id"],
        "title": item["title"],
        "year": item.get("year", 0),
        "date": item.get("date", ""),
        "authors": item.get("authors", []),
        "venue": item.get("venue", ""),
        "url": item.get("url", ""),
        "type": item.get("type", ""),
    }


pages = []
index = []
for person in PEOPLE:
    candidates = [item for item in PUBLICATIONS if person["name"] in item.get("staff", [])]
    deduplicated = {}
    priority = {"journal": 3, "working": 2, "other": 1}
    for item in candidates:
        key = title_key(item["title"])
        item_section = section(item)
        score = (priority[item_section], bool(item.get("doi")), item.get("date", ""))
        if key not in deduplicated or score > deduplicated[key][0]:
            deduplicated[key] = (score, item_section, item)

    grouped = {"journal": [], "working": [], "other": []}
    for _, item_section, item in deduplicated.values():
        grouped[item_section].append(compact(item))
    for items in grouped.values():
        items.sort(key=lambda item: (item["date"], item["year"], item["title"].lower()), reverse=True)

    total = sum(len(items) for items in grouped.values())
    if not total:
        continue
    person_slug = slug(person["name"])
    pages.append({
        "slug": person_slug,
        "name": person["name"],
        "title": person.get("title", ""),
        "profileUrl": person.get("profileUrl", ""),
        "email": person.get("email", ""),
        "publications": grouped,
    })
    index.append({"name": person["name"], "slug": person_slug, "count": total})

(ROOT / "site" / "data" / "person-publications.json").write_text(json.dumps(pages, indent=2, ensure_ascii=False) + "\n")
(ROOT / "site" / "data" / "people-publication-index.json").write_text(json.dumps(index, indent=2, ensure_ascii=False) + "\n")
print(json.dumps({"staffPages": len(pages), "publications": sum(item["count"] for item in index)}))
