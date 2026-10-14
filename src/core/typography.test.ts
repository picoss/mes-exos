import { describe, expect, it } from "vitest";
import { frenchSpacing, parseRichText } from "./typography";

describe("frenchSpacing", () => {
  it("rend insécables les espaces avant la ponctuation haute et dans les guillemets", () => {
    expect(frenchSpacing("Quel est le chiffre ? Bravo ! Complète : 3")).toBe(
      "Quel est le chiffre\u202f? Bravo\u202f! Complète\u00a0: 3",
    );
    expect(frenchSpacing("s'écrit « trois »")).toBe("s'écrit «\u00a0trois\u00a0»");
  });

  it("ne touche pas aux signes de comparaison", () => {
    expect(frenchSpacing("2,5 > 2,15 et 3 < 4")).toBe("2,5 > 2,15 et 3 < 4");
  });
});

describe("parseRichText", () => {
  it("sépare le texte et les fractions", () => {
    expect(parseRichText("Écris [[3/4]] puis [[1\u202f000/10]].")).toEqual([
      { kind: "text", text: "Écris " },
      { kind: "fraction", num: "3", den: "4" },
      { kind: "text", text: " puis " },
      { kind: "fraction", num: "1\u202f000", den: "10" },
      { kind: "text", text: "." },
    ]);
  });

  it("accepte des expressions et une case à compléter", () => {
    expect(parseRichText("[[3 × 25/4 × 25]] = [[…/100]]")).toEqual([
      { kind: "fraction", num: "3 × 25", den: "4 × 25" },
      { kind: "text", text: " = " },
      { kind: "fraction", num: "…", den: "100" },
    ]);
  });

  it("renvoie le texte tel quel sans fraction", () => {
    expect(parseRichText("Bonjour")).toEqual([{ kind: "text", text: "Bonjour" }]);
    expect(parseRichText("")).toEqual([]);
  });
});
