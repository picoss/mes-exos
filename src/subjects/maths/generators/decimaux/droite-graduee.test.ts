import { describe, expect, it } from "vitest";
import { decimalAt, parseDecimal, scaleOf } from "../../../../core/decimal";
import { LEVELS, expectWellFormed, samples } from "../testing";
import * as generator from "./droite-graduee";

describe("droite-graduee", () => {
  it.each(LEVELS)("niveau %i : questions bien formées", (level) => {
    for (const question of samples(generator, level)) expectWellFormed(question);
  });

  it.each(LEVELS)("niveau %i : la réponse est l'abscisse du point sur la figure", (level) => {
    for (const { figure, answer } of samples(generator, level)) {
      if (!figure) throw new Error("figure attendue");
      const point = figure.points[0]!;
      const expected = decimalAt(figure.start, figure.step, point.tick);
      expect(point.tick).toBeGreaterThan(0);
      expect(point.tick).toBeLessThanOrEqual(figure.intervals);
      expect(figure.labels).not.toContain(point.tick);
      if (answer.type === "number") expect(answer.value).toBe(expected);
      else if (answer.type === "fraction") {
        const { units, scale } = parseDecimal(expected);
        expect(answer.num * 10 ** scale).toBe(units * answer.den);
      } else throw new Error("réponse inattendue");
    }
  });

  it("niveau 1 en dixièmes, niveau 2 en centièmes, numérotés toutes les 10 graduations", () => {
    for (const [level, step] of [
      [1, "0,1"],
      [2, "0,01"],
    ] as const) {
      for (const { figure } of samples(generator, level, 100)) {
        expect(figure).toMatchObject({ step, intervals: 20, labels: [0, 10, 20] });
      }
    }
  });

  it("niveau 3 : seules deux graduations sont numérotées et le pas tombe juste", () => {
    for (const { figure } of samples(generator, 3)) {
      expect(figure!.labels).toHaveLength(2);
      expect(scaleOf(figure!.step)).toBeLessThanOrEqual(2);
      expect(figure!.intervals).toBeLessThanOrEqual(10);
    }
  });
});
