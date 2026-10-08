/**
 * Interface strings, one dictionary per language.
 * Add a key to `fr` first: TypeScript then requires the same key in `en`.
 * `{name}` placeholders are filled by `t(key, { name: value })`.
 * Keys ending in `.one` / `.other` are plural forms, read with `tn(key, count)`.
 */
const fr = {
  // Accessibility & chrome
  'a11y.skip': 'Aller au contenu',
  'nav.primary': 'Navigation principale',
  'header.theme': 'Changer de thème (système / clair / sombre)',
  'lang.switchTo': 'Version française',
  'backToTop': 'Retour en haut',

  // Home
  'home.moreAbout': 'En savoir plus',
  'home.projects': 'Projets récents',
  'home.allProjects': 'Tous les projets →',
  'home.posts': 'Articles récents',
  'home.allPosts': 'Tous les articles →',

  // Blog
  'blog.title': 'Blog',
  'blog.description': 'Articles, notes et réflexions.',
  'blog.count.one': '{count} article',
  'blog.count.other': '{count} articles',
  'blog.empty': 'Aucun article pour le moment.',
  'blog.back': 'Retour au blog',
  'blog.end': '— Fin de l’article. Merci pour votre lecture.',
  'blog.nav': 'Navigation entre les articles',

  // Projects
  'projects.title': 'Projets',
  'projects.description': 'Une sélection de projets sur lesquels j’ai travaillé.',
  'projects.count.one': '{count} projet',
  'projects.count.other': '{count} projets',
  'projects.empty': 'Aucun projet pour le moment.',
  'projects.back': 'Retour aux projets',
  'projects.end': '— Fin de la présentation du projet.',
  'projects.nav': 'Navigation entre les projets',
  'projects.repo': 'Code source',
  'projects.demo': 'Démo',

  // Shared entry bits (lists, article & project pages)
  'entry.readingTime': '{minutes} min de lecture',
  'entry.updated': 'Mis à jour le {date}',
  'entry.draft': 'Brouillon',
  'entry.previous': 'Précédent',
  'entry.next': 'Suivant',
  'entry.backToTop': 'Haut de page',
  'entry.tags': 'Mots-clés',
  'entry.typePost': 'Article',
  'entry.typeProject': 'Projet',
  'toc.title': 'Sommaire',
  'toc.mobile': 'Table des matières',
  'comments.title': 'Commentaires',
  'comments.reaction': 'J’aime',
  'comments.reactionTitle': 'Cet article vous a-t-il été utile ?',
  'comments.placeholder': 'Votre commentaire (e-mail facultatif, pour être averti des réponses)',

  // Pagination
  'pagination.label': 'Pagination',
  'pagination.page': 'page {page} sur {total}',
  'pagination.previous': 'Précédent',
  'pagination.next': 'Suivant',

  // Search
  'search.title': 'Recherche',
  'search.description': 'Rechercher parmi les projets et les articles.',
  'search.label': 'Rechercher un projet ou un article',
  'search.placeholder': 'Titre, mot-clé, technologie…',
  'search.tags': 'Filtrer par mot-clé',
  'search.results.one': '{count} résultat',
  'search.results.other': '{count} résultats',
  'search.empty': 'Aucun résultat. Essayez un autre mot ou retirez un filtre.',

  // About
  'about.title': 'À propos',
  'about.me': 'Qui suis-je ?',
  'about.experience': 'Expérience',
  'about.education': 'Formation',
  'about.skills': 'Compétences',
  'about.contact': 'Me contacter',
  'about.contactText': 'Vous pouvez me retrouver ici :',

  // Footer & counters
  'footer.social': 'Réseaux sociaux',
  'footer.links': 'Liens du pied de page',
  'footer.poweredBy': 'Propulsé par',
  'pageview.views': 'vues',
  'pageview.total': 'visites au total',
  'pageview.unavailable': 'Nombre de vues momentanément indisponible',
  'pageview.unavailableShort': 'indisponible',

  // Images (lightbox)
  'lightbox.dialog': 'Aperçu de l’image',
  'lightbox.close': 'Fermer l’aperçu',
  'lightbox.enlarge': 'Agrandir l’image',
  'lightbox.enlargeWith': 'Agrandir l’image : {caption}',
  'lightbox.unavailable': 'Image indisponible',
  'lightbox.unavailableWith': 'Image indisponible : {caption}',

  // Code blocks
  'code.copy': 'Copier le code',
  'code.toggle': 'Déplier / replier le bloc de code',

  // 404
  'notFound.title': 'Page introuvable',
  'notFound.text': 'Cette page n’existe pas ou a été déplacée.',
  'notFound.back': 'Retour à l’accueil'
} as const

export type UIKey = keyof typeof fr

const en: Record<UIKey, string> = {
  'a11y.skip': 'Skip to content',
  'nav.primary': 'Primary navigation',
  'header.theme': 'Toggle theme (system / light / dark)',
  'lang.switchTo': 'English version',
  'backToTop': 'Back to top',

  'home.moreAbout': 'More about me',
  'home.projects': 'Recent projects',
  'home.allProjects': 'All projects →',
  'home.posts': 'Recent posts',
  'home.allPosts': 'All posts →',

  'blog.title': 'Blog',
  'blog.description': 'Articles, notes and thoughts.',
  'blog.count.one': '{count} post',
  'blog.count.other': '{count} posts',
  'blog.empty': 'No posts yet.',
  'blog.back': 'Back to blog',
  'blog.end': '— End of article. Thanks for reading.',
  'blog.nav': 'Post navigation',

  'projects.title': 'Projects',
  'projects.description': 'A selection of projects I have worked on.',
  'projects.count.one': '{count} project',
  'projects.count.other': '{count} projects',
  'projects.empty': 'No projects yet.',
  'projects.back': 'Back to projects',
  'projects.end': '— End of project overview.',
  'projects.nav': 'Project navigation',
  'projects.repo': 'Source code',
  'projects.demo': 'Live demo',

  'entry.readingTime': '{minutes} min read',
  'entry.updated': 'Updated {date}',
  'entry.draft': 'Draft',
  'entry.previous': 'Previous',
  'entry.next': 'Next',
  'entry.backToTop': 'Back to top',
  'entry.tags': 'Tags',
  'entry.typePost': 'Post',
  'entry.typeProject': 'Project',
  'toc.title': 'Contents',
  'toc.mobile': 'Table of contents',
  'comments.title': 'Comments',
  'comments.reaction': 'Like(s)',
  'comments.reactionTitle': 'Was this post helpful?',
  'comments.placeholder': 'Leave a comment (email optional, to be notified of replies)',

  'pagination.label': 'Pagination',
  'pagination.page': 'page {page} of {total}',
  'pagination.previous': 'Previous',
  'pagination.next': 'Next',

  'search.title': 'Search',
  'search.description': 'Search projects and posts.',
  'search.label': 'Search projects and posts',
  'search.placeholder': 'Title, tag, technology…',
  'search.tags': 'Filter by tag',
  'search.results.one': '{count} result',
  'search.results.other': '{count} results',
  'search.empty': 'No results. Try another word or remove a filter.',

  'about.title': 'About me',
  'about.me': 'Who am I?',
  'about.experience': 'Experience',
  'about.education': 'Education',
  'about.skills': 'Skills',
  'about.contact': 'Get in touch',
  'about.contactText': 'You can find me here:',

  'footer.social': 'Social links',
  'footer.links': 'Footer links',
  'footer.poweredBy': 'Powered by',
  'pageview.views': 'views',
  'pageview.total': 'total visits',
  'pageview.unavailable': 'View count temporarily unavailable',
  'pageview.unavailableShort': 'unavailable',

  'lightbox.dialog': 'Image preview',
  'lightbox.close': 'Close image preview',
  'lightbox.enlarge': 'Enlarge image',
  'lightbox.enlargeWith': 'Enlarge image: {caption}',
  'lightbox.unavailable': 'Image unavailable',
  'lightbox.unavailableWith': 'Image unavailable: {caption}',

  'code.copy': 'Copy code',
  'code.toggle': 'Toggle collapse code block',

  'notFound.title': 'Page not found',
  'notFound.text': 'This page does not exist or has been moved.',
  'notFound.back': 'Back to home'
}

export const ui = { fr, en } as const
