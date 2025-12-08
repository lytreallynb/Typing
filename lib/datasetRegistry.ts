import type { CEFRLevel, PracticeMode, VocabItem } from "@/types/practice";

type DatasetMap = Record<PracticeMode, Record<CEFRLevel, VocabItem[]>>;

type ModePrefix = "words" | "sentences";

const LEVELS: CEFRLevel[] = ["A1", "A2", "B1", "B2"];

interface WebpackRequire extends NodeRequire {
  context(
    directory: string,
    useSubdirectories: boolean,
    regExp: RegExp
  ): {
    keys(): string[];
    <T>(id: string): { default?: T } | T;
  };
}

declare const require: WebpackRequire;

const datasetMap: DatasetMap = {
  word: { A1: [], A2: [], B1: [], B2: [] },
  sentence: { A1: [], A2: [], B1: [], B2: [] },
};

const context = require.context("../data", true, /(words|sentences)_([AB][12])\.json$/i);

context.keys().forEach((key) => {
  const match = key.match(/(words|sentences)_([AB]\d)\.json$/i);
  if (!match) return;
  const modePrefix = match[1].toLowerCase() as ModePrefix;
  const level = match[2].toUpperCase() as CEFRLevel;
  if (!LEVELS.includes(level)) return;
  const moduleExport = context<VocabItem[]>(key);
  const data = Array.isArray(moduleExport) ? moduleExport : (moduleExport as { default?: VocabItem[] }).default ?? [];
  const mode: PracticeMode = modePrefix === "sentences" ? "sentence" : "word";
  datasetMap[mode][level] = datasetMap[mode][level].concat(data);
});

export function getDatasetMap(): DatasetMap {
  return datasetMap;
}
