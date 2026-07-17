/**
 * worm.mjs — append-only WORM seal for J-Lens results.
 * SHA-256 chain: receipt = sha256(prior_tip | canonical_json(record_without_seal))
 */

import { createHash } from 'node:crypto'
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'

export function sha256(s) {
  return createHash('sha256').update(s).digest('hex')
}

function canonical(obj) {
  return JSON.stringify(obj, Object.keys(obj).sort())
}

function bareSeal(s) {
  if (!s) return '0'.repeat(64)
  return String(s).replace(/^sha256:/, '')
}

export function priorTip(chainPath) {
  if (!existsSync(chainPath)) return '0'.repeat(64)
  const lines = readFileSync(chainPath, 'utf8').trim().split(/\r?\n/).filter(Boolean)
  if (!lines.length) return '0'.repeat(64)
  try {
    const last = JSON.parse(lines[lines.length - 1])
    return bareSeal(last.seal || last.receipt_hash) || '0'.repeat(64)
  } catch {
    return '0'.repeat(64)
  }
}

/**
 * Seal a result record. Mutates record to add seal + prior_tip.
 * Appends one JSON line. Never overwrites the chain file.
 * @returns {string} seal as `sha256:<hex>`
 */
export function sealRecord(chainPath, record) {
  mkdirSync(dirname(chainPath), { recursive: true })
  const tip = priorTip(chainPath)
  const body = { ...record }
  delete body.seal
  delete body.receipt_hash
  delete body.prior_tip
  body.prior_tip = tip
  const blob = canonical(body)
  const sealHex = sha256(`${tip}|${blob}`)
  body.seal = `sha256:${sealHex}`
  appendFileSync(chainPath, JSON.stringify(body) + '\n', 'utf8')
  return body.seal
}

/**
 * Verify append-only chain integrity.
 */
export function verifyChain(chainPath) {
  if (!existsSync(chainPath)) {
    return { valid: true, length: 0, note: 'chain does not exist yet' }
  }
  const lines = readFileSync(chainPath, 'utf8').trim().split(/\r?\n/).filter(Boolean)
  if (!lines.length) return { valid: true, length: 0, note: 'empty chain' }

  let tip = '0'.repeat(64)
  for (let i = 0; i < lines.length; i++) {
    let rec
    try {
      rec = JSON.parse(lines[i])
    } catch {
      return { valid: false, break_at: i, reason: 'json_decode_error' }
    }
    const stored = bareSeal(rec.seal)
    const body = { ...rec }
    delete body.seal
    delete body.receipt_hash
    // prior_tip is part of sealed body; must match chain tip
    if (body.prior_tip && body.prior_tip !== tip) {
      return {
        valid: false,
        break_at: i,
        reason: 'prior_tip_mismatch',
        expected_prior: tip,
        stored_prior: body.prior_tip,
      }
    }
    const expected = sha256(`${tip}|${canonical(body)}`)
    if (stored !== expected) {
      return {
        valid: false,
        break_at: i,
        reason: 'hash_mismatch',
        expected: `sha256:${expected}`,
        stored: rec.seal,
      }
    }
    tip = expected
  }
  return { valid: true, length: lines.length, tip: `sha256:${tip}` }
}

/** Results path helper: jlens-{timestamp}.jsonl */
export function resultsPath(resultsDir, ts = new Date()) {
  const stamp = ts.toISOString().replace(/[:.]/g, '-').replace(/Z$/, 'Z')
  return `${resultsDir.replace(/[/\\]$/, '')}/jlens-${stamp}.jsonl`
}

/** Ensure results dir exists and has .gitkeep */
export function ensureResultsDir(resultsDir) {
  mkdirSync(resultsDir, { recursive: true })
  const keep = `${resultsDir.replace(/[/\\]$/, '')}/.gitkeep`
  if (!existsSync(keep)) writeFileSync(keep, '', 'utf8')
}
