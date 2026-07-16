#!/usr/bin/env node
import { createHash } from 'node:crypto'
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { pathToFileURL } from 'node:url'

const keyPath = 'docs/keys/sovereign-node-build-public.asc'
const metadataPath = 'docs/keys/sovereign-node-build.json'
const keyReadmePath = 'docs/keys/README.md'
const expectedFingerprint = '427AB4A1C0E64A7AB22B0F116ABDA4A46FDDCB60'
const expectedSha256 = '576245485b17accf4078c6507714e564311767dc15d4e1e16037949a29517123'

function read(root, path) {
  const full = join(root, path)
  if (!existsSync(full)) throw new Error(`missing ${path}`)
  return readFileSync(full, 'utf8')
}

function readJson(root, path) {
  return JSON.parse(read(root, path))
}

function walk(root, path = '.', files = []) {
  const full = join(root, path)
  if (!existsSync(full)) return files
  const stat = statSync(full)
  if (stat.isFile()) {
    files.push(relative(root, full).replace(/\\/g, '/'))
    return files
  }
  for (const entry of readdirSync(full)) {
    if (entry === '.git' || entry === 'node_modules' || entry === 'target') continue
    walk(root, join(path, entry), files)
  }
  return files
}

function sha256(text) {
  return createHash('sha256').update(text.replace(/\r\n/g, '\n')).digest('hex')
}

export function evaluateSovereignNodeKeyGuard(options = {}) {
  const root = options.root ?? process.cwd()
  const violations = []
  let publicKey = ''
  let metadata
  let keyReadme = ''

  try {
    publicKey = read(root, keyPath)
    metadata = readJson(root, metadataPath)
    keyReadme = read(root, keyReadmePath)
  } catch (error) {
    return {
      status: 'FAILED',
      mode: 'UNKNOWN',
      cratesChecked: 0,
      fingerprint: expectedFingerprint,
      violations: [error.message]
    }
  }

  const normalizedKey = publicKey.replace(/\r\n/g, '\n')
  if (!normalizedKey.includes('-----BEGIN PGP PUBLIC KEY BLOCK-----')) {
    violations.push(`${keyPath}: missing armored PGP public key begin marker`)
  }
  if (!normalizedKey.includes('-----END PGP PUBLIC KEY BLOCK-----')) {
    violations.push(`${keyPath}: missing armored PGP public key end marker`)
  }
  const actualSha = sha256(publicKey)
  if (actualSha !== expectedSha256) {
    violations.push(`${keyPath}: sha256 mismatch expected ${expectedSha256}, got ${actualSha}`)
  }

  if (metadata.id !== 'SPF-SOVEREIGN-NODE-BUILD-KEY-20260716') {
    violations.push(`${metadataPath}: unexpected key id`)
  }
  if (metadata.status !== 'ACTIVE') violations.push(`${metadataPath}: status must be ACTIVE`)
  if (metadata.mode !== 'PUBLIC_BUILD_TRUST_ANCHOR') {
    violations.push(`${metadataPath}: mode must be PUBLIC_BUILD_TRUST_ANCHOR`)
  }
  if (metadata.fingerprint !== expectedFingerprint) violations.push(`${metadataPath}: fingerprint mismatch`)
  if (metadata.public_key_path !== keyPath) violations.push(`${metadataPath}: public_key_path mismatch`)
  if (metadata.public_key_sha256 !== expectedSha256) violations.push(`${metadataPath}: public_key_sha256 mismatch`)
  if (metadata.rust_build_contract?.secret_env_supported !== 'SOVEREIGN_NODE_KEY') {
    violations.push(`${metadataPath}: SOVEREIGN_NODE_KEY support must remain documented`)
  }

  for (const marker of [
    'SOVEREIGN_NODE_KEY remains supported',
    'private key material must not be committed',
    'npm run sovereign:key:guard'
  ]) {
    if (!keyReadme.includes(marker)) violations.push(`${keyReadmePath}: missing marker ${marker}`)
  }

  const attributes = read(root, '.gitattributes')
  for (const tracked of [keyPath, metadataPath, keyReadmePath]) {
    if (!attributes.includes(tracked)) violations.push(`.gitattributes: missing tracked key marker for ${tracked}`)
  }

  const gitignore = read(root, '.gitignore')
  for (const marker of [
    'docs/keys/private/',
    'docs/keys/**/*.sec.asc',
    'docs/keys/**/*private*.asc',
    '!docs/keys/sovereign-node-build-public.asc'
  ]) {
    if (!gitignore.includes(marker)) violations.push(`.gitignore: missing private-key ignore marker ${marker}`)
  }

  const trackedPrivatePatterns = [
    /docs\/keys\/.*private.*\.asc$/i,
    /docs\/keys\/.*secret.*\.asc$/i,
    /docs\/keys\/.*\.sec\.asc$/i,
    /docs\/keys\/.*\.(gpg|kbx)$/i
  ]
  for (const file of walk(root)) {
    if (trackedPrivatePatterns.some((regex) => regex.test(file))) {
      violations.push(`${file}: private key material pattern must not be tracked`)
    }
  }

  const cargoManifests = walk(root).filter((file) => file.endsWith('Cargo.toml'))
  for (const manifest of cargoManifests) {
    const cargo = read(root, manifest)
    const crateDir = dirname(manifest)
    const buildScriptPath = crateDir === '.' ? 'build.rs' : `${crateDir}/build.rs`
    if (!/build\s*=\s*"build\.rs"/.test(cargo)) {
      violations.push(`${manifest}: every Rust crate must declare build = "build.rs"`)
    }
    if (!existsSync(join(root, buildScriptPath))) {
      violations.push(`${manifest}: missing ${buildScriptPath}`)
      continue
    }
    const buildScript = read(root, buildScriptPath)
    for (const marker of [keyPath, metadataPath, 'SOVEREIGN_NODE_KEY', expectedSha256, expectedFingerprint]) {
      if (!buildScript.includes(marker)) violations.push(`${buildScriptPath}: missing sovereign key marker ${marker}`)
    }
  }

  const rootBuild = read(root, 'build.rs')
  for (const marker of [keyPath, metadataPath, 'SOVEREIGN_NODE_KEY', expectedSha256, expectedFingerprint]) {
    if (!rootBuild.includes(marker)) violations.push('build.rs: missing root sovereign key marker')
  }

  return {
    status: violations.length > 0 ? 'FAILED' : 'ACTIVE',
    mode: metadata.mode ?? 'UNKNOWN',
    cratesChecked: cargoManifests.length,
    fingerprint: expectedFingerprint,
    violations
  }
}

function print(result) {
  console.log('# Sovereign Node Key Guard')
  console.log('')
  console.log(`status=${result.status}`)
  console.log(`mode=${result.mode}`)
  console.log(`fingerprint=${result.fingerprint}`)
  console.log(`crates_checked=${result.cratesChecked}`)
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const result = evaluateSovereignNodeKeyGuard()
  print(result)
  if (result.violations.length > 0) {
    for (const violation of result.violations) console.error(`sovereign node key guard violation: ${violation}`)
    process.exit(1)
  }
}
