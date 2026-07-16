#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { pathToFileURL } from 'node:url'

const policyPath = 'docs/governance/repo-freeze-policy.json'
const policyDocPath = 'docs/governance/repo-freeze-policy.md'
const dailyWorkflowPath = '.github/workflows/adr-daily-hardening.yml'
const verifyWorkflowPath = '.github/workflows/veneer-verify.yml'

const excludedToolPaths = new Set([
  'tools/formal/repo_freeze_guard.mjs',
  'tools/formal/phase_mirror_commit_gate.mjs',
  'tools/formal/gemini_black_team_guard.mjs'
])

const mutationPatterns = [
  ['commit command', /\bgit\s+commit\b/i],
  ['push command', /\bgit\s+push\b/i],
  ['write contents permission', /contents\s*:\s*write/i],
  ['pull request target trigger', /pull_request_target\s*:/i],
  ['pull request comment command', /\bgh\s+pr\s+comment\b/i],
  ['issue command', /\bgh\s+issue\s+(?:create|comment)\b/i],
  ['comment API command', /\bgh\s+api\b.*\bcomments\b/i],
  ['pull request write action', /create[-]pull[-]request/i]
]

function read(root, path) {
  const full = join(root, path)
  if (!existsSync(full)) throw new Error(`missing ${path}`)
  return readFileSync(full, 'utf8')
}

function readJson(root, path) {
  return JSON.parse(read(root, path))
}

function walk(root, path, files = []) {
  const full = join(root, path)
  if (!existsSync(full)) return files
  const stat = statSync(full)
  if (stat.isFile()) {
    files.push(relative(root, full).replace(/\\/g, '/'))
    return files
  }
  for (const entry of readdirSync(full)) {
    if (entry === 'node_modules' || entry === 'target' || entry === '.git') continue
    walk(root, join(path, entry), files)
  }
  return files
}

function scanForMutation(root, paths, violations) {
  for (const path of paths) {
    if (excludedToolPaths.has(path)) continue
    const source = read(root, path)
    for (const [label, regex] of mutationPatterns) {
      if (regex.test(source)) violations.push(`${path}: autonomous mutation path blocked (${label})`)
    }
  }
}

export function evaluateRepoFreezeGuard(options = {}) {
  const root = options.root ?? process.cwd()
  const violations = []
  let policy
  let pkg
  let workflow = ''
  let dailyWorkflow = ''
  let policyDoc = ''

  try {
    policy = readJson(root, policyPath)
    pkg = readJson(root, 'package.json')
    workflow = read(root, verifyWorkflowPath)
    dailyWorkflow = read(root, dailyWorkflowPath)
    policyDoc = read(root, policyDocPath)
  } catch (error) {
    return {
      status: 'FAILED',
      mode: 'UNKNOWN',
      dailyHardening: 'UNKNOWN',
      workflowsScanned: 0,
      toolsScanned: 0,
      violations: [error.message]
    }
  }

  if (policy.id !== 'SPF-REPO-FREEZE-20260716') violations.push(`${policyPath}: unexpected freeze policy id`)
  if (policy.status !== 'FROZEN') violations.push(`${policyPath}: status must be FROZEN`)
  if (policy.mode !== 'READ_ONLY_AUTONOMOUS') violations.push(`${policyPath}: mode must be READ_ONLY_AUTONOMOUS`)
  if (policy.governing_adr !== 'ADR-304') violations.push(`${policyPath}: governing ADR must be ADR-304`)
  if (policy.daily_hardening?.command !== 'npm run adr:harden:daily') {
    violations.push(`${policyPath}: daily hardening command must be npm run adr:harden:daily`)
  }
  if (policy.daily_hardening?.schedule !== '21 7 * * *') {
    violations.push(`${policyPath}: daily hardening schedule must be 21 7 * * *`)
  }

  const scripts = pkg.scripts ?? {}
  for (const script of ['repo:freeze:guard', 'adr:harden:daily', 'adr:tick', 'verify']) {
    if (!scripts[script]) violations.push(`package.json: missing ${script} script`)
  }
  if (!scripts.verify?.includes('repo:freeze:guard')) {
    violations.push('package.json: verify must include repo:freeze:guard')
  }
  if (scripts.verify?.includes('adr:tick') && scripts.verify.indexOf('repo:freeze:guard') > scripts.verify.indexOf('adr:tick')) {
    violations.push('package.json: repo:freeze:guard must run before adr:tick')
  }

  const daily = scripts['adr:harden:daily'] ?? ''
  for (const required of [
    'adr:q5:fallback',
    'repo:freeze:guard',
    'connector:check',
    'handoff:check',
    'agent:tensor:guard',
    'security:black-team:guard',
    'phase-mirror:gate',
    'adr:tick'
  ]) {
    if (!daily.includes(required)) violations.push(`package.json: adr:harden:daily must include ${required}`)
  }

  if (!/permissions:\s*\n\s*contents:\s*read/m.test(workflow)) {
    violations.push(`${verifyWorkflowPath}: contents permission must be read`)
  }
  if (!/permissions:\s*\n\s*contents:\s*read/m.test(dailyWorkflow)) {
    violations.push(`${dailyWorkflowPath}: contents permission must be read`)
  }
  if (!/cron:\s*'21 7 \* \* \*'/.test(dailyWorkflow)) {
    violations.push(`${dailyWorkflowPath}: missing 07:21 UTC daily schedule`)
  }
  if (!/run:\s*npm run adr:harden:daily/.test(dailyWorkflow)) {
    violations.push(`${dailyWorkflowPath}: must run npm run adr:harden:daily`)
  }

  const workflowFiles = walk(root, '.github/workflows')
  const toolFiles = walk(root, 'tools').filter((path) => !path.startsWith('tools/formal/'))
  scanForMutation(root, workflowFiles, violations)
  scanForMutation(root, toolFiles, violations)

  for (const marker of [
    'Status:** `FROZEN`',
    'Mode:** `READ_ONLY_AUTONOMOUS`',
    'npm run repo:freeze:guard',
    'npm run adr:harden:daily',
    '07:21 UTC daily'
  ]) {
    if (!policyDoc.includes(marker)) violations.push(`${policyDocPath}: missing freeze marker: ${marker}`)
  }

  return {
    status: violations.length > 0 ? 'FAILED' : policy.status,
    mode: policy.mode,
    dailyHardening: violations.length > 0 ? 'FAILED' : 'ACTIVE',
    workflowsScanned: workflowFiles.length,
    toolsScanned: toolFiles.length,
    violations
  }
}

function print(result) {
  console.log('# Repository Freeze Guard')
  console.log('')
  console.log(`status=${result.status}`)
  console.log(`mode=${result.mode}`)
  console.log(`daily_hardening=${result.dailyHardening}`)
  console.log(`workflows_scanned=${result.workflowsScanned}`)
  console.log(`tools_scanned=${result.toolsScanned}`)
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const result = evaluateRepoFreezeGuard()
  print(result)
  if (result.violations.length > 0) {
    for (const violation of result.violations) console.error(`repo freeze guard violation: ${violation}`)
    process.exit(1)
  }
}
