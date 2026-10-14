import { describe, expect, it } from "vitest";
import { checkAnswer, correctGiven, formatAnswer, formatGiven, parseFraction } from "./answers";
import type { Answer } from "./types";

describe("checkAnswer : nombre", () => {
  const answer: Answer = { type: "number", value: "3,5" };

  it("accepte les écritures équivalentes", () => {
    for (const given of ["3,5", "3.5", "3,50", "03,5", " 3,5 "]) {
      expect(checkAnswer(answer, [given])).toBe("correct");
    }
  });

  it("refuse une autre valeur", () => {
    expect(checkAnswer(answer, ["3,05"])).toBe("wrong");
    expect(checkAnswer(answer, ["35"])).toBe("wrong");
  });

  it("signale une réponse illisible sans la compter fausse", () => {
    expect(checkAnswer(answer, [""])).toBe("unreadable");
    expect(checkAnswer(answer, ["3,,5"])).toBe("unreadable");
    expect(checkAnswer(answer, [])).toBe("unreadable");
  });
});

describe("checkAnswer : fraction", () => {
  it("accepte une fraction égale par défaut", () => {
    const answer: Answer = { type: "fraction", num: 7, den: 10, accept: "equivalent" };
    expect(checkAnswer(answer, ["7/10"])).toBe("correct");
    expect(checkAnswer(answer, ["70/100"])).toBe("correct");
    expect(checkAnswer(answer, ["7/100"])).toBe("wrong");
  });

  it("accepte un entier quand la fraction en vaut un", () => {
    const answer: Answer = { type: "fraction", num: 6, den: 2, accept: "equivalent" };
    expect(checkAnswer(answer, ["3"])).toBe("correct");
  });

  it("mode exact : seule l'écriture demandée", () => {
    const answer: Answer = { type: "fraction", num: 7, den: 10, accept: "exact" };
    expect(checkAnswer(answer, ["7/10"])).toBe("correct");
    expect(checkAnswer(answer, ["70/100"])).toBe("wrong");
  });

  it("mode irréductible : fraction égale et simplifiée", () => {
    const answer: Answer = { type: "fraction", num: 6, den: 8, accept: "irreductible" };
    expect(checkAnswer(answer, ["3/4"])).toBe("correct");
    expect(checkAnswer(answer, ["6/8"])).toBe("wrong");
  });

  it("dénominateur nul ou saisie incomplète : illisible", () => {
    const answer: Answer = { type: "fraction", num: 1, den: 2, accept: "equivalent" };
    expect(checkAnswer(answer, ["1/0"])).toBe("unreadable");
    expect(checkAnswer(answer, ["1/"])).toBe("unreadable");
    expect(checkAnswer(answer, ["0,5"])).toBe("unreadable");
  });

  it("parseFraction ignore les espaces", () => {
    expect(parseFraction(" 3 / 4 ")).toEqual({ num: 3, den: 4 });
  });
});

describe("checkAnswer : plusieurs champs", () => {
  const answer: Answer = {
    type: "multi",
    fields: [
      { label: "à gauche", value: "7" },
      { label: "à droite", value: "8" },
    ],
    layout: "{0} < 7,38 < {1}",
  };

  it("tous les champs doivent être justes", () => {
    expect(checkAnswer(answer, ["7", "8"])).toBe("correct");
    expect(checkAnswer(answer, ["7", "9"])).toBe("wrong");
  });

  it("un champ vide rend la réponse illisible", () => {
    expect(checkAnswer(answer, ["7", ""])).toBe("unreadable");
  });

  it("s'affiche dans sa disposition", () => {
    expect(formatAnswer(answer)).toBe("7 < 7,38 < 8");
    expect(formatGiven(answer, ["6", "8"])).toBe("6 < 7,38 < 8");
  });
});

describe("checkAnswer : QCM", () => {
  const answer: Answer = { type: "choice", choices: ["<", ">", "="], correct: 1 };

  it("compare l'index choisi", () => {
    expect(checkAnswer(answer, ["1"])).toBe("correct");
    expect(checkAnswer(answer, ["0"])).toBe("wrong");
  });

  it("un index absent ou hors liste est illisible", () => {
    expect(checkAnswer(answer, [""])).toBe("unreadable");
    expect(checkAnswer(answer, ["3"])).toBe("unreadable");
  });
});

describe("correctGiven et formatAnswer", () => {
  it.each<Answer>([
    { type: "number", value: "1234,5" },
    { type: "fraction", num: 3, den: 4, accept: "exact" },
    { type: "multi", fields: [{ label: "q", value: "2" }] },
    { type: "choice", choices: ["a", "b"], correct: 0 },
  ])("la bonne réponse est acceptée (%o)", (answer) => {
    expect(checkAnswer(answer, correctGiven(answer))).toBe("correct");
  });

  it("met en forme les nombres et les fractions", () => {
    expect(formatAnswer({ type: "number", value: "1234,5" }, "cm")).toBe("1\u202f234,5\u00a0cm");
    expect(formatAnswer({ type: "fraction", num: 3, den: 4, accept: "exact" })).toBe("[[3/4]]");
  });
});
