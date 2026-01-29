import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const targetDir = path.join(process.cwd(), 'public', 'images', 'devices', '_');

if (!fs.existsSync(targetDir)) {
    console.error(`Directory not found: ${targetDir}`);
    process.exit(1);
}

const files = fs.readdirSync(targetDir);
const nonPngFiles = files.filter(f => {
    const ext = path.extname(f).toLowerCase();
    return ext !== '.png' && (ext === '.jpg' || ext === '.jpeg' || ext === '.webp');
});

if (nonPngFiles.length === 0) {
    console.log('No non-PNG files found to convert.');
    process.exit(0);
}

console.log(`Found ${nonPngFiles.length} files to convert in ${targetDir}...`);

nonPngFiles.forEach(file => {
    const inputPath = path.join(targetDir, file);
    const outputPath = path.join(targetDir, path.basename(file, path.extname(file)) + '.png');

    try {
        console.log(`Converting: ${file} -> ${path.basename(outputPath)}`);
        execSync(`magick "${inputPath}" "${outputPath}"`);
        fs.unlinkSync(inputPath);
    } catch (err) {
        console.error(`Failed to convert ${file}:`, err.message);
    }
});

console.log('\nConversion complete!');
