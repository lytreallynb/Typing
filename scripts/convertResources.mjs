#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import { parse } from "csv-parse/sync";
import AdmZip from "adm-zip";

const ROOT = process.cwd();
const RESOURCES_DIR = path.join(ROOT, "resources");
const DATA_DIR = path.join(ROOT, "data");
const LEVELS = ["A1", "A2", "B1", "B2"];

function mapDifficulty(value) {
  const numeric = Number(value ?? "0");
  if (numeric <= 1) return "A1";
  if (numeric === 2) return "A2";
  if (numeric === 3) return "B1";
  return "B2";
}

function buildSampleSentence(word) {
  return `I practice using "${word}" whenever I type in English.`;
}

function normalize(word) {
  return (word ?? "").trim().toLowerCase();
}

function parseArgs() {
  const args = process.argv.slice(2);
  const getValue = (flag) => {
    const index = args.indexOf(flag);
    if (index === -1) return undefined;
    return args[index + 1];
  };
  const limitArg = getValue("--limit");
  const outArg = getValue("--out");
  const skipRelations = args.includes("--skip-relations");
  return {
    limit: limitArg ? Number(limitArg) : undefined,
    outDir: outArg ? path.resolve(outArg) : DATA_DIR,
    useRelations: !skipRelations,
  };
}

async function readWordRows() {
  const filePath = path.join(RESOURCES_DIR, "word.csv");
  const content = await fs.readFile(filePath, "utf8");
  return parse(content, {
    columns: true,
    delimiter: ">",
    skip_empty_lines: true,
    trim: true,
  });
}

async function readTranslationMap() {
  const filePath = path.join(RESOURCES_DIR, "word_translation.csv");
  const content = await fs.readFile(filePath, "utf8");
  const rows = parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });
  const map = new Map();
  rows.forEach((row) => {
    const key = normalize(row.word);
    if (!key || map.has(key)) return;
    map.set(key, row.translation?.trim() ?? "");
  });
  return map;
}

function extractRelations(wordRows, activeIds) {
  const tagsByVocId = new Map();
  try {
    const zip = new AdmZip(path.join(RESOURCES_DIR, "relation_book_word.zip"));
    const entry = zip.getEntry("relation_book_word.csv");
    if (!entry) return new Map();
    const text = entry.getData().toString("utf8");
    const lines = text.split(/\r?\n/).slice(1);
    lines.forEach((line) => {
      if (!line) return;
      const parts = line.split(">");
      if (parts.length < 5) return;
      const vocId = parts[2];
      const tag = parts[4]?.trim();
      if (!tag || !activeIds.has(vocId)) return;
      const existing = tagsByVocId.get(vocId) ?? [];
      if (!existing.includes(tag)) {
        tagsByVocId.set(vocId, [...existing, tag].slice(0, 5));
      }
    });
  } catch (err) {
    console.warn("Unable to parse relation_book_word.csv:", err);
  }
  const wordById = new Map();
  wordRows.forEach((row) => {
    if (row.vc_id && row.vc_vocabulary) {
      wordById.set(row.vc_id, row.vc_vocabulary);
    }
  });
  const result = new Map();
  tagsByVocId.forEach((tags, id) => {
    const word = wordById.get(id);
    if (!word) return;
    result.set(word, tags);
  });
  return result;
}

function chunkByLevel(items, limit) {
  const map = {
    A1: [],
    A2: [],
    B1: [],
    B2: [],
  };
  items.forEach((item) => {
    const bucket = map[item.difficulty];
    if (!bucket) return;
    if (limit && bucket.length >= limit) {
      return;
    }
    bucket.push(item);
  });
  return map;
}

async function writeJsonFile(targetDir, filename, payload) {
  const outPath = path.join(targetDir, filename);
  await fs.mkdir(path.dirname(outPath), { recursive: true });
  await fs.writeFile(outPath, JSON.stringify(payload, null, 2), "utf8");
}

async function main() {
  const options = parseArgs();
  await fs.mkdir(options.outDir, { recursive: true });

  const wordRows = await readWordRows();
  const translationMap = await readTranslationMap();

  const vocabItems = [];
  const trackedIds = new Set();

  wordRows.forEach((row) => {
    const vocab = row.vc_vocabulary?.trim();
    if (!vocab) return;
    const translation = translationMap.get(normalize(vocab)) ?? vocab;
    const item = {
      word: vocab,
      translation,
      difficulty: mapDifficulty(row.vc_difficulty),
      sample_sentence: buildSampleSentence(vocab),
      sentence_translation: translation,
      phonetics: {
        uk: row.vc_phonetic_uk?.replace(/[\[\]]/g, "").trim(),
        us: row.vc_phonetic_us?.replace(/[\[\]]/g, "").trim(),
      },
      frequency: row.vc_frequency ? Number(row.vc_frequency) : undefined,
    };
    vocabItems.push(item);
    if (row.vc_id) {
      trackedIds.add(row.vc_id);
    }
  });

  let tagsByWord = new Map();
  if (options.useRelations) {
    tagsByWord = extractRelations(wordRows, trackedIds);
  }

  const enriched = vocabItems.map((item) => ({
    ...item,
    tags: tagsByWord.get(item.word),
  }));

  const wordsByLevel = chunkByLevel(enriched, options.limit);
  const sentencesByLevel = chunkByLevel(
    enriched.map((item) => ({
      ...item,
      word: item.word,
    })),
    options.limit
  );

  for (const level of LEVELS) {
    await writeJsonFile(options.outDir, `words_${level}.json`, wordsByLevel[level]);
    await writeJsonFile(options.outDir, `sentences_${level}.json`, sentencesByLevel[level]);
  }

  console.log(
    `Generated datasets in ${path.relative(ROOT, options.outDir)} (limit: ${options.limit ?? "∞"}, relations: ${
      options.useRelations ? "on" : "off"
    })`
  );
}

await main();
