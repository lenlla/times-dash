export type HighScore = {
  id: string;
  name: string;
  correct: number;
  total: number;
  timeLimitSeconds: number;
  secondsUsed: number;
  factors: number[];
  date: string;
};

const STORAGE_KEY = "times-dash-high-scores";
const MAX_SCORES = 10;

function scoreValue(entry: HighScore): number {
  const accuracy = entry.total > 0 ? entry.correct / entry.total : 0;
  return entry.correct * 1000 + accuracy * 100 + (entry.timeLimitSeconds - entry.secondsUsed);
}

export function loadHighScores(): HighScore[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as HighScore[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveHighScore(entry: Omit<HighScore, "id" | "date">): HighScore[] {
  const next: HighScore = {
    ...entry,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    date: new Date().toISOString(),
  };
  const scores = [...loadHighScores(), next]
    .sort((a, b) => scoreValue(b) - scoreValue(a))
    .slice(0, MAX_SCORES);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(scores));
  return scores;
}
