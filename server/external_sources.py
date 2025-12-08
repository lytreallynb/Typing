"""Helpers for fetching open vocabulary sources on-demand."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Dict, List

try:
    import httpx
except ImportError:  # pragma: no cover - optional dependency
    httpx = None  # type: ignore


DATA_DIR = Path(__file__).resolve().parent.parent / "data"


class SourceNotAvailable(Exception):
    pass


RemoteSource = Dict[str, Any]


# Built-in examples pointing to permissive open datasets. Users can add more via data/external_sources.json.
DEFAULT_SOURCES: Dict[str, RemoteSource] = {
    "hsk-level1": {
        "id": "hsk-level1",
        "name": "HSK Level 1 Vocabulary",
        "description": "HSK level 1 terms with English translations (GitHub)",
        "url": "https://raw.githubusercontent.com/pepebecker/mandarin-vocab/master/data/hsk-level-1.json",
        "format": "json",
        "list_path": None,
        "source_lang": "zh",
        "target_lang": "en",
        "text_field": "hanzi",
        "translation_field": "translations",
        "pinyin_field": "pinyin",
        "license": "MIT (per upstream repo)",
        "topics": ["hsk", "vocabulary", "beginner"],
        "languages": ["zh", "en"],
    },
    "tatoeba-daily-en-zh": {
        "id": "tatoeba-daily-en-zh",
        "name": "Tatoeba Daily EN→ZH",
        "description": "Tatoeba API slice for daily English sentences with Chinese translations",
        "url": "https://tatoeba.org/eng/api_v0/search?format=json&query=&from=eng&to=cmn&has_audio=no&sort=random",
        "format": "tatoeba",
        "list_path": None,
        "source_lang": "en",
        "target_lang": "zh",
        "text_field": "text",
        "translation_field": "translations",
        "license": "CC BY 2.0",
        "topics": ["daily", "conversation"],
        "languages": ["en", "zh"],
    },
}


def _load_custom_sources() -> Dict[str, RemoteSource]:
    custom_path = DATA_DIR / "external_sources.json"
    if not custom_path.exists():
        return {}
    try:
        data = json.loads(custom_path.read_text(encoding="utf-8"))
    except Exception:
        return {}
    return {entry["id"]: entry for entry in data if "id" in entry}


def list_sources() -> List[RemoteSource]:
    sources = {**DEFAULT_SOURCES, **_load_custom_sources()}
    return sorted(sources.values(), key=lambda s: s["id"])


async def fetch_source_items(source_id: str, limit: int = 100) -> Dict[str, Any]:
    sources = {**DEFAULT_SOURCES, **_load_custom_sources()}
    if source_id not in sources:
        raise SourceNotAvailable(f"Unknown source: {source_id}")
    if httpx is None:
        raise SourceNotAvailable("httpx dependency not installed. Run `pip install httpx`. ")

    config = sources[source_id]
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.get(config["url"], timeout=15.0)
            response.raise_for_status()
    except Exception as exc:  # pragma: no cover - network dependent
        raise SourceNotAvailable(str(exc)) from exc

    if config["format"] == "json":
        payload = response.json()
        if config.get("list_path"):
            for key in config["list_path"]:
                payload = payload[key]
        items_raw = payload[:limit]
        items = []
        for entry in items_raw:
            text = entry.get(config.get("text_field", "word"), "").strip()
            if not text:
                continue
            translation_field = config.get("translation_field")
            translation_value = entry.get(translation_field, "") if translation_field else ""
            if isinstance(translation_value, list):
                translation_text = ", ".join(translation_value[:3])
            else:
                translation_text = str(translation_value)
            romanization = entry.get(config.get("pinyin_field"))
            items.append(
                {
                    "id": f"{source_id}-{len(items)+1:04d}",
                    "type": "word",
                    "lang": config.get("source_lang", "en"),
                    "text": text,
                    "romanization": romanization,
                    "translation": {config.get("target_lang", "zh"): translation_text},
                    "tags": config.get("topics", []),
                    "license": config.get("license"),
                    "source": config.get("name"),
                }
            )
        pack = {
            "id": f"remote-{source_id}",
            "name": config.get("name", source_id),
            "languages": [config.get("source_lang", "en"), config.get("target_lang", "zh")],
            "license": config.get("license"),
            "source": config.get("url"),
            "topics": config.get("topics", []),
            "notes": config.get("description"),
            "count": len(items),
        }
        return {"pack": pack, "items": items}

    if config["format"].lower() == "tatoeba":
        data = response.json()
        results = data.get("results", [])[:limit]
        items = []
        for entry in results:
            text = entry.get("text", "").strip()
            translations = entry.get("translations", [])
            target_text = ""
            for t in translations:
                if t.get("language") == config.get("target_lang", "zh"):
                    target_text = t.get("text", "")
                    break
            if not text or not target_text:
                continue
            items.append(
                {
                    "id": f"{source_id}-{len(items)+1:04d}",
                    "type": "sentence",
                    "lang": config.get("source_lang", "en"),
                    "text": text,
                    "translation": {config.get("target_lang", "zh"): target_text},
                    "tags": config.get("topics", []),
                    "source": "Tatoeba API",
                    "license": config.get("license"),
                }
            )
        pack = {
            "id": f"remote-{source_id}",
            "name": config.get("name", source_id),
            "languages": [config.get("source_lang", "en"), config.get("target_lang", "zh")],
            "license": config.get("license"),
            "source": config.get("url"),
            "topics": config.get("topics", []),
            "notes": config.get("description"),
            "count": len(items),
        }
        return {"pack": pack, "items": items}

    raise SourceNotAvailable(f"Unsupported format for {source_id}")
