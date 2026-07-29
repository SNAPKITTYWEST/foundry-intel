// Copyright © 2026 SnapKitty Collective LLC. All rights reserved.
// Licensed under Business Source License 2.0 (BSL-2.0).
// Change Date: December 31, 2027 — after which, licensed under AGPL-3.0-only.
// See LICENSE for complete terms.

/**
 * coop-sw.js — Service Worker
 * Injects COOP + COEP headers on every response so SharedArrayBuffer
 * and WebGPU are available on GitHub Pages (which cannot set custom headers).
 *
 * Required for @mlc-ai/web-llm WebGPU inference.
 * Foundry Intel · THE SHARED PRIMORDIAL FOUNDATION
 */

const CACHE = 'foundry-intel-v1'

self.addEventListener('install', e => {
  self.skipWaiting()
})

self.addEventListener('activate', e => {
  e.waitUntil(self.clients.claim())
})

self.addEventListener('fetch', e => {
  e.respondWith(
    fetch(e.request).then(resp => {
      // Only modify same-origin or CDN responses
      const h = new Headers(resp.headers)
      h.set('Cross-Origin-Opener-Policy',   'same-origin')
      h.set('Cross-Origin-Embedder-Policy', 'require-corp')
      h.set('Cross-Origin-Resource-Policy', 'cross-origin')
      return new Response(resp.body, {
        status:     resp.status,
        statusText: resp.statusText,
        headers:    h,
      })
    }).catch(() => fetch(e.request))
  )
})
