#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()

function fail(message) {
  console.error(`connector check failed: ${message}`)
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

function requireEqual(actual, expected, label) {
  if (actual !== expected) fail(`${label}: expected ${expected}, got ${actual}`)
}

const connector = readJson('tools/foundry-connector/connector-manifest.json')
const q5 = readJson('tools/q5-adr-parser/adr_manifest.json')
const rootPackage = readJson('package.json')
const agentTour = readJson('docs/agents/metadata-tour.json')

for (const path of [
  'AGENT_MEMORY.md',
  'package-lock.json',
  '.github/workflows/veneer-verify.yml',
  'tsconfig.json',
  'tsconfig.package.json',
  'tools/production-smoke.mjs',
  'tools/adr-production-tick.mjs',
  'docs/architecture/adr/ADR-301-daily-production-tick.md',
  'docs/architecture/adr/ADR-302-primordial-foundation-rebrand.md',
  'docs/trust/primordial-foundation-interlock.md',
  'docs/bridge/foundry-connector.md',
  'docs/agents/metadata-tour.md',
  'docs/agents/metadata-tour.json',
  'docs/brand/foundry-intel-operating-map.svg',
  'docs/brand/veneer-institutional-trust.svg',
  'docs/brand/badge-verify.svg',
  'docs/brand/badge-adr.svg',
  'docs/brand/badge-trust.svg',
  'docs/brand/badge-worm.svg',
  'docs/brand/badge-daily-tick.svg',
  'docs/brand/badge-crux.svg',
  'docs/protocols/xml-handoff-envelope.md',
  'docs/protocols/xml-handoff-envelope.xsd',
  'docs/handoff/foundry-intel-agent-contract.xml',
  'docs/handoff/primordial-foundation-agent-contract.xml',
  'docs/architecture/adr-q5-theorem-classification.md',
  'tools/q5-adr-parser/ADR_REGISTRY.txt',
  'tools/q5-adr-parser/adr_manifest_index.csv'
]) {
  requireFile(path)
}

for (const script of ['build', 'test', 'lint', 'smoke', 'verify', 'adr:tick']) {
  if (!rootPackage.scripts?.[script]) fail(`package.json missing ${script} script`)
}

requireEqual(agentTour.id, 'FOUNDRY-INTEL-AGENT-METADATA-TOUR-20260716', 'agent tour id')
requireEqual(agentTour.repo.name, 'SNAPKITTYWEST/foundry-intel-2026-07-11', 'agent tour repo')
requireEqual(
  agentTour.repo.rebrand_target,
  "THE SHARED PRIMORDIAL FOUNDATION - Foundry Intel, in care of Bel Esprit D'Accord",
  'agent tour rebrand target'
)
if (!agentTour.production_gate?.commands?.includes('npm run verify')) {
  fail('agent tour must include npm run verify')
}
for (const boundary of ['ADR-055 remains OPEN_CRUX', 'ADR-062 remains SILENCE_PENDING']) {
  if (!agentTour.boundaries?.includes(boundary)) fail(`agent tour missing boundary: ${boundary}`)
}

requireEqual(connector.status, 'CONNECTED', 'connector status')
requireEqual(
  connector.repos.gkn_i4_e7_lean.delivery_commit,
  'de968509b5fc695f2d33e665959c6b86f5456be1',
  'GKN latch delivery commit'
)
requireEqual(connector.handoff.status, 'READY_FOR_CLAUDE', 'Claude handoff status')
requireEqual(connector.rebrand.status, 'PREPARED', 'Primordial Foundation rebrand status')
requireEqual(connector.rebrand.governing_adr, 'ADR-302', 'Primordial Foundation governing ADR')
requireEqual(
  connector.artifacts.intel_handoff_rebrand_envelope,
  'docs/handoff/primordial-foundation-agent-contract.xml',
  'Primordial Foundation XML handoff artifact'
)
requireEqual(q5.count, connector.q5.count, 'Q(phi) ADR count')
requireEqual(q5.q5_total, connector.q5.total, 'Q(phi) total')

const records = new Map(q5.records.map((record) => [record.id, record]))
for (const [id, status] of Object.entries(connector.q5.statuses)) {
  const record = records.get(id)
  if (!record) fail(`missing Q(phi) record ${id}`)
  requireEqual(record.status, status, `${id} status`)
}

const doc = readFileSync(join(root, 'docs/architecture/adr-q5-theorem-classification.md'), 'utf8')
if (!/metadata/i.test(doc) || !/open crux/i.test(doc)) {
  fail('Q(phi) classification doc must preserve metadata and open-crux language')
}

const readme = readFileSync(join(root, 'README.md'), 'utf8')
for (const pattern of [
  /AGENT_MEMORY\.md/,
  /foundry-intel-2026-07-11/,
  /C:\\Users\\jessi\\veneer-deploy/,
  /foundry-intel-operating-map\.svg/,
  /THE SHARED PRIMORDIAL FOUNDATION/,
  /Bel Esprit D'Accord/,
  /ADR-302/,
  /primordial-foundation-interlock\.md/,
  /primordial-foundation-agent-contract\.xml/,
  /OPEN_CRUX/,
  /SILENCE_PENDING/,
  /Q\(phi\).*metadata/is,
  /npm run verify/
]) {
  if (!pattern.test(readme)) fail(`README missing required memory/operator marker: ${pattern}`)
}

const memory = readFileSync(join(root, 'AGENT_MEMORY.md'), 'utf8')
for (const pattern of [
  /C:\\Users\\jessi\\veneer-deploy/,
  /SNAPKITTYWEST\/foundry-intel-2026-07-11/,
  /THE SHARED PRIMORDIAL FOUNDATION - Foundry Intel, in care of Bel Esprit D'Accord/,
  /ADR-302/,
  /Do Not Confuse With/,
  /ADR-055 remains `OPEN_CRUX`/,
  /ADR-062 remains `SILENCE_PENDING`/
]) {
  if (!pattern.test(memory)) fail(`AGENT_MEMORY missing required marker: ${pattern}`)
}

const adrIndex = readFileSync(join(root, 'docs/architecture/ADR-INDEX.md'), 'utf8')
if (!/ADR-302/.test(adrIndex)) fail('ADR index missing ADR-302')

const trustTransition = readFileSync(join(root, 'docs/trust/primordial-foundation-interlock.md'), 'utf8')
for (const pattern of [
  /THE SHARED PRIMORDIAL FOUNDATION/,
  /Bel Esprit D'Accord/,
  /Foundry F1 runtime/,
  /Q\(phi\) weights remain metadata classifications only/
]) {
  if (!pattern.test(trustTransition)) fail(`trust transition doc missing marker: ${pattern}`)
}

console.log('foundry connector check passed')
console.log(`connected: ${connector.repos.gkn_i4_e7_lean.repo} -> ${connector.repos.foundry_intel.repo} -> ${connector.repos.foundry_f1.repo}`)
