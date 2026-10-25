import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const iconsDir = path.resolve(__dirname, '..', 'src-tauri', 'icons');

if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Minimal valid 1x1 transparent PNG buffer
const minimalPng = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64'
);

const files = [
  '32x32.png',
  '128x128.png',
  '128x128@2x.png',
  'icon.png',
  'icon.ico',
  'icon.icns'
];

for (const file of files) {
  const filePath = path.join(iconsDir, file);
  fs.writeFileSync(filePath, minimalPng);
  console.log(`✓ Icon created: ${filePath}`);
}

console.log('Icons setup complete.');
