#!/usr/bin/env python3
"""Temporary localhost receiver for browser-rendered UCL publication records."""

from http.server import BaseHTTPRequestHandler, HTTPServer
import json
from pathlib import Path
from urllib.parse import parse_qs


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "research_staff" / "ucl_publications_capture.json"


class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        page = b"""<!doctype html><html><body><form method='post'><textarea name='payload' aria-label='Publication data'></textarea><button type='submit'>Save</button></form></body></html>"""
        self.send_response(200)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(page)))
        self.end_headers()
        self.wfile.write(page)

    def do_POST(self):
        length = int(self.headers.get("Content-Length", "0"))
        payload = parse_qs(self.rfile.read(length).decode("utf-8")).get("payload", ["[]"])[0]
        incoming = json.loads(payload)
        existing = json.loads(OUTPUT.read_text()) if OUTPUT.exists() else []
        by_key = {(item.get("staffName"), item.get("page")): item for item in existing}
        for item in incoming:
            by_key[(item.get("staffName"), item.get("page"))] = item
        merged = sorted(by_key.values(), key=lambda item: (item.get("staffName", ""), item.get("page", 0)))
        OUTPUT.write_text(json.dumps(merged, indent=2, ensure_ascii=False) + "\n")
        reply = f"Saved {len(incoming)} page captures; {len(merged)} total.".encode()
        self.send_response(200)
        self.send_header("Content-Type", "text/plain; charset=utf-8")
        self.send_header("Content-Length", str(len(reply)))
        self.end_headers()
        self.wfile.write(reply)

    def log_message(self, *_):
        pass


HTTPServer(("127.0.0.1", 8765), Handler).serve_forever()
