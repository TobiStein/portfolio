// One-off asset optimization: shrink the home-page avatar to a 256×256 WebP.
// Usage: `pnpm optimize:avatar [path/to/photo]` (default: public/avatar2.png)
import sharp from 'sharp'

const input = process.argv[2] ?? 'public/avatar2.png'
const output = 'public/avatar.webp'

await sharp(input).resize(256, 256, { fit: 'cover' }).webp({ quality: 82 }).toFile(output)

console.log(`${output} written from ${input} (256x256 webp)`)
console.log("Next: set site.avatar to '/avatar.webp' in src/site-config.ts")
