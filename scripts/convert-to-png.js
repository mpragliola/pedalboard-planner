#!/usr/bin/env node
/**
 * Convert non-PNG images (JPG, JPEG, WEBP) in public/images/devices/_ to PNG format.
 * Uses ImageMagick (magick). Replaces original files with converted PNGs.
 *
 * Run: node scripts/convert-to-png.js
 * Requires: ImageMagick in PATH
 */

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
    console.log('Converted 0 files');
    process.exit(0);
}

let converted = 0;
for (const file of nonPngFiles) {
    const inputPath = path.join(targetDir, file);
    const outputPath = path.join(targetDir, path.basename(file, path.extname(file)) + '.png');
    try {
        execSync(`magick "${inputPath}" "${outputPath}"`);
        fs.unlinkSync(inputPath);
        converted++;
    } catch (err) {
        // silent
    }
}
console.log(`Converted ${converted} files`);
