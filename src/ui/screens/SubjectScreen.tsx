import { href } from "../../core/router";
import type { Subject } from "../../core/types";
import { texts } from "../../texts";
import { Header } from "../components/Header";

/** Liste des chapitres d'une matière. */
export function SubjectScreen({ subject }: { subject: Subject }) {
  return (
    <main class="page stack">
      <Header title={subject.name} back="/" />
      <ul class="list">
        {subject.chapters.map((chapter) => (
          <li key={chapter.id}>
            <a class="list__item" href={href(`/${subject.id}/${chapter.id}`)}>
              <span class="list__title">{chapter.name}</span>
              <span class="list__meta">{texts.subject.skillCount(chapter.skills.length)}</span>
            </a>
          </li>
        ))}
      </ul>
    </main>
  );
}
