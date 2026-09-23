"use client";

import { useRef } from "react";
import { formatTime, type Question } from "@/lib/quiz";

type QuizScreenProps = {
  question: Question;
  questionIndex: number;
  questionCount: number;
  correctCount: number;
  secondsLeft: number;
  feedback: "idle" | "correct" | "wrong";
  onSubmit: (value: number) => void;
};

export function QuizScreen({
  question,
  questionIndex,
  questionCount,
  correctCount,
  secondsLeft,
  feedback,
  onSubmit,
}: QuizScreenProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const urgent = secondsLeft <= 10;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (feedback !== "idle") return;
    const form = e.currentTarget;
    const data = new FormData(form);
    const raw = String(data.get("answer") ?? "").trim();
    if (raw === "") return;
    const parsed = Number(raw);
    if (!Number.isFinite(parsed)) return;
    onSubmit(parsed);
  }

  return (
    <section className={`quiz ${feedback}`}>
      <div className="quiz-hud">
        <div className="hud-stat">
          <span className="hud-label">Score</span>
          <strong className="hud-value score-pop">{correctCount}</strong>
        </div>
        <div className="hud-stat">
          <span className="hud-label">Question</span>
          <strong className="hud-value">
            {questionIndex}/{questionCount}
          </strong>
        </div>
        <div className={`hud-stat timer ${urgent ? "urgent" : ""}`}>
          <span className="hud-label">Time</span>
          <strong className="hud-value">{formatTime(secondsLeft)}</strong>
        </div>
      </div>

      <div className={`question-stage ${feedback}`}>
        <p className="question-prompt" aria-live="polite">
          <span className="factor">{question.a}</span>
          <span className="op">×</span>
          <span className="factor">{question.b}</span>
          <span className="op">=</span>
          <span className="blank">?</span>
        </p>

        <form className="answer-form" onSubmit={handleSubmit} key={question.id}>
          <label className="sr-only" htmlFor="answer">
            Your answer
          </label>
          <input
            ref={inputRef}
            id="answer"
            name="answer"
            className="answer-input"
            type="number"
            inputMode="numeric"
            autoComplete="off"
            autoFocus
            disabled={feedback !== "idle"}
          />
          <button type="submit" className="btn primary" disabled={feedback !== "idle"}>
            Check
          </button>
        </form>

        <p className="feedback-line" aria-live="assertive">
          {feedback === "correct" && "Nice!"}
          {feedback === "wrong" && "Not quite — keep going!"}
        </p>
      </div>
    </section>
  );
}
