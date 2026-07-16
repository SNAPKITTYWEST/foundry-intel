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

for (const path of [
  'docs/bridge/foundry-connector.md',
  'docs/architecture/adr-q5-theorem-classification.md',
  'tools/q5-adr-parser/ADR_REGISTRY.txt',
  'tools/q5-adr-parser/adr_manifest_index.csv'
]) {
  requireFile(path)
}

requireEqual(connector.status, 'CONNECTED', 'connector status')
requireEqual(
  connector.repos.gkn_i4_e7_lean.delivery_commit,
  'de968509b5fc695f2d33e665959c6b86f5456be1',
  'GKN latch delivery commit'
)
requireEqual(connector.handoff.status, 'READY_FOR_CLAUDE', 'Claude handoff status')
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

console.log('foundry connector check passed')
console.log(`connected: ${connector.repos.gkn_i4_e7_lean.repo} -> ${connector.repos.foundry_intel.repo} -> ${connector.repos.foundry_f1.repo}`)
