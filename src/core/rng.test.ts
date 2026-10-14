import { describe, expect, it } from "vitest";
import { mulberry32, pick, randInt, shuffle } from "./rng";

describe("mulberry32", () => {
  it("donne la même suite pour la même graine", () => {
    const a = mulberry32(42);
    const b = mulberry32(42);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });

  it("donne des suites différentes pour des graines différentes", () => {
    expect(mulberry32(1)()).not.toBe(mulberry32(2)());
  });

  it("reste dans [0, 1[", () => {
    const rng = mulberry32(7);
    for (let i = 0; i < 10_000; i++) {
      const value = rng();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });
});

describe("randInt", () => {
  it("couvre toutes les valeurs entre min et max inclus", () => {
    const rng = mulberry32(3);
    const seen = new Set<number>();
    for (let i = 0; i < 1000; i++) seen.add(randInt(rng, 2, 5));
    expect([...seen].sort()).toEqual([2, 3, 4, 5]);
  });
});

describe("pick et shuffle", () => {
  it("pick renvoie un élément de la liste", () => {
    const rng = mulberry32(5);
    for (let i = 0; i < 100; i++) expect(["a", "b", "c"]).toContain(pick(rng, ["a", "b", "c"]));
  });

  it("shuffle garde les mêmes éléments sans modifier l'original", () => {
    const original = [1, 2, 3, 4, 5];
    const result = shuffle(mulberry32(9), original);
    expect([...result].sort()).toEqual(original);
    expect(original).toEqual([1, 2, 3, 4, 5]);
  });
});
