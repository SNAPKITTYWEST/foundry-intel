const FALLBACK_INDEX = {
  id: 'SPF-VLLM-LANGUAGE-INDEX-20260716',
  version: '1.0.0',
  routes: [
    {
      id: 'repo_overview',
      label: 'Repository Overview',
      triggers: ['repo', 'overview', 'foundation', 'primordial', 'foundry', 'intel', 'what is this'],
      offline_answer: 'This repository is the Foundry Intel governance hub for THE SHARED PRIMORDIAL FOUNDATION. It coordinates ADRs, WORM records, Q(phi) metadata, WASM gates, theorem posture, XML handoffs, and provenance checks.',
      sources: ['README.md', 'AGENT_MEMORY.md']
    },
    {
      id: 'adr_status',
      label: 'ADR Status',
      triggers: ['adr', 'adr-055', 'adr-062', 'open_crux', 'silence_pending', 'riemann', 'sigma'],
      offline_answer: 'ADR-055 remains OPEN_CRUX: the Riemann Hypothesis is not proved here. ADR-062 remains SILENCE_PENDING until the Sigma Kernel governance gap is closed by evidence.',
      sources: ['docs/architecture/adr-q5-theorem-classification.md', 'tools/q5-adr-parser/ADR_REGISTRY.txt']
    },
    {
      id: 'worm_chain',
      label: 'WORM Chain',
      triggers: ['worm', 'seal', 'append', 'ledger', 'receipt', 'chain', 'provenance'],
      offline_answer: 'WORM means write once, read many. Material decisions are appended and preserved so later agents can audit what changed, who acted, and which evidence existed at the time.',
      sources: ['packages/worm/src/index.ts', 'docs/pages/index.html']
    },
    {
      id: 'wasm_gate',
      label: 'WASM Gate',
      triggers: ['wasm', 'pearlgate', 'probe', 'synth', 'bob gate', 'browser'],
      offline_answer: 'The WASM gate exposes pearlGate, the probe classifier, Banach checks, tau_R checks, and the 108-cycle canonical in the browser. The checked state is 21/21 foundation tests and 10/10 verifier tests.',
      sources: ['apps/wasm-frontend/README.md', 'docs/pages/wasm/index.html']
    },
    {
      id: 'qphi_metadata',
      label: 'Q(phi) Metadata',
      triggers: ['qphi', 'q(phi)', 'golden', 'janet', 'phi', 'metadata', 'weight'],
      offline_answer: 'Q(phi) weights are metadata classifications. They help classify ADR posture; they are not independent mathematical proof claims.',
      sources: ['tools/q5-adr-parser/adr_manifest.json', 'docs/architecture/adr-q5-theorem-classification.md']
    },
    {
      id: 'vllm_runtime',
      label: 'vLLM/Ollama Runtime',
      triggers: ['vllm', 'ollama', 'model', 'stream', 'endpoint', 'jit', 'compiler', 'chat'],
      offline_answer: 'GitHub Pages is static and does not host a model. This chat can stream to a vLLM OpenAI-compatible endpoint or an Ollama endpoint configured in the browser, then falls back to the offline BOB compiler if the endpoint is unavailable.',
      sources: ['docs/pages/assets/bob-chat.mjs', 'docs/pages/llm/vllm-language-index.json']
    },
    {
      id: 'verify_build',
      label: 'Verification',
      triggers: ['verify', 'test', 'build', 'ci', 'npm', 'production', 'pages'],
      offline_answer: 'The production gate is npm run verify. It runs the Q(phi) manifest fallback, connector check, XML handoff check, Pages check, build, TypeScript lint, tests, smoke, and ADR tick.',
      sources: ['package.json', '.github/workflows/veneer-verify.yml', '.github/workflows/pages.yml']
    }
  ],
  guardrails: [
    'Do not claim RH is proved; ADR-055 remains OPEN_CRUX.',
    'Do not close ADR-062 without evidence; it remains SILENCE_PENDING.',
    'Treat Q(phi) weights as metadata classifications only.',
    'If evidence is missing, answer SILENCE instead of inventing certainty.'
  ]
}

const els = {}
let languageIndex = FALLBACK_INDEX

function byId(id) {
  return document.getElementById(id)
}

function initElements() {
  els.log = byId('bob-chat-log')
  els.input = byId('bob-chat-input')
  els.send = byId('bob-chat-send')
  els.provider = byId('bob-provider')
  els.endpoint = byId('bob-endpoint')
  els.model = byId('bob-model')
  els.apiKey = byId('bob-api-key')
  els.route = byId('bob-route')
  return Object.values(els).every(Boolean)
}

async function loadLanguageIndex() {
  try {
    const response = await fetch('llm/vllm-language-index.json', { cache: 'no-store' })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    languageIndex = await response.json()
  } catch (error) {
    appendSystem(`Language index fetch fell back to embedded copy: ${error.message}`)
  }
}

function restoreSettings() {
  const provider = localStorage.getItem('bob.provider')
  const endpoint = localStorage.getItem('bob.endpoint')
  const model = localStorage.getItem('bob.model')
  if (provider) els.provider.value = provider
  if (endpoint) els.endpoint.value = endpoint
  if (model) els.model.value = model
}

function persistSettings() {
  localStorage.setItem('bob.provider', els.provider.value)
  localStorage.setItem('bob.endpoint', els.endpoint.value)
  localStorage.setItem('bob.model', els.model.value)
}

function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/q\(phi\)/g, 'qphi')
    .split(/[^a-z0-9_-]+/)
    .filter(Boolean)
}

function scoreRoute(route, question, tokens) {
  const haystack = question.toLowerCase().replace(/q\(phi\)/g, 'qphi')
  return (route.triggers || []).reduce((score, trigger) => {
    const normalized = trigger.toLowerCase().replace(/q\(phi\)/g, 'qphi')
    if (haystack.includes(normalized)) return score + 4
    return score + tokens.filter((token) => normalized.includes(token) || token.includes(normalized)).length
  }, 0)
}

function compileQuestion(question) {
  const tokens = tokenize(question)
  const scored = (languageIndex.routes || FALLBACK_INDEX.routes)
    .map((route) => ({ route, score: scoreRoute(route, question, tokens) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
  const selected = scored.length ? scored.slice(0, 3).map((item) => item.route) : [languageIndex.routes?.[0] || FALLBACK_INDEX.routes[0]]
  const ids = selected.map((route) => route.id).join(' -> ')
  els.route.textContent = `JIT route: ${ids}`
  return selected
}

function appendMessage(role, text, meta) {
  const wrapper = document.createElement('div')
  wrapper.className = `chat-msg msg-${role}`
  wrapper.setAttribute('aria-label', `${role} message`)

  const bubble = document.createElement('div')
  bubble.className = `chat-bubble bubble-${role}`

  const metaEl = document.createElement('div')
  metaEl.className = 'chat-meta'
  metaEl.textContent = meta

  const content = document.createElement('div')
  content.className = 'chat-content'
  content.textContent = text

  bubble.append(metaEl, content)
  wrapper.appendChild(bubble)
  els.log.appendChild(wrapper)
  els.log.scrollTop = els.log.scrollHeight
  return content
}

function appendSystem(text) {
  if (!els.log) return
  const wrapper = document.createElement('div')
  wrapper.className = 'chat-msg msg-system'
  wrapper.setAttribute('role', 'note')
  const note = document.createElement('div')
  note.className = 'chat-system-note'
  note.textContent = text
  wrapper.appendChild(note)
  els.log.appendChild(wrapper)
  els.log.scrollTop = els.log.scrollHeight
}

function sourceLine(routes) {
  const sources = new Set(routes.flatMap((route) => route.sources || []))
  return sources.size ? `\n\nSources: ${[...sources].join(', ')}` : ''
}

function guardrailLine() {
  return '\n\nHard boundary: Q(phi) is metadata only; ADR-055 is OPEN_CRUX; ADR-062 is SILENCE_PENDING.'
}

function offlineAnswer(question, routes) {
  const lower = question.toLowerCase()
  const directBoundary =
    /riemann|rh|adr-055|hodge/.test(lower)
      ? 'BOB verdict: SILENCE on any claim that RH is solved. The repository records an open crux, not a proof.\n\n'
      : ''
  const body = routes.map((route) => `${route.label}: ${route.offline_answer}`).join('\n\n')
  return `${directBoundary}${body}${sourceLine(routes)}${guardrailLine()}`
}

async function streamText(target, text) {
  target.textContent = ''
  const chunks = text.match(/.{1,18}(\s|$)/g) || [text]
  for (const chunk of chunks) {
    target.textContent += chunk
    els.log.scrollTop = els.log.scrollHeight
    await new Promise((resolve) => setTimeout(resolve, 18))
  }
}

function systemPrompt(routes) {
  return [
    'You are BOB Gate for THE SHARED PRIMORDIAL FOUNDATION repository.',
    'Answer only from the repository context and the supplied vLLM language index.',
    'Use EVIDENCE when the repository has support. Use SILENCE when evidence is missing.',
    'Never claim the Riemann Hypothesis is proved; ADR-055 remains OPEN_CRUX.',
    'ADR-062 remains SILENCE_PENDING until theorem evidence closes it.',
    'Q(phi) weights are metadata classifications, not independent proof claims.',
    `Compiled routes: ${routes.map((route) => `${route.id}: ${route.offline_answer}`).join(' | ')}`,
    `Guardrails: ${(languageIndex.guardrails || FALLBACK_INDEX.guardrails).join(' | ')}`
  ].join('\n')
}

function endpointFor(provider, rawEndpoint) {
  const endpoint = rawEndpoint.trim()
  if (provider === 'ollama') {
    if (!endpoint) return 'http://localhost:11434/api/chat'
    return endpoint.endsWith('/api/chat') ? endpoint : `${endpoint.replace(/\/$/, '')}/api/chat`
  }
  if (!endpoint) return 'http://localhost:8000/v1/chat/completions'
  return endpoint
}

function headers() {
  const result = { 'Content-Type': 'application/json' }
  const key = els.apiKey.value.trim()
  if (key) result.Authorization = `Bearer ${key}`
  return result
}

async function streamVllm(target, question, routes) {
  const endpoint = endpointFor('vllm', els.endpoint.value)
  const model = els.model.value.trim() || 'repo-bob'
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      model,
      stream: true,
      messages: [
        { role: 'system', content: systemPrompt(routes) },
        { role: 'user', content: question }
      ]
    })
  })
  if (!response.ok) throw new Error(`vLLM HTTP ${response.status}`)
  await readSse(response, target)
}

async function streamOllama(target, question, routes) {
  const endpoint = endpointFor('ollama', els.endpoint.value)
  const model = els.model.value.trim() || 'llama3.1'
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      model,
      stream: true,
      messages: [
        { role: 'system', content: systemPrompt(routes) },
        { role: 'user', content: question }
      ]
    })
  })
  if (!response.ok) throw new Error(`Ollama HTTP ${response.status}`)
  await readNdjson(response, target)
}

async function readSse(response, target) {
  if (!response.body) {
    const payload = await response.json()
    target.textContent = payload.choices?.[0]?.message?.content || JSON.stringify(payload)
    return
  }
  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  target.textContent = ''
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() || ''
    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed.startsWith('data:')) continue
      const data = trimmed.slice(5).trim()
      if (data === '[DONE]') return
      const json = JSON.parse(data)
      target.textContent += json.choices?.[0]?.delta?.content || ''
      els.log.scrollTop = els.log.scrollHeight
    }
  }
}

async function readNdjson(response, target) {
  if (!response.body) {
    const payload = await response.json()
    target.textContent = payload.message?.content || payload.response || JSON.stringify(payload)
    return
  }
  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  target.textContent = ''
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() || ''
    for (const line of lines) {
      if (!line.trim()) continue
      const json = JSON.parse(line)
      target.textContent += json.message?.content || json.response || ''
      els.log.scrollTop = els.log.scrollHeight
      if (json.done) return
    }
  }
}

async function askBob() {
  const question = els.input.value.trim()
  if (!question) return
  persistSettings()
  appendMessage('user', question, 'Reader')
  els.input.value = ''
  els.send.disabled = true

  const routes = compileQuestion(question)
  const answer = appendMessage('bob', '', `BOB Gate · ${els.provider.value}`)

  try {
    if (els.provider.value === 'vllm') {
      await streamVllm(answer, question, routes)
    } else if (els.provider.value === 'ollama') {
      await streamOllama(answer, question, routes)
    } else {
      await streamText(answer, offlineAnswer(question, routes))
    }
  } catch (error) {
    const fallback = `Remote stream returned SILENCE: ${error.message}\n\nOffline fallback:\n${offlineAnswer(question, routes)}`
    await streamText(answer, fallback)
  } finally {
    els.send.disabled = false
    els.input.focus()
  }
}

async function initBobChat() {
  if (!initElements()) return
  restoreSettings()
  await loadLanguageIndex()
  els.provider.addEventListener('change', persistSettings)
  els.endpoint.addEventListener('change', persistSettings)
  els.model.addEventListener('change', persistSettings)
  els.send.addEventListener('click', askBob)
  els.input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      askBob()
    }
  })
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initBobChat)
} else {
  initBobChat()
}
