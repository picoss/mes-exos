import { describe, expect, it } from "vitest";
import {
  compareDecimals,
  decimalAt,
  formatNumber,
  normalizeNumber,
  parseDecimal,
  toDecimalString,
  toScale,
  withDecimals,
} from "./decimal";

describe("toDecimalString", () => {
  it.each([
    [325, 2, "3,25"],
    [3250, 3, "3,25"],
    [7, 3, "0,007"],
    [70, 2, "0,7"],
    [300, 2, "3"],
    [0, 2, "0"],
    [42, 0, "42"],
  ])("%i à l'échelle %i → %s", (units, scale, expected) => {
    expect(toDecimalString(units, scale)).toBe(expected);
  });

  it("refuse les nombres négatifs ou non entiers", () => {
    expect(() => toDecimalString(-1, 0)).toThrow();
    expect(() => toDecimalString(1.5, 0)).toThrow();
  });
});

describe("normalizeNumber", () => {
  it.each([
    ["3,25", "3,25"],
    ["3.25", "3,25"],
    [" 03,50 ", "3,5"],
    ["12 345,6", "12345,6"],
    ["12\u202f345", "12345"],
    [",5", "0,5"],
    ["5,", "5"],
    ["0,070", "0,07"],
    ["000", "0"],
    ["7", "7"],
  ])("« %s » → %s", (input, expected) => {
    expect(normalizeNumber(input)).toBe(expected);
  });

  it.each(["", " ", ",", "3,,4", "3,2,1", "-3", "3a", "1/2", "trois"])(
    "« %s » est illisible",
    (input) => {
      expect(normalizeNumber(input)).toBeNull();
    },
  );
});

describe("calculs", () => {
  it("parseDecimal et toScale", () => {
    expect(parseDecimal("3,25")).toEqual({ units: 325, scale: 2 });
    expect(toScale("3,25", 3)).toBe(3250);
    expect(() => toScale("3,256", 2)).toThrow();
  });

  it("compareDecimals compare sans se laisser piéger par la longueur", () => {
    expect(compareDecimals("2,5", "2,15")).toBe(1);
    expect(compareDecimals("2,15", "2,5")).toBe(-1);
    expect(compareDecimals("4,3", "4,30")).toBe(0);
    expect(compareDecimals("0,07", "0,1")).toBe(-1);
  });

  it("decimalAt calcule les graduations sans erreur d'arrondi", () => {
    expect(decimalAt("0", "0,1", 3)).toBe("0,3");
    expect(decimalAt("2,3", "0,01", 7)).toBe("2,37");
    expect(decimalAt("1,2", "0,02", 7)).toBe("1,34");
    expect(decimalAt("0,1", "0,2", 1)).toBe("0,3");
  });

  it("withDecimals complète avec des zéros", () => {
    expect(withDecimals("2,5", 2)).toBe("2,50");
    expect(withDecimals("3", 2)).toBe("3,00");
    expect(withDecimals("2,15", 1)).toBe("2,15");
  });
});

describe("formatNumber", () => {
  it.each([
    ["3,25", "3,25"],
    ["1000", "1\u202f000"],
    ["12345,678", "12\u202f345,678"],
    ["999", "999"],
  ])("%s → %s", (value, expected) => {
    expect(formatNumber(value)).toBe(expected);
  });
});
