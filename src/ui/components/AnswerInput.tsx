import { useEffect, useRef } from "preact/hooks";
import type { Phase } from "../../core/series";
import type { Answer } from "../../core/types";
import { texts } from "../../texts";
import { RichText } from "./RichText";
import type { AnswerFields } from "./useAnswerFields";

interface AnswerInputProps {
  answer: Answer;
  unit?: string;
  fields: AnswerFields;
  phase: Phase;
  /** Pavé numérique à l'écran : les cases n'ouvrent pas le clavier de la tablette. */
  keypad: boolean;
  resetKey: string;
  eliminated: number[];
  lastGiven: string[] | null;
  onSubmit: (given?: string[]) => void;
}

/** Cases de réponse (nombre, fraction, plusieurs cases) ou boutons d'un QCM. */
export function AnswerInput(props: AnswerInputProps) {
  const { answer, fields, phase, keypad, resetKey, onSubmit } = props;
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const locked = phase !== "answering";

  // Sur ordinateur, le curseur se place dans la première case à chaque nouvel essai.
  useEffect(() => {
    if (!keypad) inputs.current[0]?.focus();
  }, [resetKey, keypad]);

  if (answer.type === "choice") {
    return (
      <div class={`choices choices--${answer.choices.length}`}>
        {answer.choices.map((choice, index) => {
          const picked = props.lastGiven?.[0] === String(index);
          const state =
            locked && index === answer.correct
              ? "is-correct"
              : props.eliminated.includes(index) || (locked && picked)
                ? "is-wrong"
                : "";
          return (
            <button
              key={index}
              type="button"
              class={`choice ${state}`}
              disabled={locked || props.eliminated.includes(index)}
              onClick={() => onSubmit([String(index)])}
            >
              <RichText text={choice} />
            </button>
          );
        })}
      </div>
    );
  }

  const input = (index: number, label: string, extraClass = "") => (
    <input
      key={index}
      ref={(element) => {
        inputs.current[index] = element;
      }}
      class={`answer__input ${extraClass} ${keypad && !locked && fields.active === index ? "is-active" : ""}`}
      value={fields.values[index] ?? ""}
      aria-label={label}
      inputMode={keypad ? "none" : "decimal"}
      autocomplete="off"
      spellcheck={false}
      disabled={locked}
      onFocus={() => fields.setActive(index)}
      onClick={() => fields.setActive(index)}
      onInput={(event) => {
        const value = event.currentTarget.value;
        // « 83/10 » tapé ou collé dans le numérateur : on répartit dans les deux cases.
        if (answer.type === "fraction" && index === 0 && value.includes("/")) {
          const [num = "", den = ""] = value.split("/");
          fields.setValue(0, num);
          fields.setValue(1, den);
          inputs.current[1]?.focus();
          return;
        }
        fields.setValue(index, value);
      }}
      onKeyDown={(event) => {
        // Dans une fraction, « / » fait passer au dénominateur.
        if (answer.type === "fraction" && event.key === "/") {
          event.preventDefault();
          inputs.current[1]?.focus();
        }
      }}
    />
  );

  const outcome =
    phase === "correct" ? "answer--correct" : phase === "failed" ? "answer--failed" : "";

  return (
    <form
      class={`answer ${outcome}`}
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      {answer.type === "number" && (
        <div class="answer__row">
          {input(0, texts.series.answerLabel)}
          {props.unit && <span class="answer__unit">{props.unit}</span>}
        </div>
      )}
      {answer.type === "fraction" && (
        <div class="answer__fraction">
          {input(0, texts.series.numerator, "answer__input--small")}
          <span class="answer__bar" aria-hidden="true" />
          {input(1, texts.series.denominator, "answer__input--small")}
        </div>
      )}
      {answer.type === "multi" &&
        (answer.layout ? (
          <div class="answer__row">
            {answer.layout.split(/(\{\d+\})/).map((part, index) => {
              const field = /^\{(\d+)\}$/.exec(part);
              if (!field)
                return part.trim() ? (
                  <span key={`t${index}`} class="answer__text">
                    <RichText text={part.trim()} />
                  </span>
                ) : null;
              const fieldIndex = Number(field[1]);
              return input(
                fieldIndex,
                answer.fields[fieldIndex]?.label ?? "",
                "answer__input--small",
              );
            })}
          </div>
        ) : (
          <div class="answer__row">
            {answer.fields.map((field, index) => (
              <label key={index} class="answer__labelled">
                <span>{field.label}</span>
                {input(index, field.label, "answer__input--small")}
              </label>
            ))}
          </div>
        ))}
      {!keypad && !locked && (
        <button class="button button--large answer__submit" type="submit">
          {texts.series.submit}
        </button>
      )}
    </form>
  );
}
