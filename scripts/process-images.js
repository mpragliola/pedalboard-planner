import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const targetDir = path.join(process.cwd(), 'public', 'images', 'devices', '_');
const outputDir = path.join(targetDir, 'processed');
const isDryRun = process.argv.includes('--dry-run');

if (!fs.existsSync(targetDir)) {
    console.error(`Directory not found: ${targetDir}`);
    process.exit(1);
}

if (!isDryRun && !fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

function runCmd(command) {
    if (isDryRun) {
        console.log(`[DRY RUN] Executing: ${command}`);
        return "";
    }
    try {
        return execSync(command, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
    } catch (err) {
        console.error(`Error executing command: ${command}`);
        console.error(err.stderr || err.message);
        return null;
    }
}

console.log(`--- Image Processing Script (Output to: ${outputDir}) ---`);
if (isDryRun) console.log(`*** DRY RUN MODE ENABLED ***\n`);

const files = fs.readdirSync(targetDir);

// PHASE 1: Prepare PNGs in the output directory
console.log(`PHASE 1: Preparing PNG files in processed directory...`);
files.forEach(file => {
    const ext = path.extname(file).toLowerCase();
    const inputPath = path.join(targetDir, file);
    if (fs.statSync(inputPath).isDirectory()) return;

    const baseName = path.basename(file, ext);
    const outputPath = path.join(outputDir, baseName + '.png');

    if (ext === '.png') {
        console.log(` - Copying PNG: ${file}`);
        if (!isDryRun) fs.copyFileSync(inputPath, outputPath);
    } else if (['.jpg', '.jpeg', '.webp'].includes(ext)) {
        console.log(` - Converting to PNG: ${file}`);
        runCmd(`magick "${inputPath}" "${outputPath}"`);
    }
});

if (!isDryRun && fs.readdirSync(outputDir).length === 0) {
    console.log('No files found to process.');
    process.exit(0);
}

// PHASE 2: Cropping and Background Removal
console.log(`\nPHASE 2: Processing PNGs in ${outputDir}...`);
const processedFiles = isDryRun ? files.map(f => path.basename(f, path.extname(f)) + '.png') : fs.readdirSync(outputDir);

processedFiles.forEach(file => {
    const filePath = path.join(outputDir, file);
    if (!isDryRun && !fs.existsSync(filePath)) return;

    // Check for alpha channel
    const channels = runCmd(`magick identify -format "%[channels]" "${filePath}"`);
    const hasAlpha = channels && channels.includes('a');

    if (hasAlpha) {
        console.log(` - [ALPHA] ${file}: Trimming transparent borders (with fuzz)...`);
        runCmd(`magick "${filePath}" -fuzz 20% -trim +repage "${filePath}"`);
    } else {
        console.log(` - [NO ALPHA] ${file}: Adding border, removing background, and trimming...`);

        // 1. Add white border
        const borderedPath = path.join(outputDir, `temp_bordered_${file}`);
        runCmd(`magick "${filePath}" -bordercolor white -border 100x100 "${borderedPath}"`);

        // 2. Remove background with rembg
        const noBgPath = path.join(outputDir, `temp_nobg_${file}`);
        console.log(`   * Removing background with rembg...`);
        const rembgResult = runCmd(`py -3.11 -m rembg i "${borderedPath}" "${noBgPath}"`);

        if (rembgResult !== null || isDryRun) {
            // 3. Trim and replace processed original
            console.log(`   * Trimming resulting image (with fuzz)...`);
            runCmd(`magick "${noBgPath}" -fuzz 20% -trim +repage "${filePath}"`);
        }

        // Cleanup temp files
        if (!isDryRun) {
            if (fs.existsSync(borderedPath)) fs.unlinkSync(borderedPath);
            if (fs.existsSync(noBgPath)) fs.unlinkSync(noBgPath);
        }
    }
});

console.log(`\nProcessing Complete! Results are in: ${outputDir}`);
if (isDryRun) console.log(`*** DRY RUN MODE: No files were actually created or modified. ***`);
