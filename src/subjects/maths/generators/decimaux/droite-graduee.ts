// Lire l'abscisse d'un point sur une droite graduée, en écriture décimale ou en fraction décimale.

import { decimalAt, parseDecimal, toDecimalString, toScale } from "../../../../core/decimal";
import { chance, pick, randInt, type Rng } from "../../../../core/rng";
import type { GeneratorModule, NumberLineFigure, QuestionContent } from "../../../../core/types";
import { frac, plural, show } from "../../lib/format";

const POINT_NAMES = ["A", "B", "C", "D", "E", "F", "G", "M", "N", "P", "R", "S", "T"];

interface Line {
  start: string;
  step: string;
  intervals: number;
  labels: number[];
  tick: number;
}

/** Graduation numérotée la plus proche à gauche du point (ou la première à droite s'il n'y en a pas). */
function reference(line: Line): number {
  const before = line.labels.filter((label) => label <= line.tick);
  return before.length > 0 ? Math.max(...before) : Math.min(...line.labels);
}

function readingSteps(line: Line, name: string): string[] {
  const base = reference(line);
  const baseValue = decimalAt(line.start, line.step, base);
  const value = decimalAt(line.start, line.step, line.tick);
  const offset = line.tick - base;
  const distance = Math.abs(offset);
  const operation = offset >= 0 ? "+" : "−";
  return [
    `Le point ${name} est à ${distance} ${plural(distance, "graduation")} ${offset >= 0 ? "après" : "avant"} ${show(baseValue)}.`,
    `${show(baseValue)} ${operation} ${distance} × ${show(line.step)} = ${show(value)}.`,
  ];
}

function figure(line: Line, name: string): NumberLineFigure {
  return {
    kind: "number-line",
    start: line.start,
    step: line.step,
    intervals: line.intervals,
    labels: line.labels,
    points: [{ tick: line.tick, name }],
  };
}

/** Graduation au hasard, en évitant celles qui sont déjà numérotées. */
function freeTick(rng: Rng, intervals: number, labels: number[]): number {
  let tick: number;
  do tick = randInt(rng, 1, intervals - 1);
  while (labels.includes(tick));
  return tick;
}

/** Droite en dixièmes (niveau 1) ou en centièmes (niveau 2), numérotée toutes les 10 graduations. */
function regularLine(rng: Rng, level: 1 | 2): QuestionContent {
  const name = pick(rng, POINT_NAMES);
  const start = level === 1 ? String(randInt(rng, 0, 15)) : toDecimalString(randInt(rng, 1, 99), 1);
  const step = level === 1 ? "0,1" : "0,01";
  const line: Line = { start, step, intervals: 20, labels: [0, 10, 20], tick: 0 };
  line.tick = freeTick(rng, 20, line.labels);
  const value = decimalAt(start, step, line.tick);
  const unitName = level === 1 ? "dixième" : "centième";
  const den = level === 1 ? 10 : 100;
  const first = show(start);
  const second = show(decimalAt(start, step, 10));
  const intro = [
    `Entre ${first} et ${second}, il y a 10 intervalles : une graduation vaut 1 ${unitName}, soit ${show(step)}.`,
    ...readingSteps(line, name),
  ];
  const hint = `Combien y a-t-il d'intervalles entre ${first} et ${second} ? Déduis-en ce que vaut une graduation.`;

  if (chance(rng, 0.3)) {
    const num = toScale(value, level);
    return {
      prompt: `Écris l'abscisse du point ${name} sous la forme d'une fraction décimale.`,
      figure: figure(line, name),
      answer: { type: "fraction", num, den, accept: "equivalent" },
      hint,
      solution: [...intro, `${show(value)} = ${frac(num, den)}.`],
    };
  }
  return {
    prompt: `Quelle est l'abscisse du point ${name} ?`,
    figure: figure(line, name),
    answer: { type: "number", value },
    hint,
    solution: intro,
  };
}

/** Seules deux graduations sont numérotées : il faut d'abord trouver ce que vaut une graduation. */
function deducedStepLine(rng: Rng): QuestionContent {
  const name = pick(rng, POINT_NAMES);
  const options: { span: string; parts: number }[] = [];
  for (const span of ["1", "0,1"]) {
    for (const parts of [2, 4, 5]) {
      // Une graduation doit tomber juste avec au plus 2 chiffres après la virgule (0,25 ; 0,02…).
      if (Number.isInteger(toScale(span, 2) / parts)) options.push({ span, parts });
    }
  }
  const { span, parts } = pick(rng, options);
  const step = toDecimalString(toScale(span, 2) / parts, 2);
  const spanUnits = parseDecimal(span);
  const multiple =
    spanUnits.scale === 0
      ? randInt(rng, 0, 9)
      : randInt(rng, 10 ** spanUnits.scale, 10 ** (spanUnits.scale + 1) - 1);
  const start = toDecimalString(multiple * spanUnits.units, spanUnits.scale);
  const intervals = parts * 2;
  const line: Line = { start, step, intervals, labels: [0, parts], tick: 0 };
  line.tick = freeTick(rng, intervals + 1, line.labels);
  const value = decimalAt(start, step, line.tick);
  const end = decimalAt(start, step, parts);
  return {
    prompt: `Quelle est l'abscisse du point ${name} ?`,
    figure: figure(line, name),
    answer: { type: "number", value },
    hint: `Calcule l'écart entre les deux nombres écrits, puis partage-le entre les ${parts} intervalles qui les séparent.`,
    solution: [
      `Entre ${show(start)} et ${show(end)}, il y a ${parts} intervalles.`,
      `${show(end)} − ${show(start)} = ${show(span)}, donc une graduation vaut ${show(span)} ÷ ${parts} = ${show(step)}.`,
      ...readingSteps(line, name),
    ],
  };
}

export const generate: GeneratorModule["generate"] = ({ level, rng }) =>
  level === 3 ? deducedStepLine(rng) : regularLine(rng, level);
