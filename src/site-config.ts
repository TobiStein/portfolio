/**
 * Site configuration — everything personal lives here.
 * Texts shown to visitors are written once per language: `{ fr: '…', en: '…' }`.
 * Fields left empty (`''`) are simply hidden on the site; fill them in when ready.
 */
import type { Localized } from '@/i18n'

export interface NavItem {
  title: Localized
  /** Path without the language prefix, e.g. `/blog` (the prefix is added automatically) */
  link: string
}

export interface EducationItem {
  /** School or university */
  school: string
  /** Field of study, e.g. `{ fr: 'Informatique', en: 'Computer science' }` */
  major?: Localized
  /** Degree, e.g. `{ fr: 'Master', en: "Master's degree" }` */
  degree?: Localized
  /** Period, e.g. `{ fr: 'sept. 2021 – juin 2024', en: 'Sep 2021 – Jun 2024' }` */
  date: Localized
}

export interface SkillGroup {
  title: Localized
  /** A plain string when it is the same in both languages ('Git'), otherwise `{ fr, en }` */
  items: (string | Localized)[]
}

export interface SocialLink {
  label: string
  /** Full URL (`https://…`, or `mailto:you@example.com` for e-mail). Empty = hidden. */
  url: string
}

export interface Config {
  /** Site identity */
  site: {
    /** Shown in the header and the browser tab */
    title: string
    /** Your name: home page hero, footer copyright, article metadata */
    author: string
    /** Meta description (search engines, link previews) */
    description: Localized
    favicon: string
    /** Avatar shown on the home page; a path under `public/` */
    avatar: string
    /** Open Graph image (link previews); a path under `public/` */
    ogImage: string
    /** Default theme for first-time visitors: 'light' | 'dark' | 'system' (follow OS) */
    theme: 'light' | 'dark' | 'system'
    /** Separator between page title and site title, e.g. " · " */
    titleDelimiter: string
  }
  header: {
    menu: NavItem[]
  }
  /** Page views — Waline server URL; leave empty to disable.
   *  The same server also powers the site-wide counter in the footer. */
  pageview: {
    server: string
    /** Site-wide total-visits counter in the footer */
    siteWide: boolean
  }
  footer: {
    /** Overrides the default `© <year> <author>` line */
    copyright?: string
    /** Show a link to the RSS feed of the current language */
    rss: boolean
    /** Extra links next to the copyright: external URLs or files under `public/` */
    links?: { title: Localized; url: string }[]
    /** Keys pick the icon: github, gitlab, linkedin, mail, x, instagram, rss, website */
    social?: Record<string, SocialLink>
  }
  blog: {
    pageSize: number
  }
  projects: {
    pageSize: number
  }
  home: {
    hero: {
      /** Short line under your name, e.g. "Développeur web / Designer" */
      tagline?: Localized
      /** Location label, e.g. "Paris, France" */
      location?: Localized
      /** Short home page introduction; falls back to the first paragraph of `about.bio` */
      summary?: Localized
    }
    /** How many recent projects to show (0 hides the section) */
    recentProjects: number
    /** How many recent posts to show (0 hides the section) */
    recentPosts: number
  }
  /** "About me" page */
  about: {
    /** Biography; separate paragraphs with an empty line */
    bio: Localized
    /** Education timeline; hidden when empty */
    education: EducationItem[]
    /** Skill groups; hidden when empty */
    skills: SkillGroup[]
  }
  /**
   * Waline comment system under blog posts. Leave `server` empty to disable.
   * See https://waline.js.org to deploy your own Waline instance.
   */
  comment: {
    provider: 'waline'
    server: string
  }
}

export const config: Config = {
  site: {
    title: 'Tobi Stein',
    author: 'Tobi Stein',
    description: {
      fr: 'Portfolio de Tobi Stein — projets, articles et parcours.',
      en: 'Tobi Stein’s portfolio — projects, writing and background.'
    },
    favicon: '/favicon/favicon.ico',
    avatar: '/avatar2.png',
    ogImage: '/og-card.png',
    theme: 'system',
    titleDelimiter: ' · '
  },

  header: {
    menu: [
      { title: { fr: 'Projets', en: 'Projects' }, link: '/projects' },
      { title: { fr: 'Blog', en: 'Blog' }, link: '/blog' },
      { title: { fr: 'À propos', en: 'About me' }, link: '/about' }
    ]
  },

  // Your own Waline server URL, e.g. 'https://waline.example.com/'
  pageview: {
    server: '',
    siteWide: true
  },

  footer: {
    // Replaces the default « © <year> <author> » line, e.g. '© 2024 – 2026 Tobi Stein'
    // copyright: '',
    rss: true,
    links: [],
    social: {
      github: { label: 'GitHub', url: '' },
      linkedin: { label: 'LinkedIn', url: '' },
      mail: { label: 'E-mail', url: '' }
    }
  },

  blog: {
    pageSize: 8
  },

  projects: {
    pageSize: 8
  },

  home: {
    hero: {
      tagline: {
        fr: 'Développeur / Créateur / Curieux',
        en: 'Developer / Maker / Curious mind'
      },
      location: { fr: 'France', en: 'France' }
    },
    recentProjects: 2,
    recentPosts: 3
  },

  about: {
    bio: {
      fr: 'Bonjour, je suis Tobi Stein. Ce paragraphe est un texte de démonstration : remplacez-le par quelques lignes sur votre parcours et ce qui vous motive.\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      en: 'Hi, I’m Tobi Stein. This paragraph is placeholder text: replace it with a few lines about your background and what drives you.\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
    },
    // Example:
    // { school: 'Université …', major: { fr: 'Informatique', en: 'Computer science' },
    //   degree: { fr: 'Master', en: "Master's degree" }, date: { fr: '2021 – 2024', en: '2021 – 2024' } }
    education: [],
    skills: [
      {
        title: { fr: 'Langages', en: 'Languages' },
        items: [
          { fr: 'Langage A', en: 'Language A' },
          { fr: 'Langage B', en: 'Language B' }
        ]
      },
      {
        title: { fr: 'Outils', en: 'Tools' },
        items: [
          { fr: 'Outil A', en: 'Tool A' },
          { fr: 'Outil B', en: 'Tool B' }
        ]
      }
    ]
  },

  comment: {
    provider: 'waline',
    server: ''
  }
}
