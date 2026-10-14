import { decimalAt, formatNumber } from "../../core/decimal";
import type { NumberLineFigure } from "../../core/types";

const WIDTH = 640;
const HEIGHT = 120;
const MARGIN = 32;
const LINE_Y = 64;

/** Droite graduée : graduations régulières, quelques valeurs écrites, points nommés. */
export function NumberLine({ figure }: { figure: NumberLineFigure }) {
  const spacing = (WIDTH - 2 * MARGIN) / figure.intervals;
  const x = (tick: number) => MARGIN + tick * spacing;
  const ticks = Array.from({ length: figure.intervals + 1 }, (_, tick) => tick);
  // Graduation intermédiaire (au milieu de deux nombres écrits), seulement si elle tombe juste.
  const gaps = figure.labels.slice(1).map((label, index) => label - figure.labels[index]!);
  const halfway = gaps.length > 0 && gaps.every((gap) => gap === 10);
  const tickHeight = (tick: number) =>
    figure.labels.includes(tick) ? 14 : halfway && (tick - figure.labels[0]!) % 5 === 0 ? 10 : 6;
  const labelValues = figure.labels.map((tick) =>
    formatNumber(decimalAt(figure.start, figure.step, tick)),
  );
  const description = `Droite graduée. Nombres écrits : ${labelValues.join(", ")}. Point${figure.points.length > 1 ? "s" : ""} ${figure.points.map((point) => point.name).join(", ")}.`;

  return (
    <svg class="number-line" viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={description}>
      <line
        class="number-line__axis"
        x1={MARGIN - 18}
        y1={LINE_Y}
        x2={WIDTH - MARGIN + 22}
        y2={LINE_Y}
      />
      <path
        class="number-line__arrow"
        d={`M ${WIDTH - MARGIN + 14} ${LINE_Y - 7} L ${WIDTH - MARGIN + 24} ${LINE_Y} L ${WIDTH - MARGIN + 14} ${LINE_Y + 7}`}
      />
      {ticks.map((tick) => (
        <line
          key={tick}
          class="number-line__tick"
          x1={x(tick)}
          x2={x(tick)}
          y1={LINE_Y - tickHeight(tick)}
          y2={LINE_Y + tickHeight(tick)}
        />
      ))}
      {figure.labels.map((tick, index) => (
        <text
          key={tick}
          class="number-line__label"
          x={x(tick)}
          y={LINE_Y + 38}
          text-anchor="middle"
        >
          {labelValues[index]}
        </text>
      ))}
      {figure.points.map((point) => (
        <g key={point.name} class="number-line__point">
          <line x1={x(point.tick) - 7} y1={LINE_Y - 7} x2={x(point.tick) + 7} y2={LINE_Y + 7} />
          <line x1={x(point.tick) - 7} y1={LINE_Y + 7} x2={x(point.tick) + 7} y2={LINE_Y - 7} />
          <text x={x(point.tick)} y={LINE_Y - 20} text-anchor="middle">
            {point.name}
          </text>
        </g>
      ))}
    </svg>
  );
}
