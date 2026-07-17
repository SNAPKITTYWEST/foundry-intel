/**
 * api.mjs — Claude (Anthropic Messages API) + Ollama generate clients for J-Lens.
 *
 * Key: ANTHROPIC_API_KEY from process env or Windows User env (twin-runner pattern).
 * Never hardcode keys. Never log keys.
 */

import { execSync } from 'node:child_process'

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages'
const OLLAMA_URL = process.env.OLLAMA_HOST
  ? `${process.env.OLLAMA_HOST.replace(/\/$/, '')}/api/generate`
  : 'http://localhost:11434/api/generate'

export const MODELS = {
  claude: 'claude-haiku-4-5-20251001',
  haiku: 'claude-haiku-4-5-20251001',
  sonnet: 'claude-sonnet-4-6',
  // Local Ollama — prefer available names; override with --ollama-model
  nemotron: 'nemotron-mini',
  ollama: 'qwen3.5:latest',
  qwen: 'qwen3.5:latest',
  granite: 'granite4.1:3b',
}

export async function resolveApiKey() {
  if (process.env.ANTHROPIC_API_KEY) return process.env.ANTHROPIC_API_KEY
  try {
    const key = execSync(
      'powershell.exe -Command "[System.Environment]::GetEnvironmentVariable(\'ANTHROPIC_API_KEY\',\'User\')"',
      { encoding: 'utf8', timeout: 5000 },
    )
      .trim()
      .replace(/\r\n/g, '')
    if (key && key.startsWith('sk-ant-')) return key
  } catch {
    /* no Windows User key */
  }
  return null
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

/**
 * Claude Messages API.
 * @returns {{ text: string, model: string, stop_reason: string|null, usage: object, raw: object }}
 */
export async function callClaude({
  apiKey,
  prompt,
  model = MODELS.claude,
  temperature = 0,
  maxTokens = 256,
  system = null,
  retries = 3,
}) {
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY missing')

  const body = {
    model,
    max_tokens: maxTokens,
    temperature,
    messages: [{ role: 'user', content: prompt }],
  }
  if (system) body.system = system

  let lastErr
  for (let attempt = 0; attempt < retries; attempt++) {
    const resp = await fetch(ANTHROPIC_URL, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (resp.status === 429 || resp.status >= 500) {
      const wait = 1000 * 2 ** attempt
      await sleep(wait)
      lastErr = new Error(`API ${resp.status}: ${await resp.text()}`)
      continue
    }
    if (!resp.ok) throw new Error(`API ${resp.status}: ${await resp.text()}`)

    const data = await resp.json()
    const text = (data.content || [])
      .filter((b) => b.type === 'text')
      .map((b) => b.text)
      .join('')
    return {
      text,
      model: data.model || model,
      stop_reason: data.stop_reason ?? null,
      usage: data.usage || {},
      raw: data,
      provider: 'anthropic',
    }
  }
  throw lastErr || new Error('Claude API failed after retries')
}

/**
 * Ollama /api/generate — optional logprobs when the model supports them.
 * @returns {{ text: string, model: string, logprobs: number[]|null, tokens: string[]|null, entropy_nats: number|null }}
 */
export async function callOllama({
  prompt,
  model = MODELS.ollama,
  temperature = 0.7,
  maxTokens = 256,
  logprobs = false,
}) {
  const options = {
    temperature,
    num_predict: maxTokens,
  }
  // Ollama logprobs support varies by version/model
  if (logprobs) {
    options.logprobs = true
    options.top_logprobs = 5
  }

  const resp = await fetch(OLLAMA_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      model,
      prompt,
      stream: false,
      options,
    }),
  })
  if (!resp.ok) throw new Error(`Ollama ${resp.status}: ${await resp.text()}`)
  const data = await resp.json()
  const text = data.response || ''

  // Extract logprobs if present (schema differs across Ollama versions)
  let lp = null
  let tokens = null
  if (Array.isArray(data.logprobs)) {
    lp = data.logprobs.map(Number)
  } else if (data.probs || data.token_logprobs) {
    lp = (data.token_logprobs || data.probs).map(Number)
  }
  if (Array.isArray(data.tokens)) tokens = data.tokens

  let entropy_nats = null
  if (lp && lp.length) {
    // Token log-prob ≈ log p(token|context); sequence NLL ≈ -sum logp; mean as proxy
    const meanNll = -lp.reduce((a, b) => a + b, 0) / lp.length
    entropy_nats = meanNll
  }

  return {
    text,
    model: data.model || model,
    logprobs: lp,
    tokens,
    entropy_nats,
    provider: 'ollama',
    raw: { done: data.done, eval_count: data.eval_count, total_duration: data.total_duration },
  }
}

/** Rough token estimate for sensitivity vectors (whitespace split). */
export function roughTokens(text) {
  return String(text).trim().split(/\s+/).filter(Boolean)
}

export function resolveModelAlias(name) {
  if (!name) return { provider: 'anthropic', model: MODELS.claude }
  const n = name.toLowerCase()
  if (n === 'claude' || n === 'haiku' || n === 'sonnet') {
    return { provider: 'anthropic', model: MODELS[n] || MODELS.claude }
  }
  if (n === 'nemotron' || n === 'ollama' || n === 'qwen' || n === 'granite') {
    return { provider: 'ollama', model: MODELS[n] }
  }
  if (n.startsWith('claude') || n.includes('anthropic')) {
    return { provider: 'anthropic', model: name }
  }
  // Treat unknown as Ollama model id
  return { provider: 'ollama', model: name }
}
