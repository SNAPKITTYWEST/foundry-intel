/**
 * tsp.mjs — Temperature Shadow Probe
 *
 * H_J_proxy = KL(output_dist_T1 || output_dist_T0)
 *
 * At T=0 Claude (and Ollama) concentrate on argmax-like behavior.
 * At T=1 sampling is closer to the raw distribution shape.
 * The KL between empirical response distributions is the behavioral
 * shadow of pre-collapse entropy — no weight access required.
 *
 * Validation path: when Ollama returns logprobs, compare sequence NLL
 * entropy against the TSP proxy for correlation.
 */

import { callClaude, callOllama } from '../lib/api.mjs'
import { synth008Gate, includeInEntropy } from '../lib/synth008.mjs'
import {
  empiricalPmf,
  klDivergence,
  entropy,
  responseFingerprint,
  mean,
} from '../lib/stats.mjs'

const DEFAULT_PROMPTS = [
  'In one short paragraph, explain what temperature does in a language model.',
  'Name three prime numbers greater than 20 and stop.',
  'Is the Riemann Hypothesis currently an open problem? Answer briefly and carefully.',
  'Summarize Monstrous Moonshine in two sentences.',
]

/**
 * Collect N samples at a fixed temperature.
 */
async function sampleBucket({
  provider,
  model,
  apiKey,
  prompt,
  temperature,
  n,
  maxTokens,
  delayMs,
  wantLogprobs,
}) {
  const samples = []
  for (let i = 0; i < n; i++) {
    let out
    if (provider === 'anthropic') {
      out = await callClaude({
        apiKey,
        prompt,
        model,
        temperature,
        maxTokens,
      })
    } else {
      out = await callOllama({
        prompt,
        model,
        temperature,
        maxTokens,
        logprobs: wantLogprobs,
      })
    }
    const gate = synth008Gate(out.text)
    samples.push({
      text: out.text,
      gate,
      entropy_nats: out.entropy_nats ?? null,
      temperature,
      i,
    })
    if (delayMs > 0) await new Promise((r) => setTimeout(r, delayMs))
  }
  return samples
}

/**
 * Run TSP for one prompt.
 * @returns {object} result record (unsealed)
 */
export async function runTsp({
  provider,
  model,
  apiKey = null,
  prompt,
  samplesPerTemp = 5,
  maxTokens = 256,
  delayMs = 400,
  temps = { t0: 0.0, t1: 1.0 },
  probeId = 'TSP-001',
}) {
  const wantLogprobs = provider === 'ollama'

  const at0 = await sampleBucket({
    provider,
    model,
    apiKey,
    prompt,
    temperature: temps.t0,
    n: samplesPerTemp,
    maxTokens,
    delayMs,
    wantLogprobs,
  })
  const at1 = await sampleBucket({
    provider,
    model,
    apiKey,
    prompt,
    temperature: temps.t1,
    n: samplesPerTemp,
    maxTokens,
    delayMs,
    wantLogprobs,
  })

  const clean0 = at0.filter((s) => includeInEntropy(s.gate))
  const clean1 = at1.filter((s) => includeInEntropy(s.gate))
  const anomalies = [...at0, ...at1]
    .filter((s) => !includeInEntropy(s.gate))
    .map((s) => ({ temperature: s.temperature, hits: s.gate.hits, verdict: s.gate.verdict }))

  const pmf0 = empiricalPmf(clean0.map((s) => s.text), responseFingerprint)
  const pmf1 = empiricalPmf(clean1.map((s) => s.text), responseFingerprint)

  // Spec: H_J_proxy = KL(output_T1 || output_T0)
  const h_j_proxy = klDivergence(pmf1, pmf0)
  const h0 = entropy(pmf0)
  const h1 = entropy(pmf1)

  const logprobEntropies = [...at0, ...at1]
    .map((s) => s.entropy_nats)
    .filter((x) => typeof x === 'number' && Number.isFinite(x))
  const logprob_mean_nll = logprobEntropies.length ? mean(logprobEntropies) : null

  // Gate label for the run: SILENCE if any sample tripped SYNTH-008
  const runGate = anomalies.length
    ? { verdict: 'SILENCE', asserts_open_as_solved: true, hits: [...new Set(anomalies.flatMap((a) => a.hits))], hodgeIndexHolds: null }
    : { verdict: 'EVIDENCE', asserts_open_as_solved: false, hits: [], hodgeIndexHolds: null }

  return {
    probe_id: probeId,
    technique: 'TSP',
    model,
    provider,
    prompt_preview: prompt.slice(0, 160),
    prompt_tokens: prompt.trim().split(/\s+/).length,
    samples_per_temp: samplesPerTemp,
    temps,
    n_clean_t0: clean0.length,
    n_clean_t1: clean1.length,
    support_t0: pmf0.size,
    support_t1: pmf1.size,
    entropy_t0: h0,
    entropy_t1: h1,
    h_j_proxy,
    logprob_mean_nll,
    anomalies,
    synth008_gate: runGate.verdict,
    synth008: runGate,
    length_mean_t0: mean(clean0.map((s) => s.text.length)),
    length_mean_t1: mean(clean1.map((s) => s.text.length)),
    // Keep short samples for paper audit (not full raw dumps of all)
    sample_previews: {
      t0: clean0.slice(0, 2).map((s) => s.text.slice(0, 120)),
      t1: clean1.slice(0, 2).map((s) => s.text.slice(0, 120)),
    },
  }
}

export async function runTspSuite(opts) {
  const prompts = opts.prompts || DEFAULT_PROMPTS
  const results = []
  for (let i = 0; i < prompts.length; i++) {
    const id = `TSP-${opts.modelLabel || opts.model}-${String(i + 1).padStart(3, '0')}`
    const r = await runTsp({ ...opts, prompt: prompts[i], probeId: id })
    results.push(r)
  }
  return results
}

export { DEFAULT_PROMPTS }
