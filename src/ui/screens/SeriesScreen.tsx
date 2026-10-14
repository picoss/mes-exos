import { useEffect, useMemo, useRef, useState } from "preact/hooks";
import { randomSeed } from "../../core/rng";
import {
  buildQuestions,
  createSeries,
  currentQuestion,
  levelSchedule,
  next,
  submit,
  toSession,
  type SeriesState,
} from "../../core/series";
import { starsForAttempt } from "../../core/rewards";
import { findSkill } from "../../subjects";
import { texts } from "../../texts";
import { AnswerInput } from "../components/AnswerInput";
import { Feedback } from "../components/Feedback";
import { NumPad } from "../components/NumPad";
import { RichText } from "../components/RichText";
import { SeriesProgress } from "../components/SeriesProgress";
import { StarCount } from "../components/StarCount";
import { fieldCount, toGiven, useAnswerFields } from "../components/useAnswerFields";
import { FigureView } from "../figures/FigureView";
import { newId, profile, recordAttempt, recordSession } from "../store";
import { Placeholder } from "./Placeholder";
import { SeriesSummary } from "./SeriesSummary";

function randomItem(items: readonly string[]): string {
  return items[Math.floor(Math.random() * items.length)]!;
}

/** Pavé numérique à l'écran : sur un écran tactile, ou si l'option est cochée. */
function useKeypad(): boolean {
  const touch = useMemo(() => window.matchMedia("(pointer: coarse)").matches, []);
  return touch || (profile.value?.forceKeypad ?? false);
}

export function SeriesScreen({ skillKey }: { skillKey: string }) {
  const found = findSkill(skillKey);
  const [state, setState] = useState<SeriesState | null>(null);
  const [run, setRun] = useState(0);

  useEffect(() => {
    const load = found?.skill.generator;
    if (!load) return;
    let cancelled = false;
    setState(null);
    void load().then((generator) => {
      if (cancelled) return;
      const questions = buildQuestions(generator, skillKey, levelSchedule(), randomSeed);
      setState(createSeries({ skill: skillKey, questions, sessionId: newId(), now: Date.now() }));
    });
    return () => {
      cancelled = true;
    };
  }, [skillKey, run]);

  if (!found?.skill.generator) {
    return <Placeholder title={texts.notFound.title} message={texts.notFound.message} />;
  }
  const chapterPath = `/${found.subject.id}/${found.chapter.id}`;

  if (!state) {
    return (
      <main class="page">
        <p class="series__loading">{texts.series.loading}</p>
      </main>
    );
  }
  if (state.phase === "done") {
    return (
      <SeriesSummary
        attempts={state.attempts}
        chapterPath={chapterPath}
        onRestart={() => setRun((count) => count + 1)}
      />
    );
  }
  return <SeriesRun key={run} state={state} setState={setState} chapterPath={chapterPath} />;
}

interface SeriesRunProps {
  state: SeriesState;
  setState: (state: SeriesState) => void;
  chapterPath: string;
}

function SeriesRun({ state, setState, chapterPath }: SeriesRunProps) {
  const question = currentQuestion(state);
  const keypad = useKeypad();
  const resetKey = `${state.index}-${state.wrongTries}`;
  const fields = useAnswerFields(question.answer, resetKey);
  const [notice, setNotice] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const dialog = useRef<HTMLDialogElement>(null);
  const lastAttempt = state.phase !== "answering" ? state.attempts.at(-1) : undefined;
  const hasFields = fieldCount(question.answer) > 0;

  function handleSubmit(given = toGiven(question.answer, fields.values)) {
    const result = submit(state, given, { now: Date.now(), attemptId: newId() });
    if (result.outcome === "unreadable") {
      if (state.phase === "answering") setNotice(texts.series.unreadable[question.answer.type]);
      return;
    }
    setNotice(null);
    if (result.attempt) recordAttempt(result.attempt);
    if (result.outcome === "retry") setMessage(randomItem(texts.series.retry));
    if (result.outcome === "correct") {
      setMessage(
        randomItem(
          result.attempt!.tries === 1 ? texts.series.praise : texts.series.praiseSecondTry,
        ),
      );
    }
    setState(result.state);
  }

  function handleNext() {
    const now = Date.now();
    const following = next(state, now);
    if (following.phase === "done") recordSession(toSession(following, now));
    setNotice(null);
    setState(following);
  }

  function quit() {
    if (state.attempts.length > 0) recordSession(toSession(state, Date.now()));
    window.location.hash = chapterPath;
  }

  return (
    <main class="page series">
      <header class="series__top">
        <button
          class="topbar__back"
          type="button"
          aria-label={texts.series.quit}
          onClick={() => dialog.current?.showModal()}
        >
          ✕
        </button>
        <SeriesProgress state={state} />
        <StarCount />
      </header>

      <div class={`series__body ${keypad && hasFields ? "series__body--keypad" : ""}`}>
        <div class="series__main">
          <section class="question">
            <p class="question__prompt">
              <RichText text={question.prompt} />
            </p>
            {question.figure && (
              <div class="question__figure">
                <FigureView figure={question.figure} />
              </div>
            )}
          </section>

          <AnswerInput
            answer={question.answer}
            unit={question.unit}
            fields={fields}
            phase={state.phase}
            keypad={keypad}
            resetKey={resetKey}
            eliminated={state.eliminated}
            lastGiven={state.lastGiven}
            onSubmit={handleSubmit}
          />

          <Feedback
            question={question}
            phase={state.phase}
            wrongTries={state.wrongTries}
            notice={notice}
            message={message}
            stars={lastAttempt ? starsForAttempt(lastAttempt) : 0}
            lastGiven={state.lastGiven}
            onNext={handleNext}
          />
        </div>

        {keypad && hasFields && state.phase === "answering" && (
          <NumPad
            multipleFields={fieldCount(question.answer) > 1}
            onKey={(key) => (key === "submit" ? handleSubmit() : fields.press(key))}
          />
        )}
      </div>

      <dialog ref={dialog} class="dialog">
        <h2>{texts.series.quitDialog.title}</h2>
        <p>{texts.series.quitDialog.message}</p>
        <div class="dialog__actions">
          <button class="button" type="button" onClick={() => dialog.current?.close()}>
            {texts.series.quitDialog.stay}
          </button>
          <button class="button button--secondary" type="button" onClick={quit}>
            {texts.series.quitDialog.leave}
          </button>
        </div>
      </dialog>
    </main>
  );
}
