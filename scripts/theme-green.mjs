import { readdirSync, statSync, readFileSync, writeFileSync } from 'fs';
import { join, extname } from 'path';

const ROOT = 'C:/Projects/nxty-fightwear';

// File yang TIDAK boleh diubah (admin pakai warna sendiri, globals.css sudah dihandle manual)
const SKIP = [
  'globals.css',
  'theme-green.mjs',
  'node_modules',
  '.next',
  '.git',
  'app/admin',
];

// Pasangan penggantian — urutan penting (yang lebih spesifik dulu)
const REPLACEMENTS = [
  // Brand red → brand green (CTA, active state)
  // Pengecualian: jangan ubah brand-red yang memang untuk badge diskon/urgency/error
  [/\bbg-brand-red-hover\b/g, 'bg-brand-green-hover'],
  [/\bhover:bg-brand-red-hover\b/g, 'hover:bg-brand-green-hover'],
  [/\bbg-brand-red\b/g, 'bg-brand-green'],
  [/\bhover:bg-brand-red\b/g, 'hover:bg-brand-green'],
  [/\btext-brand-red\b/g, 'text-brand-green'],
  [/\bhover:text-brand-red\b/g, 'hover:text-brand-green'],
  [/\bborder-brand-red\b/g, 'border-brand-green'],
  [/\bhover:border-brand-red\b/g, 'hover:border-brand-green'],
  [/\bfocus:border-brand-red\b/g, 'focus:border-brand-green'],
  [/\bring-brand-red\b/g, 'ring-brand-green'],
  [/\bfocus-visible:ring-brand-red\b/g, 'focus-visible:ring-brand-green'],
  // Hardcode hex merah untuk CTA → hijau
  [/\bbg-\[#dc2626\]/g, 'bg-brand-green'],
  [/\bbg-\[#b91c1c\]/g, 'bg-brand-green-hover'],
  [/\btext-\[#dc2626\]/g, 'text-brand-green'],
  [/\bhover:bg-\[#dc2626\]/g, 'hover:bg-brand-green'],
  [/\bhover:text-\[#dc2626\]/g, 'hover:text-brand-green'],
  [/\bborder-\[#dc2626\]/g, 'border-brand-green'],
  [/\bhover:border-\[#dc2626\]/g, 'hover:border-brand-green'],
  // Dark background → light
  [/\bbg-\[#0a0a0a\]/g, 'bg-canvas'],
  [/\bbg-\[#161616\]/g, 'bg-surface-1'],
  [/\bbg-\[#1f1f1f\]/g, 'bg-surface-2'],
  [/\bbg-\[#262626\]/g, 'bg-surface-2'],
  // Dark text → dark on light
  [/\btext-white\b(?!.*aria)/g, 'text-text-primary'],
  [/\btext-neutral-400\b/g, 'text-text-muted'],
  // Dark border
  [/\bborder-\[#262626\]/g, 'border-border-subtle'],
];

// File yang sudah dihandle manual — skip
const MANUAL_FILES = [
  'components/ui/Button.tsx',
  'components/navigation/TopHeader.tsx',
  'components/navigation/BottomNav.tsx',
  'components/CategoryPills.tsx',
  'components/Footer.tsx',
  'components/BrandIntroSection.tsx',
  'app/tentang-kami/page.tsx',
  'app/page.tsx',
  'app/layout.tsx',
];

function shouldSkip(filePath) {
  const normalized = filePath.replace(/\\/g, '/');
  return SKIP.some(s => normalized.includes(s)) || MANUAL_FILES.some(s => normalized.endsWith(s));
}

function walk(dir) {
  const entries = readdirSync(dir);
  for (const entry of entries) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      if (!SKIP.some(s => full.replace(/\\/g, '/').includes(s))) walk(full);
    } else if (extname(entry) === '.tsx' || extname(entry) === '.ts') {
      if (!shouldSkip(full)) processFile(full);
    }
  }
}

function processFile(filePath) {
  let content = readFileSync(filePath, 'utf8');
  let changed = false;
  for (const [from, to] of REPLACEMENTS) {
    const newContent = content.replace(from, to);
    if (newContent !== content) { changed = true; content = newContent; }
  }
  if (changed) {
    writeFileSync(filePath, content, 'utf8');
    console.log('✅', filePath.replace(ROOT + '/', ''));
  }
}

console.log('🎨 Applying green theme...\n');
walk(join(ROOT, 'app'));
walk(join(ROOT, 'components'));
console.log('\n✨ Done!');
