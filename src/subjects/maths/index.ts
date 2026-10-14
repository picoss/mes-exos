import type { Subject } from "../../core/types";

// Une compétence sans `generator` ni `bank` est affichée « Bientôt ».

export default {
  id: "maths",
  name: "Mathématiques",
  icon: "📐",
  chapters: [
    {
      id: "entiers",
      name: "Nombres entiers",
      skills: [
        { id: "ecrire", name: "Écrire les nombres en chiffres et en lettres", levels: 3 },
        { id: "valeur-chiffres", name: "Valeur d'un chiffre, décomposition", levels: 3 },
        { id: "comparer-ranger", name: "Comparer, ranger, encadrer", levels: 3 },
      ],
    },
    {
      id: "decimaux",
      name: "Écriture décimale et fractions",
      skills: [
        { id: "fractions-decimales", name: "Fraction décimale et écriture décimale", levels: 3 },
        { id: "decomposition", name: "Décomposer un nombre décimal", levels: 3 },
        { id: "decimaux-lettres", name: "Écrire un nombre décimal en lettres", levels: 3 },
        { id: "fractions-usuelles", name: "Fractions simples en écriture décimale", levels: 3 },
        { id: "droite-graduee", name: "Lire une droite graduée", levels: 3 },
        { id: "comparer-ranger", name: "Comparer et ranger des décimaux", levels: 3 },
        { id: "encadrer-arrondir", name: "Encadrer, intercaler, arrondir", levels: 3 },
      ],
    },
    {
      id: "calcul",
      name: "Calcul",
      skills: [
        { id: "calcul-mental", name: "Calcul mental", levels: 3 },
        { id: "addition-soustraction", name: "Additions et soustractions", levels: 3 },
        { id: "multiplication", name: "Multiplications", levels: 3 },
        { id: "division", name: "Divisions", levels: 3 },
        { id: "multiples-diviseurs", name: "Multiples et diviseurs", levels: 3 },
        { id: "ordre-grandeur", name: "Ordres de grandeur", levels: 3 },
        { id: "problemes", name: "Problèmes", levels: 3 },
      ],
    },
    {
      id: "fractions",
      name: "Fractions",
      skills: [
        { id: "fraction-figure", name: "Lire une fraction sur une figure", levels: 3 },
        { id: "fraction-droite", name: "Fractions sur une droite graduée", levels: 3 },
        { id: "fractions-egales", name: "Fractions égales", levels: 3 },
        { id: "comparer-fractions", name: "Comparer des fractions", levels: 3 },
        { id: "fraction-quantite", name: "Fraction d'une quantité", levels: 3 },
        { id: "fraction-quotient", name: "Fraction et division", levels: 3 },
      ],
    },
    {
      id: "proportionnalite",
      name: "Proportionnalité et données",
      skills: [
        { id: "tableau-proportionnalite", name: "Tableaux de proportionnalité", levels: 3 },
        { id: "problemes-proportionnalite", name: "Problèmes de proportionnalité", levels: 3 },
        { id: "pourcentages", name: "Pourcentages", levels: 3 },
        { id: "lire-donnees", name: "Lire un tableau ou un graphique", levels: 3 },
      ],
    },
    {
      id: "mesures",
      name: "Grandeurs et mesures",
      skills: [
        { id: "conversions", name: "Conversions", levels: 3 },
        { id: "durees", name: "Durées et horaires", levels: 3 },
        { id: "perimetres", name: "Périmètres", levels: 3 },
        { id: "aires", name: "Aires", levels: 3 },
        { id: "volumes", name: "Volumes", levels: 3 },
        { id: "angles", name: "Angles", levels: 3 },
      ],
    },
    {
      id: "geometrie",
      name: "Géométrie",
      skills: [
        { id: "vocabulaire", name: "Points, droites, segments", levels: 3 },
        { id: "paralleles-perpendiculaires", name: "Parallèles et perpendiculaires", levels: 3 },
        { id: "cercle", name: "Le cercle", levels: 3 },
        { id: "figures", name: "Triangles et quadrilatères", levels: 3 },
        { id: "symetrie", name: "Symétrie axiale", levels: 3 },
        { id: "solides", name: "Solides et patrons", levels: 3 },
      ],
    },
  ],
} satisfies Subject;
