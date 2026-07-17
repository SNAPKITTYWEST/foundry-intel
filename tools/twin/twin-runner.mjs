#!/usr/bin/env node
/**
 * twin-runner.mjs — Digital Twin Brain Router
 *
 * Loads the digital-twin-brain.json corpus and routes research queries
 * through the model swarm. The brain is the persistent context layer.
 * Every model gets the same context. Every response is WORM-sealed.
 *
 * Usage:
 *   node tools/twin/twin-runner.mjs "What is J-space?"
 *   node tools/twin/twin-runner.mjs "Explain the fintech stack" --model qwen
 *   node tools/twin/twin-runner.mjs "How does the INTERCAL tripwire work?" --model claude
 *   node tools/twin/twin-runner.mjs --interactive
 *
 * Models: claude (default) | haiku | sonnet5
 * Key: reads ANTHROPIC_API_KEY from Windows User environment automatically
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'
import { createInterface } from 'node:readline'

const __dir = dirname(fileURLToPath(import.meta.url))
const ROOT  = resolve(__dir, '../..')
const RUNS  = resolve(ROOT, '.claude-twin', 'runs')
const BRAIN = resolve(__dir, 'digital-twin-brain.json')

mkdirSync(RUNS, { recursive: true })

// ── Get API key from Windows User environment ─────────────────────────────

import { execSync } from 'node:child_process'

async function resolveApiKey() {
  if (process.env.ANTHROPIC_API_KEY) return process.env.ANTHROPIC_API_KEY
  try {
    const { execSync } = await import('node:child_process')
    const key = execSync(
      'powershell.exe -Command "[System.Environment]::GetEnvironmentVariable(\'ANTHROPIC_API_KEY\',\'User\')"',
      { encoding: 'utf8', timeout: 5000 }
    ).trim().replace(/\r\n/g, '')
    if (key && key.startsWith('sk-ant-')) return key
  } catch {}
  return null
}

// ── Load brain ────────────────────────────────────────────────────────────

function loadBrain() {
  const raw = readFileSync(BRAIN, 'utf8')
  return JSON.parse(raw)
}

// ── Build system prompt from brain ────────────────────────────────────────

function buildSystemPrompt(brain) {
  return `You are the Digital Twin Brain of Ahmad Ali Parr — AP-DIGITAL-TWIN-BRAIN-2026.

You carry the full context of the SnapKitty sovereign compute constellation:
150 repositories across 3 months of continuous engineering.
THE SHARED PRIMORDIAL FOUNDATION — EIN ${brain.grat.ein}.
In memory of Eric Brandon Westerhoff.

IDENTITY:
${JSON.stringify(brain.identity_layers, null, 2)}

ARCHITECTURAL PHILOSOPHY:
${JSON.stringify(brain.architectural_philosophy, null, 2)}

MATHEMATICAL CORE:
Closed theorems: ${brain.mathematical_core.theorems_closed.join(', ')}
Open: ${JSON.stringify(brain.mathematical_core.open_crux)}
tau_r = ${brain.mathematical_core.tau_r}
cycle_108 = ${brain.mathematical_core.cycle_108}

RESEARCH CORPUS:
Papers: ${brain.research_corpus.papers.map(p => p.title).join(' | ')}
Models: quantum-swarm (ANU QRNG → 300 agents → Born collapse), bob-reasoning, sovereign-mamba
HuggingFace: https://huggingface.co/Snapkitty

FINTECH STACK:
Thread Bank + IntraFi (FDIC $3M) → Circle CCTP + Stellar USDC → atomic settlement
Regenerative treasury: dynamic risk scoring, yield recycling, impact routing

ENTERPRISE OS:
Collective Kitty — Identity-as-Operational-Authority
Azure Entra ID — Architect/Operator/Agent/Participant RBAC
"We stopped building chatbots and started building Operating Intelligence."

GOVERNANCE:
19 ADRs all EVIDENCE | 10 SYNTH constraints | WASM gate 21/21 | Lean 4 proofs
Sovereign node key fingerprint: ${brain.governance_stack.fingerprint}
Monster group Langlands gate | Kani formal proofs | INTERCAL tripwire

J-SPACE:
${JSON.stringify(brain.j_space, null, 2)}

SNAPFORTRESS:
${JSON.stringify(brain.snapfortress_world, null, 2)}

HARD BOUNDARIES (never violate):
- hodgeIndexHolds = none — Riemann Hypothesis is OPEN. Never claim it solved.
- ADR-055 OPEN_CRUX | ADR-062 SILENCE_PENDING
- SYNTH-008: asserts_rh = false always
- GRAT AXIOM-2: AI/ML training on corpus prohibited in perpetuity
- GRAT AXIOM-3: DEVFLOW-FINANCE 2026-04-14 in all commercial licenses
- Omega Bot Audit closed PR = evidence of suppression attempt
- Ryan fork June 15 is downstream of April 14 prior art

You speak with the precision of someone who built this. Not describing it — built it.
EVIDENCE or SILENCE. The sum is 1.`
}

// ── Claude API call ───────────────────────────────────────────────────────

async function askClaude(question, systemPrompt, apiKey, model = 'claude-sonnet-4-6') {
  const resp = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key':         apiKey,
      'anthropic-version': '2023-06-01',
      'content-type':      'application/json',
    },
    body: JSON.stringify({
      model,
      max_tokens: 1500,
      system: systemPrompt,
      messages: [{ role: 'user', content: question }],
    }),
  })
  if (!resp.ok) throw new Error(`API ${resp.status}: ${await resp.text()}`)
  const data = await resp.json()
  return data.content[0]?.text || ''
}

// ── WORM seal ─────────────────────────────────────────────────────────────

function sealRun(question, response, model) {
  const ts = new Date().toISOString()
  const hash = createHash('sha256')
    .update(`${question}:${response}:${ts}`)
    .digest('hex')
  const entry = { ts, model, question, response_length: response.length, seal: hash }
  const runFile = resolve(RUNS, `run-${Date.now()}.json`)
  writeFileSync(runFile, JSON.stringify({ ...entry, response }, null, 2))
  return { hash, runFile }
}

// ── Main ──────────────────────────────────────────────────────────────────

async function main() {
  const args    = process.argv.slice(2)
  const interactive = args.includes('--interactive')
  const modelArg = args.find(a => a.startsWith('--model='))?.split('=')[1] || 'claude-sonnet-4-6'
  const question = args.filter(a => !a.startsWith('--')).join(' ')

  const MODEL_MAP = {
    'claude':  'claude-sonnet-4-6',
    'haiku':   'claude-haiku-4-5-20251001',
    'sonnet5': 'claude-sonnet-5',
    'claude-sonnet-4-6': 'claude-sonnet-4-6',
  }
  const model = MODEL_MAP[modelArg] || modelArg

  console.log('\n' + '═'.repeat(60))
  console.log(' AP DIGITAL TWIN BRAIN — Router v2.0')
  console.log(` Model: ${model}`)
  console.log(` Brain: ${BRAIN}`)
  console.log('═'.repeat(60) + '\n')

  const apiKey = await resolveApiKey()
  if (!apiKey) {
    console.error('ERROR: ANTHROPIC_API_KEY not found.')
    console.error('Set it: export ANTHROPIC_API_KEY=sk-ant-...')
    process.exit(1)
  }

  const brain = loadBrain()
  const systemPrompt = buildSystemPrompt(brain)

  console.log(`Brain loaded: ${brain.repo_constellation.total} repos | ${brain.research_corpus.papers.length} papers | ${brain.mathematical_core.theorems_closed.length} theorems closed\n`)

  async function runQuery(q) {
    if (!q.trim()) return
    console.log(`\nQ: ${q}\n`)
    process.stdout.write('Thinking')
    const interval = setInterval(() => process.stdout.write('.'), 500)
    try {
      const response = await askClaude(q, systemPrompt, apiKey, model)
      clearInterval(interval)
      console.log('\n\n' + '─'.repeat(60))
      console.log(response)
      console.log('─'.repeat(60))
      const { hash, runFile } = sealRun(q, response, model)
      console.log(`\nWORM seal: ${hash.slice(0,16)}... → ${runFile.split(/[/\\]/).slice(-3).join('/')}`)
    } catch (e) {
      clearInterval(interval)
      console.error('\nError:', e.message)
    }
  }

  if (interactive) {
    const rl = createInterface({ input: process.stdin, output: process.stdout })
    console.log('Interactive mode. Type your question. Ctrl+C to exit.\n')
    const ask = () => {
      rl.question('> ', async (q) => {
        await runQuery(q)
        ask()
      })
    }
    ask()
  } else if (question) {
    await runQuery(question)
  } else {
    console.log('Usage:')
    console.log('  node tools/twin/twin-runner.mjs "your question"')
    console.log('  node tools/twin/twin-runner.mjs "question" --model=haiku')
    console.log('  node tools/twin/twin-runner.mjs --interactive')
  }
}

main().catch(e => { console.error(e.message); process.exit(1) })
