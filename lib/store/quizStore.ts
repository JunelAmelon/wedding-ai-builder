"use client";

import { create } from "zustand";
import type { QuizAnswers, QuizStep } from "@/types/domain";
import { QUIZ_STEPS } from "@/types/domain";

interface QuizState {
  sessionId: string | null;
  answers: QuizAnswers;
  startedAt: number | null;
  setSessionId: (id: string) => void;
  setAnswer: <K extends keyof QuizAnswers>(key: K, value: QuizAnswers[K]) => void;
  setStartedAt: (ts: number) => void;
  reset: () => void;
  currentStepIndex: (step: QuizStep) => number;
}

const STORAGE_KEY = "wab_quiz_state";

function loadFromStorage(): { sessionId: string | null; answers: QuizAnswers; startedAt: number | null } {
  if (typeof window === "undefined") return { sessionId: null, answers: {}, startedAt: null };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { sessionId: null, answers: {}, startedAt: null };
    return JSON.parse(raw);
  } catch {
    return { sessionId: null, answers: {}, startedAt: null };
  }
}

function persist(state: { sessionId: string | null; answers: QuizAnswers; startedAt: number | null }) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export const useQuizStore = create<QuizState>((set, get) => ({
  ...loadFromStorage(),
  setSessionId: (id) => {
    set({ sessionId: id });
    persist({ sessionId: id, answers: get().answers, startedAt: get().startedAt });
  },
  setAnswer: (key, value) => {
    const answers = { ...get().answers, [key]: value };
    set({ answers });
    persist({ sessionId: get().sessionId, answers, startedAt: get().startedAt });
  },
  setStartedAt: (ts) => {
    set({ startedAt: ts });
    persist({ sessionId: get().sessionId, answers: get().answers, startedAt: ts });
  },
  reset: () => {
    set({ sessionId: null, answers: {}, startedAt: null });
    if (typeof window !== "undefined") window.localStorage.removeItem(STORAGE_KEY);
  },
  currentStepIndex: (step) => QUIZ_STEPS.indexOf(step),
}));

export { QUIZ_STEPS };
