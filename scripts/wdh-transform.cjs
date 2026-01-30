const fs = require('fs')

function transform(path) {
  let s = fs.readFileSync(path, 'utf8')
  s = s.replace(
    /width: (\d+(?:\.\d+)?), depth: (\d+(?:\.\d+)?), height: (\d+(?:\.\d+)?)/g,
    (_, w, d, h) => `wdh: [${w}, ${d}, ${h}]`
  )
  fs.writeFileSync(path, s)
}

transform('src/data/boards.ts')
transform('src/data/devices.ts')
console.log('done')
