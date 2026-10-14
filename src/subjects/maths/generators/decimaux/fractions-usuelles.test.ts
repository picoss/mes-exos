import { describe, expect, it } from "vitest";
import { normalizeNumber, parseDecimal } from "../../../../core/decimal";
import { LEVELS, expectWellFormed, fractionsIn, samples } from "../testing";
import * as generator from "./fractions-usuelles";

/** Valeur exacte d'une fraction, en millièmes (toutes les fractions utilisées tombent juste). */
const thousandths = (num: number, den: number) => (num * 1000) / den;
const decimalThousandths = (value: string) => {
  const { units, scale } = parseDecimal(value);
  return units * 10 ** (3 - scale);
};

describe("fractions-usuelles", () => {
  it.each(LEVELS)("niveau %i : questions bien formées", (level) => {
    for (const question of samples(generator, level)) expectWellFormed(question);
  });

  it.each(LEVELS)("niveau %i : la bonne réponse est égale à la valeur demandée", (level) => {
    for (const { prompt, answer } of samples(generator, level)) {
      const [fraction] = fractionsIn(prompt);
      if (prompt.startsWith("Écris")) {
        if (answer.type !== "number") throw new Error("réponse numérique attendue");
        expect(decimalThousandths(answer.value)).toBe(thousandths(fraction!.num, fraction!.den));
      }
      if (prompt.startsWith("Quel nombre")) {
        if (answer.type !== "choice") throw new Error("QCM attendu");
        const correct = normalizeNumber(answer.choices[answer.correct]!)!;
        expect(decimalThousandths(correct)).toBe(thousandths(fraction!.num, fraction!.den));
        // Les mauvais choix ne sont jamais égaux à la fraction.
        for (const [index, choice] of answer.choices.entries()) {
          if (index === answer.correct) continue;
          expect(decimalThousandths(normalizeNumber(choice)!)).not.toBe(
            thousandths(fraction!.num, fraction!.den),
          );
        }
      }
      if (prompt.startsWith("Quelle fraction")) {
        if (answer.type !== "choice") throw new Error("QCM attendu");
        const value = decimalThousandths(normalizeNumber(prompt.match(/égale à (.+) \?/)![1]!)!);
        for (const [index, choice] of answer.choices.entries()) {
          const [{ num, den }] = fractionsIn(choice) as [{ num: number; den: number }];
          expect(thousandths(num, den) === value).toBe(index === answer.correct);
        }
      }
    }
  });

  it("niveau 3 : des fractions plus grandes que 1", () => {
    const fractions = samples(generator, 3).flatMap((question) => fractionsIn(question.prompt));
    expect(fractions.some(({ num, den }) => num > den)).toBe(true);
  });
});
