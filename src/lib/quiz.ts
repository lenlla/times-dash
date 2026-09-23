export type QuizSettings = {
  factors: number[];
  timeLimitSeconds: number;
  questionCount: number;
  playerName: string;
};

export type Question = {
  id: number;
  a: number;
  b: number;
  answer: number;
};

export type AnswerRecord = {
  question: Question;
  given: number | null;
  correct: boolean;
};

export const ALL_FACTORS = Array.from({ length: 12 }, (_, i) => i + 1);

export const DEFAULT_SETTINGS: QuizSettings = {
  factors: [...ALL_FACTORS],
  timeLimitSeconds: 60,
  questionCount: 20,
  playerName: "",
};

function normalizeFactors(factors: number[]): number[] {
  const cleaned = [
    ...new Set(
      factors
        .map((n) => Number(n))
        .filter((n) => Number.isInteger(n) && n >= 1 && n <= 12),
    ),
  ].sort((a, b) => a - b);
  return cleaned.length > 0 ? cleaned : [...ALL_FACTORS];
}

/** One selected factor appears on either side; the other side is random 1–12. */
export function createQuestion(
  factors: number[],
  id: number,
  rng: () => number = Math.random,
): Question {
  const pool = normalizeFactors(factors);
  const selected = pool[Math.floor(rng() * pool.length)]!;
  const other = Math.floor(rng() * 12) + 1;
  const swap = rng() < 0.5;
  const a = swap ? other : selected;
  const b = swap ? selected : other;
  if (a !== selected && b !== selected) {
    // Should be unreachable; keep kids from seeing an off-table problem.
    return { id, a: selected, b: other, answer: selected * other };
  }
  return { id, a, b, answer: a * b };
}

export function createQuestionBank(
  factors: number[],
  count: number,
  rng: () => number = Math.random,
): Question[] {
  const pool = normalizeFactors(factors);
  return Array.from({ length: Math.max(1, count) }, (_, i) =>
    createQuestion(pool, i + 1, rng),
  );
}

export function formatTime(totalSeconds: number): string {
  const safe = Math.max(0, totalSeconds);
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
