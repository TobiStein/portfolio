# Tobi Stein — portfolio

Portfolio bilingue (français / anglais) de Tobi Stein, construit avec [Astro](https://astro.build) et [UnoCSS](https://unocss.dev). Trois rubriques : **Projets**, **Blog** et **À propos**, chacune disponible en `/fr/` et en `/en/`.

Le site est entièrement statique : on le construit une fois, puis on publie le dossier `dist` sur n’importe quel hébergeur de fichiers statiques.

## Prérequis

- Node.js 22.12.0 ou plus récent (exigé par Astro 7)
- pnpm (version épinglée : 10.20.0)

## Démarrer

```bash
pnpm install
pnpm dev
```

Le serveur de développement répond sur <http://localhost:4321>.

| Commande               | Rôle                                                                                                         |
| ---------------------- | ------------------------------------------------------------------------------------------------------------ |
| `pnpm dev`             | Serveur de développement local                                                                               |
| `pnpm build`           | Vérifie le code (`astro check`) puis génère le site dans `dist`                                              |
| `pnpm preview`         | Prévisualise le site construit                                                                               |
| `pnpm test`            | Lance les tests Node (`tests/*.test.mjs`)                                                                    |
| `pnpm check`           | Diagnostics Astro et TypeScript                                                                              |
| `pnpm format`          | Formate le dépôt avec Prettier (modifie les fichiers)                                                        |
| `pnpm optimize:avatar` | Crée `public/avatar.webp` (256 × 256) depuis `public/avatar2.png` ou `pnpm optimize:avatar chemin/photo.png` |

## Où modifier quoi

| Fichier                                                        | Contenu                                                                                                  |
| -------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| [src/site-config.ts](./src/site-config.ts)                     | Informations personnelles : nom, description, menu, réseaux sociaux, bio, formation, compétences, Waline |
| [src/i18n/ui.ts](./src/i18n/ui.ts)                             | Textes de l’interface (boutons, titres, libellés) en français et en anglais                              |
| [src/assets/styles/tokens.css](./src/assets/styles/tokens.css) | Couleurs, polices, arrondis                                                                              |
| `public/avatar2.png`                                           | Photo de profil (chemin réglé par `site.avatar`)                                                         |
| `public/og-card.svg` → `og-card.png`                           | Image d’aperçu lors du partage d’un lien (`site.ogImage`) ; après modification du SVG, régénérez le PNG : `node -e "require('sharp')('public/og-card.svg').png().toFile('public/og-card.png')"` |
| `public/favicon/`                                              | Icônes du site et `site.webmanifest`                                                                     |

Dans `src/site-config.ts`, les textes visibles s’écrivent une fois par langue : `{ fr: '…', en: '…' }`. **Un champ laissé vide (`''`, `[]`) est simplement masqué sur le site** : remplissez-le quand vous êtes prêt (liens GitHub / LinkedIn / e-mail, formation, etc.).

Couleurs : deux palettes, chacune en version claire et sombre, dans `src/assets/styles/tokens.css` :

- **abysse** (palette par défaut) : blocs `:root` (clair) et `.dark` (sombre). En plus des 8 couleurs de base, elle définit `--accent-vivid` (bleu-vert vif, décor uniquement, jamais en texte en mode clair), `--accent-fg` (texte sur fond `--accent` plein), `--accent-2` (pervenche) et `--glow` (lueur ambrée, jamais en texte). Tous les composants sont stylés avec ces couleurs : halo d’en-tête (`#ambient`), surlignage (`mark`) et sélection dans `global.css` / `tokens.css`, pastilles (`chip`, `tag-pill`), cartes (`paper-card`) et texte des articles (liens, listes, citations) dans `uno.config.ts`.
- **fresh** : blocs `.fresh` et `.fresh.dark`.

`site.palette` choisit la palette affichée aux nouveaux visiteurs (`'abysse'`) ; le bouton palette de l’en-tête (vagues / feuille) permet de basculer. Classes UnoCSS disponibles : `text-accent`, `text-accent-2`, `border-accent-vivid/60`, `bg-glow/35`, etc.

## Ajouter un article ou un projet

Chaque contenu existe dans un dossier par langue. **Un même nom de fichier dans `fr/` et `en/` relie les deux traductions** : le bouton FR / EN passe alors directement de l’une à l’autre.

```text
src/content/
├── blog/
│   ├── fr/hello-world.md      →  /fr/blog/hello-world
│   └── en/hello-world.md      →  /en/blog/hello-world
└── projects/
    ├── fr/project-alpha.md    →  /fr/projects/project-alpha
    └── en/project-alpha.md    →  /en/projects/project-alpha
```

Si une traduction manque, la page reste publiée dans sa langue et le bouton FR / EN mène à la liste (blog ou projets) de l’autre langue.

### Article de blog

```markdown
---
title: 'Titre de l’article' # 80 caractères max
description: 'Résumé affiché dans les listes et les aperçus' # 200 caractères max
publishDate: 2026-10-05
updatedDate: 2026-10-12 # facultatif
tags: [astro, notes]
heroImage: # facultatif, image locale relative à ce fichier
  src: ../../../assets/cover.png
  alt: 'Description de l’image'
draft: false # facultatif ; true = absent des listes mais accessible par son URL
comment: true # facultatif ; active les commentaires sous cet article
---

Le texte en Markdown.
```

### Projet

```markdown
---
title: 'Nom du projet'
description: 'Une ou deux phrases de présentation'
publishDate: 2026-10-05 # sert au tri, du plus récent au plus ancien
updatedDate: 2026-10-12 # facultatif
tags: [astro, typescript]
repo: 'https://github.com/…' # facultatif, lien vers le code source
demo: 'https://…' # facultatif, lien vers la démo / le site
heroImage: # facultatif, même format que pour le blog
  src: ../../../assets/projet.png
  alt: 'Capture d’écran'
draft: false # facultatif
---

Contexte, fonctionnalités, technologies, ce que j’ai appris…
```

Les contenus fournis (`hello-world`, `project-alpha`, `project-beta`) sont des exemples en lorem ipsum : supprimez-les ou remplacez-les.

## Langues

- Toutes les pages existent sous `/fr/…` et `/en/…` ; le français est la langue par défaut.
- Le bouton **FR / EN** de l’en-tête ouvre la même page dans l’autre langue et mémorise le choix dans le navigateur.
- La racine `/` redirige vers `/fr/` ou `/en/` : d’abord la langue mémorisée, sinon celle du navigateur, sinon le français.
- Chaque langue a son flux RSS : `/fr/rss.xml` et `/en/rss.xml`.

## Commentaires et compteur de vues (facultatif)

Les commentaires sous les articles et le compteur de vues utilisent [Waline](https://waline.js.org). Ils sont **désactivés tant que l’adresse du serveur est vide** :

- `comment.server` : commentaires sous les articles de blog
- `pageview.server` : nombre de vues affiché sur chaque article et chaque projet, et compteur global dans le pied de page si `pageview.siteWide` vaut `true`

Indiquez l’adresse de votre propre instance Waline (par exemple `https://waline.example.com/`) pour les activer.

## Déploiement

`pnpm build` produit un dossier `dist` statique, publiable sur GitHub Pages, Vercel, Netlify, Cloudflare Pages, etc.

L’adresse du site et le sous-chemin sont lus dans les variables d’environnement `SITE_URL` et `BASE_PATH` (voir [astro.config.ts](./astro.config.ts)) :

- `SITE_URL` : l’origine de production (ex. `https://mon-domaine.fr`), utilisée pour le sitemap, les URL canoniques, Open Graph et le RSS.
- `BASE_PATH` : uniquement si le site vit dans un sous-dossier (ex. `/mon-portfolio/`).

Pour GitHub Pages, le workflow fourni [.github/workflows/deploy.yml](./.github/workflows/deploy.yml) définit ces deux variables automatiquement à chaque push sur `main`, que le site soit un site de projet (`<user>.github.io/<repo>/`), un site utilisateur (`<user>.github.io`) ou sur un domaine personnalisé (activez Pages avec la source « GitHub Actions » dans les réglages du dépôt). Le workflow [build.yml](./.github/workflows/build.yml) vérifie que le site se construit sur chaque push et pull request.

## Crédits et licence

Basé sur le thème [astro-theme-ink](https://github.com/willimt/astro-theme-ink) de willimt, publié sous licence MIT. Le pipeline de blocs de code Shiki (`src/plugins/shiki-custom-transformers.ts`, `src/plugins/shiki-official`, `public/icons/code.svg`) provient de [astro-theme-pure](https://github.com/cworld1/astro-theme-pure) (Apache-2.0). Ce dépôt est distribué sous [licence MIT](./LICENSE).
