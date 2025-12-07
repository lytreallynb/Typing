from typing import Dict, Any, List


def _levenshtein(a: str, b: str) -> int:
    if a == b:
        return 0
    la, lb = len(a), len(b)
    if la == 0:
        return lb
    if lb == 0:
        return la
    # DP with two rows
    prev = list(range(lb + 1))
    curr = [0] * (lb + 1)
    for i in range(1, la + 1):
        curr[0] = i
        ca = a[i - 1]
        for j in range(1, lb + 1):
            cb = b[j - 1]
            cost = 0 if ca == cb else 1
            curr[j] = min(
                prev[j] + 1,       # deletion
                curr[j - 1] + 1,   # insertion
                prev[j - 1] + cost # substitution
            )
        prev, curr = curr, prev
    return prev[lb]


def _error_heatmap(typed: str, target: str) -> Dict[str, int]:
    # Simple character mismatch counts
    heat: Dict[str, int] = {}
    m = min(len(typed), len(target))
    for i in range(m):
        if typed[i] != target[i]:
            ch = target[i]
            heat[ch] = heat.get(ch, 0) + 1
    # Count extra characters as errors under a special key
    if len(typed) > len(target):
        heat["<extra>"] = heat.get("<extra>", 0) + (len(typed) - len(target))
    if len(target) > len(typed):
        heat["<missing>"] = heat.get("<missing>", 0) + (len(target) - len(typed))
    return heat


def compute_metrics(lang: str, typed_text: str, target_text: str, duration_ms: int) -> Dict[str, Any]:
    duration_ms = max(1, int(duration_ms))

    # Levenshtein-based CER
    distance = _levenshtein(typed_text, target_text)
    denom = max(1, len(target_text))
    cer = distance / denom

    # WPM/CPM calculation
    minutes = duration_ms / 60000.0
    char_count = len(typed_text)
    wpm = (char_count / 5.0) / minutes if minutes > 0 else 0.0
    cpm = (char_count / minutes) if minutes > 0 else 0.0

    # For Chinese, CPM is primary; for English, WPM is primary
    metrics = {
        "wpm": wpm,
        "cpm": cpm,
        "cer": cer,
        "distance": distance,
        "duration_ms": duration_ms,
        "error_heatmap": _error_heatmap(typed_text, target_text),
    }
    return metrics


def _mean(values: List[float]) -> float:
    return sum(values) / len(values) if values else 0.0


def aggregate_progress(attempts: List[Dict[str, Any]]) -> Dict[str, Any]:
    overall = {
        "attempts": len(attempts),
        "wpm": _mean([a.get("wpm", 0.0) for a in attempts]),
        "cpm": _mean([a.get("cpm", 0.0) for a in attempts]),
        "cer": _mean([a.get("cer", 0.0) for a in attempts]),
    }

    per_pack: Dict[str, Dict[str, Any]] = {}
    for a in attempts:
        pid = a.get("pack_id") or a.get("pack") or "unknown"
        entry = per_pack.setdefault(pid, {"attempts": 0, "wpm": [], "cpm": [], "cer": []})
        entry["attempts"] += 1
        entry["wpm"].append(a.get("wpm", 0.0))
        entry["cpm"].append(a.get("cpm", 0.0))
        entry["cer"].append(a.get("cer", 0.0))

    per_pack_out = []
    for pid, vals in per_pack.items():
        per_pack_out.append({
            "pack_id": pid,
            "attempts": vals["attempts"],
            "wpm": _mean(vals["wpm"]),
            "cpm": _mean(vals["cpm"]),
            "cer": _mean(vals["cer"]),
        })

    return {"overall": overall, "per_pack": per_pack_out}

