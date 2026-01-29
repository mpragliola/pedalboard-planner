const fs = require('fs');
const path = require('path');

const devicesFilePath = path.join(__dirname, '..', 'src', 'data', 'devices.ts');
const publicDirPath = path.join(__dirname, '..', 'public');

const content = fs.readFileSync(devicesFilePath, 'utf-8');
const entryRegex = /image:\s*['"](.+?)['"]/g;

let match;
let total = 0;
let broken = 0;

console.log('--- Verifying Device Images ---');

while ((match = entryRegex.exec(content)) !== null) {
    const imagePath = match[1];
    const fullPath = path.join(publicDirPath, imagePath.replace(/\//g, path.sep));
    total++;
    
    if (!fs.existsSync(fullPath)) {
        console.log(`[BROKEN] ${imagePath}`);
        broken++;
    }
}

console.log(`\nTotal images checked: ${total}`);
console.log(`Broken links: ${broken}`);
