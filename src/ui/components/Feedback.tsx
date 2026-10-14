import { useEffect, useRef } from "preact/hooks";
import { formatAnswer, formatGiven } from "../../core/answers";
import type { Phase } from "../../core/series";
import type { Question } from "../../core/types";
import { texts } from "../../texts";
import { RichText } from "./RichText";

interface FeedbackProps {
  question: Question;
  phase: Phase;
  wrongTries: number;
  /** Réponse illisible : message d'aide, sans essai consommé. */
  notice: string | null;
  /** Message d'encouragement tiré au hasard. */
  message: string;
  stars: number;
  lastGiven: string[] | null;
  onNext: () => void;
}

/** Retour après une réponse : indice, bravo ou correction détaillée. */
export function Feedback(props: FeedbackProps) {
  const { question, phase } = props;
  const box = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    box.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    // Entrée passe à la suite.
    button.current?.focus({ preventScroll: true });
  }, [phase, props.wrongTries, props.notice]);

  if (phase === "answering") {
    if (!props.notice && props.wrongTries === 0) return null;
    return (
      <div ref={box} class="feedback-stack">
        {props.wrongTries > 0 && (
          <div class="feedback feedback--hint" role="status">
            <p class="feedback__title">{props.message}</p>
            <p>
              <span class="feedback__label">💡 {texts.series.hint}&nbsp;: </span>
              <RichText text={question.hint} />
            </p>
          </div>
        )}
        {props.notice && (
          <div class="feedback feedback--notice" role="status">
            {props.notice}
          </div>
        )}
      </div>
    );
  }

  if (phase === "correct") {
    return (
      <div ref={box} class="feedback feedback--correct" role="status">
        <p class="feedback__title">
          {props.message} <span class="feedback__stars">{texts.series.earned(props.stars)}</span>
        </p>
        <button ref={button} class="button button--large" type="button" onClick={props.onNext}>
          {texts.series.next}
        </button>
      </div>
    );
  }

  if (phase !== "failed") return null;
  return (
    <div ref={box} class="feedback feedback--failed" role="status">
      <p class="feedback__title">{texts.series.failed}</p>
      <p>
        {texts.series.correctAnswer}{" "}
        <strong class="feedback__answer">
          <RichText text={formatAnswer(question.answer, question.unit)} />
        </strong>
      </p>
      {props.lastGiven && (
        <p class="feedback__given">
          {texts.series.yourAnswer}{" "}
          <RichText text={formatGiven(question.answer, props.lastGiven, question.unit)} />
        </p>
      )}
      <ol class="steps">
        {question.solution.map((step, index) => (
          <li key={index}>
            <RichText text={step} />
          </li>
        ))}
      </ol>
      <button ref={button} class="button button--large" type="button" onClick={props.onNext}>
        {texts.series.understood}
      </button>
    </div>
  );
}
