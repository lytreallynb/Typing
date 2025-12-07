#!/usr/bin/env python3
"""
Minimal ETL for building a pack from CSV/JSON input.

Usage examples:
  python etl/build_pack.py \
    --id my-travel-zh-en \
    --name "My Travel (ZH→EN)" \
    --source_csv data/raw.csv \
    --lang zh --target en \
    --license "CC BY-SA 3.0"

Input CSV columns:
  zh,en,tag (optional)

Optional libraries:
  - pypinyin (pinyin romanization)
  - opencc (S/T conversion)
  - jieba (segmentation; not strictly needed)
"""

import csv
import json
import argparse
from pathlib import Path
from typing import Dict, Any


def try_pinyin(text: str) -> str:
    try:
        from pypinyin import lazy_pinyin, Style
        py = lazy_pinyin(text, style=Style.TONE3, errors='ignore')
        return " ".join(py)
    except Exception:
        return ""


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--id", required=True)
    ap.add_argument("--name", required=True)
    ap.add_argument("--source_csv", required=True)
    ap.add_argument("--lang", default="zh")
    ap.add_argument("--target", default="en")
    ap.add_argument("--license", default="CC BY 4.0")
    ap.add_argument("--source", default="")
    ap.add_argument("--topic", action="append", default=[])
    args = ap.parse_args()

    out_dir = Path("packs") / args.id
    out_dir.mkdir(parents=True, exist_ok=True)

    items_path = out_dir / "items.jsonl"
    meta_path = out_dir / "metadata.json"

    # Write metadata
    meta = {
        "id": args.id,
        "name": args.name,
        "languages": [args.lang, args.target],
        "license": args.license,
        "source": args.source or "",
        "topics": args.topic or [],
    }
    meta_path.write_text(json.dumps(meta, ensure_ascii=False, indent=2), encoding="utf-8")

    # Build items
    with open(args.source_csv, "r", encoding="utf-8") as f, open(items_path, "w", encoding="utf-8") as out:
        reader = csv.DictReader(f)
        n = 0
        for row in reader:
            zh = (row.get("zh") or "").strip()
            en = (row.get("en") or "").strip()
            if not zh or not en:
                continue
            n += 1
            item = {
                "id": f"{args.id}-{n:04d}",
                "type": "sentence",
                "lang": args.lang,
                "text": zh,
                "romanization": try_pinyin(zh),
                "translation": {args.target: en},
                "tags": [t for t in (row.get("tag") or "").split(";") if t] + (args.topic or []),
                "difficulty": {"freq_band": 0},
                "source": meta["source"],
                "license": args.license,
            }
            out.write(json.dumps(item, ensure_ascii=False) + "\n")

    print(f"Wrote {n} items to {items_path}")


if __name__ == "__main__":
    main()

