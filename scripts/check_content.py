#!/usr/bin/env python3
"""Check the repository's README as a small, dependency-free content contract."""
from pathlib import Path
import re
import sys
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
README = ROOT / "README.md"


def main() -> int:
    try:
        text = README.read_text(encoding="utf-8")
    except (OSError, UnicodeError):
        print("README.md must exist and be valid UTF-8")
        return 1
    if not text.strip():
        print("README.md must contain text")
        return 1

    fences = re.findall(r"^\s*(```+|~~~+)", text, re.MULTILINE)
    if len(fences) % 2:
        print("README.md has an unclosed fenced code block")
        return 1

    for match in re.finditer(r"!?\[[^\]]*\]\(([^)]+)\)", text):
        target = match.group(1).strip().split(maxsplit=1)[0].strip("<>")
        parsed = urlsplit(target)
        if parsed.scheme or target.startswith("//") or not parsed.path:
            continue
        local_path = (README.parent / unquote(parsed.path)).resolve()
        try:
            local_path.relative_to(ROOT.resolve())
        except ValueError:
            print("README.md contains a relative link outside the repository")
            return 1
        if not local_path.exists():
            print("README.md contains a broken relative link")
            return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
