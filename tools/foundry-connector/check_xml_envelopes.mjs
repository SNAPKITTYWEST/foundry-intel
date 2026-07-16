#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const handoffDir = join(root, 'docs/handoff')

function fail(message) {
  console.error(`XML handoff check failed: ${message}`)
  process.exit(1)
}

function requireFile(path) {
  if (!existsSync(join(root, path))) fail(`missing ${path}`)
}

function assertWellFormed(xml, file) {
  const stack = []
  const tagPattern = /<\/([^>\s]+)>|<([^!/?][^>\s/]*)\s*\/>|<([^!/?][^>\s/]*)(?:\s[^>]*)?>/g
  let match
  while ((match = tagPattern.exec(xml)) !== null) {
    const close = match[1]
    const selfClosing = match[2]
    const open = match[3]
    if (selfClosing) continue
    if (open) {
      stack.push(open)
      continue
    }
    const expected = stack.pop()
    if (expected !== close) {
      fail(`${file}: expected closing </${expected}>, got </${close}>`)
    }
  }
  if (stack.length > 0) fail(`${file}: unclosed <${stack.at(-1)}>`)
}

function requirePattern(xml, file, pattern, label) {
  if (!pattern.test(xml)) fail(`${file}: missing ${label}`)
}

function countTag(xml, tag) {
  const pattern = new RegExp(`<${tag}(\\s[^>]*)?>`, 'g')
  return [...xml.matchAll(pattern)].length
}

requireFile('docs/protocols/xml-handoff-envelope.md')
requireFile('docs/protocols/xml-handoff-envelope.xsd')

if (!existsSync(handoffDir)) fail('missing docs/handoff')
const envelopes = readdirSync(handoffDir).filter((name) => name.endsWith('.xml')).sort()
if (envelopes.length === 0) fail('no XML envelopes found under docs/handoff')

for (const name of envelopes) {
  const path = `docs/handoff/${name}`
  const xml = readFileSync(join(root, path), 'utf8')
  assertWellFormed(xml, path)
  requirePattern(xml, path, /<\?xml version="1\.0" encoding="UTF-8"\?>/, 'XML declaration')
  requirePattern(xml, path, /<agent_contract\b[^>]*\bid="[^"]+"/, 'agent_contract id')
  requirePattern(xml, path, /<agent_contract\b[^>]*\bversion="[^"]+"/, 'agent_contract version')
  for (const tag of [
    'role',
    'repo',
    'current_state',
    'mission',
    'required_work',
    'hard_boundaries',
    'validation',
    'git_rules'
  ]) {
    requirePattern(xml, path, new RegExp(`<${tag}(\\s[^>]*)?>`), `<${tag}>`)
  }
  if (countTag(xml, 'task') < 3) fail(`${path}: expected at least 3 tasks`)
  if (countTag(xml, 'boundary') < 3) fail(`${path}: expected at least 3 boundaries`)
  if (countTag(xml, 'command') < 2) fail(`${path}: expected at least 2 validation commands`)
  requirePattern(xml, path, /OPEN_CRUX/, 'OPEN_CRUX boundary')
  requirePattern(xml, path, /SILENCE_PENDING/, 'SILENCE_PENDING boundary')
  requirePattern(xml, path, /Q\(phi\).*metadata|metadata.*Q\(phi\)/s, 'Q(phi) metadata boundary')
}

console.log(`XML handoff check passed (${envelopes.length} envelope${envelopes.length === 1 ? '' : 's'})`)
