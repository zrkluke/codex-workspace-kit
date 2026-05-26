#!/usr/bin/env python
"""Create versioned workbench artifact filenames and changelog entries."""

from __future__ import annotations

import argparse
import re
import shutil
import sys
from datetime import datetime
from pathlib import Path

for stream_name in ("stdout", "stderr"):
    stream = getattr(sys, stream_name, None)
    if hasattr(stream, "reconfigure"):
        stream.reconfigure(encoding="utf-8", errors="replace")


WORKBENCH_ROOT = Path("02-workbench")
DEFAULT_EXTENSIONS = {
    "schema": ".xlsx",
    "knowledge": ".xlsx",
    "golden": ".xlsx",
    "interview": ".md",
    "reports": ".md",
}


def slugify(value: str) -> str:
    value = value.strip().lower()
    value = re.sub(r"[^a-z0-9\u4e00-\u9fff]+", "_", value)
    value = re.sub(r"_+", "_", value).strip("_")
    return value or "update"


def next_version(directory: Path, artifact: str, stage: str) -> int:
    pattern = re.compile(
        rf"^\d{{8}}-\d{{4}}_{re.escape(artifact)}_{re.escape(stage)}_v(\d{{2}})(?:_|\.|$)"
    )
    versions: list[int] = []
    if directory.exists():
        for path in directory.iterdir():
            match = pattern.match(path.name)
            if match:
                versions.append(int(match.group(1)))
    return max(versions, default=0) + 1


def build_name(
    artifact: str,
    stage: str,
    note: str,
    extension: str,
    timestamp: datetime,
    version: int,
) -> str:
    parts = [
        timestamp.strftime("%Y%m%d-%H%M"),
        slugify(artifact),
        slugify(stage),
        f"v{version:02d}",
    ]
    note_slug = slugify(note)
    if note_slug and note_slug != "update":
        parts.append(note_slug)
    return "_".join(parts) + extension


def artifact_changelog_path(artifact: str) -> Path:
    return WORKBENCH_ROOT / artifact / "CHANGELOG.md"


def append_changelog(path: Path, artifact_path: Path, summary: str, source: Path | None) -> None:
    today = datetime.now().strftime("%Y-%m-%d")
    if path.exists():
        text = path.read_text(encoding="utf-8")
    else:
        text = "# Workbench 版本紀錄\n\n"

    if f"## {today}" not in text:
        if not text.endswith("\n"):
            text += "\n"
        text += f"\n## {today}\n\n"

    entry = f"### {artifact_path.as_posix()}\n"
    if source:
        entry += f"- 來源：`{source.as_posix()}`\n"
    entry += f"- 摘要：{summary.strip() or '建立 workbench 新版本。'}\n\n"
    text += entry
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text, encoding="utf-8")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "artifact",
        choices=sorted(DEFAULT_EXTENSIONS),
        help="Workbench artifact area.",
    )
    parser.add_argument("--stage", default="workbench", help="Stage label, such as enriched or draft.")
    parser.add_argument("--note", default="", help="Short filename note.")
    parser.add_argument("--source", type=Path, default=None, help="Optional source file to copy.")
    parser.add_argument("--summary", default="", help="Changelog summary.")
    parser.add_argument("--ext", default=None, help="File extension, inferred from artifact by default.")
    parser.add_argument("--dry-run", action="store_true", help="Print the next filename without writing files.")
    args = parser.parse_args()

    artifact = slugify(args.artifact)
    stage = slugify(args.stage)
    extension = args.ext or DEFAULT_EXTENSIONS[artifact]
    if not extension.startswith("."):
        extension = "." + extension

    directory = WORKBENCH_ROOT / artifact
    timestamp = datetime.now()
    version = next_version(directory, artifact, stage)
    filename = build_name(artifact, stage, args.note, extension, timestamp, version)
    output_path = directory / filename

    print(output_path.as_posix())
    if args.dry_run:
        return 0

    directory.mkdir(parents=True, exist_ok=True)
    if args.source:
        if not args.source.exists():
            print(f"找不到來源檔：{args.source}")
            return 1
        shutil.copy2(args.source, output_path)
        output_path.touch()
    else:
        output_path.touch(exist_ok=False)

    changelog_path = artifact_changelog_path(artifact)
    append_changelog(changelog_path, output_path, args.summary, args.source)
    print(f"已建立 workbench 版本：{output_path}")
    print(f"已更新 changelog：{changelog_path}")
    print(f"請只修改新版本檔案，不要覆蓋來源或前一版：{output_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
