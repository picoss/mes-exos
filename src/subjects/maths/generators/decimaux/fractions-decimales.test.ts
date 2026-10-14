import { describe, expect, it } from "vitest";
import { compareDecimals, toDecimalString } from "../../../../core/decimal";
import { mulberry32 } from "../../../../core/rng";
import { LEVELS, expectWellFormed, fractionsIn, numbersIn, samples } from "../testing";
import * as generator from "./fractions-decimales";

describe("fractions-decimales", () => {
  it.each(LEVELS)("niveau %i : questions bien formées", (level) => {
    for (const question of samples(generator, level)) expectWellFormed(question);
  });

  it.each(LEVELS)("niveau %i : la réponse correspond à l'énoncé", (level) => {
    for (const question of samples(generator, level)) {
      const { prompt, answer } = question;
      if (answer.type !== "number") throw new Error("réponse numérique attendue");
      const fractions = fractionsIn(prompt);

      if (prompt.startsWith("Écris") && fractions.length === 1 && !prompt.includes("+")) {
        // [[num/den]] → écriture décimale
        const { num, den } = fractions[0]!;
        expect(answer.value).toBe(toDecimalString(num, Math.log10(den)));
      } else if (prompt.startsWith("Complète")) {
        // valeur = […/den] → numérateur
        const value = numbersIn(prompt)[0]!;
        const den = Number(prompt.match(/…\/([\d\u202f]+)\]\]/)![1]!.replace(/\u202f/g, ""));
        expect(compareDecimals(toDecimalString(Number(answer.value), Math.log10(den)), value)).toBe(
          0,
        );
      } else {
        // somme : entier + fractions décimales
        const [whole] = numbersIn(prompt.split(":")[1]!.replace(/\[\[.*?\]\]/g, ""));
        const total = fractions.reduce(
          (sum, { num, den }) => sum + num * (1000 / den),
          Number(whole) * 1000,
        );
        expect(answer.value).toBe(toDecimalString(total, 3));
      }
    }
  });

  it("niveau 3 : contient des pièges avec des zéros", () => {
    const values = samples(generator, 3).map((q) =>
      q.answer.type === "number" ? q.answer.value : "",
    );
    expect(values.some((value) => /,\d*0\d/.test(value))).toBe(true);
  });

  it("donne la même question pour la même graine", () => {
    expect(generator.generate({ level: 2, rng: mulberry32(12) })).toEqual(
      generator.generate({ level: 2, rng: mulberry32(12) }),
    );
  });
});
