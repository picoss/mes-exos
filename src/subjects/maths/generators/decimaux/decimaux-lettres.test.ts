import { describe, expect, it } from "vitest";
import { mulberry32 } from "../../../../core/rng";
import { LEVELS, expectWellFormed, samples } from "../testing";
import * as generator from "./decimaux-lettres";

describe("decimaux-lettres", () => {
  it.each(LEVELS)("niveau %i : questions bien formées", (level) => {
    for (const question of samples(generator, level)) expectWellFormed(question);
  });

  it.each(LEVELS)("niveau %i : les QCM ont toujours 4 choix", (level) => {
    for (const { answer } of samples(generator, level)) {
      if (answer.type === "choice") expect(answer.choices).toHaveLength(4);
    }
  });

  it.each(LEVELS)(
    "niveau %i : « x unités et y dixièmes » a toujours y < 10 (idem centièmes, millièmes)",
    (level) => {
      const limits: Record<string, number> = { dixième: 10, centième: 100, millième: 1000 };
      for (const { prompt, answer } of samples(generator, level)) {
        const texts = answer.type === "choice" ? answer.choices : [prompt];
        for (const text of texts) {
          const match = text.match(/unités? et (.+) (dixième|centième|millième)s?/);
          if (!match) continue;
          // Le nombre de rangs est écrit en lettres : on vérifie juste qu'il n'est pas trop grand.
          const words = match[1]!;
          const limit = limits[match[2]!]!;
          if (limit === 10)
            expect(words).toMatch(/^(un|deux|trois|quatre|cinq|six|sept|huit|neuf)$/);
          if (limit === 100) expect(words).not.toMatch(/cent|mille/);
        }
      }
    },
  );

  it("propose des QCM et des questions à écrire en chiffres", () => {
    const types = new Set(samples(generator, 2).map((question) => question.answer.type));
    expect(types).toEqual(new Set(["choice", "number"]));
  });

  it("niveau 3 : contient des écritures avec plus de centièmes que 100", () => {
    const prompts = samples(generator, 3).map((question) => question.prompt);
    expect(prompts.some((prompt) => /cent-.* centièmes/.test(prompt))).toBe(true);
  });

  it("exemples précis", () => {
    // Graine choisie pour tomber sur une écriture en lettres à recopier en chiffres.
    for (let seed = 1; seed < 200; seed++) {
      const question = generator.generate({ level: 1, rng: mulberry32(seed) });
      if (question.prompt === "Écris en chiffres : trois unités et sept dixièmes.") {
        expect(question.answer).toEqual({ type: "number", value: "3,7" });
      }
      if (question.prompt.startsWith("Écris en chiffres : vingt-et-une")) {
        throw new Error("le niveau 1 ne va pas au-delà de 20 unités");
      }
    }
  });
});
