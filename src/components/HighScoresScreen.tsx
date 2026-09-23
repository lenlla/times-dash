"use client";

import { useState } from "react";
import { loadHighScores, type HighScore } from "@/lib/high-scores";
import { formatTime } from "@/lib/quiz";

type HighScoresScreenProps = {
  onBack: () => void;
};

export function HighScoresScreen({ onBack }: HighScoresScreenProps) {
  const [scores] = useState<HighScore[]>(() => loadHighScores());

  return (
    <section className="scores">
      <header>
        <p className="brand">Times Dash</p>
        <h1>High scores</h1>
        <p className="lede">Top runs saved on this device.</p>
      </header>

      {scores.length === 0 ? (
        <p className="empty">No scores yet — finish a dash to get on the board.</p>
      ) : (
        <ol className="score-list">
          {scores.map((s, i) => (
            <li key={s.id}>
              <span className="rank">{i + 1}</span>
              <div className="score-body">
                <strong>{s.name}</strong>
                <span>
                  {s.correct}/{s.total} correct · {formatTime(s.secondsUsed)} used
                </span>
                <span className="factors">
                  Tables: {s.factors.join(", ")}
                </span>
              </div>
            </li>
          ))}
        </ol>
      )}

      <div className="cta-row">
        <button type="button" className="btn primary" onClick={onBack}>
          Back
        </button>
      </div>
    </section>
  );
}
