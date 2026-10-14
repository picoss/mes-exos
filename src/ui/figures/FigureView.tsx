import type { Figure } from "../../core/types";
import { NumberLine } from "./NumberLine";

export function FigureView({ figure }: { figure: Figure }) {
  switch (figure.kind) {
    case "number-line":
      return <NumberLine figure={figure} />;
  }
}
