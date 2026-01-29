import fs from 'fs';
import path from 'path';

const devicesTs = fs.readFileSync('src/data/devices.ts', 'utf8');
const boardsTs = fs.readFileSync('src/data/boards.ts', 'utf8');

const entryRegex = /\{\s*id:\s*['"](.+?)['"].+?brand:\s*['"](.+?)['"].+?model:\s*['"](.+?)['"].+?image:\s*(null|['"].+?['"])/g;

function getMissingImages(content, type) {
    const missing = [];
    let match;
    while ((match = entryRegex.exec(content)) !== null) {
        const [_, id, brand, model, image] = match;
        if (image === 'null') {
            missing.push({ id, brand, model });
        }
    }
    return missing;
}

console.log('--- Objects without images ---\n');

const missingDevices = getMissingImages(devicesTs, 'Device');
console.log(`Devices (${missingDevices.length}):`);
missingDevices.forEach(d => console.log(` - [${d.brand}] ${d.model} (${d.id})`));

console.log('\n' + '='.repeat(30) + '\n');

const missingBoards = getMissingImages(boardsTs, 'Board');
console.log(`Boards (${missingBoards.length}):`);
missingBoards.forEach(b => console.log(` - [${b.brand}] ${b.model} (${b.id})`));

if (missingDevices.length === 0 && missingBoards.length === 0) {
    console.log('All objects have images!');
}
