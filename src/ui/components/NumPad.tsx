import { texts } from "../../texts";
import type { FieldKey } from "./useAnswerFields";

const DIGITS = ["7", "8", "9", "4", "5", "6", "1", "2", "3"];

interface NumPadProps {
  /** Affiche la touche « case suivante » quand il y a plusieurs cases. */
  multipleFields: boolean;
  onKey: (key: FieldKey) => void;
}

/** Pavé numérique à l'écran, pour la tablette (disposition de calculatrice). */
export function NumPad({ multipleFields, onKey }: NumPadProps) {
  const key = (value: FieldKey, label: string, ariaLabel?: string, extraClass = "") => (
    <button
      type="button"
      class={`keypad__key ${extraClass}`}
      aria-label={ariaLabel}
      onClick={() => onKey(value)}
    >
      {label}
    </button>
  );

  return (
    <div class="keypad" role="group" aria-label="Pavé numérique">
      {DIGITS.map((digit) => key(digit, digit))}
      {key(",", ",", "virgule")}
      {key("0", "0")}
      {key("erase", "⌫", texts.series.erase)}
      {multipleFields && key("next", texts.series.switchField, undefined, "keypad__key--text")}
      <button
        type="button"
        class={`keypad__key keypad__submit ${multipleFields ? "" : "keypad__submit--full"}`}
        onClick={() => onKey("submit")}
      >
        {texts.series.submit}
      </button>
    </div>
  );
}
