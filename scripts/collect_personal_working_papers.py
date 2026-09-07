#!/usr/bin/env python3
"""Collect candidate working-paper lists from staff personal webpages."""

from concurrent.futures import ThreadPoolExecutor, as_completed
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import sys
import unicodedata
from urllib.parse import urljoin, urlparse
from urllib.request import Request, urlopen


ROOT = Path(sys.argv[1] if len(sys.argv) > 1 else ".").resolve()
STAFF_PATH = ROOT / "research_staff" / "staff.json"
OUTPUT = ROOT / "research_staff" / "working_papers_web.json"
WORKING_HEADING = re.compile(r"working\s*(?:and\s*discussion\s*)?papers?|work\s+in\s+progress|unpublished|research\s+in\s+progress", re.I)
NEXT_SECTION = re.compile(r"published|journal|book|teaching|contact|software|data|policy|media|presentation|conference", re.I)
PAGE_HINT = re.compile(r"research|publication|papers?|work", re.I)
NOISE = re.compile(r"^(home|about|research|publications?|working papers?|cv|curriculum vitae|contact|more|download|pdf)$", re.I)
NOISE_PHRASES = re.compile(
    r"phone|e-?mail|powered by|plans?\s*&\s*pricing|privacy|cookies?|terms|"
    r"more working papers|published (?:and|or) forthcoming|see (?:my )?cv|"
    r"joint with|draft coming soon|columns? written|media coverage|back to top",
    re.I,
)
NON_PAPER = re.compile(
    r"^(?:lecture|speech) by\b|ifs wp\b|listen to it|occupation health committee|"
    r"dissertation award|for published work|hknet\b|corrected proof|paper trailer",
    re.I,
)


def clean(value):
    return re.sub(r"\s+", " ", value).strip(" \t\r\n•–—")


def key(value):
    value = unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode().lower()
    return re.sub(r"[^a-z0-9]+", " ", value).strip()


class PageParser(HTMLParser):
    def __init__(self, base):
        super().__init__()
        self.base = base
        self.tag = ""
        self.buffer = []
        self.href = ""
        self.current_heading = ""
        self.links = []
        self.working_items = []

    def handle_starttag(self, tag, attrs):
        self.tag = tag.lower()
        if self.tag in {"h1", "h2", "h3", "h4", "li", "p", "a"}:
            self.buffer = []
        if self.tag == "a":
            self.href = dict(attrs).get("href", "")

    def handle_data(self, data):
        if self.tag in {"h1", "h2", "h3", "h4", "li", "p", "a"}:
            self.buffer.append(data)

    def handle_endtag(self, tag):
        tag = tag.lower()
        text = clean(" ".join(self.buffer))
        if tag in {"h1", "h2", "h3", "h4"} and text:
            if WORKING_HEADING.search(text):
                self.current_heading = text
            elif NEXT_SECTION.search(text):
                self.current_heading = ""
        elif tag == "a":
            url = urljoin(self.base, self.href)
            if text and url.startswith(("http://", "https://")):
                self.links.append((text, url))
                if self.current_heading and 8 <= len(text) <= 350 and not NOISE.match(text):
                    self.working_items.append((text, url, self.current_heading))
            self.href = ""
        elif tag in {"li", "p"} and self.current_heading and 12 <= len(text) <= 500 and not NOISE.match(text):
            self.working_items.append((text, "", self.current_heading))
        if tag == self.tag:
            self.tag = ""
            self.buffer = []


def fetch(url):
    # Some staff URLs contain unescaped spaces in their path.
    from urllib.parse import quote
    url = quote(url, safe=":/?&=#%")
    request = Request(url, headers={"User-Agent": "Mozilla/5.0 UCL Economics Research prototype"})
    with urlopen(request, timeout=25) as response:
        content_type = response.headers.get("Content-Type", "")
        if "html" not in content_type:
            return ""
        return response.read(3_000_000).decode("utf-8", "replace")


def collect(member):
    start = member.get("personalUrl", "")
    if not start:
        return member["name"], [], "No personal webpage"
    pages = [start]
    parsed_start = urlparse(start)
    results = []
    visited = set()
    error = ""
    while pages and len(visited) < 6:
        url = pages.pop(0)
        if url in visited:
            continue
        visited.add(url)
        try:
            html = fetch(url)
        except Exception as exc:
            error = f"{type(exc).__name__}: {exc}"
            continue
        parser = PageParser(url)
        parser.feed(html)
        results.extend((title, link, heading, url) for title, link, heading in parser.working_items)
        for text, link in parser.links:
            target = urlparse(link)
            if target.netloc == parsed_start.netloc and PAGE_HINT.search(f"{text} {target.path}") and link not in visited:
                pages.append(link)
    unique = {}
    for title, link, heading, source_page in results:
        title = clean(title)
        words = title.split()
        if len(words) < 4 or len(title) < 20 or NOISE_PHRASES.search(title) or NON_PAPER.search(title):
            continue
        if re.fullmatch(r"(?:[A-Z]{1,4}\s*)?\d{2,}(?:[-/]\d+)?", title, re.I):
            continue
        unique.setdefault(key(title), {"staffName": member["name"], "title": title, "url": link,
                                       "sectionHeading": heading, "sourcePage": source_page,
                                       "source": "Personal webpage", "reviewStatus": "Review"})
    status = "Working-paper section found" if unique else (error or "No working-paper section found")
    return member["name"], list(unique.values()), status


staff = json.loads(STAFF_PATH.read_text())
all_records = []
statuses = {}
with ThreadPoolExecutor(max_workers=6) as pool:
    futures = [pool.submit(collect, member) for member in staff]
    for future in as_completed(futures):
        name, records, status = future.result()
        all_records.extend(records)
        statuses[name] = status

for member in staff:
    member["personalWebsiteWorkingPaperStatus"] = statuses.get(member["name"], "Not checked")
STAFF_PATH.write_text(json.dumps(staff, indent=2, ensure_ascii=False) + "\n")
all_records.sort(key=lambda item: (item["staffName"], item["title"].lower()))
OUTPUT.write_text(json.dumps(all_records, indent=2, ensure_ascii=False) + "\n")
print(json.dumps({"webpagesChecked": sum(bool(item.get('personalUrl')) for item in staff),
                  "staffWithCandidates": len({item['staffName'] for item in all_records}),
                  "candidateWorkingPapers": len(all_records),
                  "statuses": statuses}, indent=2))
