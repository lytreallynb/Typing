import json
from pathlib import Path
from typing import Dict, Any, List, Optional, Iterable


PACKS_DIR = Path(__file__).resolve().parent.parent / "packs"


def _iter_pack_dirs() -> Iterable[Path]:
    if not PACKS_DIR.exists():
        return []
    for child in PACKS_DIR.iterdir():
        if child.is_dir() and (child / "metadata.json").exists() and (child / "items.jsonl").exists():
            yield child


def _read_json(path: Path) -> Any:
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def pack_exists(pack_id: str) -> bool:
    p = PACKS_DIR / pack_id
    return p.is_dir() and (p / "metadata.json").exists()


def list_packs(lang: Optional[str] = None, topic: Optional[str] = None) -> List[Dict[str, Any]]:
    packs: List[Dict[str, Any]] = []
    for pd in _iter_pack_dirs():
        meta = _read_json(pd / "metadata.json")
        pack_id = pd.name

        # Count items lazily
        count = 0
        try:
            with (pd / "items.jsonl").open("r", encoding="utf-8") as f:
                for _ in f:
                    count += 1
        except FileNotFoundError:
            count = 0

        if lang and meta.get("languages") and lang not in meta.get("languages", []):
            continue

        if topic and topic not in meta.get("topics", []):
            continue

        packs.append({
            "id": pack_id,
            "name": meta.get("name", pack_id),
            "languages": meta.get("languages", []),
            "license": meta.get("license"),
            "source": meta.get("source"),
            "topics": meta.get("topics", []),
            "count": count,
        })
    return sorted(packs, key=lambda x: x["id"])  # deterministic order


def get_pack_items(pack_id: str, offset: int = 0, limit: int = 50, tag: Optional[str] = None) -> Iterable[Dict[str, Any]]:
    p = PACKS_DIR / pack_id / "items.jsonl"
    if not p.exists():
        return []

    emitted = 0
    skipped = 0
    with p.open("r", encoding="utf-8") as f:
        for line in f:
            try:
                obj = json.loads(line)
            except Exception:
                continue

            if tag and tag not in obj.get("tags", []):
                continue

            if skipped < offset:
                skipped += 1
                continue

            yield obj
            emitted += 1
            if emitted >= limit:
                break

