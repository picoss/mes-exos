import type { JSX } from "preact";
import { matchRoute } from "../core/router";
import type { Profile } from "../core/types";
import { findChapter, findSubject } from "../subjects";
import { texts } from "../texts";
import { UpdateBanner } from "./components/UpdateBanner";
import { currentPath } from "./router";
import { ChapterScreen } from "./screens/ChapterScreen";
import { Customize } from "./screens/Customize";
import { Home } from "./screens/Home";
import { Onboarding } from "./screens/Onboarding";
import { Placeholder } from "./screens/Placeholder";
import { SeriesScreen } from "./screens/SeriesScreen";
import { SubjectScreen } from "./screens/SubjectScreen";
import { profile } from "./store";

type Params = Record<string, string>;
type Render = (params: Params, profile: Profile) => JSX.Element | null;

const comingSoon = (title: string) => () => (
  <Placeholder title={title} message={texts.comingSoon.message} />
);

// Les chemins fixes passent avant les chemins à paramètres.
const ROUTES: [pattern: string, render: Render][] = [
  ["/", (_, current) => <Home profile={current} />],
  ["/personnaliser", (_, current) => <Customize profile={current} />],
  ["/defis", comingSoon(texts.home.challenges)],
  ["/trophees", comingSoon(texts.home.trophies)],
  ["/parent", comingSoon(texts.home.parent)],
  ["/serie/:skill", ({ skill = "" }) => <SeriesScreen key={skill} skillKey={skill} />],
  [
    "/:subject",
    ({ subject = "" }) => {
      const found = findSubject(subject);
      return found ? <SubjectScreen subject={found} /> : null;
    },
  ],
  [
    "/:subject/:chapter",
    ({ subject = "", chapter = "" }) => {
      const foundSubject = findSubject(subject);
      const foundChapter = foundSubject && findChapter(foundSubject, chapter);
      return foundSubject && foundChapter ? (
        <ChapterScreen subject={foundSubject} chapter={foundChapter} />
      ) : null;
    },
  ],
];

function renderRoute(path: string, current: Profile): JSX.Element {
  for (const [pattern, render] of ROUTES) {
    const params = matchRoute(pattern, path);
    const screen = params && render(params, current);
    if (screen) return screen;
  }
  return <Placeholder title={texts.notFound.title} message={texts.notFound.message} />;
}

export function App() {
  const path = currentPath.value;
  const current = profile.value;

  return (
    <>
      {current ? renderRoute(path, current) : <Onboarding />}
      <UpdateBanner path={path} />
    </>
  );
}
