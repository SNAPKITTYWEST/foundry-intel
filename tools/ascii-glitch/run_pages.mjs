import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const passthroughArgs = process.argv.slice(2);
const candidates = [
  process.env.SWIPL,
  'swipl',
  'C:\\Program Files\\swipl\\bin\\swipl.exe',
  'C:\\Program Files (x86)\\swipl\\bin\\swipl.exe',
].filter(Boolean);

function canRun(candidate) {
  if (candidate.includes('\\') && !existsSync(candidate)) return false;
  const probe = spawnSync(candidate, ['--version'], {
    stdio: 'ignore',
    windowsHide: true,
  });
  return probe.status === 0;
}

const swipl = candidates.find(canRun);

if (!swipl) {
  console.error('Unable to find SWI-Prolog. Install it or set SWIPL to swipl.exe.');
  process.exit(1);
}

const args = [
  '-q',
  '-s',
  'tools/ascii-glitch/build_pages.pl',
  '-g',
  'main',
  '-t',
  'halt',
  '--',
  ...passthroughArgs,
];

const run = spawnSync(swipl, args, {
  stdio: 'inherit',
  windowsHide: true,
});

process.exit(run.status ?? 1);
