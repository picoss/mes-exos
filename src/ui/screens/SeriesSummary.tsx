import { formatAnswer, formatGiven } from "../../core/answers";
import { href } from "../../core/router";
import { summarize } from "../../core/series";
import type { Attempt } from "../../core/types";
import { texts } from "../../texts";
import { RichText } from "../components/RichText";
import { FigureView } from "../figures/FigureView";

interface SeriesSummaryProps {
  attempts: Attempt[];
  chapterPath: string;
  onRestart: () => void;
}

/** Bilan de fin de série : score, étoiles et correction des questions ratées. */
export function SeriesSummary({ attempts, chapterPath, onRestart }: SeriesSummaryProps) {
  const summary = summarize(attempts);
  const perfect = summary.firstTry === attempts.length;

  return (
    <main class="page stack">
      <header class="summary__header">
        <h1>{perfect ? texts.summary.perfect : texts.summary.title}</h1>
        <p class="summary__stars" aria-label={texts.summary.stars(summary.stars)}>
          <span aria-hidden="true">{texts.series.earned(summary.stars)}</span>
        </p>
      </header>

      <ul class="summary__stats">
        <li class="summary__stat summary__stat--first">
          <strong>{summary.firstTry}</strong> {texts.summary.firstTry}
        </li>
        <li class="summary__stat summary__stat--second">
          <strong>{summary.secondTry}</strong> {texts.summary.secondTry}
        </li>
        <li class="summary__stat summary__stat--failed">
          <strong>{summary.failed}</strong> {texts.summary.failed}
        </li>
      </ul>

      <div class="summary__actions">
        <button class="button button--large" type="button" onClick={onRestart}>
          {texts.summary.restart}
        </button>
        <a class="button button--secondary" href={href(chapterPath)}>
          {texts.summary.otherSkill}
        </a>
        <a class="button button--secondary" href={href("/")}>
          {texts.summary.home}
        </a>
      </div>

      {summary.mistakes.length > 0 && (
        <section class="stack">
          <h2>{texts.summary.mistakesTitle}</h2>
          {summary.mistakes.map((attempt) => {
            const snapshot = attempt.snapshot!;
            return (
              <article key={attempt.id} class="mistake">
                <p class="mistake__prompt">
                  <RichText text={snapshot.prompt} />
                </p>
                {snapshot.figure && <FigureView figure={snapshot.figure} />}
                <p>
                  {texts.series.correctAnswer}{" "}
                  <strong>
                    <RichText text={formatAnswer(snapshot.answer)} />
                  </strong>
                </p>
                <p class="feedback__given">
                  {texts.series.yourAnswer}{" "}
                  <RichText text={formatGiven(snapshot.answer, snapshot.given)} />
                </p>
                <ol class="steps">
                  {snapshot.solution.map((step, index) => (
                    <li key={index}>
                      <RichText text={step} />
                    </li>
                  ))}
                </ol>
              </article>
            );
          })}
        </section>
      )}
    </main>
  );
}
