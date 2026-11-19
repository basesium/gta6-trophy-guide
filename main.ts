// Leonida Platinum — the entry program for gta6-trophy-guide-01.
// Copies app/ and screenshots/ from this repository to the output
// directory (MAKEFUN_OUTPUT_DIR outside the grader, /output inside it)
// and writes /output/dossier.json with buildDossier from the kit's
// vendored library. Node 22, standard library only, deterministic:
// the same repository always writes the same bytes.

import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)));
const OUT_DIR = process.env.MAKEFUN_OUTPUT_DIR || '/output';

const DOSSIER_CAPS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
  app_path_max_bytes: 1000,
};

function copyEntryTree(name: string): void {
  const source = join(REPO_ROOT, name);
  const target = join(OUT_DIR, name);
  if (!existsSync(source)) throw new Error('main.ts: missing ' + name + '/ in the repository');
  rmSync(target, { recursive: true, force: true });
  cpSync(source, target, { recursive: true });
}

mkdirSync(OUT_DIR, { recursive: true });
copyEntryTree('app');
copyEntryTree('screenshots');

const dossier = buildDossier(OUT_DIR, DOSSIER_CAPS);
writeFileSync(join(OUT_DIR, 'dossier.json'), dossier);
console.log('main.ts: wrote dossier.json (' + dossier.length + ' bytes) to ' + OUT_DIR);
