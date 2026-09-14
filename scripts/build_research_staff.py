import json
import re
import time
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "research_staff"
SITE_DATA = ROOT / "site" / "data"

# Current directory entries from the UCL Economics academic and teaching staff page.
STAFF = [
    ("Klaus Adam", "k.adam@ucl.ac.uk", "https://centreforfinance.org/peopledetail.htm?person=398", None),
    ("Beatriz Armendariz", "b.armendariz@ucl.ac.uk", "https://profiles.ucl.ac.uk/1738-beatriz-armendariz", 1738),
    ("Mark Armstrong", "mark-armstrong@ucl.ac.uk", "https://profiles.ucl.ac.uk/4914-mark-armstrong", 4914),
    ("Thanos Athanasopoulos", "thanos.athanasopoulos@ucl.ac.uk", "", None),
    ("Hadar Avivi", "h.avivi@ucl.ac.uk", "https://profiles.ucl.ac.uk/99386-hadar-avivi", 99386),
    ("Saleem Bahaj", "s.bahaj@ucl.ac.uk", "https://profiles.ucl.ac.uk/84014-saleem-bahaj", 84014),
    ("Richard Blundell", "r.blundell@ucl.ac.uk", "https://profiles.ucl.ac.uk/8333-richard-blundell", 8333),
    ("Wendy Carlin", "w.carlin@ucl.ac.uk", "https://profiles.ucl.ac.uk/8335-wendy-carlin", 8335),
    ("Pedro Carneiro", "p.carneiro@ucl.ac.uk", "https://profiles.ucl.ac.uk/3797-pedro-carneiro", 3797),
    ("Parama Chaudhury", "p.chaudhury@ucl.ac.uk", "https://profiles.ucl.ac.uk/32067-parama-chaudhury", 32067),
    ("Andrew Chesher", "andrew.chesher@ucl.ac.uk", "https://profiles.ucl.ac.uk/5419-andrew-chesher", 5419),
    ("Gabriella Conti", "gabriella.conti@ucl.ac.uk", "https://profiles.ucl.ac.uk/41886-gabriella-conti", 41886),
    ("Lucas Conwell", "l.conwell@ucl.ac.uk", "https://profiles.ucl.ac.uk/93848-lucas-conwell", 93848),
    ("Adrien Couturier", "adrien.couturier@ucl.ac.uk", "https://profiles.ucl.ac.uk/108837-adrien-couturier", 108837),
    ("Martin Cripps", "m.cripps@ucl.ac.uk", "https://profiles.ucl.ac.uk/2191-martin-cripps", 2191),
    ("Wei Cui", "w.cui@ucl.ac.uk", "https://profiles.ucl.ac.uk/39679-wei-cui", 39679),
    ("Aureo De Paula Neto", "a.paula@ucl.ac.uk", "https://profiles.ucl.ac.uk/32107-aureo-de-paula", 32107),
    ("Benjamin Deaner", "b.deaner@ucl.ac.uk", "https://profiles.ucl.ac.uk/89558-benjamin-deaner", 89558),
    ("Christian Dustmann", "c.dustmann@ucl.ac.uk", "https://profiles.ucl.ac.uk/10888-christian-dustmann", 10888),
    ("François Gerard", "f.gerard@ucl.ac.uk", "https://profiles.ucl.ac.uk/97363-francois-gerard", 97363),
    ("Raffaella Giacomini", "r.giacomini@ucl.ac.uk", "https://profiles.ucl.ac.uk/7172-raffaella-giacomini", 7172),
    ("Duarte Goncalves Dias Da Silva", "duarte.goncalves@ucl.ac.uk", "", None),
    ("Hugh Goodacre", "h.goodacre@ucl.ac.uk", "", None),
    ("Alexander Gorbenko", "a.gorbenko@ucl.ac.uk", "https://profiles.ucl.ac.uk/77851-alex-gorbenko", 77851),
    ("Joao Granja De Almeida", "joao.granja@ucl.ac.uk", "https://profiles.ucl.ac.uk/84441-joao-granja", 84441),
    ("Antonio Guarino", "a.guarino@ucl.ac.uk", "https://profiles.ucl.ac.uk/11100-antonio-guarino", 11100),
    ("Stephen Hansen", "stephen.hansen@ucl.ac.uk", "https://profiles.ucl.ac.uk/91767-stephen-hansen", 91767),
    ("Jonas Hjort", "j.hjort@ucl.ac.uk", "https://profiles.ucl.ac.uk/87075-jonas-hjort", 87075),
    ("Philippe Jehiel", "p.jehiel@ucl.ac.uk", "https://profiles.ucl.ac.uk/5416-philippe-jehiel", 5416),
    ("Deniz Kattwinkel", "d.kattwinkel@ucl.ac.uk", "https://profiles.ucl.ac.uk/78659-deniz-kattwinkel", 78659),
    ("Dennis Kristensen", "d.kristensen@ucl.ac.uk", "https://profiles.ucl.ac.uk/32358-dennis-kristensen", 32358),
    ("Hyejin Ku", "h.ku@ucl.ac.uk", "https://profiles.ucl.ac.uk/32099-hyejin-ku", 32099),
    ("Valerie Lechene", "v.lechene@ucl.ac.uk", "https://profiles.ucl.ac.uk/4027-valerie-lechene", 4027),
    ("Daniel Lewis", "daniel.j.lewis@ucl.ac.uk", "https://profiles.ucl.ac.uk/91180-daniel-lewis", 91180),
    ("Dunli Li", "dunli.li@ucl.ac.uk", "", None),
    ("Attila Lindner", "a.lindner@ucl.ac.uk", "https://profiles.ucl.ac.uk/52122-attila-lindner", 52122),
    ("Frederic Malherbe", "f.malherbe@ucl.ac.uk", "https://profiles.ucl.ac.uk/66118-frederic-malherbe", 66118),
    ("Kalina Manova", "k.manova@ucl.ac.uk", "https://profiles.ucl.ac.uk/64670-kalina-manova", 64670),
    ("Marta Morrazoni", "m.morazzoni@ucl.ac.uk", "https://profiles.ucl.ac.uk/93847-marta-morazzoni", 93847),
    ("Ramin Nassehi", "r.nassehi@ucl.ac.uk", "https://profiles.ucl.ac.uk/64513-ramin-nassehi", 64513),
    ("Lars Nesheim", "l.nesheim@ucl.ac.uk", "https://profiles.ucl.ac.uk/1568-lars-nesheim", 1568),
    ("Marguerite Obolensky", "m.obolensky@ucl.ac.uk", "", None),
    ("Alan Olivi", "a.olivi@ucl.ac.uk", "https://profiles.ucl.ac.uk/72540-alan-olivi", 72540),
    ("Duygu Ozdemir", "d.ozdemir@ucl.ac.uk", "https://profiles.ucl.ac.uk/81608-duygu-ozdemir", 81608),
    ("Rodrigo Paiva Guimaraes", "r.guimaraes@ucl.ac.uk", "", None),
    ("Suphanit Piyapromdee", "s.piyapromdee@ucl.ac.uk", "https://profiles.ucl.ac.uk/44970-suphanit-piyapromdee", 44970),
    ("Franck Portier", "f.portier@ucl.ac.uk", "https://profiles.ucl.ac.uk/64073-franck-portier", 64073),
    ("Fabien Postel-Vinay", "f.postel-vinay@ucl.ac.uk", "https://profiles.ucl.ac.uk/40795-fabien-postelvinay", 40795),
    ("Peter Postl", "peter.postl@ucl.ac.uk", "https://profiles.ucl.ac.uk/89737-peter-postl", 89737),
    ("Ian Preston", "i.preston@ucl.ac.uk", "https://profiles.ucl.ac.uk/1371-ian-preston", 1371),
    ("Lukasz Rachel", "l.rachel@ucl.ac.uk", "https://profiles.ucl.ac.uk/83503-lukasz-rachel", 83503),
    ("Imran Rasul", "i.rasul@ucl.ac.uk", "https://profiles.ucl.ac.uk/8235-imran-rasul", 8235),
    ("Morten Ravn", "m.ravn@ucl.ac.uk", "https://profiles.ucl.ac.uk/5372-morten-ravn", 5372),
    ("Jose-Victor Rios-Rull", "j.rios-rull@ucl.ac.uk", "https://profiles.ucl.ac.uk/45092-josevictor-riosrull", 45092),
    ("Vasiliki Skreta", "v.skreta@ucl.ac.uk", "https://profiles.ucl.ac.uk/38415-vasiliki-skreta", 38415),
    ("Ran Spiegler", "r.spiegler@ucl.ac.uk", "https://profiles.ucl.ac.uk/2004-ran-spiegler", 2004),
    ("Vincent Sterk", "v.sterk@ucl.ac.uk", "https://profiles.ucl.ac.uk/31657-vincent-sterk", 31657),
    ("Liyang Sun", "liyang.sun@ucl.ac.uk", "https://profiles.ucl.ac.uk/94418-liyang-sun", 94418),
    ("Alessia Testa", "alessia.testa@ucl.ac.uk", "https://profiles.ucl.ac.uk/102591-alessia-testa", 102591),
    ("Michael Thaler", "michael.thaler@ucl.ac.uk", "https://profiles.ucl.ac.uk/90096-michael-thaler", 90096),
    ("Michela Tincani", "m.tincani@ucl.ac.uk", "https://profiles.ucl.ac.uk/36036-michela-tincani", 36036),
    ("Gabriel Ulyssea", "g.ulyssea@ucl.ac.uk", "https://profiles.ucl.ac.uk/79556-gabriel-ulyssea", 79556),
    ("Marcos Angel Vera-Hernandez", "m.vera@ucl.ac.uk", "https://profiles.ucl.ac.uk/8056-marcos-vera-hernandez", 8056),
    ("Frank Witte", "f.witte@ucl.ac.uk", "", None),
    ("Ming Yang", "m-yang@ucl.ac.uk", "https://profiles.ucl.ac.uk/77624-ming-yang", 77624),
    ("Xiao Yin", "xiao.yin@ucl.ac.uk", "https://profiles.ucl.ac.uk/93764-xiao-yin", 93764),
    ("Ji Hee Yoon", "jihee.yoon@ucl.ac.uk", "https://profiles.ucl.ac.uk/67593-ji-hee-yoon", 67593),
    ("Andrei Zeleneev", "a.zeleneev@ucl.ac.uk", "https://profiles.ucl.ac.uk/79900-andrei-zeleneev", 79900),
]

FIELD_RULES = {
    "Applied": ["applied", "labour", "labor", "development", "health", "education", "public economics", "political economy", "urban", "trade", "inequality", "environment"],
    "Econometrics": ["econometric", "causal inference", "statistics", "statistical", "machine learning", "measurement"],
    "Theory": ["theory", "game", "mechanism", "information economics", "industrial organization", "industrial organisation", "microeconomic"],
    "Macroeconomics": ["macroeconomic", "macroeconomics", "monetary", "business cycle", "growth", "international macro"],
    "Finance": ["finance", "financial", "banking", "asset pricing", "corporate"],
}

OVERRIDES = {
    "Klaus Adam": ("Macroeconomics", "Finance"),
    "Mark Armstrong": ("Theory", "Applied"),
    "Saleem Bahaj": ("Macroeconomics", "Finance"),
    "Richard Blundell": ("Applied", "Econometrics"),
    "Wendy Carlin": ("Macroeconomics", "Applied"),
    "Andrew Chesher": ("Econometrics", "Applied"),
    "Raffaella Giacomini": ("Econometrics", "Macroeconomics"),
    "Martin Cripps": ("Theory", "Applied"),
    "Alexander Gorbenko": ("Finance", "Theory"),
    "Philippe Jehiel": ("Theory", "Applied"),
    "Dennis Kristensen": ("Econometrics", "Applied"),
    "Frederic Malherbe": ("Finance", "Macroeconomics"),
    "Lars Nesheim": ("Applied", "Theory"),
    "Franck Portier": ("Macroeconomics", "Applied"),
    "Morten Ravn": ("Macroeconomics", "Applied"),
    "Jose-Victor Rios-Rull": ("Macroeconomics", "Applied"),
    "Vasiliki Skreta": ("Theory", "Finance"),
    "Ran Spiegler": ("Theory", "Applied"),
    "Vincent Sterk": ("Macroeconomics", "Applied"),
    "Liyang Sun": ("Econometrics", "Applied"),
}

HEADERS = {"User-Agent": "UCL-Economics-Research-prototype/1.0 (l.nesheim@ucl.ac.uk)"}

def get_json(url):
    for attempt in range(5):
        try:
            request = urllib.request.Request(url, headers=HEADERS)
            with urllib.request.urlopen(request, timeout=45) as response:
                return json.load(response)
        except Exception:
            if attempt == 4:
                raise
            time.sleep(1.5 * (attempt + 1))

def classify(name, profile):
    if name in OVERRIDES:
        return (*OVERRIDES[name], "Reviewed")
    text_parts = []
    for item in (profile.get("tags", {}).get("explicit", []) if profile else []):
        text_parts.append(item.get("value", ""))
    if profile:
        text_parts.append(profile.get("tabSummaryAbout", {}).get("htmlStripped", ""))
    text = " ".join(text_parts).lower()
    scores = {field: sum(text.count(term) for term in terms) for field, terms in FIELD_RULES.items()}
    ranked = sorted(scores, key=lambda field: (-scores[field], field))
    if not ranked or scores[ranked[0]] == 0:
        return "UNSURE", "UNSURE", "Needs review"
    primary = ranked[0]
    secondary = ranked[1] if len(ranked) > 1 and scores[ranked[1]] > 0 else "UNSURE"
    return primary, secondary, "Derived from UCL profile; review" if secondary == "UNSURE" else "Derived from UCL profile"

def choose_openalex_author(name, orcid):
    if orcid:
        result = get_json(f"https://api.openalex.org/authors/https://orcid.org/{orcid}")
        return result
    query = urllib.parse.quote(name)
    results = get_json(f"https://api.openalex.org/authors?search={query}&per-page=10").get("results", [])
    for author in results:
        affiliations = author.get("affiliations", [])
        if any("University College London" in affiliation.get("institution", {}).get("display_name", "") for affiliation in affiliations):
            return author
    return None

def fetch_works(author_id):
    cursor = "*"
    works = []
    while cursor:
        url = f"https://api.openalex.org/works?filter=author.id:{author_id}&per-page=200&cursor={urllib.parse.quote(cursor)}"
        page = get_json(url)
        works.extend(page.get("results", []))
        cursor = page.get("meta", {}).get("next_cursor")
        if not page.get("results"):
            break
        time.sleep(0.08)
    return works

def bib_escape(value):
    return str(value or "").replace("\\", "\\textbackslash{}").replace("{", "\\{").replace("}", "\\}")

JOURNAL_FIELDS = {
    "Econometrics": ["journal of econometrics", "econometric theory", "econometrics journal", "econometric reviews", "journal of applied econometrics", "quantitative economics"],
    "Theory": ["journal of economic theory", "theoretical economics", "games and economic behavior", "review of economic design", "social choice and welfare"],
    "Macroeconomics": ["journal of monetary economics", "american economic journal: macroeconomics", "journal of macroeconomics", "macroeconomic dynamics", "review of economic dynamics", "journal of money, credit and banking"],
    "Finance": ["journal of finance", "review of financial studies", "journal of financial economics", "journal of banking & finance", "journal of corporate finance", "review of finance"],
    "Applied": ["journal of labor economics", "journal of human resources", "journal of development economics", "journal of public economics", "journal of health economics", "health economics", "labour economics", "economics of education review", "journal of urban economics", "journal of international economics"],
}

PAPER_FIELD_TERMS = {
    "Applied": ["labor", "labour", "employment", "wage", "education", "school", "health", "development", "poverty", "inequality", "tax", "public economics", "trade", "migration", "crime", "environment", "urban", "household", "industrial organization", "industrial organisation"],
    "Econometrics": ["econometric", "identification", "estimator", "estimation", "causal inference", "instrumental variable", "difference-in-differences", "regression discontinuity", "panel data", "time series", "nonparametric", "semiparametric", "statistical inference"],
    "Theory": ["game theory", "mechanism design", "auction", "matching", "information design", "contract theory", "social choice", "equilibrium", "strategic", "decision theory", "bargaining"],
    "Macroeconomics": ["macroeconomic", "monetary policy", "inflation", "business cycle", "fiscal policy", "economic growth", "recession", "central bank", "aggregate demand", "productivity", "sovereign debt", "exchange rate"],
    "Finance": ["asset pricing", "corporate finance", "banking", "financial intermediation", "portfolio", "stock market", "bond", "credit market", "liquidity", "capital structure", "household finance", "financial market"],
}

def restore_abstract(inverted_index):
    if not inverted_index:
        return ""
    positions = [(position, word) for word, indexes in inverted_index.items() for position in indexes]
    return " ".join(word for _, word in sorted(positions))

def classify_paper(title, abstract, venue, topic_text):
    title_text = title.lower()
    abstract_text = abstract.lower()
    venue_text = venue.lower()
    topic_lower = topic_text.lower()
    scores = {field: 0 for field in PAPER_FIELD_TERMS}
    journal_field = ""
    for field, journals in JOURNAL_FIELDS.items():
        if any(journal in venue_text for journal in journals):
            scores[field] += 8
            journal_field = field
            break
    for field, terms in PAPER_FIELD_TERMS.items():
        scores[field] += 3 * sum(term in title_text for term in terms)
        scores[field] += sum(term in abstract_text for term in terms)
        scores[field] += 2 * sum(term in topic_lower for term in terms)
    ranked = sorted(scores, key=lambda field: (-scores[field], field))
    top, second = ranked[0], ranked[1]
    if scores[top] == 0:
        return "UNSURE", "", "Low", "No field signal", True, scores
    secondary = second if scores[second] >= 3 and scores[second] >= scores[top] * 0.45 else ""
    margin = scores[top] - scores[second]
    confidence = "High" if journal_field == top or (scores[top] >= 8 and margin >= 4) else "Medium" if scores[top] >= 4 and margin >= 2 else "Low"
    source = "Journal mapping and paper content" if journal_field else "Paper title, abstract and OpenAlex topic"
    return top, secondary, confidence, source, confidence == "Low", scores

OUT.mkdir(exist_ok=True)
SITE_DATA.mkdir(exist_ok=True)
staff_records = []
publication_map = {}

for index, (name, email, profile_url, profile_id) in enumerate(STAFF, start=1):
    profile = None
    if profile_id:
        try:
            profile = get_json(f"https://profiles.ucl.ac.uk/api/users/{profile_id}")
        except Exception:
            profile = None
    if profile and profile.get("emailAddress", {}).get("address"):
        email = profile["emailAddress"]["address"]
    primary, secondary, classification_status = classify(name, profile)
    orcid = (profile or {}).get("orcid", {}).get("value", "")
    openalex_author = None
    try:
        openalex_author = choose_openalex_author(name, orcid)
    except Exception:
        pass
    scholar_query = "https://scholar.google.com/scholar?q=" + urllib.parse.quote(f'author:"{name}"')
    record = {
        "name": name,
        "email": email,
        "profileUrl": profile_url,
        "primaryField": primary,
        "secondaryField": secondary,
        "classificationStatus": classification_status,
        "uclProfileId": profile_id or "",
        "orcid": orcid,
        "openAlexAuthorId": (openalex_author or {}).get("id", ""),
        "googleScholarSearch": scholar_query,
        "googleScholarStatus": "Automated export unavailable; verify manually",
        "sourceUrl": "https://www.ucl.ac.uk/social-historical-sciences/economics/our-staff/academic-and-teaching-staff",
    }
    staff_records.append(record)
    if openalex_author:
        try:
            works = fetch_works(openalex_author["id"])
        except Exception:
            works = []
        for work in works:
            year = work.get("publication_year")
            title = work.get("title") or "Untitled"
            authors = [item.get("author", {}).get("display_name", "") for item in work.get("authorships", [])]
            source = (((work.get("primary_location") or {}).get("source") or {}).get("display_name") or "")
            source_type = (((work.get("primary_location") or {}).get("source") or {}).get("type") or "")
            topic_field = (((work.get("primary_topic") or {}).get("field") or {}).get("display_name") or "")
            economics_concepts = {"Economics", "Econometrics", "Finance", "Macroeconomics", "Microeconomics"}
            concept_names = {concept.get("display_name", "") for concept in work.get("concepts", [])}
            is_economics = topic_field == "Economics, Econometrics and Finance" or bool(economics_concepts & concept_names)
            publication_type = work.get("type", "")
            category = "Journal article" if publication_type == "article" and source_type == "journal" else "Book" if publication_type == "book" else "Other"
            abstract = restore_abstract(work.get("abstract_inverted_index"))
            topic_text = " ".join(filter(None, [
                topic_field,
                ((work.get("primary_topic") or {}).get("subfield") or {}).get("display_name", ""),
                *[topic.get("display_name", "") for topic in work.get("topics", [])],
            ]))
            paper_primary, paper_secondary, paper_confidence, paper_source, needs_review, paper_scores = classify_paper(title, abstract, source, topic_text)
            doi = (work.get("doi") or "").replace("https://doi.org/", "")
            url = work.get("doi") or (work.get("primary_location") or {}).get("landing_page_url") or work.get("id", "")
            key = doi.lower() if doi else work.get("id", "")
            if not key:
                key = f"{title.lower()}-{year}"
            pub = publication_map.setdefault(key, {
                "id": re.sub(r"[^a-z0-9]+", "-", key.lower()).strip("-"),
                "title": title,
                "year": year or 0,
                "date": work.get("publication_date") or "",
                "authors": authors,
                "venue": source,
                "doi": doi,
                "url": url,
                "type": work.get("type", ""),
                "sourceType": source_type,
                "topicField": topic_field,
                "isEconomics": is_economics,
                "category": category,
                "paperPrimaryField": paper_primary,
                "paperSecondaryField": paper_secondary,
                "paperFields": [field for field in (paper_primary, paper_secondary) if field and field != "UNSURE"],
                "classificationConfidence": paper_confidence,
                "classificationSource": paper_source,
                "classificationNeedsReview": needs_review,
                "classificationScores": paper_scores,
                "staff": [],
                "fields": [],
                "source": "OpenAlex",
            })
            if name not in pub["staff"]:
                pub["staff"].append(name)
    print(f"{index}/{len(STAFF)} {name}", flush=True)

publications = sorted(publication_map.values(), key=lambda item: (-item["year"], item["title"].lower()))
if len(publications) < 1000:
    raise RuntimeError(
        f"Publication source returned only {len(publications)} records; "
        "refusing to overwrite the last complete dataset."
    )

(OUT / "staff.json").write_text(json.dumps(staff_records, indent=2, ensure_ascii=False) + "\n")
(OUT / "publications.json").write_text(json.dumps(publications, indent=2, ensure_ascii=False) + "\n")
(SITE_DATA / "research-staff.json").write_text(json.dumps(staff_records, indent=2, ensure_ascii=False) + "\n")
(SITE_DATA / "publications.json").write_text(json.dumps(publications, indent=2, ensure_ascii=False) + "\n")
(ROOT / "site" / "public" / "publications.json").write_text(json.dumps(publications, separators=(",", ":"), ensure_ascii=False) + "\n")

bib = ["% Publication metadata compiled from UCL Profiles and OpenAlex.", "% Google Scholar automated export was unavailable; records require editorial review.", ""]
used_keys = set()
for number, pub in enumerate(publications, start=1):
    first_author = (pub["authors"][0].split()[-1] if pub["authors"] else "ucl").lower()
    base = re.sub(r"[^a-z0-9]", "", f"{first_author}{pub['year']}") or f"ucl{number}"
    cite_key = base
    suffix = 2
    while cite_key in used_keys:
        cite_key = f"{base}{suffix}"
        suffix += 1
    used_keys.add(cite_key)
    fields = [
        f"  title = {{{bib_escape(pub['title'])}}}",
        f"  author = {{{bib_escape(' and '.join(pub['authors']))}}}",
        f"  year = {{{pub['year']}}}",
    ]
    if pub["venue"]:
        fields.append(f"  journal = {{{bib_escape(pub['venue'])}}}")
    if pub["doi"]:
        fields.append(f"  doi = {{{bib_escape(pub['doi'])}}}")
    if pub["url"]:
        fields.append(f"  url = {{{bib_escape(pub['url'])}}}")
    bib.extend([f"@misc{{{cite_key},", ",\n".join(fields), "}", ""])
(OUT / "publications.bib").write_text("\n".join(bib), encoding="utf-8")
print(json.dumps({"staff": len(staff_records), "publications": len(publications)}))
