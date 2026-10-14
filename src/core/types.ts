// Types partagés : contenu pédagogique (matières, questions) et données enregistrées.

// --- Contenu ---------------------------------------------------------------

export type Level = 1 | 2 | 3;

export type Answer =
  | { type: "number"; value: string }
  | { type: "fraction"; num: number; den: number; accept: "equivalent" | "exact" | "irreductible" }
  | { type: "multi"; fields: { label: string; value: string }[] }
  | { type: "choice"; choices: string[]; correct: number };

/** Figure SVG générée. Chaque sorte de figure précisera ses propres champs. */
export interface Figure {
  kind: string;
}

export interface Question {
  /** Identifiant complet de la compétence, ex. "maths.calcul.multiplication". */
  skill: string;
  level: Level;
  /** "gen:<graine>" pour une question générée, ou l'id d'une question de banque. */
  ref: string;
  prompt: string;
  figure?: Figure;
  answer: Answer;
  /** Unité affichée après le champ de réponse, ex. "cm". */
  unit?: string;
  hint: string;
  /** Étapes de la correction détaillée. */
  solution: string[];
}

export type BankQuestion = Omit<Question, "skill" | "ref"> & { id: string };

export interface GeneratorModule {
  /** `rng` renvoie un nombre aléatoire dans [0, 1[, à partir d'une graine. */
  generate(options: { level: Level; rng: () => number }): Question;
}

export interface Skill {
  /** Identifiant stable : il est enregistré dans la progression, il ne doit jamais changer. */
  id: string;
  name: string;
  levels: number;
  generator?: () => Promise<GeneratorModule>;
  bank?: () => Promise<{ default: BankQuestion[] }>;
}

export interface Chapter {
  id: string;
  name: string;
  skills: Skill[];
}

export interface Subject {
  id: string;
  name: string;
  icon: string;
  chapters: Chapter[];
}

// --- Données enregistrées -------------------------------------------------

export interface Profile {
  name: string;
  avatar: string;
  theme: string;
  sound: boolean;
  forceKeypad: boolean;
  updatedAt: number;
}

export interface Settings {
  pinHash: string | null;
  /** Identifiants des chapitres ou compétences masqués par le parent. */
  hidden: string[];
  deviceName: string;
  lastExportAt: number | null;
  updatedAt: number;
}

export type AttemptMode = "serie" | "revision" | "defi";

export interface AttemptSnapshot {
  prompt: string;
  figure?: Figure;
  answer: Answer;
  given: string[];
  solution: string[];
}

export interface Attempt {
  id: string;
  ts: number;
  sessionId: string;
  skill: string;
  level: Level;
  mode: AttemptMode;
  ok: boolean;
  /** Nombre d'essais utilisés (1 ou 2). */
  tries: number;
  ms: number;
  /** Id de l'essai raté d'origine, pour une question « à revoir ». */
  reviewOf?: string;
  /** Copie de la question, conservée seulement quand elle est ratée. */
  snapshot?: AttemptSnapshot;
}

export type SessionMode = "serie" | "revision" | "jour" | "defi";

export interface Session {
  id: string;
  ts: number;
  mode: SessionMode;
  skill?: string;
  challenge?: string;
  score: number;
  durationMs: number;
}

export interface AppData {
  profile: Profile | null;
  settings: Settings;
  attempts: Attempt[];
  sessions: Session[];
  seenBadges: string[];
}
