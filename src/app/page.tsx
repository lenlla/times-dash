"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { HighScoresScreen } from "@/components/HighScoresScreen";
import { QuizScreen } from "@/components/QuizScreen";
import { ResultsScreen } from "@/components/ResultsScreen";
import { SetupScreen } from "@/components/SetupScreen";
import { saveHighScore } from "@/lib/high-scores";
import {
  createQuestionBank,
  DEFAULT_SETTINGS,
  type AnswerRecord,
  type Question,
  type QuizSettings,
} from "@/lib/quiz";

type Phase = "setup" | "playing" | "results" | "scores";

export default function Home() {
  const [phase, setPhase] = useState<Phase>("setup");
  const [settings, setSettings] = useState<QuizSettings>(DEFAULT_SETTINGS);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [correctCount, setCorrectCount] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(DEFAULT_SETTINGS.timeLimitSeconds);
  const [secondsUsed, setSecondsUsed] = useState(0);
  const [endedBy, setEndedBy] = useState<"time" | "questions">("questions");
  const [feedback, setFeedback] = useState<"idle" | "correct" | "wrong">("idle");
  const [scoreSaved, setScoreSaved] = useState(false);
  const feedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const finishing = useRef(false);
  const answersRef = useRef<AnswerRecord[]>([]);
  const settingsRef = useRef(settings);
  const secondsUsedRef = useRef(0);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  useEffect(() => {
    secondsUsedRef.current = secondsUsed;
  }, [secondsUsed]);

  const finishQuiz = useCallback((by: "time" | "questions", finalAnswers?: AnswerRecord[]) => {
    if (finishing.current) return;
    finishing.current = true;
    const resolvedAnswers = finalAnswers ?? answersRef.current;
    const activeSettings = settingsRef.current;
    const used = Math.min(secondsUsedRef.current, activeSettings.timeLimitSeconds);
    setEndedBy(by);
    setAnswers(resolvedAnswers);
    setSecondsUsed(used);
    const correct = resolvedAnswers.filter((a) => a.correct).length;
    if (resolvedAnswers.length > 0) {
      saveHighScore({
        name: activeSettings.playerName.trim() || "Champion",
        correct,
        total: resolvedAnswers.length,
        timeLimitSeconds: activeSettings.timeLimitSeconds,
        secondsUsed: used,
        factors: activeSettings.factors,
      });
      setScoreSaved(true);
    } else {
      setScoreSaved(false);
    }
    setPhase("results");
  }, []);

  function startQuiz() {
    finishing.current = false;
    const active = settingsRef.current;
    const bank = createQuestionBank(active.factors, active.questionCount);
    setSettings(active); // keep UI in sync with what we actually started
    setQuestions(bank);
    setIndex(0);
    setAnswers([]);
    answersRef.current = [];
    setCorrectCount(0);
    setSecondsLeft(settings.timeLimitSeconds);
    setSecondsUsed(0);
    secondsUsedRef.current = 0;
    setFeedback("idle");
    setEndedBy("questions");
    setScoreSaved(false);
    setPhase("playing");
  }

  useEffect(() => {
    if (phase !== "playing") return;

    const id = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(id);
          const used = settingsRef.current.timeLimitSeconds;
          secondsUsedRef.current = used;
          setSecondsUsed(used);
          finishQuiz("time");
          return 0;
        }
        const used = settingsRef.current.timeLimitSeconds - (prev - 1);
        secondsUsedRef.current = used;
        setSecondsUsed(used);
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(id);
  }, [phase, finishQuiz]);

  useEffect(() => {
    return () => {
      if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
    };
  }, []);

  function handleSubmit(value: number) {
    if (phase !== "playing" || feedback !== "idle" || finishing.current) return;
    const question = questions[index];
    if (!question) return;
    const currentIndex = index;
    const total = questions.length;

    const correct = value === question.answer;
    const record: AnswerRecord = { question, given: value, correct };
    const nextAnswers = [...answersRef.current, record];
    answersRef.current = nextAnswers;
    setAnswers(nextAnswers);
    if (correct) setCorrectCount((c) => c + 1);
    setFeedback(correct ? "correct" : "wrong");

    feedbackTimer.current = setTimeout(() => {
      setFeedback("idle");
      if (currentIndex + 1 >= total) {
        finishQuiz("questions", nextAnswers);
      } else {
        setIndex(currentIndex + 1);
      }
    }, 550);
  }

  return (
    <main className="app-shell">
      <div className="atmosphere" aria-hidden />
      <div className="app-frame">
        {phase === "setup" && (
          <SetupScreen
            settings={settings}
            onChange={setSettings}
            onStart={startQuiz}
            onShowScores={() => setPhase("scores")}
          />
        )}
        {phase === "playing" && questions[index] && (
          <QuizScreen
            question={questions[index]}
            questionIndex={index + 1}
            questionCount={questions.length}
            correctCount={correctCount}
            secondsLeft={secondsLeft}
            feedback={feedback}
            onSubmit={handleSubmit}
          />
        )}
        {phase === "results" && (
          <ResultsScreen
            settings={settings}
            answers={answers}
            secondsUsed={Math.min(secondsUsed, settings.timeLimitSeconds)}
            endedBy={endedBy}
            scoreSaved={scoreSaved}
            onPlayAgain={startQuiz}
            onHome={() => setPhase("setup")}
            onShowScores={() => setPhase("scores")}
          />
        )}
        {phase === "scores" && (
          <HighScoresScreen onBack={() => setPhase("setup")} />
        )}
      </div>
    </main>
  );
}
