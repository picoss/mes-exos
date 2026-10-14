// Déroulement d'une série de questions (§4.5 des specs) : essais, indice, correction, bilan.
// Fonctions pures : l'écran garde l'état et enregistre les réponses terminées.

import { checkAnswer } from "./answers";
import { starsForAttempt } from "./rewards";
import { mulberry32 } from "./rng";
import type { Attempt, GeneratorModule, Level, Question, Session } from "./types";

export const SERIES_LENGTH = 10;

/**
 * Niveaux des questions d'une série : la difficulté monte au fil de la série.
 * (L'adaptation au niveau de l'élève remplacera ce découpage fixe.)
 */
export function levelSchedule(length: number = SERIES_LENGTH): Level[] {
  return Array.from({ length }, (_, index) => {
    const position = index / length;
    return position < 0.3 ? 1 : position < 0.7 ? 2 : 3;
  });
}

/** Tire les questions d'une série en évitant les doublons. */
export function buildQuestions(
  generator: GeneratorModule,
  skill: string,
  levels: readonly Level[],
  nextSeed: () => number,
): Question[] {
  const seen = new Set<string>();
  return levels.map((level) => {
    let question: Question | undefined;
    for (let attempt = 0; attempt < 30 && !question; attempt++) {
      const seed = nextSeed();
      const content = generator.generate({ level, rng: mulberry32(seed) });
      const key = JSON.stringify([content.prompt, content.figure ?? null, content.answer]);
      if (!seen.has(key) || attempt === 29) {
        seen.add(key);
        question = { ...content, skill, level, ref: `gen:${seed}` };
      }
    }
    return question!;
  });
}

export type Phase = "answering" | "correct" | "failed" | "done";

export interface SeriesState {
  skill: string;
  sessionId: string;
  startedAt: number;
  questions: Question[];
  index: number;
  phase: Phase;
  /** Essais ratés sur la question en cours. */
  wrongTries: number;
  /** Choix déjà essayés (et faux) sur un QCM. */
  eliminated: number[];
  /** Dernière réponse validée sur la question en cours. */
  lastGiven: string[] | null;
  questionStartedAt: number;
  /** Réponses terminées de la série. */
  attempts: Attempt[];
}

export function createSeries(options: {
  skill: string;
  questions: Question[];
  sessionId: string;
  now: number;
}): SeriesState {
  return {
    skill: options.skill,
    sessionId: options.sessionId,
    startedAt: options.now,
    questions: options.questions,
    index: 0,
    phase: "answering",
    wrongTries: 0,
    eliminated: [],
    lastGiven: null,
    questionStartedAt: options.now,
    attempts: [],
  };
}

export function currentQuestion(state: SeriesState): Question {
  return state.questions[state.index]!;
}

/** Un QCM à 2 ou 3 choix n'a droit qu'à un essai : sinon le 2e se gagne au hasard. */
export function maxTries(question: Question): number {
  return question.answer.type === "choice" && question.answer.choices.length <= 3 ? 1 : 2;
}

export type SubmitOutcome = "unreadable" | "retry" | "correct" | "failed";

export interface SubmitResult {
  state: SeriesState;
  outcome: SubmitOutcome;
  /** Réponse terminée, à enregistrer (quand l'issue est `correct` ou `failed`). */
  attempt?: Attempt;
}

export function submit(
  state: SeriesState,
  given: string[],
  context: { now: number; attemptId: string },
): SubmitResult {
  if (state.phase !== "answering") return { state, outcome: "unreadable" };
  const question = currentQuestion(state);
  const result = checkAnswer(question.answer, given);
  if (result === "unreadable") return { state, outcome: "unreadable" };

  const tries = state.wrongTries + 1;
  if (result === "wrong" && tries < maxTries(question)) {
    const eliminated =
      question.answer.type === "choice"
        ? [...state.eliminated, Number(given[0])]
        : state.eliminated;
    return {
      state: { ...state, wrongTries: tries, eliminated, lastGiven: given },
      outcome: "retry",
    };
  }

  const ok = result === "correct";
  const attempt: Attempt = {
    id: context.attemptId,
    ts: context.now,
    sessionId: state.sessionId,
    skill: question.skill,
    level: question.level,
    mode: "serie",
    ok,
    tries,
    ms: context.now - state.questionStartedAt,
    ...(ok
      ? {}
      : {
          snapshot: {
            prompt: question.prompt,
            ...(question.figure ? { figure: question.figure } : {}),
            answer: question.answer,
            given,
            solution: question.solution,
          },
        }),
  };
  return {
    state: {
      ...state,
      phase: ok ? "correct" : "failed",
      lastGiven: given,
      attempts: [...state.attempts, attempt],
    },
    outcome: ok ? "correct" : "failed",
    attempt,
  };
}

/** Passe à la question suivante, ou termine la série. */
export function next(state: SeriesState, now: number): SeriesState {
  if (state.phase !== "correct" && state.phase !== "failed") return state;
  const index = state.index + 1;
  if (index >= state.questions.length) return { ...state, phase: "done" };
  return {
    ...state,
    index,
    phase: "answering",
    wrongTries: 0,
    eliminated: [],
    lastGiven: null,
    questionStartedAt: now,
  };
}

export interface SeriesSummary {
  firstTry: number;
  secondTry: number;
  failed: number;
  stars: number;
  /** Questions ratées, avec leur correction. */
  mistakes: Attempt[];
}

export function summarize(attempts: readonly Attempt[]): SeriesSummary {
  return {
    firstTry: attempts.filter((attempt) => attempt.ok && attempt.tries === 1).length,
    secondTry: attempts.filter((attempt) => attempt.ok && attempt.tries > 1).length,
    failed: attempts.filter((attempt) => !attempt.ok).length,
    stars: attempts.reduce((sum, attempt) => sum + starsForAttempt(attempt), 0),
    mistakes: attempts.filter((attempt) => !attempt.ok),
  };
}

/** Résumé de la série à enregistrer, quand elle est terminée ou abandonnée. */
export function toSession(state: SeriesState, now: number): Session {
  return {
    id: state.sessionId,
    ts: state.startedAt,
    mode: "serie",
    skill: state.skill,
    score: state.attempts.filter((attempt) => attempt.ok).length,
    durationMs: now - state.startedAt,
  };
}
