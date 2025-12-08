"""
Database module using SQLite for persistent storage.
Replaces JSONL-based storage for better scalability and querying.
"""

import sqlite3
from pathlib import Path
from typing import Optional, Dict, List, Any
from datetime import datetime
import json
from contextlib import contextmanager
import threading

# Thread-local storage for database connections
_thread_local = threading.local()

DB_PATH = Path(__file__).parent.parent / "data" / "typing.db"


def get_connection() -> sqlite3.Connection:
    """Get or create a thread-local database connection."""
    if not hasattr(_thread_local, "connection"):
        DB_PATH.parent.mkdir(parents=True, exist_ok=True)
        conn = sqlite3.connect(str(DB_PATH), check_same_thread=False)
        conn.row_factory = sqlite3.Row  # Return rows as dictionaries
        _thread_local.connection = conn
    return _thread_local.connection


@contextmanager
def get_cursor():
    """Context manager for database cursor with automatic commit/rollback."""
    conn = get_connection()
    cursor = conn.cursor()
    try:
        yield cursor
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        cursor.close()


def init_database():
    """Initialize database schema."""
    with get_cursor() as cursor:
        # Users table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                username TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE,
                password_hash TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                settings TEXT DEFAULT '{}'
            )
        """)

        # Attempts table - stores individual typing attempts
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS attempts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                item_id TEXT NOT NULL,
                pack_id TEXT,
                lang TEXT NOT NULL,
                typed_text TEXT NOT NULL,
                target_text TEXT NOT NULL,
                duration_ms INTEGER NOT NULL,
                wpm REAL,
                cpm REAL,
                cer REAL,
                error_count INTEGER,
                accuracy REAL,
                error_heatmap TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        """)

        # Achievements table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS achievements (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                description TEXT,
                icon TEXT,
                criteria TEXT NOT NULL,
                tier TEXT DEFAULT 'bronze'
            )
        """)

        # User achievements - tracks which achievements users have earned
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS user_achievements (
                user_id TEXT NOT NULL,
                achievement_id TEXT NOT NULL,
                earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                progress REAL DEFAULT 1.0,
                PRIMARY KEY (user_id, achievement_id),
                FOREIGN KEY (user_id) REFERENCES users(id),
                FOREIGN KEY (achievement_id) REFERENCES achievements(id)
            )
        """)

        # Streaks table - tracks daily practice streaks
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS streaks (
                user_id TEXT PRIMARY KEY,
                current_streak INTEGER DEFAULT 0,
                longest_streak INTEGER DEFAULT 0,
                last_practice_date DATE,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        """)

        # Milestones table - tracks progress milestones
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS milestones (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                milestone_type TEXT NOT NULL,
                value INTEGER NOT NULL,
                achieved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        """)

        # Create indices for common queries
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_attempts_user ON attempts(user_id)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_attempts_pack ON attempts(pack_id)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_attempts_created ON attempts(created_at)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON user_achievements(user_id)")

        # Insert default demo user if not exists
        cursor.execute("""
            INSERT OR IGNORE INTO users (id, username, email)
            VALUES ('demo-user', 'demo', 'demo@example.com')
        """)

        # Insert default streak record for demo user
        cursor.execute("""
            INSERT OR IGNORE INTO streaks (user_id, current_streak, longest_streak)
            VALUES ('demo-user', 0, 0)
        """)


def record_attempt(
    user_id: str,
    item_id: str,
    lang: str,
    typed_text: str,
    target_text: str,
    duration_ms: int,
    pack_id: Optional[str] = None,
    metrics: Optional[Dict[str, Any]] = None
) -> int:
    """Record a typing attempt and return the attempt ID."""
    with get_cursor() as cursor:
        wpm = metrics.get("wpm") if metrics else None
        cpm = metrics.get("cpm") if metrics else None
        cer = metrics.get("cer") if metrics else None
        error_count = metrics.get("error_count") if metrics else None
        accuracy = metrics.get("accuracy") if metrics else None
        error_heatmap = json.dumps(metrics.get("error_heatmap", {})) if metrics else None

        cursor.execute("""
            INSERT INTO attempts (
                user_id, item_id, pack_id, lang, typed_text, target_text,
                duration_ms, wpm, cpm, cer, error_count, accuracy, error_heatmap
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            user_id, item_id, pack_id, lang, typed_text, target_text,
            duration_ms, wpm, cpm, cer, error_count, accuracy, error_heatmap
        ))

        # Update user last_active
        cursor.execute("""
            UPDATE users SET last_active = CURRENT_TIMESTAMP
            WHERE id = ?
        """, (user_id,))

        return cursor.lastrowid


def get_user_attempts(
    user_id: str,
    pack_id: Optional[str] = None,
    limit: int = 100,
    offset: int = 0
) -> List[Dict[str, Any]]:
    """Get typing attempts for a user, optionally filtered by pack."""
    with get_cursor() as cursor:
        if pack_id:
            cursor.execute("""
                SELECT * FROM attempts
                WHERE user_id = ? AND pack_id = ?
                ORDER BY created_at DESC
                LIMIT ? OFFSET ?
            """, (user_id, pack_id, limit, offset))
        else:
            cursor.execute("""
                SELECT * FROM attempts
                WHERE user_id = ?
                ORDER BY created_at DESC
                LIMIT ? OFFSET ?
            """, (user_id, limit, offset))

        rows = cursor.fetchall()
        return [dict(row) for row in rows]


def get_user_stats(user_id: str) -> Dict[str, Any]:
    """Get aggregated statistics for a user."""
    with get_cursor() as cursor:
        # Overall stats
        cursor.execute("""
            SELECT
                COUNT(*) as total_attempts,
                AVG(wpm) as avg_wpm,
                AVG(cpm) as avg_cpm,
                AVG(cer) as avg_cer,
                AVG(accuracy) as avg_accuracy,
                SUM(duration_ms) as total_time_ms,
                MAX(wpm) as best_wpm
            FROM attempts
            WHERE user_id = ?
        """, (user_id,))

        overall = dict(cursor.fetchone())

        # Per-pack stats
        cursor.execute("""
            SELECT
                pack_id,
                COUNT(*) as attempts,
                AVG(wpm) as avg_wpm,
                AVG(cpm) as avg_cpm,
                AVG(cer) as avg_cer,
                AVG(accuracy) as avg_accuracy
            FROM attempts
            WHERE user_id = ? AND pack_id IS NOT NULL
            GROUP BY pack_id
        """, (user_id,))

        per_pack = [dict(row) for row in cursor.fetchall()]

        return {
            "overall": overall,
            "per_pack": per_pack
        }


def update_streak(user_id: str, practice_date: str) -> Dict[str, int]:
    """Update user's practice streak based on practice date."""
    with get_cursor() as cursor:
        # Get current streak data
        cursor.execute("""
            SELECT current_streak, longest_streak, last_practice_date
            FROM streaks
            WHERE user_id = ?
        """, (user_id,))

        row = cursor.fetchone()
        if not row:
            # Initialize streak for new user
            cursor.execute("""
                INSERT INTO streaks (user_id, current_streak, longest_streak, last_practice_date)
                VALUES (?, 1, 1, ?)
            """, (user_id, practice_date))
            return {"current_streak": 1, "longest_streak": 1}

        current_streak = row["current_streak"]
        longest_streak = row["longest_streak"]
        last_date = row["last_practice_date"]

        # Parse dates
        from datetime import datetime, timedelta
        practice_dt = datetime.strptime(practice_date, "%Y-%m-%d").date()

        if last_date:
            last_dt = datetime.strptime(last_date, "%Y-%m-%d").date()
            days_diff = (practice_dt - last_dt).days

            if days_diff == 0:
                # Same day, no change
                pass
            elif days_diff == 1:
                # Consecutive day, increment streak
                current_streak += 1
                longest_streak = max(longest_streak, current_streak)
            else:
                # Streak broken, reset
                current_streak = 1
        else:
            # First practice
            current_streak = 1
            longest_streak = 1

        # Update database
        cursor.execute("""
            UPDATE streaks
            SET current_streak = ?, longest_streak = ?, last_practice_date = ?
            WHERE user_id = ?
        """, (current_streak, longest_streak, practice_date, user_id))

        return {
            "current_streak": current_streak,
            "longest_streak": longest_streak
        }


def get_streak(user_id: str) -> Dict[str, int]:
    """Get user's current streak information."""
    with get_cursor() as cursor:
        cursor.execute("""
            SELECT current_streak, longest_streak, last_practice_date
            FROM streaks
            WHERE user_id = ?
        """, (user_id,))

        row = cursor.fetchone()
        if row:
            return dict(row)
        return {"current_streak": 0, "longest_streak": 0, "last_practice_date": None}


def create_user(user_id: str, username: str, email: Optional[str] = None) -> bool:
    """Create a new user. Returns True if successful, False if user already exists."""
    try:
        with get_cursor() as cursor:
            cursor.execute("""
                INSERT INTO users (id, username, email)
                VALUES (?, ?, ?)
            """, (user_id, username, email))

            # Initialize streak record
            cursor.execute("""
                INSERT INTO streaks (user_id, current_streak, longest_streak)
                VALUES (?, 0, 0)
            """, (user_id,))

        return True
    except sqlite3.IntegrityError:
        return False


def get_user(user_id: str) -> Optional[Dict[str, Any]]:
    """Get user information by ID."""
    with get_cursor() as cursor:
        cursor.execute("""
            SELECT id, username, email, created_at, last_active, settings
            FROM users
            WHERE id = ?
        """, (user_id,))

        row = cursor.fetchone()
        return dict(row) if row else None


# Initialize database on module import
init_database()
