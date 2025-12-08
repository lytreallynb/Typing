"use client";

import { useEffect, useMemo, useState } from "react";
import type { Lesson, PackItem, PackSummary } from "@/types/lesson";
import {
  fetchExternalSourceItems,
  fetchExternalSources,
  fetchPackItems,
  fetchPacks,
} from "@/utils/api";
import type { ExternalSourceInfo } from "@/types/lesson";
import {
  OFFLINE_DEFAULT_LESSON,
  OFFLINE_LOCAL_LESSONS,
  OFFLINE_LOCAL_PACK,
} from "@/data/offlineData";

interface LessonControllerProps {
  onLessonSelect: (lesson: Lesson) => void;
  currentLessonId?: string;
  onPackChange?: (pack: PackSummary | null) => void;
}

const FALLBACK_PACK: PackSummary = OFFLINE_LOCAL_PACK;
const FALLBACK_LESSONS: Lesson[] = OFFLINE_LOCAL_LESSONS;
const FALLBACK_LESSON = OFFLINE_DEFAULT_LESSON || FALLBACK_LESSONS[0];

function mapPackItemToLesson(item: PackItem, pack: PackSummary): Lesson {
  const translationEntries = Object.entries(item.translation || {});
  const translationPreview = translationEntries.find(([lang]) => lang !== item.lang) || translationEntries[0];

  return {
    id: item.id,
    title: item.text.length > 64 ? `${item.text.slice(0, 61)}...` : item.text,
    description: translationPreview ? translationPreview[1] : pack.source,
    difficulty: String(item.difficulty?.hsk || item.difficulty?.freq_band || ""),
    type: (item.type as Lesson["type"]) || "sentences",
    content: item.text,
    lang: item.lang,
    translation: item.translation,
    romanization: item.romanization,
    packId: pack.id,
    pack,
    tags: item.tags,
    source: item.source || pack.source,
    license: item.license || pack.license,
  };
}

export default function LessonController({
  onLessonSelect,
  currentLessonId,
  onPackChange,
}: LessonControllerProps) {
  const [packs, setPacks] = useState<PackSummary[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>(FALLBACK_LESSONS);
  const [selectedPack, setSelectedPack] = useState<PackSummary | null>(FALLBACK_PACK);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [externalSources, setExternalSources] = useState<ExternalSourceInfo[]>([]);
  const [externalError, setExternalError] = useState<string | null>(null);
  const [importingSource, setImportingSource] = useState<string | null>(null);
  const [languageFilter, setLanguageFilter] = useState("all");
  const [topicFilter, setTopicFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");

  const availableLanguages = useMemo(() => {
    const langs = new Set<string>();
    lessons.forEach((lesson) => {
      if (lesson.lang) langs.add(lesson.lang);
    });
    packs.forEach((pack) => (pack.languages || []).forEach((lang) => langs.add(lang)));
    return Array.from(langs);
  }, [lessons, packs]);

  const availableTopics = useMemo(() => {
    const topics = new Set<string>();
    lessons.forEach((lesson) => (lesson.tags || []).forEach((tag) => topics.add(tag)));
    packs.forEach((pack) => (pack.topics || []).forEach((topic) => topics.add(topic)));
    return Array.from(topics);
  }, [lessons, packs]);

  const availableDifficulties = useMemo(() => {
    const diff = new Set<string>();
    lessons.forEach((lesson) => {
      if (lesson.difficulty) {
        diff.add(String(lesson.difficulty));
      }
    });
    return Array.from(diff);
  }, [lessons]);

  const filteredLessons = useMemo(() => {
    return lessons.filter((lesson) => {
      const lessonDifficulty = lesson.difficulty ? String(lesson.difficulty).toLowerCase() : "";
      const lessonTopics = new Set<string>([...(lesson.tags || []), ...(lesson.pack?.topics || [])]);
      if (languageFilter !== "all" && lesson.lang !== languageFilter) {
        return false;
      }
      if (
        difficultyFilter !== "all" &&
        lessonDifficulty !== difficultyFilter.toLowerCase()
      ) {
        return false;
      }
      if (topicFilter !== "all" && !lessonTopics.has(topicFilter)) {
        return false;
      }
      return true;
    });
  }, [lessons, languageFilter, topicFilter, difficultyFilter]);

  // Initial load of available packs
  useEffect(() => {
    const load = async () => {
      try {
        const fetchedPacks = await fetchPacks();
        setPacks(fetchedPacks);
        if (fetchedPacks.length === 0) {
          onPackChange?.(FALLBACK_PACK);
          if (FALLBACK_LESSON) {
            onLessonSelect(FALLBACK_LESSON);
          }
          return;
        }
        await handlePackSelect(fetchedPacks[0]);
      } catch (err) {
        console.error("Failed to load packs", err);
        setError("Offline mode: using bundled practice lessons.");
        setSelectedPack(FALLBACK_PACK);
        setLessons(FALLBACK_LESSONS);
        onPackChange?.(FALLBACK_PACK);
        if (FALLBACK_LESSON) {
          onLessonSelect(FALLBACK_LESSON);
        }
      }
    };

    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const loadCatalog = async () => {
      try {
        const catalog = await fetchExternalSources();
        setExternalSources(catalog);
        setExternalError(null);
      } catch (err) {
        console.warn("Failed to load external sources", err);
        setExternalError("External catalog unavailable (check backend connection).");
      }
    };
    loadCatalog();
  }, []);

  const handlePackSelect = async (pack: PackSummary) => {
    setSelectedPack(pack);
    onPackChange?.(pack);
    setLoading(true);
    setError(null);
    try {
      const response = await fetchPackItems(pack.id, { limit: 100 });
      const mappedLessons = response.items.map((item) => mapPackItemToLesson(item, pack));
      setLessons(mappedLessons);
      if (mappedLessons.length > 0) {
        onLessonSelect(mappedLessons[0]);
      }
    } catch (err) {
      console.error(`Failed to load pack ${pack.id}`, err);
      setError("Unable to load pack items. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLessonSelect = (lesson: Lesson) => {
    if (lesson.pack) {
      setSelectedPack(lesson.pack);
      onPackChange?.(lesson.pack);
    }
    onLessonSelect(lesson);
  };

  const handlePackButtonClick = (pack: PackSummary) => {
    if (pack.id === selectedPack?.id && packs.length > 0) return;
    void handlePackSelect(pack);
  };

  const renderLessonCard = (lesson: Lesson) => {
    const translationEntries = Object.entries(lesson.translation || {});
    const translationPreview = translationEntries.find(([lang]) => lang !== lesson.lang) || translationEntries[0];
    return (
      <button
        key={lesson.id}
        onClick={() => handleLessonSelect(lesson)}
        className={`text-left px-4 py-3 rounded-xl transition-all duration-200 border overflow-hidden ${
          currentLessonId === lesson.id
            ? "border-blue-400 bg-blue-50 shadow-sm"
            : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
        }`}
      >
        <div className="text-xs font-medium text-gray-400 mb-1 truncate">
          {lesson.pack?.name || lesson.type}
        </div>
        <div className="text-sm font-medium text-gray-900 line-clamp-2">
          {lesson.content}
        </div>
        {translationPreview && (
          <div className="text-xs text-gray-500 mt-2 line-clamp-2">
            {translationPreview[0].toUpperCase()}: {translationPreview[1]}
          </div>
        )}
      </button>
    );
  };

  const handleExternalImport = async (source: ExternalSourceInfo) => {
    setImportingSource(source.id);
    try {
      const payload = await fetchExternalSourceItems(source.id, 80);
      const pack = {
        ...payload.pack,
        count: payload.items.length,
      };
      setPacks((prev) => {
        if (prev.find((p) => p.id === pack.id)) {
          return prev;
        }
        return [...prev, pack];
      });
      const mappedLessons = payload.items.map((item) => mapPackItemToLesson(item, pack));
      setLessons(mappedLessons);
      setSelectedPack(pack);
      onPackChange?.(pack);
      if (mappedLessons.length > 0) {
        onLessonSelect(mappedLessons[0]);
      }
      setExternalError(null);
    } catch (err) {
      console.error("Failed to import external source", err);
      setExternalError(`Unable to import ${source.name}. Please try again later.`);
    } finally {
      setImportingSource(null);
    }
  };

  return (
    <div className="mb-12">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between mb-4">
        <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
          Language Packs
        </h2>
        {selectedPack && (
          <div className="text-xs text-gray-400">
            Source: {selectedPack.source || "Unknown"} · License: {selectedPack.license || "Unknown"}
          </div>
        )}
      </div>

      {packs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {packs.map((pack) => (
            <button
              key={pack.id}
              onClick={() => handlePackButtonClick(pack)}
              className={`text-left px-4 py-3 rounded-xl border transition-colors ${
                selectedPack?.id === pack.id
                  ? "border-blue-400 bg-blue-50"
                  : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              <div className="text-xs uppercase tracking-wide text-gray-400 mb-1">
                {pack.languages.join(" · ")}
              </div>
              <div className="text-sm font-semibold text-gray-900">{pack.name}</div>
              <div className="text-xs text-gray-500 mt-1">
                {(pack.topics || []).slice(0, 3).join(" · ")}
              </div>
              <div className="text-[11px] text-gray-400 mt-1">
                {pack.count ?? 0} entries
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="mb-6 text-sm text-gray-500">
          Using bundled practice lessons (offline mode).
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
          {error}
        </div>
      )}

      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
            Open Vocabulary Catalog
          </h3>
          {externalError && (
            <span className="text-xs text-red-500">{externalError}</span>
          )}
        </div>
        {externalSources.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {externalSources.map((source) => (
              <div
                key={source.id}
                className="border border-dashed border-gray-200 rounded-2xl p-4 bg-white"
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="text-sm font-semibold text-gray-900">
                      {source.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {source.license || "Open source"}
                    </div>
                  </div>
                  <button
                    onClick={() => handleExternalImport(source)}
                    disabled={importingSource === source.id}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                      importingSource === source.id
                        ? "bg-gray-200 text-gray-500"
                        : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                    }`}
                  >
                    {importingSource === source.id ? "Importing…" : "Import"}
                  </button>
                </div>
                <p className="text-xs text-gray-600 mb-2">
                  {source.description || "Open dataset"}
                </p>
                <div className="text-[11px] text-gray-400">
                  {(source.languages || []).join(" · ")}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-xs text-gray-500">
            No external catalog entries are currently available.
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
          Entries
        </h3>
        {loading && <span className="text-xs text-gray-400">Loading…</span>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <label className="text-xs text-gray-500 uppercase tracking-wide">
          Language
          <select
            className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
            value={languageFilter}
            onChange={(e) => setLanguageFilter(e.target.value)}
          >
            <option value="all">All</option>
            {availableLanguages.map((lang) => (
              <option key={lang} value={lang}>
                {lang.toUpperCase()}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs text-gray-500 uppercase tracking-wide">
          Topic
          <select
            className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
            value={topicFilter}
            onChange={(e) => setTopicFilter(e.target.value)}
          >
            <option value="all">All</option>
            {availableTopics.map((topic) => (
              <option key={topic} value={topic}>
                {topic}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs text-gray-500 uppercase tracking-wide">
          Difficulty
          <select
            className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
          >
            <option value="all">All</option>
            {availableDifficulties.map((difficulty) => (
              <option key={difficulty} value={difficulty.toLowerCase()}>
                {difficulty || "Unlabeled"}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredLessons.map((lesson) => renderLessonCard(lesson))}
      </div>
    </div>
  );
}
