import type { SeriesState } from "../../core/series";
import { texts } from "../../texts";

/** Une case par question : verte si réussie du premier coup, claire au deuxième essai, orange si ratée. */
export function SeriesProgress({ state }: { state: SeriesState }) {
  const total = state.questions.length;
  const current = Math.min(state.index + 1, total);
  return (
    <div
      class="progress"
      role="progressbar"
      aria-valuemin={1}
      aria-valuemax={total}
      aria-valuenow={current}
      aria-label={texts.series.progress(current, total)}
    >
      {state.questions.map((_, index) => {
        const attempt = state.attempts[index];
        const status = attempt
          ? attempt.ok
            ? attempt.tries === 1
              ? "is-first"
              : "is-second"
            : "is-failed"
          : index === state.index
            ? "is-current"
            : "";
        return <span key={index} class={`progress__step ${status}`} />;
      })}
    </div>
  );
}
