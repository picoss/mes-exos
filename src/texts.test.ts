import { expect, it } from "vitest";
import { texts } from "./texts";

function allStrings(value: unknown): string[] {
  if (typeof value === "string") return [value];
  // Les textes paramétrés sont appelés avec une valeur d'exemple.
  if (typeof value === "function") return allStrings(value(2));
  if (typeof value === "object" && value !== null) return Object.values(value).flatMap(allStrings);
  return [];
}

it("met une espace insécable (pas une espace normale) avant ! ? ; :", () => {
  const faulty = allStrings(texts).filter((text) => /[ \t][!?;:]/.test(text));
  expect(faulty).toEqual([]);
});
