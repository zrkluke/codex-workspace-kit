#!/usr/bin/env python
"""List latest source and workbench files before modifying GenBI prep assets."""

from __future__ import annotations

import argparse
import sys
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path

for stream_name in ("stdout", "stderr"):
    stream = getattr(sys, stream_name, None)
    if hasattr(stream, "reconfigure"):
        stream.reconfigure(encoding="utf-8", errors="replace")


SOURCE_ROOT = Path("01-source")
WORKBENCH_ROOT = Path("02-workbench")
ARTIFACT_DIRS = {
    "schema": "schema",
    "knowledge": "knowledge",
    "golden": "golden",
    "interview": "interview",
    "reports": "reports",
}
DEFAULT_PATTERNS = {
    "schema": ["*.xlsx", "*.xlsm", "*.xls"],
    "knowledge": ["*.xlsx", "*.xlsm", "*.xls"],
    "golden": ["*.xlsx", "*.xlsm", "*.xls"],
    "interview": ["*.md", "*.txt", "*.docx"],
    "reports": ["*.md", "*.txt"],
}


@dataclass
class Candidate:
    area: str
    path: Path
    modified: float

    @property
    def modified_text(self) -> str:
        return datetime.fromtimestamp(self.modified).strftime("%Y-%m-%d %H:%M:%S")


def iter_candidates(root: Path, artifact: str, patterns: list[str]) -> list[Candidate]:
    directory = root / ARTIFACT_DIRS[artifact]
    candidates: list[Candidate] = []
    if not directory.exists():
        return candidates
    for pattern in patterns:
        for path in directory.glob(pattern):
            if path.is_file() and path.name != ".gitkeep" and not path.name.startswith("~$"):
                candidates.append(Candidate(root.name, path, path.stat().st_mtime))
    return candidates


def print_section(title: str, candidates: list[Candidate], limit: int) -> None:
    print(f"## {title}")
    if not candidates:
        print("- No candidate files found.")
        print()
        return
    for candidate in sorted(candidates, key=lambda item: item.modified, reverse=True)[:limit]:
        print(f"- {candidate.modified_text} | `{candidate.path.as_posix()}`")
    print()


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("artifact", choices=sorted(ARTIFACT_DIRS), help="Artifact area to inspect.")
    parser.add_argument("--root", type=Path, default=Path("."), help="Workspace root.")
    parser.add_argument("--limit", type=int, default=5, help="Candidates to show per area.")
    args = parser.parse_args()

    root = args.root.resolve()
    patterns = DEFAULT_PATTERNS[args.artifact]
    source = iter_candidates(root / SOURCE_ROOT, args.artifact, patterns)
    workbench = iter_candidates(root / WORKBENCH_ROOT, args.artifact, patterns)
    combined = sorted(source + workbench, key=lambda item: item.modified, reverse=True)

    print(f"# Active {args.artifact} File Candidates\n")
    print_section("Latest Overall", combined, args.limit)
    print_section("01-source", source, args.limit)
    print_section("02-workbench", workbench, args.limit)

    if combined:
        latest = combined[0]
        print("## Suggested Prompt")
        print(
            "- Confirm with the user whether to continue from "
            f"`{latest.path.as_posix()}` before creating a new workbench version."
        )
        print("- Do not edit the confirmed active file in place; copy it to a new versioned workbench file first.")
    else:
        print("## Suggested Prompt")
        print("- Ask the user to add the relevant source file under `01-source/`.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
