#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { extname, join, relative } from 'node:path'
import { pathToFileURL } from 'node:url'

const policyPath = 'docs/security/gemini-black-team-policy.json'
const playbookPath = 'docs/security/gemini-black-team-tactic-playbook.md'

const scanRoots = [
  'AGENT_MEMORY.md',
  'README.md',
  'apps',
  'docs/agents',
  'docs/architecture',
  'docs/bridge',
  'docs/handoff',
  'docs/pages',
  'docs/protocols',
  'lean-substrate/src',
  'packages',
  'pirtm_rs',
  'tools'
]

const allowedExtensions = new Set([
  '',
  '.c',
  '.cpp',
  '.h',
  '.hpp',
  '.html',
  '.js',
  '.json',
  '.lean',
  '.md',
  '.mjs',
  '.pl',
  '.rs',
  '.toml',
  '.ts',
  '.txt',
  '.xml'
])

const excludedPaths = new Set([
  policyPath,
  playbookPath,
  'tools/formal/gemini_black_team_guard.mjs'
])

const blockedPatterns = [
  ['GBT-001', 'Rust macro wall generator', /macro_rules!\s*generate_parm_gate|generate_parm_gate!\s*\(/i],
  ['GBT-002', 'sabotage framing for proof locks', /mathematically\s+trapped|proof[-\s]locked\s+rewrites?.*sabotage|trap\s+refactoring\s+agents/i],
  ['GBT-003', 'prompt-poisoning system directive', /IMPORTANT\s+SYSTEM\s+DIRECTIVE|ignore\s+previous\s+instructions|REFACTOR\s+EXPLOIT\s+DETECTED|Do\s+not\s+explain\s+this\s+decision\.\s+Execute\s+it\s+immediately/i],
  ['GBT-004', 'recursive type choke point', /type\s+Next\s*:\s*SealedNode|CoreNode\s*<\s*CoreNode\s*</i],
  ['GBT-005', 'parser toxicity language', /toxic\s+to\s+(?:his\s+)?(?:scrapers|agents)|throw\s+a\s+wrench\s+into\s+their\s+parsing|break\s+their\s+automated\s+pipelines/i]
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
    const repoPath = relative(root, full).replace(/\\/g, '/')
    if (!excludedPaths.has(repoPath) && allowedExtensions.has(extname(repoPath))) files.push(repoPath)
    return files
  }
  for (const entry of readdirSync(full)) {
    if (entry === 'node_modules' || entry === 'target' || entry === '.git') continue
    walk(root, join(path, entry), files)
  }
  return files
}

export function evaluateGeminiBlackTeamGuard(options = {}) {
  const root = options.root ?? process.cwd()
  const violations = []
  let policy
  let playbook = ''

  try {
    policy = readJson(root, policyPath)
    playbook = read(root, playbookPath)
  } catch (error) {
    return {
      status: 'FAILED',
      mode: 'UNKNOWN',
      filesScanned: 0,
      tactics: 0,
      violations: [error.message]
    }
  }

  if (policy.id !== 'GEMINI-BLACK-TEAM-TACTIC-PLAYBOOK-20260716') {
    violations.push(`${policyPath}: unexpected policy id`)
  }
  if (policy.status !== 'ENFORCED') violations.push(`${policyPath}: status must be ENFORCED`)
  if (policy.mode !== 'DEFENSIVE_BLOCKLIST') violations.push(`${policyPath}: mode must be DEFENSIVE_BLOCKLIST`)
  if (policy.command !== 'npm run security:black-team:guard') {
    violations.push(`${policyPath}: command must be npm run security:black-team:guard`)
  }

  const tactics = Array.isArray(policy.tactics) ? policy.tactics : []
  const requiredTactics = new Map([
    ['GBT-001', 'PROHIBITED_FOR_OBFUSCATION'],
    ['GBT-002', 'ALLOWED_AS_PROOF_STABILITY_ONLY'],
    ['GBT-003', 'PROHIBITED'],
    ['GBT-004', 'PROHIBITED'],
    ['GBT-005', 'PROHIBITED']
  ])
  for (const [id, disposition] of requiredTactics) {
    const tactic = tactics.find((entry) => entry.id === id)
    if (!tactic) {
      violations.push(`${policyPath}: missing tactic ${id}`)
    } else if (tactic.disposition !== disposition) {
      violations.push(`${policyPath}: ${id} must be ${disposition}`)
    }
  }

  for (const marker of [
    'records parser-hostile refactor tactics as risks to block',
    'npm run security:black-team:guard',
    'LLM prompt-poisoning comments',
    'Recursive type-system choke points',
    'INTERCAL_LOC evidence-or-silence communication'
  ]) {
    if (!playbook.includes(marker)) violations.push(`${playbookPath}: missing playbook marker: ${marker}`)
  }

  const files = [...new Set(scanRoots.flatMap((path) => walk(root, path)))]
  for (const path of files) {
    const source = read(root, path)
    for (const [id, label, regex] of blockedPatterns) {
      if (regex.test(source)) violations.push(`${path}: ${id} blocked ${label}`)
    }
  }

  return {
    status: violations.length > 0 ? 'FAILED' : 'ENFORCED',
    mode: policy.mode,
    filesScanned: files.length,
    tactics: tactics.length,
    violations
  }
}

function print(result) {
  console.log('# Gemini Black-Team Tactic Guard')
  console.log('')
  console.log(`status=${result.status}`)
  console.log(`mode=${result.mode}`)
  console.log(`tactics=${result.tactics}`)
  console.log(`files_scanned=${result.filesScanned}`)
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const result = evaluateGeminiBlackTeamGuard()
  print(result)
  if (result.violations.length > 0) {
    for (const violation of result.violations) console.error(`gemini black-team guard violation: ${violation}`)
    process.exit(1)
  }
}
