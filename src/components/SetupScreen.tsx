"use client";

import { ALL_FACTORS, type QuizSettings } from "@/lib/quiz";

type SetupScreenProps = {
  settings: QuizSettings;
  onChange: (settings: QuizSettings) => void;
  onStart: () => void;
  onShowScores: () => void;
};

export function SetupScreen({
  settings,
  onChange,
  onStart,
  onShowScores,
}: SetupScreenProps) {
  const allSelected = settings.factors.length === ALL_FACTORS.length;

  function toggleFactor(n: number) {
    const has = settings.factors.includes(n);
    if (has && settings.factors.length === 1) return;
    onChange({
      ...settings,
      factors: has
        ? settings.factors.filter((f) => f !== n)
        : [...settings.factors, n].sort((a, b) => a - b),
    });
  }

  function toggleAll() {
    onChange({
      ...settings,
      factors: allSelected ? [2] : [...ALL_FACTORS],
    });
  }

  const canStart =
    settings.factors.length > 0 &&
    settings.timeLimitSeconds >= 10 &&
    settings.questionCount >= 1;

  return (
    <section className="setup">
      <header className="hero-brand">
        <p className="brand">Times Dash</p>
        <h1>Race the clock. Master your tables.</h1>
        <p className="lede">
          Pick your numbers, set a timer, and see how many you can nail.
        </p>
      </header>

      <div className="setup-panel">
        <label className="field">
          <span>Your name</span>
          <input
            type="text"
            maxLength={20}
            placeholder="Champion"
            value={settings.playerName}
            onChange={(e) =>
              onChange({ ...settings, playerName: e.target.value })
            }
          />
        </label>

        <div className="field">
          <div className="field-row">
            <span>Practice these numbers</span>
            <button type="button" className="linkish" onClick={toggleAll}>
              {allSelected ? "Clear all" : "Select all"}
            </button>
          </div>
          <div className="factor-grid" role="group" aria-label="Factors">
            {ALL_FACTORS.map((n) => {
              const selected = settings.factors.includes(n);
              return (
                <button
                  key={n}
                  type="button"
                  className={`factor-chip ${selected ? "selected" : ""}`}
                  aria-pressed={selected}
                  onClick={() => toggleFactor(n)}
                >
                  {n}
                </button>
              );
            })}
          </div>
        </div>

        <div className="settings-row">
          <label className="field">
            <span>Time (seconds)</span>
            <input
              type="number"
              min={10}
              max={300}
              step={5}
              value={settings.timeLimitSeconds}
              onChange={(e) => {
                const n = Number(e.target.value);
                if (!Number.isFinite(n)) return;
                onChange({ ...settings, timeLimitSeconds: n });
              }}
              onBlur={() =>
                onChange({
                  ...settings,
                  timeLimitSeconds: Math.min(
                    300,
                    Math.max(10, settings.timeLimitSeconds || 10),
                  ),
                })
              }
            />
          </label>
          <label className="field">
            <span>Questions</span>
            <input
              type="number"
              min={1}
              max={100}
              value={settings.questionCount}
              onChange={(e) => {
                const n = Number(e.target.value);
                if (!Number.isFinite(n)) return;
                onChange({ ...settings, questionCount: n });
              }}
              onBlur={() =>
                onChange({
                  ...settings,
                  questionCount: Math.min(
                    100,
                    Math.max(1, settings.questionCount || 1),
                  ),
                })
              }
            />
          </label>
        </div>

        <div className="cta-row">
          <button
            type="button"
            className="btn primary"
            disabled={!canStart}
            onClick={onStart}
          >
            Start dash
          </button>
          <button type="button" className="btn ghost" onClick={onShowScores}>
            High scores
          </button>
        </div>
      </div>
    </section>
  );
}
