import json
from pathlib import Path
from threading import Lock
from typing import Dict, Any, List


DATA_DIR = Path(__file__).resolve().parent.parent / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)
ATTEMPTS_PATH = DATA_DIR / "attempts.jsonl"
_lock = Lock()


def append_attempt(record: Dict[str, Any]) -> None:
    # Optional: Normalize known fields
    record.setdefault("pack_id", record.get("pack"))
    with _lock:
        with ATTEMPTS_PATH.open("a", encoding="utf-8") as f:
            f.write(json.dumps(record, ensure_ascii=False) + "\n")


def get_attempts_by_user(user_id: str) -> List[Dict[str, Any]]:
    out: List[Dict[str, Any]] = []
    if not ATTEMPTS_PATH.exists():
        return out
    with _lock:
        with ATTEMPTS_PATH.open("r", encoding="utf-8") as f:
            for line in f:
                try:
                    obj = json.loads(line)
                except Exception:
                    continue
                if obj.get("user_id") == user_id:
                    out.append(obj)
    return out

