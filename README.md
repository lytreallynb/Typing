Typing + Language Learning Web App (EN/ZH)

A comprehensive bilingual typing and language learning platform with gamification, progress tracking, and polished UX.

What's included
- Full-stack Next.js + FastAPI application
- SQLite database for scalable data storage
- Achievement system with 14+ unlockable badges
- Daily streak tracking for habit formation
- Dark mode support with theme persistence
- Sample content packs with travel phrases and Tatoeba examples
- REST API for packs, progress, achievements, and streaks
- External catalog importer for HSK/Tatoeba vocabulary
- Sound profiles and background music
- Visual keyboard and hand guides
- IME support for Chinese character input
- Attribution generator for licenses/sources

Key Features

Typing & Learning:
- Character-by-character typing with real-time feedback
- Support for English and Chinese (Simplified/Traditional)
- IME composition event handling for Chinese input
- Live translations and romanization (pinyin) display
- Toggle between typing source text or translation
- Visual keyboard highlighting and hand position guides
- Real-time WPM, CPM, accuracy, and error tracking

Gamification & Motivation:
- 14+ achievements across 4 tiers (bronze, silver, gold, platinum)
- Daily practice streak tracking with visual indicators
- Automatic achievement unlocks after typing sessions
- Progress milestones for speed, accuracy, and consistency
- Bilingual practice rewards and Chinese mastery challenges

User Experience:
- Dark mode with system preference detection
- Theme persistence across sessions
- 5 sound profiles (Classic, Mechanical, Soft, Typewriter, Silent)
- Background music with volume controls (3 lofi tracks)
- Responsive design with polished UI
- Loading states and error handling

Data & Progress:
- SQLite database for scalable storage
- Comprehensive progress tracking (WPM, CPM, CER)
- Per-pack statistics and performance trends
- Attempt history with full metrics
- Error heatmap data for weak character identification

Quick start

Backend Setup:
1) (Optional) Create a Python venv
   python3 -m venv .venv && source .venv/bin/activate

2) Install dependencies
   pip install -r requirements.txt

3) Run the API (http://127.0.0.1:8000)
   uvicorn server.main:app --reload

Frontend Setup:
1) Install dependencies
   npm install

2) Run the development server (http://localhost:3000)
   npm run dev

3) Open your browser and navigate to http://localhost:3000

Try the API endpoints
   - List packs:        curl 'http://127.0.0.1:8000/packs'
   - Pack items:        curl 'http://127.0.0.1:8000/packs/wikivoyage-travel-zh-en/items?limit=5'
   - Post an attempt:
     curl -X POST 'http://127.0.0.1:8000/attempts' \
       -H 'Content-Type: application/json' \
       -d '{"user_id":"u1","item_id":"wikitravel-0001","lang":"zh","typed_text":"你好！","target_text":"你好！","duration_ms":3000}'
   - User progress:     curl 'http://127.0.0.1:8000/users/u1/progress'

Offline mode
- If you cannot install packages, you can still explore the data format in `packs/` and inspect the ETL and scripts. The app runtime requires FastAPI to serve HTTP.
- The Next.js UI now calls the backend for packs, so set `NEXT_PUBLIC_API_BASE_URL` (defaults to `http://127.0.0.1:8000`).
- `NEXT_PUBLIC_USER_ID` controls which user profile progress is fetched for (defaults to `demo-user`).
- Background music streams from royalty-free Pixabay tracks; audio loads only after you toggle it in the Sound menu.

Project layout
- app/                           Next.js application directory
  - page.tsx                     Main application page
  - layout.tsx                   Root layout with theme provider
  - globals.css                  Global styles with dark mode
- components/                    React components
  - TypingArea.tsx               Core typing functionality
  - LessonController.tsx         Pack/lesson selection
  - ProgressOverview.tsx         Stats and streak display
  - AchievementBadge.tsx         Achievement system UI
  - ThemeProvider.tsx            Dark mode context
  - ThemeToggle.tsx              Theme switcher button
  - Keyboard.tsx                 Visual keyboard display
  - HandsDisplay.tsx             Finger position guide
  - StatsDisplay.tsx             Real-time typing metrics
  - SoundSettings.tsx            Audio controls
- server/                        FastAPI backend
  - main.py                      API endpoints
  - database.py                  SQLite database layer
  - achievements.py              Achievement system logic
  - packs.py                     Pack discovery and loading
  - metrics.py                   WPM/CPM/CER calculation
  - external_sources.py          Remote catalog fetching
- packs/                         Content packs
  - <pack_id>/metadata.json      Pack metadata
  - <pack_id>/items.jsonl        Lesson items
- data/                          Application data
  - typing.db                    SQLite database (auto-created)
- types/                         TypeScript type definitions
- utils/                         Utility functions and API client
- requirements.txt               Python dependencies
- package.json                   Node.js dependencies

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

API Endpoints

Content Packs:
- GET /packs
  Query params: lang, topic (optional)
  Returns pack metadata and item counts.

- GET /packs/{pack_id}/items
  Query params: offset, limit, tag (optional)
  Returns paginated items from the pack.

Typing Attempts:
- POST /attempts
  Body: { user_id, item_id, lang, typed_text, target_text, duration_ms, pack_id? }
  Computes metrics, updates streak, checks achievements.
  Returns: { ok, attempt_id, metrics, streak, new_achievements }

User Management:
- POST /users
  Body: { user_id, username, email? }
  Creates a new user account.

- GET /users/{user_id}
  Returns user profile information.

- GET /users/{user_id}/attempts
  Query params: pack_id, limit, offset (optional)
  Returns paginated typing attempt history.

- GET /users/{user_id}/progress
  Returns overall stats, per-pack breakdown, and streak data.

- GET /users/{user_id}/streak
  Returns current streak and longest streak.

- GET /users/{user_id}/achievements
  Returns all achievements (earned and locked).

External Content:
- GET /external/sources
  Lists remote vocabulary catalogs (HSK, Tatoeba).

- GET /external/sources/{source_id}
  Fetches items from remote source.
  Returns: { pack, items }

Notes on licensing
- Each item carries `source` and `license` fields. Keep these when building new packs. Some sources (e.g., CC BY-SA) require share-alike; follow their terms.

ETL & translation
- `etl/build_pack.py` can attach pinyin/OpenCC if optional libs are installed. For production, prefer pre-translating content and storing translations with source/engine fields.
