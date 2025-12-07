from typing import Optional, List, Dict, Any
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from .packs import list_packs, get_pack_items, pack_exists
from .storage import append_attempt, get_attempts_by_user
from .metrics import compute_metrics, aggregate_progress


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
    record = {**payload, **metrics}
    append_attempt(record)
    return {"ok": True, "metrics": metrics}


@app.get("/users/{user_id}/progress")
def api_user_progress(user_id: str):
    attempts = get_attempts_by_user(user_id)
    return aggregate_progress(attempts)


@app.get("/")
def root():
    return {"status": "ok", "endpoints": ["/packs", "/packs/{id}/items", "/attempts", "/users/{id}/progress"]}

