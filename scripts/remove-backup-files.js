import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const imagesDir = path.join(__dirname, '..', 'public', 'images');

function removeBackupFiles(dir) {
  let removed = 0;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      removed += removeBackupFiles(fullPath);
    } else if (entry.name.endsWith('~')) {
      fs.unlinkSync(fullPath);
      console.log('Removed:', path.relative(imagesDir, fullPath));
      removed++;
    }
  }
  return removed;
}

if (!fs.existsSync(imagesDir)) {
  console.error('Images folder not found:', imagesDir);
  process.exit(1);
}

const count = removeBackupFiles(imagesDir);
console.log(`\nRemoved ${count} backup file(s).`);
