# Khalissa Rhoulam — portfolio

Portfolio bilingue (français / anglais) de Khalissa Rhoulam, construit avec [Astro](https://astro.build) et [UnoCSS](https://unocss.dev). Trois rubriques : **Projets**, **Blog** et **À propos**, chacune disponible en `/fr/` et en `/en/`.

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
| [src/assets/styles/tokens.css](./src/assets/styles/tokens.css) | Palettes fire et abyss (clair et sombre), échelle de chaleur, couleurs du code, polices, arrondis : **le seul fichier où s’écrivent couleurs et polices** |
| [src/scripts/thermal/](./src/scripts/thermal/)                 | Fond ASCII animé : papillon, chaleur du pointeur, balayage d’ouverture                                   |
| `public/avatar2.png`                                           | Photo de profil (chemin réglé par `site.avatar`), en haut de la page À propos : vue « en caméra thermique », ses vraies couleurs au survol |
| `public/og-card.png`                                          | Image d’aperçu lors du partage d’un lien (`site.ogImage`, 1200 × 630) : une capture de l’accueil en thème sombre, sans l’en-tête ni les sections |
| `public/favicon/`                                              | Icônes du site (le manifeste `/favicon/site.webmanifest` est généré par `src/pages/favicon/site.webmanifest.ts`, avec la couleur de page de `tokens.css`) |

Dans `src/site-config.ts`, les textes visibles s’écrivent une fois par langue : `{ fr: '…', en: '…' }`. **Un champ laissé vide (`''`, `[]`) est simplement masqué sur le site** : remplissez-le quand vous êtes prêt (liens GitHub / LinkedIn / e-mail, formation, etc.).

Couleurs : deux palettes, chacune en version claire et sombre, définies dans `src/assets/styles/tokens.css`. **C’est le seul fichier où s’écrivent des couleurs et des polices** : le reste du site (composants, blocs de code, fond ASCII, photo, impression, barre du navigateur) les lit avec `var(--…)`, et `pnpm test` signale toute couleur ou police écrite en dur ailleurs.

- **fire** (par défaut) : le site vu à travers une caméra thermique ; plus un élément est chaud, plus il attire l’œil. Version claire **givre** (blanc et bleu pâle, indigo, rose pour l’accent seulement) et version sombre **braise** (aucune couleur froide : nuit rouge-noir, pêche, or pour l’accent). Règle **70:20:10** : 70 % pour le fond et le froid, 20 % pour la couleur secondaire `--accent-2` (accroche, mots-clés, dates, liens), 10 % pour l’accent `--accent` (boutons d’action, survol, section courante). Ses règles sont dans la charte « Palette Fire ».
- **abyss** : la palette des grands fonds de la version précédente du site, aux valeurs de la charte « Palette Abysse » : le bleu-vert d’abord, la pervenche en écho, une seule étincelle ambrée. Son échelle de chaleur et ses couleurs de code sont des mélanges de ses propres couleurs (`color-mix()`), sans nouvelle teinte.

Dans l’en-tête, le bouton flamme / vagues change de palette et le bouton écran / soleil / lune alterne système / clair / sombre ; les deux choix sont mémorisés dans le navigateur. `site.palette` et `site.theme` (`src/site-config.ts`) fixent ceux d’un premier visiteur.

Chaque palette définit les mêmes variables : les couleurs de base (`--paper`, `--ink`, `--accent`, `--accent-2`, `--accent-vivid` pour le décor uniquement, `--accent-fg` pour le texte sur un fond `--accent` plein, `--glow` pour la sélection et le surlignage, `--overlay` pour la visionneuse d’images…), l’**échelle de chaleur** `--thermal-0` (le plus froid) → `--thermal-10` (le plus chaud), qui colore le fond ASCII, la barre de progression de lecture, les diagrammes Mermaid et la photo de la page À propos, et les couleurs du code `--code-*` (le thème Shiki `src/plugins/shiki-palette-theme.ts` n’est fait que de ces variables). Les composants ne choisissent pas eux-mêmes une couleur de la palette : ils utilisent des **rôles** que chaque palette relie à ses couleurs (`--secondary` pour les mots-clés, `--meta` pour l’accroche et les dates, `--decor` pour les lueurs et les puces, `--hover-ink`, `--link-underline`, `--selection`, `--quote-rule`, `--code-highlight`, `--diagram-border` et `--diagram-line` pour les diagrammes). C’est ce qui permet aux mots-clés d’être indigo dans fire et bleu-vert dans abyss. Classes UnoCSS disponibles : `text-accent`, `text-secondary`, `text-meta`, `border-decor/50`, `bg-glow/35`, `font-display`, `btn-hot`, etc.

`pnpm test` vérifie aussi les contrastes de chaque palette, en clair et en sombre (4,5:1 pour tous les textes, couleurs du code comprises) : un token qui rendrait un texte illisible fait échouer les tests.

Ajouter une palette : copier les deux blocs d’abyss dans `tokens.css` sous un nouveau nom (`[data-palette='nom']` avec toutes les variables, `[data-palette='nom'].dark` avec ce qui change en sombre), puis ajouter ce nom à `PALETTES` et `PALETTE_SELECTORS` (`src/utils/theme.ts`), à la liste `palettes` de `src/scripts/theme.js` et une icône dans `src/components/Header.astro`. Les tests vérifient que toutes les palettes définissent les mêmes variables, et leurs contrastes.

Polices : **Geist Pixel** (nom, titres de page et de section, années : une police pixel fine, comme l’affichage d’une caméra thermique), **Mona Sans** (texte et titres longs) et **Monaspace Neon** (fond ASCII, code), hébergées avec le site via Fontsource : aucune requête vers un service tiers. Elles sont déclarées dans `tokens.css` (`--font-display`, `--font-sans`, `--font-mono`), que lisent aussi le fond ASCII et les diagrammes Mermaid. Pour changer de police, il suffit de modifier la variable et l’import correspondant dans `src/layouts/BaseLayout.astro`.

Paragraphes : ils sont justifiés, avec césure automatique dans la langue de la page pour garder un espacement régulier entre les mots. La règle se trouve dans `uno.config.ts` (`.prose p` : articles, projets et texte de la page À propos) et dans la classe `text-justified` de `global.css` (accroche de l’accueil, descriptions des listes, description de l’expérience).

Fond ASCII : `src/components/ThermalField.astro` (un canevas fixe derrière la page) et `src/scripts/thermal/` (le moteur). Un papillon procédural est dessiné en caractères ASCII et coloré selon sa température : le thorax est le plus chaud, les ailes refroidissent vers leurs pointes. Le pointeur réchauffe le champ, le papillon s’écarte quand on l’approche, un clic libère une gerbe d’étincelles, et la première page de la visite s’ouvre sur un balayage de capteur. Attributs utilisables dans les pages :

- `data-butterfly` : la boîte (taille et position fixées en CSS) où dessiner le papillon ;
- `data-thermal-shield` : refroidit le fond derrière un bloc de texte pour garder la lecture confortable (`data-thermal-shield="fixed"` pour un élément collant ou fixe, comme la barre de navigation) ;
- `data-reveal` : bloc dévoilé par le balayage d’ouverture.

Avec « réduire les animations » activé dans le système, le fond reste une image fixe.

En thème sombre, chaque température a directement sa couleur sur l’échelle. En thème clair, où les couleurs de l’échelle sont plus nombreuses à se distinguer, le moteur fait comme le gain automatique d’une caméra thermique (`src/scripts/thermal/tone.ts`) : le papillon s’étale sur toute l’échelle, chaque couleur en recevant à peu près la même part, et sa bordure suit le dégradé des ailes au lieu d’être d’une seule couleur ; le cœur des traînées de chaleur monte jusqu’à l’avant-dernière couleur (le rose de fire), leurs bords et le fond gardent les leurs. La palette elle-même ne change pas.

Recherche : l’icône loupe de l’en-tête mène à `/fr/search/` (ou `/en/search/`). Elle cherche dans les projets et les articles de la langue courante (titre, mots-clés, description puis texte complet, sans tenir compte des accents) et propose un filtre par mot-clé (plusieurs mots-clés = contenus qui les ont tous). L’adresse garde la recherche, par exemple `/fr/search/?tag=astro`, pour la partager.

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

Basé sur le thème [astro-theme-ink](https://github.com/willimt/astro-theme-ink) de willimt, publié sous licence MIT. Le pipeline de blocs de code Shiki (`src/plugins/shiki-custom-transformers.ts`, `src/plugins/shiki-official`, `public/icons/code.svg`) provient de [astro-theme-pure](https://github.com/cworld1/astro-theme-pure) (Apache-2.0). Polices Geist Pixel (Vercel), Mona Sans et Monaspace Neon (GitHub), sous licence SIL Open Font License 1.1. Ce dépôt est distribué sous [licence MIT](./LICENSE).
