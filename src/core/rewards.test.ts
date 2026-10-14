import { describe, expect, it } from "vitest";
import { starsForAttempt, totalStars } from "./rewards";
import { defaultData } from "./storage";
import type { Attempt } from "./types";

function attempt(overrides: Partial<Attempt>): Attempt {
  return {
    id: "a",
    ts: 0,
    sessionId: "s",
    skill: "maths.calcul.multiplication",
    level: 1,
    mode: "serie",
    ok: true,
    tries: 1,
    ms: 1000,
    ...overrides,
  };
}

describe("starsForAttempt", () => {
  it("donne 2 étoiles du premier coup, 1 au deuxième essai, 0 sinon", () => {
    expect(starsForAttempt(attempt({ tries: 1 }))).toBe(2);
    expect(starsForAttempt(attempt({ tries: 2 }))).toBe(1);
    expect(starsForAttempt(attempt({ ok: false, tries: 2 }))).toBe(0);
  });

  it("compte aussi les révisions", () => {
    expect(starsForAttempt(attempt({ mode: "revision" }))).toBe(2);
  });

  it("ne compte pas les réponses de défi une par une", () => {
    expect(starsForAttempt(attempt({ mode: "defi" }))).toBe(0);
  });
});

describe("totalStars", () => {
  it("additionne les étoiles de toutes les réponses", () => {
    const data = defaultData();
    data.attempts = [attempt({ tries: 1 }), attempt({ tries: 2 }), attempt({ ok: false })];
    expect(totalStars(data)).toBe(3);
  });
});
