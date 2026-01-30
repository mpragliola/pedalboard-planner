/**
 * Lists all image files under public/images/devices/ that are not
 * referenced by any device in src/data/devices.ts.
 *
 * Run: node scripts/list-unlinked-images.cjs
 */

const fs = require('fs')
const path = require('path')

const devicesTsPath = path.join(__dirname, '..', 'src', 'data', 'devices.ts')
const devicesImagesDir = path.join(__dirname, '..', 'public', 'images', 'devices')

const IMAGE_EXT = new Set(['.png', '.jpg', '.jpeg', '.webp', '.avif'])

// Extract all image: '...' paths from devices.ts
const devicesTs = fs.readFileSync(devicesTsPath, 'utf8')
const linked = new Set()
const re = /image:\s*['"]([^'"]+)['"]/g
let m
while ((m = re.exec(devicesTs)) !== null) {
  linked.add(m[1].replace(/\\/g, '/'))
}

// Recursively list image files under dir, returning paths relative to baseDir
function listImages(dir, baseDir, acc = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const e of entries) {
    const full = path.join(dir, e.name)
    const rel = path.relative(baseDir, full).replace(/\\/g, '/')
    if (e.isDirectory()) {
      listImages(full, baseDir, acc)
    } else if (IMAGE_EXT.has(path.extname(e.name).toLowerCase())) {
      acc.push(rel)
    }
  }
  return acc
}

const allImages = listImages(devicesImagesDir, devicesImagesDir)
const unlinked = allImages.filter((rel) => !linked.has(rel)).sort()

console.log('Unlinked images (not referenced in src/data/devices.ts):\n')
if (unlinked.length === 0) {
  console.log('(none)')
} else {
  unlinked.forEach((p) => console.log(p))
}
console.log(`\nTotal: ${unlinked.length} unlinked of ${allImages.length} images`)
