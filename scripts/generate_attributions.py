#!/usr/bin/env python3
import json
from pathlib import Path


def main():
    root = Path(__file__).resolve().parent.parent
    packs = root / "packs"
    attributions = {}
    for p in packs.iterdir():
        meta = p / "metadata.json"
        if not meta.exists():
            continue
        try:
            data = json.loads(meta.read_text(encoding="utf-8"))
        except Exception:
            continue
        key = (data.get("source") or "Unknown", data.get("license") or "Unknown")
        attributions.setdefault(key, 0)
        # Count items
        cnt = 0
        items = p / "items.jsonl"
        if items.exists():
            with items.open("r", encoding="utf-8") as f:
                for _ in f:
                    cnt += 1
        attributions[key] += cnt

    lines = ["# Attributions\n"]
    for (source, license_), count in sorted(attributions.items(), key=lambda kv: kv[0][0] or ""):
        lines.append(f"- Source: {source} | License: {license_} | Items: {count}")
    (root / "ATTRIBUTIONS.md").write_text("\n".join(lines) + "\n", encoding="utf-8")
    print("Wrote ATTRIBUTIONS.md")


if __name__ == "__main__":
    main()

