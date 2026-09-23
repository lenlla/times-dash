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

export function createQuestion(
  factors: number[],
  id: number,
  rng: () => number = Math.random,
): Question {
  const selected = factors[Math.floor(rng() * factors.length)]!;
  const other = Math.floor(rng() * 12) + 1;
  const swap = rng() < 0.5;
  const a = swap ? other : selected;
  const b = swap ? selected : other;
  return { id, a, b, answer: a * b };
}

export function createQuestionBank(
  factors: number[],
  count: number,
  rng: () => number = Math.random,
): Question[] {
  return Array.from({ length: count }, (_, i) =>
    createQuestion(factors, i + 1, rng),
  );
}

export function formatTime(totalSeconds: number): string {
  const safe = Math.max(0, totalSeconds);
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
