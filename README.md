Typing + Language Learning Backend (EN/ZH)

This repo contains a minimal backend and content-pack format to power a typing + language learning app for English and Chinese.

What’s included
- Sample content pack: travel phrases (ZH→EN) with pinyin
- REST API endpoints to list packs and fetch items
- Progress tracking: store attempts and compute WPM/CPM + CER
- ETL stub to build packs from raw sources (optional, dependency-light)
- Attribution generator for licenses/sources

Quick start
1) (Optional) Create a Python venv
   python3 -m venv .venv && source .venv/bin/activate

2) Install runtime deps (FastAPI + Uvicorn). If you don’t have network access now, skip and read “Offline mode”.
   pip install fastapi uvicorn

3) Run the API
   uvicorn server.main:app --reload

4) Try the endpoints
   - List packs:        curl 'http://127.0.0.1:8000/packs'
   - Pack items:        curl 'http://127.0.0.1:8000/packs/wikivoyage-travel-zh-en/items?limit=5'
   - Post an attempt:
     curl -X POST 'http://127.0.0.1:8000/attempts' \
       -H 'Content-Type: application/json' \
       -d '{"user_id":"u1","item_id":"wikitravel-0001","lang":"zh","typed_text":"你好！","target_text":"你好！","duration_ms":3000}'
   - User progress:     curl 'http://127.0.0.1:8000/users/u1/progress'

Offline mode
- If you cannot install packages, you can still explore the data format in `packs/` and inspect the ETL and scripts. The app runtime requires FastAPI to serve HTTP.

Project layout
- packs/                         Content packs (self-contained)
  - <pack_id>/metadata.json      Pack metadata (license, source, tags)
  - <pack_id>/items.jsonl        One JSON object per line (items)
- server/
  - main.py                      FastAPI app + endpoints
  - packs.py                     Pack discovery and item loading
  - metrics.py                   WPM/CPM, CER, heatmaps
  - storage.py                   JSONL storage for attempts
- etl/
  - build_pack.py                Minimal ETL for CSV/JSON sources
- scripts/
  - generate_attributions.py     Produces ATTRIBUTIONS.md from packs
- ATTRIBUTIONS.md                Generated attribution file

Content item schema (JSONL)
{
  "id": "wikitravel-0001",
  "type": "sentence",
  "lang": "zh",
  "text": "请问地铁站在哪里？",
  "romanization": "qǐng wèn dì tiě zhàn zài nǎ lǐ?",
  "translation": { "en": "Excuse me, where is the subway station?" },
  "tags": ["travel", "directions", "A1"],
  "difficulty": { "freq_band": 3 },
  "source": "Wikivoyage phrasebook (demo sample)",
  "license": "CC BY-SA 3.0"
}

Endpoints
- GET /packs
  Query params: lang, topic (optional)
  Returns pack metadata and item counts.

- GET /packs/{pack_id}/items
  Query params: offset, limit, tag (optional)
  Returns a slice of items from the pack.

- POST /attempts
  Body: { user_id, item_id, lang, typed_text, target_text, duration_ms, started_at? }
  Computes WPM/CPM, CER, and stores attempt in data/attempts.jsonl.

- GET /users/{user_id}/progress
  Returns aggregates over attempts (mean WPM/CPM, CER, attempts count), plus per-pack breakdown.

Notes on licensing
- Each item carries `source` and `license` fields. Keep these when building new packs. Some sources (e.g., CC BY-SA) require share-alike; follow their terms.

ETL & translation
- `etl/build_pack.py` can attach pinyin/OpenCC if optional libs are installed. For production, prefer pre-translating content and storing translations with source/engine fields.

