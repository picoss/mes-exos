import { describe, expect, it } from "vitest";
import { isExerciseRoute, matchRoute, pathFromHash } from "./router";

describe("pathFromHash", () => {
  it.each([
    ["", "/"],
    ["#", "/"],
    ["#/", "/"],
    ["#/maths", "/maths"],
    ["#/maths/decimaux/", "/maths/decimaux"],
    ["#//maths//decimaux", "/maths/decimaux"],
    ["#/serie/maths.decimaux.droite-graduee", "/serie/maths.decimaux.droite-graduee"],
    ["#/a%20b", "/a b"],
    ["#/%E0%A4%A", "/%E0%A4%A"],
  ])("%s → %s", (hash, path) => {
    expect(pathFromHash(hash)).toBe(path);
  });
});

describe("matchRoute", () => {
  it("reconnaît un chemin fixe", () => {
    expect(matchRoute("/", "/")).toEqual({});
    expect(matchRoute("/personnaliser", "/personnaliser")).toEqual({});
    expect(matchRoute("/personnaliser", "/defis")).toBeNull();
  });

  it("extrait les paramètres", () => {
    expect(matchRoute("/:subject/:chapter", "/maths/decimaux")).toEqual({
      subject: "maths",
      chapter: "decimaux",
    });
  });

  it("refuse un nombre de segments différent", () => {
    expect(matchRoute("/:subject", "/maths/decimaux")).toBeNull();
    expect(matchRoute("/:subject/:chapter", "/maths")).toBeNull();
  });
});

describe("isExerciseRoute", () => {
  it("repère les écrans d'exercice", () => {
    expect(isExerciseRoute("/serie/maths.calcul.multiplication")).toBe(true);
    expect(isExerciseRoute("/defi/tables")).toBe(true);
  });

  it("ne confond pas avec les autres écrans", () => {
    expect(isExerciseRoute("/")).toBe(false);
    expect(isExerciseRoute("/defis")).toBe(false);
    expect(isExerciseRoute("/maths/decimaux")).toBe(false);
  });
});
