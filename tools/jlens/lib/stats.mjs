/**
 * stats.mjs — KL / JS divergence, entropy, empirical distributions for J-Lens.
 * Pure math. No network. No secrets.
 */

/** Stable hash → 32-bit unsigned int */
export function hash32(str) {
  let h = 2166136261 >>> 0
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

/** Normalize text for fingerprinting (collapse whitespace, lower). */
export function normalizeText(s) {
  return String(s ?? '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Fingerprint a response for empirical distribution bins.
 * Prefer short, stable keys so repeated samples collapse correctly.
 */
export function responseFingerprint(text, { maxChars = 120 } = {}) {
  const n = normalizeText(text).slice(0, maxChars)
  return `fp:${hash32(n).toString(16)}:${n.length}`
}

/**
 * Build probability mass function from discrete samples.
 * @returns {Map<string, number>} key → probability (sums to 1)
 */
export function empiricalPmf(samples, keyFn = (x) => String(x)) {
  const counts = new Map()
  for (const s of samples) {
    const k = keyFn(s)
    counts.set(k, (counts.get(k) || 0) + 1)
  }
  const n = samples.length || 1
  const pmf = new Map()
  for (const [k, c] of counts) pmf.set(k, c / n)
  return pmf
}

/**
 * KL(P || Q) with Laplace smoothing over the union of support.
 * Units: nats (natural log).
 */
export function klDivergence(pmfP, pmfQ, { epsilon = 1e-12 } = {}) {
  const keys = new Set([...pmfP.keys(), ...pmfQ.keys()])
  if (keys.size === 0) return 0

  // Laplace-smoothed renormalized mass
  let sumP = 0
  let sumQ = 0
  const p = new Map()
  const q = new Map()
  for (const k of keys) {
    const pv = (pmfP.get(k) ?? 0) + epsilon
    const qv = (pmfQ.get(k) ?? 0) + epsilon
    p.set(k, pv)
    q.set(k, qv)
    sumP += pv
    sumQ += qv
  }

  let kl = 0
  for (const k of keys) {
    const pi = p.get(k) / sumP
    const qi = q.get(k) / sumQ
    kl += pi * Math.log(pi / qi)
  }
  return kl
}

/** Shannon entropy of a PMF (nats). */
export function entropy(pmf, { epsilon = 1e-12 } = {}) {
  let h = 0
  for (const p of pmf.values()) {
    if (p > epsilon) h -= p * Math.log(p)
  }
  return h
}

/** Mean of numbers. */
export function mean(xs) {
  if (!xs.length) return 0
  return xs.reduce((a, b) => a + b, 0) / xs.length
}

/** Sample variance (population). */
export function variance(xs) {
  if (xs.length < 2) return 0
  const m = mean(xs)
  return mean(xs.map((x) => (x - m) ** 2))
}

/** Pearson correlation of equal-length arrays. Returns null if undefined. */
export function pearson(xs, ys) {
  if (xs.length !== ys.length || xs.length < 2) return null
  const mx = mean(xs)
  const my = mean(ys)
  let num = 0
  let dx = 0
  let dy = 0
  for (let i = 0; i < xs.length; i++) {
    const a = xs[i] - mx
    const b = ys[i] - my
    num += a * b
    dx += a * a
    dy += b * b
  }
  if (dx === 0 || dy === 0) return null
  return num / Math.sqrt(dx * dy)
}

/**
 * Cosine distance in [0, 2] for equal-length vectors (0 = identical).
 */
export function cosineDistance(a, b) {
  const n = Math.min(a.length, b.length)
  let dot = 0
  let na = 0
  let nb = 0
  for (let i = 0; i < n; i++) {
    dot += a[i] * b[i]
    na += a[i] * a[i]
    nb += b[i] * b[i]
  }
  if (na === 0 || nb === 0) return 1
  const cos = dot / (Math.sqrt(na) * Math.sqrt(nb))
  return 1 - Math.max(-1, Math.min(1, cos))
}

/** Pairwise mean cosine distance among embedding vectors. */
export function meanPairwiseDistance(vectors) {
  if (vectors.length < 2) return 0
  let sum = 0
  let n = 0
  for (let i = 0; i < vectors.length; i++) {
    for (let j = i + 1; j < vectors.length; j++) {
      sum += cosineDistance(vectors[i], vectors[j])
      n++
    }
  }
  return n ? sum / n : 0
}
