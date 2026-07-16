#!/usr/bin/env node
/**
 * serve.mjs — dev server for the WASM frontend
 * Serves dist/ on http://localhost:4242
 */

import { createServer }                   from 'node:http'
import { readFileSync, existsSync }        from 'node:fs'
import { extname, resolve }                from 'node:path'
import { fileURLToPath }                   from 'node:url'

const __dir = fileURLToPath(new URL('../dist', import.meta.url))
const PORT  = 4242

const MIME = {
  '.html': 'text/html',
  '.mjs':  'application/javascript',
  '.js':   'application/javascript',
  '.wasm': 'application/wasm',
  '.json': 'application/json',
  '.css':  'text/css',
}

createServer((req, res) => {
  const url  = req.url === '/' ? '/index.html' : req.url
  const path = resolve(__dir, '.' + url)

  if (!path.startsWith(__dir) || !existsSync(path)) {
    res.writeHead(404); res.end('Not found'); return
  }

  const ext  = extname(path)
  const mime = MIME[ext] || 'application/octet-stream'
  res.writeHead(200, {
    'Content-Type': mime,
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Embedder-Policy': 'require-corp',
  })
  res.end(readFileSync(path))
}).listen(PORT, () => {
  console.log(`Foundry Intel WASM frontend: http://localhost:${PORT}`)
})
