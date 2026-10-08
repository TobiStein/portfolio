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

export interface ExperienceItem {
  /** Job title, e.g. `{ fr: 'Développeuse front-end', en: 'Front-end developer' }` */
  role: Localized
  /** Company, lab or team */
  organization: string
  /** Period, e.g. `{ fr: 'nov. 2023 – janv. 2024', en: 'Nov 2023 – Jan 2024' }` */
  date: Localized
  /** What you did, in a few sentences */
  description?: Localized
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
    /** Work experience, most recent first; hidden when empty */
    experience: ExperienceItem[]
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
    title: 'Khalissa Rhoulam',
    author: 'Khalissa Rhoulam',
    description: {
      fr: 'Portfolio de Khalissa Rhoulam : intelligence artificielle, robotique et développement.',
      en: 'Khalissa Rhoulam’s portfolio: artificial intelligence, robotics and software development.'
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
    // Replaces the default « © <year> <author> » line, e.g. '© 2024 – 2026 Khalissa Rhoulam'
    // copyright: '',
    rss: true,
    links: [],
    social: {
      github: { label: 'GitHub', url: 'https://github.com/TobiStein' },
      // Full profile URL, e.g. 'https://www.linkedin.com/in/…'
      linkedin: { label: 'LinkedIn', url: '' },
      // 'mailto:…' — left empty on purpose (no personal contact details on the site)
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
        fr: 'Intelligence artificielle · Robotique · Développement',
        en: 'Artificial intelligence · Robotics · Development'
      },
      location: { fr: 'Lyon, France', en: 'Lyon, France' },
      summary: {
        fr: 'Formée en intelligence artificielle à l’Université Claude Bernard Lyon 1, je mêle algorithmes, modélisation 3D et électronique, avec un intérêt particulier pour l’apprentissage par renforcement.',
        en: 'Trained in artificial intelligence at Université Claude Bernard Lyon 1, I combine algorithms, 3D modelling and electronics, with a particular interest in reinforcement learning.'
      }
    },
    recentProjects: 2,
    recentPosts: 3
  },

  about: {
    bio: {
      fr: 'Je suis Khalissa Rhoulam, formée en intelligence artificielle à l’Université Claude Bernard Lyon 1 (licence et master), après un DUT informatique. Je cultive une approche pluridisciplinaire qui mêle algorithmes, modélisation 3D et électronique, avec un intérêt particulier pour l’apprentissage par renforcement.\n\nMes projets vont de l’IA embarquée dans des robots (un robot joueur de Puissance 4, une flotte de robots autonomes) à la vision par ordinateur et à la simulation biomécanique. J’accorde aussi une place importante à la documentation technique : cahiers des charges, spécifications, dossiers de conception.\n\nJe recherche un poste d’ingénieure d’études en informatique, et reste ouverte à toutes les opportunités.\n\nEn dehors de l’informatique, je conçois de petites pièces en 3D, je pratique la soudure (dernier projet en date : l’assemblage complet d’une radio) et je dessine régulièrement, du croquis à l’art numérique.',
      en: 'I’m Khalissa Rhoulam, trained in artificial intelligence at Université Claude Bernard Lyon 1 (bachelor’s and master’s degrees), after a two-year technical degree in computer science. I take a multidisciplinary approach that combines algorithms, 3D modelling and electronics, with a particular interest in reinforcement learning.\n\nMy projects range from AI running on robots (a robot that plays Connect Four, a fleet of autonomous robots) to computer vision and biomechanical simulation. I also put a lot of care into technical documentation: requirements, specifications, design documents.\n\nI am looking for a position as a research engineer in computer science, and remain open to all opportunities.\n\nOutside computing, I design small 3D parts, solder (most recent project: assembling a radio from scratch) and draw regularly, from sketches to digital art.'
    },
    experience: [
      {
        role: { fr: 'Développeuse front-end', en: 'Front-end developer' },
        organization: 'Équipe GRADIENT, laboratoire LIRIS (Villeurbanne)',
        date: { fr: 'nov. 2023 – janv. 2024', en: 'Nov 2023 – Jan 2024' },
        description: {
          fr: 'Création du site vitrine du projet GRADIENT, en totale autonomie. Face à un besoin initial peu défini, j’ai conçu et fait évoluer plusieurs maquettes sur Figma pour structurer les attentes et valider l’identité visuelle, puis assuré l’intégration responsive (HTML5, CSS3, Bootstrap) dans des délais serrés.',
          en: 'Built the showcase website of the GRADIENT project, fully autonomously. Starting from loosely defined needs, I designed and iterated on several Figma mock-ups to structure expectations and validate the visual identity, then delivered the responsive integration (HTML5, CSS3, Bootstrap) on a tight schedule.'
        }
      }
    ],
    education: [
      {
        school: 'Université Claude Bernard Lyon 1',
        major: {
          fr: 'Informatique, parcours intelligence artificielle',
          en: 'Computer science, artificial intelligence track'
        },
        degree: { fr: 'Licence et master', en: 'Bachelor’s and master’s degrees' },
        date: { fr: '2023 – 2026', en: '2023 – 2026' }
      },
      {
        school: 'IUT Lyon 1',
        major: { fr: 'Informatique', en: 'Computer science' },
        degree: { fr: 'DUT', en: 'Two-year technical degree (DUT)' },
        date: { fr: '2020 – 2023', en: '2020 – 2023' }
      },
      {
        school: 'Faculté de médecine Lyon Est (Lyon 1)',
        major: {
          fr: 'Première année commune aux études de santé',
          en: 'First year of health studies'
        },
        degree: { fr: 'PACES', en: 'PACES' },
        date: { fr: '2018 – 2020', en: '2018 – 2020' }
      }
    ],
    skills: [
      {
        title: { fr: 'IA & robotique', en: 'AI & robotics' },
        items: [
          'Python',
          'PyTorch',
          { fr: 'Apprentissage par renforcement (Gym)', en: 'Reinforcement learning (Gym)' },
          { fr: 'Vision par ordinateur (MediaPipe)', en: 'Computer vision (MediaPipe)' },
          'ROS',
          'C++',
          'Arduino',
          { fr: 'Électronique', en: 'Electronics' },
          { fr: 'Modélisation 3D (Blender, CAO avec Onshape)', en: '3D modelling (Blender, CAD with Onshape)' }
        ]
      },
      {
        title: { fr: 'Développement', en: 'Development' },
        items: ['Java', 'JavaScript', 'HTML / CSS', 'Bootstrap', 'Figma']
      },
      {
        title: { fr: 'Méthodes', en: 'Methods' },
        items: [
          { fr: 'Gestion de projet (Agile)', en: 'Project management (Agile)' },
          {
            fr: 'Documentation technique (Vision & Scope, spécifications)',
            en: 'Technical documentation (Vision & Scope, specifications)'
          },
          { fr: 'Travail en équipe', en: 'Teamwork' }
        ]
      },
      {
        title: { fr: 'Langues', en: 'Languages' },
        items: [
          { fr: 'Français', en: 'French' },
          { fr: 'Anglais (TOEIC 975/990)', en: 'English (TOEIC 975/990)' }
        ]
      }
    ]
  },

  comment: {
    provider: 'waline',
    server: ''
  }
}
