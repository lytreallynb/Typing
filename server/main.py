from typing import Optional, List, Dict, Any
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from .packs import list_packs, get_pack_items, pack_exists
from .database import (
    record_attempt, get_user_attempts, get_user_stats,
    update_streak, get_streak, create_user, get_user
)
from .metrics import compute_metrics
from .external_sources import list_sources, fetch_source_items, SourceNotAvailable
from .achievements import check_achievements, get_user_achievements
from datetime import date


app = FastAPI(title="Typing+Language Backend", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/packs")
def api_list_packs(lang: Optional[str] = Query(default=None), topic: Optional[str] = Query(default=None)):
    return list_packs(lang=lang, topic=topic)


@app.get("/packs/{pack_id}/items")
def api_get_pack_items(pack_id: str, offset: int = 0, limit: int = 50, tag: Optional[str] = Query(default=None)):
    if not pack_exists(pack_id):
        raise HTTPException(status_code=404, detail="Pack not found")
    return {
        "pack_id": pack_id,
        "offset": offset,
        "limit": limit,
        "items": list(get_pack_items(pack_id, offset=offset, limit=limit, tag=tag)),
    }


@app.post("/attempts")
def api_post_attempt(payload: Dict[str, Any]):
    required = ["user_id", "item_id", "lang", "typed_text", "target_text", "duration_ms"]
    for key in required:
        if key not in payload:
            raise HTTPException(status_code=400, detail=f"Missing field: {key}")

    metrics = compute_metrics(
        lang=payload.get("lang"),
        typed_text=payload.get("typed_text", ""),
        target_text=payload.get("target_text", ""),
        duration_ms=int(payload.get("duration_ms", 0)),
    )

    attempt_id = record_attempt(
        user_id=payload["user_id"],
        item_id=payload["item_id"],
        lang=payload["lang"],
        typed_text=payload["typed_text"],
        target_text=payload["target_text"],
        duration_ms=payload["duration_ms"],
        pack_id=payload.get("pack_id"),
        metrics=metrics
    )

    # Update streak
    today = date.today().isoformat()
    streak_data = update_streak(payload["user_id"], today)

    # Check for new achievements
    new_achievements = check_achievements(payload["user_id"])

    return {
        "ok": True,
        "attempt_id": attempt_id,
        "metrics": metrics,
        "streak": streak_data,
        "new_achievements": new_achievements
    }


@app.get("/users/{user_id}/progress")
def api_user_progress(user_id: str):
    stats = get_user_stats(user_id)
    streak = get_streak(user_id)
    return {
        **stats,
        "streak": streak
    }


@app.get("/users/{user_id}/attempts")
def api_user_attempts(
    user_id: str,
    pack_id: Optional[str] = None,
    limit: int = 100,
    offset: int = 0
):
    attempts = get_user_attempts(user_id, pack_id=pack_id, limit=limit, offset=offset)
    return {
        "user_id": user_id,
        "pack_id": pack_id,
        "total": len(attempts),
        "attempts": attempts
    }


@app.get("/users/{user_id}/streak")
def api_user_streak(user_id: str):
    return get_streak(user_id)


@app.post("/users")
def api_create_user(payload: Dict[str, Any]):
    required = ["user_id", "username"]
    for key in required:
        if key not in payload:
            raise HTTPException(status_code=400, detail=f"Missing field: {key}")

    success = create_user(
        user_id=payload["user_id"],
        username=payload["username"],
        email=payload.get("email")
    )

    if not success:
        raise HTTPException(status_code=409, detail="User already exists")

    return {"ok": True, "user_id": payload["user_id"]}


@app.get("/users/{user_id}")
def api_get_user(user_id: str):
    user = get_user(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@app.get("/users/{user_id}/achievements")
def api_user_achievements(user_id: str):
    return get_user_achievements(user_id)


@app.get("/external/sources")
def api_external_sources():
    return list_sources()


@app.get("/external/sources/{source_id}")
async def api_fetch_external_source(source_id: str, limit: int = 100):
    try:
        return await fetch_source_items(source_id, limit=limit)
    except SourceNotAvailable as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc


@app.get("/")
def root():
    return {
        "status": "ok",
        "endpoints": [
            "/packs",
            "/packs/{id}/items",
            "/attempts",
            "/users",
            "/users/{id}",
            "/users/{id}/progress",
            "/users/{id}/attempts",
            "/users/{id}/streak",
            "/users/{id}/achievements",
            "/external/sources",
            "/external/sources/{id}",
        ],
    }
