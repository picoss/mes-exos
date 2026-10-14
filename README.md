# Mes exos

Site d'exercices de maths pour la 6e, utilisable sur ordinateur et sur tablette, même hors ligne. Les spécifications complètes sont dans [SPECS.md](SPECS.md).

## Développement

Il faut Node.js 24 (LTS) ou plus récent.

```bash
npm install
npm run dev        # serveur local avec rechargement instantané : http://localhost:5173
```

| Commande          | Rôle                                                                       |
| ----------------- | -------------------------------------------------------------------------- |
| `npm run dev`     | Serveur de développement                                                   |
| `npm test`        | Tests unitaires (Vitest)                                                   |
| `npm run check`   | Vérification des types (TypeScript)                                        |
| `npm run build`   | Construit le site dans `dist/`                                             |
| `npm run preview` | Sert `dist/` pour tester la version de production, mode hors ligne compris |
| `npm run format`  | Formate le code (Prettier)                                                 |
| `npm run icons`   | Régénère les icônes de `public/` (nécessite Inkscape)                      |

Le mode hors ligne (service worker) n'est actif qu'avec `build` + `preview`, pas avec `dev`.

## Où modifier quoi

- **Nom du site, thèmes, avatars, paliers d'étoiles** : `src/config.ts`
- **Textes affichés** : `src/texts.ts`
- **Chapitres et compétences** : `src/subjects/maths/index.ts`
- **Logique** (stockage, routage, étoiles…) : `src/core/`, testée sans navigateur
- **Écrans et composants** : `src/ui/`

Les identifiants des compétences (`maths.decimaux.droite-graduee`…) sont enregistrés dans la progression : il ne faut jamais les renommer.

## Mise en ligne (GitHub Pages)

1. Pousser le dépôt sur GitHub.
2. Dans le dépôt : **Settings → Pages → Build and deployment → Source : GitHub Actions**.
3. Chaque push sur `main` lance le workflow `.github/workflows/deploy.yml` : vérification des types, tests, build, puis publication. Si une étape échoue, rien n'est publié.

Le site est alors disponible à l'adresse `https://<utilisateur>.github.io/<dépôt>/`.

⚠️ La progression est enregistrée dans le navigateur et liée à cette adresse. Changer de nom de dépôt ou d'hébergeur fait repartir de zéro : il faudra exporter la progression avant (fonction prévue au lot 2).

## Installer sur la tablette Android

Ouvrir l'adresse du site dans Chrome, puis menu **⋮ → Installer l'application** (ou « Ajouter à l'écran d'accueil »). Le site s'ouvre alors en plein écran, comme une appli, et marche hors ligne.

Quand une nouvelle version est publiée, un bandeau « Une nouvelle version est disponible » propose de la charger. Il ne s'affiche jamais pendant un exercice.
