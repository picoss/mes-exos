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
