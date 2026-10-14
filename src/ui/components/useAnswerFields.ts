import { useState } from "preact/hooks";
import type { Answer } from "../../core/types";

const MAX_LENGTH = 12;

/** Nombre de cases à remplir pour une réponse (0 pour un QCM). */
export function fieldCount(answer: Answer): number {
  switch (answer.type) {
    case "number":
      return 1;
    case "fraction":
      return 2;
    case "multi":
      return answer.fields.length;
    case "choice":
      return 0;
  }
}

/** Contenu des cases → réponse à vérifier. Une fraction sans dénominateur reste illisible. */
export function toGiven(answer: Answer, values: readonly string[]): string[] {
  if (answer.type === "fraction") return [`${values[0] ?? ""}/${values[1] ?? ""}`];
  return [...values];
}

export type FieldKey = "submit" | "erase" | "next" | string;

export interface AnswerFields {
  values: string[];
  active: number;
  setActive: (index: number) => void;
  setValue: (index: number, value: string) => void;
  /** Touche du pavé numérique : chiffre, virgule, effacer, case suivante. */
  press: (key: FieldKey) => void;
}

/**
 * Contenu des cases de réponse. `resetKey` change à chaque nouvelle question et à chaque
 * nouvel essai : les cases repartent alors vides.
 */
export function useAnswerFields(answer: Answer, resetKey: string): AnswerFields {
  const count = fieldCount(answer);
  const blank = () => ({ key: resetKey, values: Array<string>(count).fill(""), active: 0 });
  const [stored, setStored] = useState(blank);
  const current = stored.key === resetKey ? stored : blank();

  const change = (update: (state: typeof current) => Partial<typeof current>) =>
    setStored((previous) => {
      const base = previous.key === resetKey ? previous : blank();
      return { ...base, ...update(base) };
    });

  return {
    values: current.values,
    active: current.active,
    setActive: (index) => change(() => ({ active: index })),
    setValue: (index, value) =>
      change((state) => ({
        values: state.values.map((existing, i) =>
          i === index ? value.slice(0, MAX_LENGTH) : existing,
        ),
      })),
    press: (key) =>
      change((state) => {
        if (key === "next") return { active: (state.active + 1) % Math.max(count, 1) };
        const values = state.values.map((existing, i) => {
          if (i !== state.active) return existing;
          if (key === "erase") return existing.slice(0, -1);
          return (existing + key).slice(0, MAX_LENGTH);
        });
        return { values };
      }),
  };
}
