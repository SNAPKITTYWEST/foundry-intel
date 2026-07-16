#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const selfPath = fileURLToPath(import.meta.url)

function read(root, path) {
  return readFileSync(join(root, path), 'utf8')
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
    walk(root, join(path, entry), files)
  }
  return files
}

function pattern(source) {
  return new RegExp(source, 'i')
}

const mutationPatterns = [
  ['git commit', pattern(String.raw`\bgit\s+commit\b`)],
  ['git push', pattern(String.raw`\bgit\s+push\b`)],
  ['contents write permission', pattern(String.raw`contents\s*:\s*write`)],
  ['pull_request_target trigger', pattern(String.raw`pull_request_target\s*:`)],
  ['PR comment command', pattern(String.raw`\bgh\s+pr\s+comment\b`)],
  ['issue comment command', pattern(String.raw`\bgh\s+issue\s+comment\b`)],
  ['issue create command', pattern(String.raw`\bgh\s+issue\s+create\b`)],
  ['GitHub comment API', pattern(String.raw`\bgh\s+api\b.*\bcomments\b`)],
  ['create-pull-request action', pattern(String.raw`create-pull-request`)]
]

const promotionClaimPatterns = [
  ['fully kernel verified claim', pattern(String.raw`fully\s+kernel[-\s]verified`)],
  ['bulletproof proof claim', pattern(String.raw`bulletproof\s+mathematical\s+model`)],
  ['superior closed proof claim', pattern(String.raw`superior,\s*fully\s+closed\s+proof`)],
  ['mathematical invalidation claim', pattern(String.raw`mathematically\s+invalid\s+compared`)]
]

const leanBuildMarkers = [
  'lean-substrate/.lake/build/lib/olean/ADR/PhaseMirror.olean',
  'lean-substrate/.lake/build/lib/olean/Core/PARM.olean'
]

export function evaluatePhaseMirrorCommitGate(options = {}) {
  const root = options.root ?? process.cwd()
  const violations = []
  const mutationFiles = [
    ...walk(root, '.github/workflows'),
    ...walk(root, 'tools')
  ].filter((path) => path !== relative(root, selfPath).replace(/\\/g, '/'))

  for (const path of mutationFiles) {
    const source = read(root, path)
    for (const [label, regex] of mutationPatterns) {
      if (regex.test(source)) violations.push(`${path}: blocked mutation path (${label})`)
    }
  }

  const claimFiles = [
    'README.md',
    ...walk(root, 'docs'),
    ...walk(root, 'tools')
  ].filter((path) => path !== relative(root, selfPath).replace(/\\/g, '/'))

  for (const path of claimFiles) {
    const source = read(root, path)
    for (const [label, regex] of promotionClaimPatterns) {
      if (regex.test(source)) violations.push(`${path}: blocked Phase Mirror proof-promotion language (${label})`)
    }
  }

  const pkg = JSON.parse(read(root, 'package.json'))
  const verify = pkg.scripts?.verify ?? ''
  if (!pkg.scripts?.['phase-mirror:gate']) {
    violations.push('package.json: missing phase-mirror:gate script')
  }
  if (!verify.includes('phase-mirror:gate')) {
    violations.push('package.json: verify script must include phase-mirror:gate')
  }
  if (verify.includes('adr:tick') && verify.indexOf('phase-mirror:gate') > verify.indexOf('adr:tick')) {
    violations.push('package.json: phase-mirror:gate must run before adr:tick')
  }

  const workflow = read(root, '.github/workflows/veneer-verify.yml')
  if (!/permissions:\s*\n\s*contents:\s*read/m.test(workflow)) {
    violations.push('.github/workflows/veneer-verify.yml: workflow contents permission must remain read-only')
  }

  const leanEvidencePresent = leanBuildMarkers.every((path) => existsSync(join(root, path)))
  return {
    status: 'BLOCKED_FROM_MUTATION',
    proofPromotion: leanEvidencePresent ? 'LEAN_BUILD_EVIDENCE_PRESENT_STILL_NON_MUTATING' : 'BLOCKED_NO_LEAN_BUILD_EVIDENCE',
    leanEvidencePresent,
    mutationFilesScanned: mutationFiles.length,
    claimFilesScanned: claimFiles.length,
    violations
  }
}

function print(result) {
  console.log('# Phase Mirror Commit Gate')
  console.log('')
  console.log(`status=${result.status}`)
  console.log(`proof_promotion=${result.proofPromotion}`)
  console.log(`lean_build_evidence_present=${result.leanEvidencePresent}`)
  console.log(`mutation_files_scanned=${result.mutationFilesScanned}`)
  console.log(`claim_files_scanned=${result.claimFilesScanned}`)
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const result = evaluatePhaseMirrorCommitGate()
  print(result)
  if (result.violations.length > 0) {
    for (const violation of result.violations) console.error(`phase mirror gate violation: ${violation}`)
    process.exit(1)
  }
}
