// Vérification des réponses et mise en forme des réponses pour l'affichage.

import { formatNumber, normalizeNumber } from "./decimal";
import type { Answer } from "./types";

/** `unreadable` : la réponse ne peut pas être lue (champ vide, « 3,,4 »…), ça ne compte pas. */
export type CheckResult = "correct" | "wrong" | "unreadable";

export function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

/** "3/4" → { num: 3, den: 4 } ; un entier seul vaut n/1. */
export function parseFraction(input: string): { num: number; den: number } | null {
  const match = /^(\d+)(?:\/(\d+))?$/.exec(input.replace(/[\s\u00a0\u202f]/g, ""));
  if (!match) return null;
  const num = Number(match[1]);
  const den = match[2] === undefined ? 1 : Number(match[2]);
  return den === 0 ? null : { num, den };
}

export function checkAnswer(answer: Answer, given: readonly string[]): CheckResult {
  switch (answer.type) {
    case "number": {
      const value = normalizeNumber(given[0] ?? "");
      if (value === null) return "unreadable";
      return value === answer.value ? "correct" : "wrong";
    }
    case "fraction": {
      const fraction = parseFraction(given[0] ?? "");
      if (!fraction) return "unreadable";
      const equivalent = fraction.num * answer.den === fraction.den * answer.num;
      const ok =
        answer.accept === "exact"
          ? fraction.num === answer.num && fraction.den === answer.den
          : answer.accept === "irreductible"
            ? equivalent && gcd(fraction.num, fraction.den) === 1
            : equivalent;
      return ok ? "correct" : "wrong";
    }
    case "multi": {
      const values = answer.fields.map((_, index) => normalizeNumber(given[index] ?? ""));
      if (values.some((value) => value === null)) return "unreadable";
      return values.every((value, index) => value === answer.fields[index]!.value)
        ? "correct"
        : "wrong";
    }
    case "choice": {
      const raw = given[0] ?? "";
      if (!/^\d+$/.test(raw) || Number(raw) >= answer.choices.length) return "unreadable";
      return Number(raw) === answer.correct ? "correct" : "wrong";
    }
  }
}

/** La bonne réponse, sous la forme que l'élève aurait saisie. */
export function correctGiven(answer: Answer): string[] {
  switch (answer.type) {
    case "number":
      return [answer.value];
    case "fraction":
      return [`${answer.num}/${answer.den}`];
    case "multi":
      return answer.fields.map((field) => field.value);
    case "choice":
      return [String(answer.correct)];
  }
}

function showNumber(raw: string): string {
  const value = normalizeNumber(raw);
  return value === null ? raw : formatNumber(value);
}

function fillLayout(layout: string, values: readonly string[]): string {
  return layout.replace(/\{(\d+)\}/g, (_, index: string) => values[Number(index)] ?? "…");
}

/** Une réponse (bonne ou donnée par l'élève), prête à afficher. Peut contenir [[a/b]]. */
export function formatGiven(answer: Answer, given: readonly string[], unit?: string): string {
  const withUnit = (text: string) => (unit ? `${text}\u00a0${unit}` : text);
  switch (answer.type) {
    case "number":
      return withUnit(showNumber(given[0] ?? ""));
    case "fraction": {
      const fraction = parseFraction(given[0] ?? "");
      if (!fraction) return given[0] ?? "";
      return fraction.den === 1 ? String(fraction.num) : `[[${fraction.num}/${fraction.den}]]`;
    }
    case "multi": {
      const values = answer.fields.map((_, index) => showNumber(given[index] ?? ""));
      return answer.layout
        ? fillLayout(answer.layout, values)
        : answer.fields.map((field, index) => `${field.label}\u00a0: ${values[index]}`).join(", ");
    }
    case "choice":
      return answer.choices[Number(given[0])] ?? "";
  }
}

export function formatAnswer(answer: Answer, unit?: string): string {
  return formatGiven(answer, correctGiven(answer), unit);
}
