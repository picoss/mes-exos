// Types partagés : contenu pédagogique (matières, questions) et données enregistrées.

// --- Contenu ---------------------------------------------------------------

export type Level = 1 | 2 | 3;

// Les nombres sont écrits en écriture décimale française sans espace : "3,25", "1000".
// Les textes (énoncé, indice, correction, choix) acceptent le balisage [[a/b]] pour une fraction.

export type Answer =
  | { type: "number"; value: string }
  | { type: "fraction"; num: number; den: number; accept: "equivalent" | "exact" | "irreductible" }
  | {
      type: "multi";
      fields: { label: string; value: string }[];
      /** Disposition des champs dans une ligne, ex. "{0} < 7,38 < {1}". */
      layout?: string;
    }
  | { type: "choice"; choices: string[]; correct: number };

/** Droite graduée : graduations régulières à partir de `start`, espacées de `step`. */
export interface NumberLineFigure {
  kind: "number-line";
  start: string;
  step: string;
  /** Nombre d'intervalles entre la première et la dernière graduation. */
  intervals: number;
  /** Graduations dont la valeur est écrite sous la droite (numéros à partir de 0). */
  labels: number[];
  points: { tick: number; name: string }[];
}

export type Figure = NumberLineFigure;

/** Contenu d'une question, tel que le produit un générateur. */
export interface QuestionContent {
  prompt: string;
  figure?: Figure;
  answer: Answer;
  /** Unité affichée après le champ de réponse, ex. "cm". */
  unit?: string;
  hint: string;
  /** Étapes de la correction détaillée. */
  solution: string[];
}

export interface Question extends QuestionContent {
  /** Identifiant complet de la compétence, ex. "maths.calcul.multiplication". */
  skill: string;
  level: Level;
  /** "gen:<graine>" pour une question générée, ou l'id d'une question de banque. */
  ref: string;
}

export type BankQuestion = QuestionContent & { id: string; level: Level };

export interface GeneratorModule {
  /** `rng` renvoie un nombre aléatoire dans [0, 1[, à partir d'une graine. */
  generate(options: { level: Level; rng: () => number }): QuestionContent;
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
