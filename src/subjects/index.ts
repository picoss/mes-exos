// Registre des matières. Pour en ajouter une : créer son dossier et l'ajouter ici.

import type { Chapter, Skill, Subject } from "../core/types";
import maths from "./maths";

export const SUBJECTS: Subject[] = [maths];

export function findSubject(subjectId: string): Subject | undefined {
  return SUBJECTS.find((subject) => subject.id === subjectId);
}

export function findChapter(subject: Subject, chapterId: string): Chapter | undefined {
  return subject.chapters.find((chapter) => chapter.id === chapterId);
}

/** Identifiant complet d'une compétence, tel qu'il est enregistré : "maths.calcul.multiplication". */
export function skillKey(subject: Subject, chapter: Chapter, skill: Skill): string {
  return `${subject.id}.${chapter.id}.${skill.id}`;
}

export function isSkillAvailable(skill: Skill): boolean {
  return skill.generator !== undefined || skill.bank !== undefined;
}

/** Retrouve une compétence à partir de son identifiant complet. */
export function findSkill(
  key: string,
): { subject: Subject; chapter: Chapter; skill: Skill } | undefined {
  const [subjectId = "", chapterId = "", skillId = ""] = key.split(".");
  const subject = findSubject(subjectId);
  const chapter = subject && findChapter(subject, chapterId);
  const skill = chapter?.skills.find((candidate) => candidate.id === skillId);
  return subject && chapter && skill ? { subject, chapter, skill } : undefined;
}
