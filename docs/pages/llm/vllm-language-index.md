# vLLM Language Index

This index feeds the BOB chat surface on GitHub Pages.

The page is static. It does not host a model and does not claim server-side
inference exists inside GitHub Pages. The browser can do three things:

- answer from the offline BOB route compiler;
- stream to a reader-supplied vLLM OpenAI-compatible endpoint;
- stream to a reader-supplied Ollama endpoint.

The JSON index maps user language to repository routes: ADR status, WORM chain,
WASM gate, Q(phi) metadata, XML handoffs, provenance, and verification.

Hard boundaries:

- ADR-055 remains `OPEN_CRUX`.
- ADR-062 remains `SILENCE_PENDING`.
- Q(phi) weights are metadata classifications only.
- Missing evidence returns `SILENCE`, not a fabricated claim.

Pages artifact:

```text
docs/pages/index.html
docs/pages/assets/bob-chat.mjs
docs/pages/llm/vllm-language-index.json
```
