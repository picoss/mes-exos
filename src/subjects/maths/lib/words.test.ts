import { describe, expect, it } from "vitest";
import { numberToWords } from "./words";

describe("numberToWords (orthographe de 1990)", () => {
  it.each([
    [0, "zéro"],
    [1, "un"],
    [10, "dix"],
    [16, "seize"],
    [17, "dix-sept"],
    [21, "vingt-et-un"],
    [22, "vingt-deux"],
    [30, "trente"],
    [61, "soixante-et-un"],
    [70, "soixante-dix"],
    [71, "soixante-et-onze"],
    [72, "soixante-douze"],
    [77, "soixante-dix-sept"],
    [80, "quatre-vingts"],
    [81, "quatre-vingt-un"],
    [90, "quatre-vingt-dix"],
    [91, "quatre-vingt-onze"],
    [99, "quatre-vingt-dix-neuf"],
    [100, "cent"],
    [101, "cent-un"],
    [180, "cent-quatre-vingts"],
    [200, "deux-cents"],
    [201, "deux-cent-un"],
    [215, "deux-cent-quinze"],
    [280, "deux-cent-quatre-vingts"],
    [304, "trois-cent-quatre"],
    [1000, "mille"],
    [1001, "mille-un"],
    [1205, "mille-deux-cent-cinq"],
    [2000, "deux-mille"],
    [21000, "vingt-et-un-mille"],
    [80000, "quatre-vingt-mille"],
    [200000, "deux-cent-mille"],
    [300200, "trois-cent-mille-deux-cents"],
    [999999, "neuf-cent-quatre-vingt-dix-neuf-mille-neuf-cent-quatre-vingt-dix-neuf"],
  ])("%i → %s", (n, words) => {
    expect(numberToWords(n)).toBe(words);
  });

  it("accorde « un » au féminin", () => {
    expect(numberToWords(1, { feminine: true })).toBe("une");
    expect(numberToWords(21, { feminine: true })).toBe("vingt-et-une");
    expect(numberToWords(81, { feminine: true })).toBe("quatre-vingt-une");
    expect(numberToWords(11, { feminine: true })).toBe("onze");
  });

  it("refuse les nombres hors limites", () => {
    expect(() => numberToWords(-1)).toThrow();
    expect(() => numberToWords(1_000_000)).toThrow();
    expect(() => numberToWords(1.5)).toThrow();
  });
});
