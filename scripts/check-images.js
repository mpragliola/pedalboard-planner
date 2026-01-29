import fs from 'fs';
import path from 'path';

// This is a simple node script to verify image paths
// Since I can't easily import the .ts files, I'll just regex them

const devicesTs = fs.readFileSync('src/data/devices.ts', 'utf8');
const boardsTs = fs.readFileSync('src/data/boards.ts', 'utf8');

const imageRegex = /image:\s*['"](.+?)['"]/g;
const paths = [];
let match;

while ((match = imageRegex.exec(devicesTs)) !== null) {
    if (match[1] !== 'null') paths.push(match[1]);
}
while ((match = imageRegex.exec(boardsTs)) !== null) {
    if (match[1] !== 'null') paths.push(match[1]);
}

console.log(`Checking ${paths.length} image paths...`);

const missing = [];
paths.forEach(p => {
    // Remove leading slash and construct absolute path
    // Note: React public folder maps to root /
    const fullPath = path.join(process.cwd(), 'public', p);

    // Handle the unicode escapes in the string
    const decodedPath = p.replace(/\\u([0-9a-fA-F]{4})/g, (match, grp) => {
        return String.fromCharCode(parseInt(grp, 16));
    });

    const absoluteDecodedPath = path.join(process.cwd(), 'public', decodedPath);

    if (!fs.existsSync(absoluteDecodedPath)) {
        missing.push(decodedPath);
    }
});

if (missing.length === 0) {
    console.log('All image paths are valid!');
} else {
    console.log('Missing images:');
    missing.forEach(m => console.log(` - ${m}`));
}

console.log('\nChecking for orphaned images...');
const allImages = [];
const walk = (dir) => {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if (file !== 'padded' && file !== '_') walk(fullPath);
        } else if (file.endsWith('.png') || file.endsWith('.webp') || file.endsWith('.jpg')) {
            const relPath = '/' + path.relative(path.join(process.cwd(), 'public'), fullPath).replace(/\\/g, '/');
            allImages.push(relPath);
        }
    });
};

walk(path.join(process.cwd(), 'public', 'images'));

const orphaned = allImages.filter(img => !paths.some(p => {
    const decodedP = p.replace(/\\u([0-9a-fA-F]{4})/g, (match, grp) => String.fromCharCode(parseInt(grp, 16)));
    return decodedP === img;
}));

console.log('\nChecking if _ directory is redundant...');
const underscoreDir = path.join(process.cwd(), 'public', 'images', 'devices', '_', 'cut');
if (fs.existsSync(underscoreDir)) {
    const uFiles = fs.readdirSync(underscoreDir);
    uFiles.forEach(f => {
        const brands = ['mxr', 'dunlop', 'amt', 'mission', 'evh'];
        let found = false;
        for (const b of brands) {
            if (fs.existsSync(path.join(process.cwd(), 'public', 'images', 'devices', b, f))) {
                found = true;
                break;
            }
        }
        if (!found) console.log(` - ${f} is ONLY in _ directory`);
    });
}


