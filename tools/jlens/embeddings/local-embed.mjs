/**
 * local-embed.mjs — zero-dependency local sentence embedding for J-Lens.
 *
 * Fixed-dim bag-of-hashed-ngrams (feature hashing). No external API.
 * Good enough for cosine-distance variance across short probe responses;
 * not a semantic SOTA model — document that limitation in the paper.
 */

import { createHash } from 'node:crypto'

const DEFAULT_DIM = 128

function tokens(text) {
  return String(text ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9\s']/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 0)
}

function ngrams(toks, n) {
  const out = []
  for (let i = 0; i <= toks.length - n; i++) {
    out.push(toks.slice(i, i + n).join('_'))
  }
  return out
}

function featureIndex(feature, dim) {
  const h = createHash('sha256').update(feature).digest()
  // first 4 bytes as uint32
  const idx = h.readUInt32BE(0) % dim
  // sign from next bit
  const sign = h[4] & 1 ? 1 : -1
  return { idx, sign }
}

/**
 * Embed text → Float64Array of length `dim` (L2-normalized).
 */
export function embed(text, { dim = DEFAULT_DIM } = {}) {
  const v = new Float64Array(dim)
  const toks = tokens(text)
  const feats = [
    ...toks,
    ...ngrams(toks, 2),
    ...ngrams(toks, 3),
  ]
  if (!feats.length) return v

  for (const f of feats) {
    const { idx, sign } = featureIndex(f, dim)
    v[idx] += sign
  }

  // L2 normalize
  let norm = 0
  for (let i = 0; i < dim; i++) norm += v[i] * v[i]
  norm = Math.sqrt(norm) || 1
  for (let i = 0; i < dim; i++) v[i] /= norm
  return v
}

export function embedMany(texts, opts) {
  return texts.map((t) => embed(t, opts))
}
