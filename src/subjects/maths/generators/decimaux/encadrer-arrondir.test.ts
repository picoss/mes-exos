import { describe, expect, it } from "vitest";
import { compareDecimals, parseDecimal } from "../../../../core/decimal";
import { LEVELS, expectWellFormed, numbersIn, samples } from "../testing";
import * as generator from "./encadrer-arrondir";

const PRECISIONS: Record<string, number> = { "à l'unité": 0, "au dixième": 1, "au centième": 2 };

/** Arrondi calculé autrement : en flottants avec une marge, puis comparé. */
function roundedFloat(value: string, precision: number): number {
  const { units, scale } = parseDecimal(value);
  return Math.round((units / 10 ** scale) * 10 ** precision + 1e-9) / 10 ** precision;
}

describe("encadrer-arrondir", () => {
  it.each(LEVELS)("niveau %i : questions bien formées", (level) => {
    for (const question of samples(generator, level)) expectWellFormed(question);
  });

  it.each(LEVELS)("niveau %i : les réponses sont justes", (level) => {
    for (const { prompt, answer } of samples(generator, level)) {
      const round = prompt.match(/^Arrondis (.+) (à l'unité|au dixième|au centième)\.$/);
      if (round) {
        if (answer.type !== "number") throw new Error("réponse numérique attendue");
        const value = numbersIn(round[1]!)[0]!;
        const { units, scale } = parseDecimal(answer.value);
        expect(units / 10 ** scale).toBeCloseTo(roundedFloat(value, PRECISIONS[round[2]!]!), 9);
      } else if (answer.type === "multi") {
        const [lower, upper] = answer.fields.map((field) => field.value) as [string, string];
        const value = numbersIn(prompt)[0]!;
        expect(compareDecimals(lower, value)).toBe(-1);
        expect(compareDecimals(value, upper)).toBe(-1);
      } else if (answer.type === "choice") {
        const [lower, upper] = numbersIn(prompt) as [string, string];
        for (const [index, choice] of answer.choices.entries()) {
          const value = numbersIn(choice)[0]!;
          const inside = compareDecimals(lower, value) < 0 && compareDecimals(value, upper) < 0;
          expect(inside).toBe(index === answer.correct);
        }
      }
    }
  });

  it("les QCM ont 4 choix", () => {
    for (const { answer } of samples(generator, 3)) {
      if (answer.type === "choice") expect(answer.choices).toHaveLength(4);
    }
  });

  it("niveau 3 : contient un arrondi avec retenue (3,996 → 4)", () => {
    const carried = samples(generator, 3).filter(
      ({ prompt, answer }) =>
        prompt.startsWith("Arrondis") && answer.type === "number" && !answer.value.includes(","),
    );
    expect(carried.length).toBeGreaterThan(0);
  });
});
