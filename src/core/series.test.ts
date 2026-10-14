import { describe, expect, it } from "vitest";
import {
  buildQuestions,
  createSeries,
  levelSchedule,
  maxTries,
  next,
  submit,
  summarize,
  toSession,
  type SeriesState,
} from "./series";
import type { Answer, GeneratorModule, Question } from "./types";

function question(answer: Answer, overrides: Partial<Question> = {}): Question {
  return {
    skill: "maths.decimaux.test",
    level: 1,
    ref: "gen:1",
    prompt: "Question",
    answer,
    hint: "Indice",
    solution: ["Étape"],
    ...overrides,
  };
}

const NUMBER = question({ type: "number", value: "3,5" });
const SMALL_CHOICE = question({ type: "choice", choices: ["<", ">", "="], correct: 0 });
const BIG_CHOICE = question({ type: "choice", choices: ["a", "b", "c", "d"], correct: 2 });

function start(questions: Question[]): SeriesState {
  return createSeries({ skill: "maths.decimaux.test", questions, sessionId: "s1", now: 1000 });
}

let ids = 0;
const ctx = (now: number) => ({ now, attemptId: `a${++ids}` });

describe("levelSchedule", () => {
  it("monte du niveau 1 au niveau 3", () => {
    expect(levelSchedule(10)).toEqual([1, 1, 1, 2, 2, 2, 2, 3, 3, 3]);
  });
});

describe("buildQuestions", () => {
  it("évite de poser deux fois la même question", () => {
    let call = 0;
    const generator: GeneratorModule = {
      // Une question sur deux est identique à la précédente.
      generate: ({ level }) => ({
        prompt: `Q${Math.floor(call++ / 2)}-${level}`,
        answer: { type: "number", value: "1" },
        hint: "h",
        solution: ["s"],
      }),
    };
    let seed = 0;
    const questions = buildQuestions(generator, "maths.x.y", [1, 1, 1], () => ++seed);
    expect(new Set(questions.map((q) => q.prompt)).size).toBe(3);
    expect(questions[0]).toMatchObject({ skill: "maths.x.y", level: 1, ref: "gen:1" });
  });
});

describe("maxTries", () => {
  it("un seul essai pour un QCM à 3 choix, deux sinon", () => {
    expect(maxTries(SMALL_CHOICE)).toBe(1);
    expect(maxTries(BIG_CHOICE)).toBe(2);
    expect(maxTries(NUMBER)).toBe(2);
  });
});

describe("submit", () => {
  it("juste du premier coup", () => {
    const { state, outcome, attempt } = submit(start([NUMBER]), ["3,5"], ctx(4000));
    expect(outcome).toBe("correct");
    expect(state.phase).toBe("correct");
    expect(attempt).toMatchObject({ ok: true, tries: 1, ms: 3000, sessionId: "s1", mode: "serie" });
    expect(attempt?.snapshot).toBeUndefined();
  });

  it("une réponse illisible ne consomme pas d'essai", () => {
    const { state, outcome, attempt } = submit(start([NUMBER]), ["3,,5"], ctx(2000));
    expect(outcome).toBe("unreadable");
    expect(state.wrongTries).toBe(0);
    expect(attempt).toBeUndefined();
  });

  it("première erreur : indice et deuxième essai", () => {
    const first = submit(start([NUMBER]), ["3"], ctx(2000));
    expect(first.outcome).toBe("retry");
    expect(first.state.phase).toBe("answering");
    expect(first.attempt).toBeUndefined();

    const second = submit(first.state, ["3,5"], ctx(3000));
    expect(second.outcome).toBe("correct");
    expect(second.attempt).toMatchObject({ ok: true, tries: 2 });
  });

  it("deuxième erreur : correction et copie de la question", () => {
    const first = submit(start([NUMBER]), ["3"], ctx(2000));
    const second = submit(first.state, ["4"], ctx(3000));
    expect(second.outcome).toBe("failed");
    expect(second.state.phase).toBe("failed");
    expect(second.attempt).toMatchObject({ ok: false, tries: 2 });
    expect(second.attempt?.snapshot).toMatchObject({
      prompt: "Question",
      answer: NUMBER.answer,
      given: ["4"],
      solution: ["Étape"],
    });
  });

  it("QCM à 3 choix : correction dès la première erreur", () => {
    const result = submit(start([SMALL_CHOICE]), ["1"], ctx(2000));
    expect(result.outcome).toBe("failed");
  });

  it("QCM à 4 choix : le choix faux est éliminé pour le deuxième essai", () => {
    const result = submit(start([BIG_CHOICE]), ["0"], ctx(2000));
    expect(result.outcome).toBe("retry");
    expect(result.state.eliminated).toEqual([0]);
  });

  it("ignore une réponse envoyée pendant la correction", () => {
    const done = submit(start([NUMBER]), ["3,5"], ctx(2000)).state;
    expect(submit(done, ["3,5"], ctx(2500)).state).toBe(done);
  });
});

describe("next et bilan", () => {
  it("enchaîne les questions puis termine la série", () => {
    let state = start([NUMBER, NUMBER]);
    state = submit(state, ["3,5"], ctx(2000)).state;
    state = next(state, 2500);
    expect(state).toMatchObject({
      index: 1,
      phase: "answering",
      wrongTries: 0,
      questionStartedAt: 2500,
    });

    state = submit(state, ["1"], ctx(3000)).state;
    state = submit(state, ["2"], ctx(3500)).state;
    state = next(state, 4000);
    expect(state.phase).toBe("done");

    const summary = summarize(state.attempts);
    expect(summary).toMatchObject({ firstTry: 1, secondTry: 0, failed: 1, stars: 2 });
    expect(summary.mistakes).toHaveLength(1);
    expect(toSession(state, 9000)).toEqual({
      id: "s1",
      ts: 1000,
      mode: "serie",
      skill: "maths.decimaux.test",
      score: 1,
      durationMs: 8000,
    });
  });

  it("ne passe pas à la suite tant que la question n'est pas terminée", () => {
    const state = start([NUMBER]);
    expect(next(state, 2000)).toBe(state);
  });
});
