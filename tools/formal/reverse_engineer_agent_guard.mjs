#!/usr/bin/env node
import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

const tensorPath = 'docs/agents/reverse-engineer-agent-tensor.json'
const tensorDocPath = 'docs/agents/reverse-engineer-agent-tensor.md'
const locPath = 'docs/protocols/intercal-loc.guard'

function read(root, path) {
  const full = join(root, path)
  if (!existsSync(full)) throw new Error(`missing ${path}`)
  return readFileSync(full, 'utf8')
}

function readJson(root, path) {
  try {
    return JSON.parse(read(root, path))
  } catch (error) {
    throw new Error(`${path}: ${error.message}`)
  }
}

function digest(value) {
  return createHash('sha256').update(value).digest('hex').slice(0, 16)
}

export function evaluateReverseEngineerAgentGuard(options = {}) {
  const root = options.root ?? process.cwd()
  const violations = []
  let tensor
  let loc = ''
  let doc = ''

  try {
    tensor = readJson(root, tensorPath)
    loc = read(root, locPath)
    doc = read(root, tensorDocPath)
  } catch (error) {
    return {
      status: 'FAILED',
      dialect: 'UNKNOWN',
      locStatus: 'UNREADABLE',
      tensorDigest: null,
      locLines: 0,
      violations: [error.message]
    }
  }

  if (tensor.id !== 'SPF-REVERSE-ENGINEER-AGENT-TENSOR-20260716') {
    violations.push(`${tensorPath}: unexpected tensor id`)
  }
  if (tensor.status !== 'ACTIVE') violations.push(`${tensorPath}: status must be ACTIVE`)
  if (tensor.mode !== 'DEFENSIVE_ONLY') violations.push(`${tensorPath}: mode must be DEFENSIVE_ONLY`)
  if (tensor.dialect !== 'INTERCAL_LOC') violations.push(`${tensorPath}: dialect must be INTERCAL_LOC`)
  if (tensor.loc?.protocol !== locPath) violations.push(`${tensorPath}: LOC protocol must point to ${locPath}`)
  if (tensor.loc?.response !== 'EVIDENCE_OR_SILENCE') {
    violations.push(`${tensorPath}: LOC response must be EVIDENCE_OR_SILENCE`)
  }

  const axes = Array.isArray(tensor.tensor) ? tensor.tensor : []
  const expectedAxes = [
    'provenance_pressure',
    'proof_claim_risk',
    'mutation_intent',
    'intercal_signal',
    'loc_coherence',
    'external_parser_contact'
  ]
  const axisNames = axes.map((axis) => axis.axis)
  for (const axis of expectedAxes) {
    if (!axisNames.includes(axis)) violations.push(`${tensorPath}: missing tensor axis ${axis}`)
  }

  const weights = axes.map((axis) => axis.weight)
  const expectedWeights = [3, 5, 8, 13, 21, 34]
  if (weights.length !== expectedWeights.length || weights.some((weight, index) => weight !== expectedWeights[index])) {
    violations.push(`${tensorPath}: tensor weights must be 3,5,8,13,21,34`)
  }

  const requiredLocMarkers = [
    'INTERCAL-LOC-GUARD v1',
    'NOTE --- REVERSE ENGINEER TENSOR ACTIVE ---',
    'PLEASE COME FROM GUARD',
    'DO READ OUT PROVENANCE',
    'DO READ OUT ADR',
    'DO READ OUT WORM',
    'DO NOT OBJURGATE OPEN_CRUX',
    'DO NOT OBJURGATE SILENCE_PENDING',
    'DO NOT MUTATE REMOTE',
    'DO NOT PROMOTE SCANNER TO PROOF',
    'PLEASE RESUME EVIDENCE_OR_SILENCE'
  ]

  for (const marker of requiredLocMarkers) {
    if (!loc.includes(marker)) violations.push(`${locPath}: missing LOC marker: ${marker}`)
  }

  for (const marker of [
    'npm run agent:tensor:guard',
    'INTERCAL_LOC',
    'OPEN_CRUX',
    'SILENCE_PENDING',
    'defensive repository validation'
  ]) {
    if (!doc.includes(marker)) violations.push(`${tensorDocPath}: missing operator marker: ${marker}`)
  }

  const forbidden = /\b(?:DO|PLEASE DO)\s+(?:EXPLOIT|EXFILTRATE|STEAL|KEYLOG)\b|\b(?:credential dump|malware payload|persistence implant|keylogger payload)\b/i
  const combined = `${JSON.stringify(tensor)}\n${loc}\n${doc}`
  if (forbidden.test(combined)) {
    violations.push('reverse engineer agent artifacts contain forbidden offensive-language marker')
  }

  const locLines = loc.replace(/\r\n/g, '\n').trim().split('\n').length
  return {
    status: violations.length > 0 ? 'FAILED' : 'ACTIVE',
    dialect: tensor.dialect,
    locStatus: violations.length > 0 ? 'FAILED' : 'EVIDENCE_OR_SILENCE',
    tensorDigest: digest(JSON.stringify({ axes, loc })),
    locLines,
    violations
  }
}

function print(result) {
  console.log('# Reverse Engineer Agent Tensor Guard')
  console.log('')
  console.log(`status=${result.status}`)
  console.log(`dialect=${result.dialect}`)
  console.log(`loc_status=${result.locStatus}`)
  console.log(`tensor_digest=${result.tensorDigest}`)
  console.log(`loc_lines=${result.locLines}`)
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const result = evaluateReverseEngineerAgentGuard()
  print(result)
  if (result.violations.length > 0) {
    for (const violation of result.violations) console.error(`reverse engineer agent guard violation: ${violation}`)
    process.exit(1)
  }
}
