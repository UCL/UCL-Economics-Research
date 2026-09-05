import json
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "research_staff" / "publications.json"
STAFF_SOURCE = ROOT / "research_staff" / "staff.json"
VALID_FIELDS = {"Applied", "Econometrics", "Theory", "Macroeconomics", "Finance"}
FIELD_ORDER = ["Applied", "Econometrics", "Theory", "Macroeconomics", "Finance"]

staff = json.loads(STAFF_SOURCE.read_text())
primary_field_by_name = {person["name"]: person.get("primaryField", "UNSURE") for person in staff}
publications = json.loads(SOURCE.read_text())

for publication in publications:
    ucl_authors = publication.get("staff", [])
    author_fields = [primary_field_by_name.get(name, "UNSURE") for name in ucl_authors]
    fields = [field for field in FIELD_ORDER if field in set(author_fields)]
    unresolved_authors = [
        name for name in ucl_authors
        if primary_field_by_name.get(name, "UNSURE") not in VALID_FIELDS
    ]
    publication["paperPrimaryField"] = fields[0] if len(fields) == 1 else "; ".join(fields) if fields else "UNSURE"
    publication["paperSecondaryField"] = ""
    publication["paperFields"] = fields
    publication["classificationConfidence"] = "High" if fields and not unresolved_authors else "Low"
    publication["classificationSource"] = "Primary field of UCL author(s)"
    publication["classificationNeedsReview"] = not fields or bool(unresolved_authors)
    publication["classificationScores"] = dict(Counter(field for field in author_fields if field in VALID_FIELDS))
    publication["classificationUclAuthors"] = ucl_authors
    publication["classificationUnresolvedAuthors"] = unresolved_authors

pretty = json.dumps(publications, indent=2, ensure_ascii=False) + "\n"
compact = json.dumps(publications, separators=(",", ":"), ensure_ascii=False) + "\n"
(ROOT / "research_staff" / "publications.json").write_text(pretty)
(ROOT / "site" / "data" / "publications.json").write_text(pretty)
(ROOT / "site" / "public" / "publications.json").write_text(compact)
print(json.dumps({"publications": len(publications)}))
