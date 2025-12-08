const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000").replace(/\/$/, "");

import type {
  AttemptPayload,
  ExternalSourceInfo,
  ExternalSourcePayload,
  PackItem,
  PackSummary,
  UserProgress,
  UserAchievements,
  StreakData,
} from "@/types/lesson";
import {
  OFFLINE_ACHIEVEMENTS,
  OFFLINE_EXTERNAL_PAYLOADS,
  OFFLINE_EXTERNAL_SOURCES,
  OFFLINE_PACK_ITEMS,
  OFFLINE_PACKS,
  OFFLINE_PROGRESS,
} from "@/data/offlineData";

interface PackItemsResponse {
  pack_id: string;
  offset: number;
  limit: number;
  items: PackItem[];
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const message = await res.text();
    throw new Error(message || `Request failed: ${res.status}`);
  }

  return (await res.json()) as T;
}

export async function fetchPacks(): Promise<PackSummary[]> {
  try {
    return await request<PackSummary[]>("/packs");
  } catch (err) {
    console.warn("Falling back to offline packs", err);
    return OFFLINE_PACKS;
  }
}

interface FetchPackItemsParams {
  limit?: number;
  offset?: number;
  tag?: string;
}

export async function fetchPackItems(
  packId: string,
  params: FetchPackItemsParams = {}
): Promise<PackItemsResponse> {
  const search = new URLSearchParams();
  if (params.limit) search.set("limit", String(params.limit));
  if (params.offset) search.set("offset", String(params.offset));
  if (params.tag) search.set("tag", params.tag);
  const query = search.toString();
  const suffix = query ? `?${query}` : "";
  try {
    return await request<PackItemsResponse>(`/packs/${packId}/items${suffix}`);
  } catch (err) {
    const fallbackItems = OFFLINE_PACK_ITEMS[packId];
    if (!fallbackItems) {
      throw err;
    }
    console.warn(`Falling back to offline items for ${packId}`, err);
    let items = fallbackItems;
    if (params.tag) {
      items = items.filter((item) => (item.tags || []).includes(params.tag as string));
    }
    const offset = params.offset ?? 0;
    const limit = params.limit ?? items.length;
    return {
      pack_id: packId,
      offset,
      limit,
      items: items.slice(offset, offset + limit),
    };
  }
}

export async function recordAttempt(payload: AttemptPayload) {
  try {
    return await request<{ ok: boolean; metrics: unknown }>("/attempts", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.warn("Unable to sync attempt, storing offline only", err);
    return { ok: true, metrics: { offline: true } };
  }
}

export async function fetchProgress(userId: string) {
  try {
    return await request<UserProgress>(`/users/${encodeURIComponent(userId)}/progress`);
  } catch (err) {
    console.warn("Falling back to offline progress", err);
    return OFFLINE_PROGRESS;
  }
}

export async function fetchExternalSources() {
  try {
    return await request<ExternalSourceInfo[]>("/external/sources");
  } catch (err) {
    console.warn("Falling back to offline external catalog", err);
    return OFFLINE_EXTERNAL_SOURCES;
  }
}

export async function fetchExternalSourceItems(sourceId: string, limit = 80) {
  try {
    return await request<ExternalSourcePayload>(`/external/sources/${sourceId}?limit=${limit}`);
  } catch (err) {
    const payload = OFFLINE_EXTERNAL_PAYLOADS[sourceId];
    if (!payload) {
      throw err;
    }
    console.warn(`Falling back to offline payload for ${sourceId}`, err);
    return {
      pack: payload.pack,
      items: payload.items.slice(0, limit),
    };
  }
}

export async function fetchUserAchievements(userId: string) {
  try {
    return await request<UserAchievements>(`/users/${encodeURIComponent(userId)}/achievements`);
  } catch (err) {
    console.warn("Falling back to offline achievements", err);
    return OFFLINE_ACHIEVEMENTS;
  }
}

export async function fetchUserStreak(userId: string) {
  try {
    return await request<StreakData>(`/users/${encodeURIComponent(userId)}/streak`);
  } catch (err) {
    console.warn("Falling back to offline streak", err);
    return OFFLINE_PROGRESS.streak || { current_streak: 0, longest_streak: 0 };
  }
}
