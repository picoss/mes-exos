// Tous les textes affichés à l'élève et au parent.
// Typographie française : espace fine insécable (\u202f) avant ! ? ; et espace insécable
// (\u00a0) avant : — sinon la ponctuation peut partir seule à la ligne. Un test le vérifie.

import { APP_NAME } from "./config";

export const texts = {
  back: "Retour",
  stars: (count: number) => `${count} étoile${count > 1 ? "s" : ""}`,
  locked: (stars: number) => `Se débloque à ${stars} étoiles`,

  onboarding: {
    title: `Bienvenue dans ${APP_NAME}\u202f!`,
    nameLabel: "Comment tu t'appelles\u202f?",
    namePlaceholder: "Ton prénom",
    avatarLabel: "Choisis ton avatar",
    themeLabel: "Choisis tes couleurs",
    start: "C'est parti\u202f!",
  },

  home: {
    hello: (name: string) => `Bonjour ${name}\u202f!`,
    challenges: "Défis chronométrés",
    trophies: "Mes trophées",
    customize: "Personnaliser",
    parent: "Espace parent",
    continue: "Continuer",
    storageWarning:
      "Attention\u00a0: ce navigateur ne peut pas enregistrer ta progression. Elle sera perdue en fermant la page.",
  },

  subject: {
    skillCount: (count: number) => `${count} compétence${count > 1 ? "s" : ""}`,
  },

  chapter: {
    comingSoon: "Bientôt",
  },

  customize: {
    title: "Personnaliser",
    nameLabel: "Ton prénom",
    avatarLabel: "Avatar",
    themeLabel: "Couleurs",
    optionsLabel: "Options",
    sound: "Sons",
    forceKeypad: "Toujours afficher le pavé numérique",
  },

  series: {
    loading: "Préparation des questions…",
    progress: (current: number, total: number) => `Question ${current} sur ${total}`,
    quit: "Quitter la série",
    submit: "Valider",
    next: "Suivant",
    understood: "J'ai compris",
    answerLabel: "Ta réponse",
    numerator: "Numérateur",
    denominator: "Dénominateur",
    erase: "Effacer",
    switchField: "Changer de case",
    hint: "Indice",
    correctAnswer: "Bonne réponse\u00a0:",
    yourAnswer: "Ta réponse\u00a0:",
    failed: "Pas cette fois. Voici la correction\u00a0:",
    earned: (stars: number) => `+${stars} ⭐`,
    praise: [
      "Bravo\u202f!",
      "Exact\u202f!",
      "Super\u202f!",
      "Parfait\u202f!",
      "Bien joué\u202f!",
      "Excellent\u202f!",
    ],
    praiseSecondTry: ["Bien rattrapé\u202f!", "C'est ça\u202f!", "Bravo, tu as trouvé\u202f!"],
    retry: ["Pas tout à fait…", "Presque…", "Ce n'est pas encore ça…"],
    unreadable: {
      number: "Je n'ai pas compris ta réponse. Écris un nombre, par exemple 3,5.",
      fraction: "Écris le numérateur et le dénominateur.",
      multi: "Remplis toutes les cases.",
      choice: "Choisis une réponse.",
    },
    quitDialog: {
      title: "Arrêter la série\u202f?",
      message: "Les réponses que tu as déjà données sont gardées.",
      stay: "Continuer la série",
      leave: "Arrêter",
    },
  },

  summary: {
    title: "Série terminée\u202f!",
    perfect: "Série parfaite\u202f!",
    firstTry: "du premier coup",
    secondTry: "au deuxième essai",
    failed: "à revoir",
    stars: (count: number) =>
      `${count} étoile${count > 1 ? "s" : ""} gagnée${count > 1 ? "s" : ""}`,
    mistakesTitle: "À revoir",
    restart: "Recommencer",
    otherSkill: "Autre exercice",
    home: "Accueil",
  },

  comingSoon: {
    message: "Cette partie arrive bientôt\u202f!",
    home: "Retour à l'accueil",
  },

  notFound: {
    title: "Page introuvable",
    message: "Cette page n'existe pas.",
  },

  update: {
    message: "Une nouvelle version est disponible.",
    action: "Mettre à jour",
  },
};
