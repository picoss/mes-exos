// Lire et écrire un nombre décimal en lettres :
// « trois unités et sept dixièmes » = 3,7 ; « deux-cent-quinze centièmes » = 2,15.

import { compareDecimals } from "../../../../core/decimal";
import { chance, pick, randInt, shuffle, type Rng } from "../../../../core/rng";
import type { GeneratorModule, QuestionContent } from "../../../../core/types";
import { dec, frac, plural, show } from "../../lib/format";
import { POWERS, rankName, type DecimalScale } from "../../lib/ranks";
import { numberToWords } from "../../lib/words";

/** Une façon d'écrire un nombre en lettres, avec sa valeur. */
interface Form {
  kind: "mixed" | "rank" | "comma";
  text: string;
  value: string;
  whole: number;
  part: number;
  scale: DecimalScale;
}

function unitsWords(n: number): string {
  return `${numberToWords(n, { feminine: true })} ${plural(n, "unité")}`;
}

function rankWords(n: number, scale: DecimalScale): string {
  return `${numberToWords(n)} ${rankName(scale, n)}`;
}

/** « trois unités et sept dixièmes » */
function mixed(whole: number, part: number, scale: DecimalScale): Form {
  return {
    kind: "mixed",
    text: `${unitsWords(whole)} et ${rankWords(part, scale)}`,
    value: dec(whole * POWERS[scale] + part, scale),
    whole,
    part,
    scale,
  };
}

/** « deux-cent-quinze centièmes » */
function rank(count: number, scale: DecimalScale): Form {
  return {
    kind: "rank",
    text: rankWords(count, scale),
    value: dec(count, scale),
    whole: Math.floor(count / POWERS[scale]),
    part: count,
    scale,
  };
}

/** « trois virgule vingt-cinq » (partie décimale sans zéro au début ni à la fin) */
function comma(whole: number, part: number, scale: DecimalScale): Form {
  return {
    kind: "comma",
    text: `${numberToWords(whole)} virgule ${numberToWords(part)}`,
    value: dec(whole * POWERS[scale] + part, scale),
    whole,
    part,
    scale,
  };
}

/** Entier entre min et max qui ne finit pas par 0. */
function noTrailingZero(rng: Rng, min: number, max: number): number {
  let n: number;
  do n = randInt(rng, min, max);
  while (n % 10 === 0);
  return n;
}

function pickForm(rng: Rng, level: number): Form {
  if (level === 1) {
    return pick(rng, [
      () => mixed(randInt(rng, 1, 20), randInt(rng, 1, 9), 1),
      () => rank(noTrailingZero(rng, 11, 99), 2),
      () => comma(randInt(rng, 1, 20), noTrailingZero(rng, 11, 99), 2),
    ])();
  }
  if (level === 2) {
    return pick(rng, [
      () => mixed(randInt(rng, 1, 20), randInt(rng, 1, 9), 2),
      () => mixed(randInt(rng, 1, 20), noTrailingZero(rng, 11, 99), 2),
      () => mixed(randInt(rng, 1, 20), noTrailingZero(rng, 1, 99), 3),
      () => rank(noTrailingZero(rng, 101, 999), 3),
    ])();
  }
  return pick(rng, [
    () => rank(noTrailingZero(rng, 101, 999), 2),
    () => rank(noTrailingZero(rng, 11, 99), 1),
    () => mixed(randInt(rng, 1, 20), randInt(rng, 1, 9), 3),
    () => mixed(pick(rng, [21, 31, 41, 51, 61, 71, 81]), noTrailingZero(rng, 11, 99), 2),
  ])();
}

function explain(form: Form): string[] {
  const den = POWERS[form.scale];
  if (form.kind === "mixed") {
    return [
      `${form.whole} ${plural(form.whole, "unité")} et ${form.part} ${rankName(form.scale, form.part)}.`,
      `${form.part} ${rankName(form.scale, form.part)} = ${frac(form.part, den)} = ${show(dec(form.part, form.scale))}.`,
      `Donc le nombre s'écrit ${show(form.value)}.`,
    ];
  }
  if (form.kind === "rank") {
    return [
      `${show(form.part)} ${rankName(form.scale, form.part)} = ${frac(form.part, den)}.`,
      `${frac(form.part, den)} = ${show(form.value)}.`,
    ];
  }
  return [
    `Avant la virgule : ${form.whole}. Après la virgule : ${form.part}.`,
    `Le nombre s'écrit ${show(form.value)}.`,
  ];
}

function hintFor(form: Form): string {
  if (form.kind === "mixed") {
    return `Écris les unités, puis la virgule. Avec des ${rankName(form.scale)}, il faut ${form.scale} ${plural(form.scale, "chiffre")} après la virgule.`;
  }
  if (form.kind === "rank") {
    return `Écris ${show(form.part)}, puis place la virgule pour que le dernier chiffre soit au rang des ${rankName(form.scale)}.`;
  }
  return "« Virgule » sépare la partie entière de la partie décimale.";
}

function toDigits(form: Form): QuestionContent {
  return {
    prompt: `Écris en chiffres : ${form.text}.`,
    answer: { type: "number", value: form.value },
    hint: hintFor(form),
    solution: explain(form),
  };
}

/** Écritures en lettres d'autres valeurs, construites à partir des erreurs fréquentes. */
function distractors(rng: Rng, form: Form): Form[] {
  const scales: DecimalScale[] = [1, 2, 3];
  const others = scales.filter((scale) => scale !== form.scale);
  const candidates: Form[] = [];
  const fits = (n: number, scale: DecimalScale) => n >= 1 && n < POWERS[scale];
  if (form.kind === "rank") {
    for (const scale of others) candidates.push(rank(form.part, scale));
    const rest = form.part % POWERS[form.scale];
    if (form.whole > 0 && rest > 0) {
      for (const scale of others)
        if (fits(rest, scale)) candidates.push(mixed(form.whole, rest, scale));
    }
    // 0,941 lu « neuf unités et quarante-et-un millièmes » ; 0,43 lu « quatre centièmes ».
    const misreadPart = form.part % 100 || 1;
    if (fits(misreadPart, form.scale)) {
      candidates.push(mixed(Math.floor(form.part / 100) || 1, misreadPart, form.scale));
    }
    if (form.part >= 10) candidates.push(rank(Math.floor(form.part / 10), form.scale));
  } else {
    for (const scale of others)
      if (fits(form.part, scale)) candidates.push(mixed(form.whole, form.part, scale));
    if (fits(form.whole, form.scale))
      candidates.push(mixed(form.part % 100 || 1, form.whole, form.scale));
    candidates.push(rank(form.whole * 10 + (form.part % 10), form.scale));
    candidates.push(mixed(form.whole + 1, form.part, form.scale));
  }
  const seen = new Set([form.text]);
  return shuffle(rng, candidates).filter((candidate) => {
    if (seen.has(candidate.text) || compareDecimals(candidate.value, form.value) === 0)
      return false;
    seen.add(candidate.text);
    return true;
  });
}

function toWords(rng: Rng, form: Form): QuestionContent {
  const wrong = distractors(rng, form).slice(0, 3);
  const choices = shuffle(rng, [form, ...wrong]);
  return {
    prompt:
      form.kind === "rank"
        ? `Quelle écriture en lettres est égale à ${show(form.value)} ?`
        : `Comment s'écrit ${show(form.value)} en lettres ?`,
    answer: {
      type: "choice",
      choices: choices.map((choice) => choice.text),
      correct: choices.indexOf(form),
    },
    hint: `Dans ${show(form.value)}, le dernier chiffre est au rang des ${rankName(form.scale)}.`,
    solution: [
      ...(form.kind === "rank"
        ? [`${show(form.value)} = ${frac(form.part, POWERS[form.scale])}.`]
        : [
            `${show(form.value)} : ${form.whole} ${plural(form.whole, "unité")} et ${form.part} ${rankName(form.scale, form.part)}.`,
          ]),
      `Donc ${show(form.value)} s'écrit « ${form.text} ».`,
    ],
  };
}

export const generate: GeneratorModule["generate"] = ({ level, rng }) => {
  const form = pickForm(rng, level);
  // L'écriture « virgule » ne sert qu'à la lecture : elle n'est jamais proposée en QCM.
  return form.kind !== "comma" && chance(rng, 0.35) ? toWords(rng, form) : toDigits(form);
};
