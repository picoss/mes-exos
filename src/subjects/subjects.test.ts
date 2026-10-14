import { describe, expect, it } from "vitest";
import { SUBJECTS, skillKey } from ".";

// Les identifiants sont enregistrés dans la progression : ils doivent rester simples et uniques.
const ID = /^[a-z0-9]+(-[a-z0-9]+)*$/;

describe("registre des matières", () => {
  it("utilise des identifiants simples (minuscules, chiffres, tirets)", () => {
    for (const subject of SUBJECTS) {
      expect(subject.id).toMatch(ID);
      for (const chapter of subject.chapters) {
        expect(chapter.id).toMatch(ID);
        for (const skill of chapter.skills) expect(skill.id).toMatch(ID);
      }
    }
  });

  it("n'a pas deux fois le même identifiant", () => {
    const subjectIds = SUBJECTS.map((subject) => subject.id);
    expect(new Set(subjectIds).size).toBe(subjectIds.length);

    for (const subject of SUBJECTS) {
      const chapterIds = subject.chapters.map((chapter) => chapter.id);
      expect(new Set(chapterIds).size).toBe(chapterIds.length);

      const skillKeys = subject.chapters.flatMap((chapter) =>
        chapter.skills.map((skill) => skillKey(subject, chapter, skill)),
      );
      expect(new Set(skillKeys).size).toBe(skillKeys.length);
    }
  });
});
