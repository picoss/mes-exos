import { describe, expect, it } from "vitest";
import { parseDecimal } from "../../../../core/decimal";
import { LEVELS, expectWellFormed, numbersIn, samples } from "../testing";
import * as generator from "./decomposition";

const PLACES: Record<string, number> = {
  dizaines: 1,
  unités: 0,
  dixièmes: -1,
  centièmes: -2,
  millièmes: -3,
};

describe("decomposition", () => {
  it.each(LEVELS)("niveau %i : questions bien formées", (level) => {
    for (const question of samples(generator, level)) expectWellFormed(question);
  });

  it.each(LEVELS)("niveau %i : la réponse correspond à l'énoncé", (level) => {
    for (const { prompt, answer } of samples(generator, level)) {
      if (answer.type !== "number") throw new Error("réponse numérique attendue");
      const digitMatch = prompt.match(/^Quel est le chiffre des (\S+) dans (.+) \?$/);
      const countMatch = prompt.match(/^Combien y a-t-il de (\S+) en tout dans (.+) \?$/);
      if (digitMatch) {
        const { units, scale } = parseDecimal(numbersIn(digitMatch[2]!)[0]!);
        const power = PLACES[digitMatch[1]!]!;
        expect(Number(answer.value)).toBe(Math.floor(units / 10 ** (scale + power)) % 10);
      } else if (countMatch) {
        const { units, scale } = parseDecimal(numbersIn(countMatch[2]!)[0]!);
        const target = -PLACES[countMatch[1]!]!;
        expect(Number(answer.value)).toBe(Math.floor((units * 10 ** target) / 10 ** scale));
      }
    }
  });

  it("niveau 3 : la décomposition à compléter redonne le nombre", () => {
    for (const { prompt, answer } of samples(generator, 3)) {
      if (!prompt.startsWith("Complète") || answer.type !== "number") continue;
      const filled = prompt.replace("…", answer.value);
      const [value, ...terms] = filled.replace("Complète : ", "").split(/ = | \+ /);
      const total = terms.reduce((sum, term) => {
        const fraction = term.match(/\[\[(\d+)\/([\d\u202f]+)\]\]/);
        if (!fraction) return sum + Number(term) * 1000;
        return sum + (Number(fraction[1]) * 1000) / Number(fraction[2]!.replace(/\u202f/g, ""));
      }, 0);
      const { units, scale } = parseDecimal(value!);
      expect(total).toBe(units * 10 ** (3 - scale));
    }
  });
});
