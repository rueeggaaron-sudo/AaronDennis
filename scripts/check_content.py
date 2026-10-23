#!/usr/bin/env python3
"""Validate this repository's README encoding and relative links."""
from pathlib import Path
import re
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
README = ROOT / "README.md"

try:
    text = README.read_text(encoding="utf-8")
except (OSError, UnicodeError):
    raise SystemExit("README.md must be readable UTF-8")
if not text.strip():
    raise SystemExit("README.md must contain text")
if len(re.findall(r"^\s*(```+|~~~+)", text, re.MULTILINE)) % 2:
    raise SystemExit("README.md has an unclosed fenced code block")

for raw in re.findall(r"!?\[[^\]]*\]\(([^)]+)\)", text):
    url = urlsplit(raw.strip().split(maxsplit=1)[0].strip("<>"))
    if url.scheme or not url.path:
        continue
    target = (README.parent / unquote(url.path)).resolve()
    try:
        target.relative_to(ROOT.resolve())
    except ValueError:
        raise SystemExit("README.md links outside this repository")
    if not target.exists():
        raise SystemExit("README.md has a broken relative link")
