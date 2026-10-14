import { href } from "../../core/router";
import type { Chapter, Subject } from "../../core/types";
import { isSkillAvailable, skillKey } from "../../subjects";
import { texts } from "../../texts";
import { Header } from "../components/Header";

/** Liste des compétences d'un chapitre. */
export function ChapterScreen({ subject, chapter }: { subject: Subject; chapter: Chapter }) {
  return (
    <main class="page stack">
      <Header title={chapter.name} back={"/" + subject.id} />
      <ul class="list">
        {chapter.skills.map((skill) => (
          <li key={skill.id}>
            {isSkillAvailable(skill) ? (
              <a class="list__item" href={href("/serie/" + skillKey(subject, chapter, skill))}>
                <span class="list__title">{skill.name}</span>
              </a>
            ) : (
              <div class="list__item is-disabled">
                <span class="list__title">{skill.name}</span>
                <span class="badge">{texts.chapter.comingSoon}</span>
              </div>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}
