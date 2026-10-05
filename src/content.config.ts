import { glob } from 'astro/loaders'
import { defineCollection } from 'astro:content'
import { z } from 'astro/zod'

/*
 * Content lives in one folder per language:
 *   src/content/blog/fr/my-post.md      →  /fr/blog/my-post
 *   src/content/blog/en/my-post.md      →  /en/blog/my-post
 *   src/content/projects/fr/my-app.md   →  /fr/projects/my-app
 * Give a translation the same file name in the other language folder so the
 * FR / EN toggle links the two versions together.
 */

function dedupeTags(tags: string[]) {
  const seen = new Set<string>()
  return tags
    .map((t) => t.trim().toLowerCase())
    .filter((t) => (t && !seen.has(t) ? (seen.add(t), true) : false))
}

const blog = defineCollection({
  loader: glob({ base: './src/content/blog', pattern: '{fr,en}/**/*.{md,mdx}' }),
  schema: ({ image }) =>
    z.object({
      /** Post title */
      title: z.string().max(80),
      /** Short summary shown in lists and meta description */
      description: z.string().max(200),
      publishDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      tags: z.array(z.string()).default([]).transform(dedupeTags),
      /** Optional cover image — a local asset referenced relative to this file,
       *  e.g. `src: ../../../assets/cover.png`. Optimized by the Astro image
       *  service (sharp) with responsive sizes. */
      heroImage: z
        .object({
          src: image(),
          alt: z.string().optional()
        })
        .optional(),
      /** Hidden from lists but still accessible by URL */
      draft: z.boolean().default(false),
      /** Per-post comment toggle */
      comment: z.boolean().default(true)
    })
})

const projects = defineCollection({
  loader: glob({ base: './src/content/projects', pattern: '{fr,en}/**/*.{md,mdx}' }),
  schema: ({ image }) =>
    z.object({
      /** Project name */
      title: z.string().max(80),
      /** One or two sentences shown in lists and meta description */
      description: z.string().max(200),
      /** Used to sort projects, newest first */
      publishDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      /** Technologies / topics, e.g. [astro, typescript] */
      tags: z.array(z.string()).default([]).transform(dedupeTags),
      /** Source code URL (GitHub, GitLab…) */
      repo: z.url().optional(),
      /** Live demo / website URL */
      demo: z.url().optional(),
      /** Optional cover image, same format as blog posts */
      heroImage: z
        .object({
          src: image(),
          alt: z.string().optional()
        })
        .optional(),
      /** Hidden from lists but still accessible by URL */
      draft: z.boolean().default(false)
    })
})

export const collections = { blog, projects }
