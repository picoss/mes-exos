// Vérifications communes aux tests des générateurs.

import { expect } from "vitest";
import { checkAnswer, correctGiven } from "../../../core/answers";
import { normalizeNumber } from "../../../core/decimal";
import { mulberry32 } from "../../../core/rng";
import type { GeneratorModule, Level, QuestionContent } from "../../../core/types";

export const LEVELS: Level[] = [1, 2, 3];

/** Questions tirées avec les graines 1 à `count` : toujours les mêmes d'un test à l'autre. */
export function samples(generator: GeneratorModule, level: Level, count = 500): QuestionContent[] {
  return Array.from({ length: count }, (_, index) =>
    generator.generate({ level, rng: mulberry32(index + 1) }),
  );
}

function allTexts(question: QuestionContent): string[] {
  const { answer } = question;
  return [
    question.prompt,
    question.hint,
    ...question.solution,
    ...(answer.type === "choice" ? answer.choices : []),
    ...(answer.type === "multi" ? answer.fields.map((field) => field.label) : []),
    ...(answer.type === "multi" && answer.layout ? [answer.layout] : []),
  ];
}

export function expectWellFormed(question: QuestionContent): void {
  expect(question.prompt.trim()).not.toBe("");
  expect(question.hint.trim()).not.toBe("");
  expect(question.solution.length).toBeGreaterThan(0);

  for (const text of allTexts(question)) {
    expect(text).not.toMatch(/undefined|NaN|null|\[object|Infinity/);
    expect(text.split("[[").length).toBe(text.split("]]").length);
    for (const match of text.matchAll(/\[\[(.*?)\]\]/g))
      expect(match[1]!.split("/")).toHaveLength(2);
  }

  const { answer } = question;
  if (answer.type === "number") expect(normalizeNumber(answer.value)).toBe(answer.value);
  if (answer.type === "fraction") expect(answer.den).toBeGreaterThan(0);
  if (answer.type === "multi") {
    for (const field of answer.fields) expect(normalizeNumber(field.value)).toBe(field.value);
    if (answer.layout) {
      for (const index of answer.fields.keys()) expect(answer.layout).toContain(`{${index}}`);
    }
  }
  if (answer.type === "choice") {
    expect(answer.choices.length).toBeGreaterThanOrEqual(2);
    expect(answer.choices.length).toBeLessThanOrEqual(4);
    expect(new Set(answer.choices).size).toBe(answer.choices.length);
    expect(answer.correct).toBeGreaterThanOrEqual(0);
    expect(answer.correct).toBeLessThan(answer.choices.length);
  }
  expect(checkAnswer(answer, correctGiven(answer))).toBe("correct");
}

/** Nombres écrits dans un texte, en écriture canonique : "Entre 1 200,5 et 3" → ["1200,5", "3"]. */
export function numbersIn(text: string): string[] {
  return [...text.matchAll(/\d{1,3}(?:\u202f\d{3})*(?:,\d+)?/g)].map((match) =>
    match[0].replace(/\u202f/g, ""),
  );
}

/** Fractions [[a/b]] d'un texte, quand leurs termes sont des nombres. */
export function fractionsIn(text: string): { num: number; den: number }[] {
  return [...text.matchAll(/\[\[([\d\u202f]+)\/([\d\u202f]+)\]\]/g)].map((match) => ({
    num: Number(match[1]!.replace(/\u202f/g, "")),
    den: Number(match[2]!.replace(/\u202f/g, "")),
  }));
}
