/**
 * Genera los iconos de la PWA a partir de art/icon-source.png.
 * Uso: npm run icons
 */
import { mkdir, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import sharp from 'sharp'

const SRC = 'art/icon-source.png'
const OUT = 'public/icons'

await mkdir(OUT, { recursive: true })
// Los intermedios van a /tmp: en el repo solo se versiona art/icon-source.png
const base = join(tmpdir(), 'arsbot-icon-base.png')
await sharp(SRC).resize(1024, 1024, { fit: 'cover' }).png().toFile(base)
await sharp(base).resize(192, 192).png().toFile(`${OUT}/icon-192.png`)
await sharp(base).resize(512, 512).png().toFile(`${OUT}/icon-512.png`)
await sharp(base).resize(180, 180).png().toFile(`${OUT}/apple-touch-icon.png`)

// Icono "maskable": el dibujo ocupa el 80% central sobre fondo sólido
const inner = join(tmpdir(), 'arsbot-icon-inner.png')
await sharp(base).resize(410, 410).png().toFile(inner)
await sharp({ create: { width: 512, height: 512, channels: 3, background: '#191919' } })
  .composite([{ input: inner, top: 51, left: 51 }])
  .png()
  .toFile(`${OUT}/maskable-512.png`)
await rm(inner, { force: true })

await sharp(base).resize(64, 64).png().toFile('public/favicon.png')
await rm(base, { force: true })

console.log('✔ Iconos generados en', OUT)
