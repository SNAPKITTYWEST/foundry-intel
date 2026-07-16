#!/usr/bin/env node
import { appendFileSync, existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { evaluatePhaseMirrorCommitGate } from './formal/phase_mirror_commit_gate.mjs'
import { evaluatePhaseMirrorForceInvoke } from './formal/phase_mirror_force_invoke.mjs'

const root = process.cwd()

function fail(message) {
  console.error(`ADR production tick failed: ${message}`)
  process.exit(1)
}

function readJson(path) {
  try {
    return JSON.parse(readFileSync(join(root, path), 'utf8'))
  } catch (error) {
    fail(`${path}: ${error.message}`)
  }
}

function requireFile(path) {
  if (!existsSync(join(root, path))) fail(`missing ${path}`)
}

for (const path of [
  'docs/architecture/adr/ADR-301-daily-production-tick.md',
  '.github/workflows/veneer-verify.yml',
  'tools/foundry-connector/connector-manifest.json',
  'tools/formal/phase_mirror_commit_gate.mjs',
  'tools/formal/phase_mirror_force_invoke.mjs',
  'docs/protocols/phase-mirror-force-invoke.trap',
  'tools/q5-adr-parser/adr_manifest.json',
  'package-lock.json'
]) {
  requireFile(path)
}

const q5 = readJson('tools/q5-adr-parser/adr_manifest.json')
const connector = readJson('tools/foundry-connector/connector-manifest.json')
const pkg = readJson('package.json')

if (q5.q5_total !== '8 + 3*phi') fail(`unexpected Q(phi) total ${q5.q5_total}`)
if (connector.status !== 'CONNECTED') fail(`connector status is ${connector.status}`)
if (!pkg.scripts?.verify?.includes('adr:tick')) fail('verify script must include adr:tick')
if (!pkg.scripts?.verify?.includes('phase-mirror:gate')) fail('verify script must include phase-mirror:gate')

const phaseMirrorGate = evaluatePhaseMirrorCommitGate({ root })
if (phaseMirrorGate.violations.length > 0) {
  fail(`Phase Mirror commit gate violations: ${phaseMirrorGate.violations.join('; ')}`)
}
const phaseMirrorForceInvoke = evaluatePhaseMirrorForceInvoke({ root })
if (phaseMirrorForceInvoke.violations.length > 0) {
  fail(`Phase Mirror force invoke violations: ${phaseMirrorForceInvoke.violations.join('; ')}`)
}

const statusMap = new Map(q5.records.map((record) => [record.id, record.status]))
if (statusMap.get('ADR-055') !== 'OPEN_CRUX') fail('ADR-055 must remain OPEN_CRUX')
if (statusMap.get('ADR-062') !== 'SILENCE_PENDING') fail('ADR-062 must remain SILENCE_PENDING')

const sha = process.env.GITHUB_SHA ?? 'local'
const runId = process.env.GITHUB_RUN_ID ?? 'local'
const summary = [
  '# ADR-301 Production Tick',
  '',
  '| Field | Value |',
  '|---|---|',
  '| Tick time | `07:16 UTC daily` |',
  '| Mode | `non-mutating verify` |',
  `| Commit | \`${sha}\` |`,
  `| Run | \`${runId}\` |`,
  `| Connector | \`${connector.status}\` |`,
  `| Q(phi) total | \`${q5.q5_total}\` |`,
  `| Phase Mirror gate | \`${phaseMirrorGate.status}\` |`,
  `| Phase Mirror proof promotion | \`${phaseMirrorGate.proofPromotion}\` |`,
  `| Phase Mirror force invoke | \`${phaseMirrorForceInvoke.status}\` |`,
  `| Phase Mirror regression | \`${phaseMirrorForceInvoke.regression}\` |`,
  `| ADR-055 | \`${statusMap.get('ADR-055')}\` |`,
  `| ADR-062 | \`${statusMap.get('ADR-062')}\` |`,
  '',
  'The daily tick does not push commits, post comments, open issues, mutate Phase Mirror, or promote open cruxes.',
  ''
].join('\n')

if (process.env.GITHUB_STEP_SUMMARY) {
  appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary)
}

console.log(summary)
