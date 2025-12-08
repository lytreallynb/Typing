"""
Achievement system for gamification and user motivation.
Tracks milestones, badges, and accomplishments.
"""

from typing import List, Dict, Any, Optional
from .database import get_cursor

# Define default achievements
DEFAULT_ACHIEVEMENTS = [
    {
        "id": "first_lesson",
        "name": "First Steps",
        "description": "Complete your first typing lesson",
        "icon": "star",
        "criteria": "attempts >= 1",
        "tier": "bronze"
    },
    {
        "id": "speed_demon_50",
        "name": "Speed Demon",
        "description": "Reach 50 WPM in a single attempt",
        "icon": "zap",
        "criteria": "wpm >= 50",
        "tier": "silver"
    },
    {
        "id": "speed_demon_80",
        "name": "Lightning Fingers",
        "description": "Reach 80 WPM in a single attempt",
        "icon": "zap-double",
        "criteria": "wpm >= 80",
        "tier": "gold"
    },
    {
        "id": "speed_demon_100",
        "name": "Sonic Typist",
        "description": "Reach 100 WPM in a single attempt",
        "icon": "rocket",
        "criteria": "wpm >= 100",
        "tier": "platinum"
    },
    {
        "id": "accuracy_master",
        "name": "Perfectionist",
        "description": "Complete a lesson with 100% accuracy",
        "icon": "target",
        "criteria": "accuracy == 100",
        "tier": "gold"
    },
    {
        "id": "streak_7",
        "name": "Week Warrior",
        "description": "Practice for 7 days in a row",
        "icon": "fire",
        "criteria": "streak >= 7",
        "tier": "silver"
    },
    {
        "id": "streak_30",
        "name": "Monthly Master",
        "description": "Practice for 30 days in a row",
        "icon": "fire-double",
        "criteria": "streak >= 30",
        "tier": "gold"
    },
    {
        "id": "streak_100",
        "name": "Century Streak",
        "description": "Practice for 100 days in a row",
        "icon": "trophy",
        "criteria": "streak >= 100",
        "tier": "platinum"
    },
    {
        "id": "marathon_10",
        "name": "Practice Apprentice",
        "description": "Complete 10 typing attempts",
        "icon": "book",
        "criteria": "attempts >= 10",
        "tier": "bronze"
    },
    {
        "id": "marathon_50",
        "name": "Dedicated Learner",
        "description": "Complete 50 typing attempts",
        "icon": "book-open",
        "criteria": "attempts >= 50",
        "tier": "silver"
    },
    {
        "id": "marathon_100",
        "name": "Practice Master",
        "description": "Complete 100 typing attempts",
        "icon": "graduation-cap",
        "criteria": "attempts >= 100",
        "tier": "gold"
    },
    {
        "id": "polyglot_beginner",
        "name": "Bilingual Beginner",
        "description": "Practice in both English and Chinese",
        "icon": "globe",
        "criteria": "languages >= 2",
        "tier": "silver"
    },
    {
        "id": "chinese_master",
        "name": "Chinese Character Master",
        "description": "Complete 50 Chinese typing attempts",
        "icon": "chinese",
        "criteria": "chinese_attempts >= 50",
        "tier": "gold"
    },
    {
        "id": "hsk_explorer",
        "name": "HSK Explorer",
        "description": "Practice with 3 different HSK level packs",
        "icon": "map",
        "criteria": "hsk_packs >= 3",
        "tier": "silver"
    }
]


def init_achievements():
    """Initialize default achievements in the database."""
    with get_cursor() as cursor:
        for achievement in DEFAULT_ACHIEVEMENTS:
            cursor.execute("""
                INSERT OR IGNORE INTO achievements (id, name, description, icon, criteria, tier)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (
                achievement["id"],
                achievement["name"],
                achievement["description"],
                achievement["icon"],
                achievement["criteria"],
                achievement["tier"]
            ))


def check_achievements(user_id: str) -> List[Dict[str, Any]]:
    """
    Check if user has unlocked any new achievements.
    Returns list of newly unlocked achievements.
    """
    newly_unlocked = []

    with get_cursor() as cursor:
        # Get user stats for achievement checking
        cursor.execute("""
            SELECT
                COUNT(*) as total_attempts,
                MAX(wpm) as max_wpm,
                MAX(accuracy) as max_accuracy,
                COUNT(DISTINCT lang) as languages_count,
                SUM(CASE WHEN lang = 'zh' THEN 1 ELSE 0 END) as chinese_attempts
            FROM attempts
            WHERE user_id = ?
        """, (user_id,))

        stats = dict(cursor.fetchone())

        # Get current streak
        cursor.execute("""
            SELECT current_streak FROM streaks WHERE user_id = ?
        """, (user_id,))
        streak_row = cursor.fetchone()
        current_streak = streak_row["current_streak"] if streak_row else 0

        # Get pack diversity
        cursor.execute("""
            SELECT COUNT(DISTINCT pack_id) as pack_count
            FROM attempts
            WHERE user_id = ? AND pack_id LIKE '%hsk%'
        """, (user_id,))
        hsk_row = cursor.fetchone()
        hsk_packs = hsk_row["pack_count"] if hsk_row else 0

        # Get achievements user doesn't have yet
        cursor.execute("""
            SELECT a.* FROM achievements a
            WHERE a.id NOT IN (
                SELECT achievement_id FROM user_achievements
                WHERE user_id = ?
            )
        """, (user_id,))

        unclaimed = cursor.fetchall()

        # Check each unclaimed achievement
        for achievement in unclaimed:
            criteria = achievement["criteria"]
            unlocked = False

            # Parse and evaluate criteria (simple evaluation)
            if "attempts >=" in criteria:
                threshold = int(criteria.split(">=")[1].strip())
                if stats["total_attempts"] >= threshold:
                    unlocked = True

            elif "wpm >=" in criteria:
                threshold = int(criteria.split(">=")[1].strip())
                if stats["max_wpm"] and stats["max_wpm"] >= threshold:
                    unlocked = True

            elif "accuracy ==" in criteria:
                threshold = float(criteria.split("==")[1].strip())
                if stats["max_accuracy"] and stats["max_accuracy"] >= threshold:
                    unlocked = True

            elif "streak >=" in criteria:
                threshold = int(criteria.split(">=")[1].strip())
                if current_streak >= threshold:
                    unlocked = True

            elif "languages >=" in criteria:
                threshold = int(criteria.split(">=")[1].strip())
                if stats["languages_count"] >= threshold:
                    unlocked = True

            elif "chinese_attempts >=" in criteria:
                threshold = int(criteria.split(">=")[1].strip())
                if stats["chinese_attempts"] >= threshold:
                    unlocked = True

            elif "hsk_packs >=" in criteria:
                threshold = int(criteria.split(">=")[1].strip())
                if hsk_packs >= threshold:
                    unlocked = True

            if unlocked:
                # Award achievement
                cursor.execute("""
                    INSERT INTO user_achievements (user_id, achievement_id)
                    VALUES (?, ?)
                """, (user_id, achievement["id"]))

                newly_unlocked.append({
                    "id": achievement["id"],
                    "name": achievement["name"],
                    "description": achievement["description"],
                    "icon": achievement["icon"],
                    "tier": achievement["tier"]
                })

    return newly_unlocked


def get_user_achievements(user_id: str) -> Dict[str, Any]:
    """Get all achievements for a user, both earned and locked."""
    with get_cursor() as cursor:
        # Get all achievements
        cursor.execute("SELECT * FROM achievements ORDER BY tier, name")
        all_achievements = [dict(row) for row in cursor.fetchall()]

        # Get user's earned achievements
        cursor.execute("""
            SELECT achievement_id, earned_at, progress
            FROM user_achievements
            WHERE user_id = ?
        """, (user_id,))
        earned = {row["achievement_id"]: dict(row) for row in cursor.fetchall()}

        # Combine data
        result = {
            "total_achievements": len(all_achievements),
            "earned_count": len(earned),
            "achievements": []
        }

        for achievement in all_achievements:
            achievement_data = dict(achievement)
            if achievement["id"] in earned:
                achievement_data["earned"] = True
                achievement_data["earned_at"] = earned[achievement["id"]]["earned_at"]
                achievement_data["progress"] = earned[achievement["id"]]["progress"]
            else:
                achievement_data["earned"] = False
                achievement_data["progress"] = 0.0

            result["achievements"].append(achievement_data)

        return result


# Initialize achievements on module import
init_achievements()
