#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const registryPath = process.argv[2] ?? join(here, 'ADR_REGISTRY.txt')
const jsonOut = process.argv[3] ?? join(here, 'adr_manifest.json')
const csvOut = process.argv[4] ?? jsonOut.replace(/\.json$/i, '_index.csv')

function gcd(a, b) {
  let x = Math.abs(a)
  let y = Math.abs(b)
  while (y !== 0) {
    const t = x % y
    x = y
    y = t
  }
  return x
}

function rat(n, d = 1) {
  if (d === 0) throw new Error('zero denominator')
  const sign = d < 0 ? -1 : 1
  const g = gcd(n, d)
  return [sign * n / g, sign * d / g]
}

function radd(x, y) {
  return rat(x[0] * y[1] + y[0] * x[1], x[1] * y[1])
}

function q5(a, b) {
  return [a, b]
}

function q5add(x, y) {
  return [radd(x[0], y[0]), radd(x[1], y[1])]
}

function ratString(x) {
  return x[1] === 1 ? String(x[0]) : `${x[0]}/${x[1]}`
}

function q5String(x) {
  return `${ratString(x[0])} + ${ratString(x[1])}*phi`
}

function statusOf(text) {
  if (text.includes('OPEN_CRUX')) return 'OPEN_CRUX'
  if (text.includes('SILENCE_PENDING')) return 'SILENCE_PENDING'
  if (text.includes('PROVEN_NO_SORRY')) return 'PROVEN_NO_SORRY'
  if (text.includes('SPECIFIED')) return 'SPECIFIED'
  if (/no sorry/i.test(text)) return 'PROVEN_NO_SORRY'
  if (/crux stays none/i.test(text)) return 'OPEN_CRUX'
  return 'SPECIFIED'
}

function weightOf(status) {
  switch (status) {
    case 'PROVEN_NO_SORRY': return q5(rat(1), rat(1))
    case 'SILENCE_PENDING': return q5(rat(0), rat(1))
    case 'OPEN_CRUX': return q5(rat(-1), rat(1))
    default: return q5(rat(1), rat(0))
  }
}

function parseRegistry(text) {
  const lines = text.split(/\r?\n/)
  const records = []
  let current = null
  let body = []

  function flush() {
    if (!current) return
    const joined = body.join(' ').trim()
    const [title, ...rest] = joined.split('—')
    const status = statusOf(joined)
    const weight = weightOf(status)
    records.push({
      id: current,
      title: title.trim(),
      description: rest.join('—').trim(),
      status,
      q5_weight: q5String(weight)
    })
  }

  for (const raw of lines) {
    const line = raw.trim()
    if (!line) continue
    if (/^ADR-/.test(line)) {
      flush()
      current = line
      body = []
    } else {
      body.push(line)
    }
  }
  flush()
  return records
}

function csvEscape(value) {
  const s = String(value ?? '')
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

const records = parseRegistry(readFileSync(registryPath, 'utf8'))
let total = q5(rat(0), rat(0))
for (const record of records) total = q5add(total, weightOf(record.status))

const payload = {
  count: records.length,
  q5_total: q5String(total),
  note: 'Q(phi) weights are metadata classifications, not independent mathematical proof claims.',
  records
}

writeFileSync(jsonOut, JSON.stringify(payload, null, 2) + '\n')
writeFileSync(
  csvOut,
  [
    ['id', 'title', 'status', 'q5_weight', 'description'].join(','),
    ...records.map((r) => [r.id, r.title, r.status, r.q5_weight, r.description].map(csvEscape).join(','))
  ].join('\n') + '\n'
)

console.log(`parsed ${records.length} ADR records`)
console.log(`Q(phi) total: ${payload.q5_total}`)
console.log(`wrote ${jsonOut}`)
console.log(`wrote ${csvOut}`)
