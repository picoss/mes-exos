import { describe, expect, it } from "vitest";
import { compareDecimals } from "../../../../core/decimal";
import { LEVELS, expectWellFormed, numbersIn, samples } from "../testing";
import * as generator from "./comparer-ranger";

describe("comparer-ranger", () => {
  it.each(LEVELS)("niveau %i : questions bien formées", (level) => {
    for (const question of samples(generator, level)) expectWellFormed(question);
  });

  it.each(LEVELS)("niveau %i : le bon signe ou le bon nombre est choisi", (level) => {
    for (const { prompt, answer } of samples(generator, level)) {
      if (answer.type !== "choice") throw new Error("QCM attendu");
      const correct = answer.choices[answer.correct]!;
      if (prompt.startsWith("Complète")) {
        const [a, b] = numbersIn(prompt.split(":")[1]!) as [string, string];
        const order = compareDecimals(a, b);
        expect(correct).toBe(order < 0 ? "<" : order > 0 ? ">" : "=");
      } else {
        const values = answer.choices.map((choice) => numbersIn(choice)[0]!);
        const sorted = [...values].sort(compareDecimals);
        const expected = prompt.includes("petit") ? sorted[0] : sorted.at(-1);
        expect(numbersIn(correct)[0]).toBe(expected);
      }
    }
  });

  it("niveau 2 : contient des nombres égaux écrits différemment", () => {
    const equal = samples(generator, 2).filter(
      ({ answer }) => answer.type === "choice" && answer.choices[answer.correct] === "=",
    );
    expect(equal.length).toBeGreaterThan(0);
  });
});
