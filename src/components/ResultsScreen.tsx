"use client";

import { formatTime, type AnswerRecord, type QuizSettings } from "@/lib/quiz";

type ResultsScreenProps = {
  settings: QuizSettings;
  answers: AnswerRecord[];
  secondsUsed: number;
  endedBy: "time" | "questions";
  scoreSaved: boolean;
  onPlayAgain: () => void;
  onHome: () => void;
  onShowScores: () => void;
};

export function ResultsScreen({
  settings,
  answers,
  secondsUsed,
  endedBy,
  scoreSaved,
  onPlayAgain,
  onHome,
  onShowScores,
}: ResultsScreenProps) {
  const correct = answers.filter((a) => a.correct).length;
  const wrong = answers.filter((a) => !a.correct);

  return (
    <section className="results">
      <header className="results-hero">
        <p className="brand">Times Dash</p>
        <h1>
          {correct === answers.length && answers.length > 0
            ? "Perfect dash!"
            : correct >= Math.ceil(answers.length * 0.7)
              ? "Great run!"
              : "Nice try!"}
        </h1>
        <p className="lede">
          You got <strong>{correct}</strong> of <strong>{answers.length}</strong>{" "}
          right
          {endedBy === "time" ? " before time ran out" : ""}.
        </p>
        <p className="meta">
          Time used: {formatTime(secondsUsed)} /{" "}
          {formatTime(settings.timeLimitSeconds)}
          {scoreSaved ? " · Score saved" : ""}
        </p>
      </header>

      {wrong.length > 0 && (
        <div className="review-panel">
          <h2>Review misses</h2>
          <ul className="review-list">
            {wrong.map(({ question, given }) => (
              <li key={question.id}>
                <span className="eq">
                  {question.a} × {question.b}
                </span>
                <span className="yours">
                  You: {given === null ? "—" : given}
                </span>
                <span className="right">Answer: {question.answer}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="cta-row">
        <button type="button" className="btn primary" onClick={onPlayAgain}>
          Play again
        </button>
        <button type="button" className="btn ghost" onClick={onShowScores}>
          High scores
        </button>
        <button type="button" className="btn ghost" onClick={onHome}>
          Change settings
        </button>
      </div>
    </section>
  );
}
