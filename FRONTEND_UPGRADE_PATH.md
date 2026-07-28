# Foundry-Intel Frontend Upgrade Path
## From Broken JIT Box to Twin-O-Matic Clean Design

**Date**: 2026-07-28  
**Status**: ✅ Frontend Fixed + Upgrade Path Documented

---

## WHAT WAS BROKEN

The foundry-intel JIT box frontend was **completely broken**:
- Fresh clone had no compiled WASM (`build/verifier.wasm` missing)
- Loader couldn't fetch WASM → complete UI failure
- Complex, cluttered interface (too many form fields)

---

## WHAT I FIXED

✅ Added WASM build to `npm install`  
✅ Committed compiled `verifier.wasm` to git  
✅ Created `build:frontend` and `serve:frontend` scripts  
✅ Frontend now boots successfully

**Test locally:**
```bash
cd foundry-intel/frontend
npm run serve
# http://localhost:4173
```

---

## THE UPGRADE PATH: Twin-O-Matic Design

**Reference**: https://snapkittywest.github.io/twin-o-matic/frontend/index.html

Twin-O-Matic's frontend is **production-grade clean**:

### Design Principles (Copy from Twin-O-Matic)

```
✅ Split-screen layout (3D viewport left, terminal right)
✅ Dark theme with accent colors (#5ad1c4 teal, #a78bfa purple)
✅ Monospace font for all code/terminal
✅ Progress bar for streaming responses
✅ Status dots (off/on/loading) with animations
✅ Minimal button styling (no clutter)
✅ Responsive grid (desktop 1:1 split, mobile stacked)
✅ Full-height viewport with overlay tools
```

### Current Foundry-Intel Frontend (Messy)

```
❌ Cramped form layout (Lean buffer + Goldilocks + Banach all on one page)
❌ Too many buttons (SHA-256, Add, Sub, Mul, Pow, Inv, Check)
❌ Inconsistent spacing and visual hierarchy
❌ No viewport/visualization area
❌ Text-only output (no 3D or visual feedback)
```

---

## RECOMMENDED UPGRADE (Phase 1)

**Goal**: Make foundry-intel frontend match Twin-O-Matic design quality

### Step 1: Adopt CSS/Layout Framework
Copy Twin-O-Matic's CSS grid + variable structure:
- Same color palette (--bg, --panel, --panel2, --line, etc.)
- Same monospace font stack
- Same button/input styling
- Same header + status bar

### Step 2: Reorganize UI Sections

**LEFT SIDE (Visualization)**:
```
┌─────────────────────────────┐
│  Lean Verification Results  │  ← Live visualization
│  (replace textarea with     │     instead of just text
│   structured output)        │
├─────────────────────────────┤
│  Goldilocks Field           │  ← Math operations
│  (a + b, a · b, etc)        │
└─────────────────────────────┘
```

**RIGHT SIDE (Terminal + Input)**:
```
┌─────────────────────────────┐
│  Status Bar (engine state)  │
├─────────────────────────────┤
│  Terminal Output            │
│  (system, user, llm lines)  │
├─────────────────────────────┤
│  Input Bar                  │
│  "Enter proof or command"   │
└─────────────────────────────┘
```

### Step 3: Add Visual Feedback

- ✅ Progress bar for Lean verification
- ✅ Status dot for engine state (on/loading/error)
- ✅ Styled output pills (PASS/FAIL/WARN)
- ✅ Syntax highlighting in terminal

### Step 4: Simplify Interaction

Instead of scattered buttons:
```
OLD: [Run] [Load Sample] [SHA] [+] [-] [·] [^] [⁻¹] [Check]

NEW: Command palette at bottom
  > verify proof
  > compute goldilocks
  > check banach
```

---

## FILE STRUCTURE (AFTER UPGRADE)

```
foundry-intel/frontend/
├── index.html (new Twin-O-Matic-style layout)
├── src/
│   ├── loader.mjs (unchanged — WASM loader)
│   ├── ui.mjs (new — split-screen layout)
│   ├── terminal.mjs (new — terminal output styling)
│   └── commands.mjs (new — command palette)
├── build/
│   └── verifier.wasm (compiled AssemblyScript)
└── package.json
```

---

## IMMEDIATE TODO (Phase 0)

Since we're starting Phase 0 (sovereign-transformer), this is **optional enhancement**:

- [ ] Keep foundry-intel frontend working as-is (✅ Done)
- [ ] Use Twin-O-Matic as primary visual layer for sovereign-transformer
- [ ] Later: Port foundry-intel to Twin-O-Matic design (post-Phase 0)

---

## DEPLOYMENT

**Current Frontend Status**:
- ✅ Runs locally: `npm run serve` at http://localhost:4173
- ⏳ Deploy to GitHub Pages: Needs `npm run build` in CI

**Add GitHub Pages deploy step**:
```yaml
# .github/workflows/deploy-frontend.yml
- name: Build frontend WASM
  run: cd frontend && npm install && npm run build

- name: Deploy to GitHub Pages
  uses: actions/deploy-pages@v1
  with:
    folder: frontend/build
```

---

## RECOMMENDATION

**For sovereign-transformer Phase 0:**
- ✅ Use Twin-O-Matic as primary web frontend (already clean + proven)
- ✅ Keep foundry-intel as reference implementation (now fixed + working)
- ⏳ Upgrade foundry-intel UI after Phase 0 complete

**Why?**
- Twin-O-Matic is production-ready
- foundry-intel is proof-of-concept (math engine is valuable, UI is secondary)
- Focus on Phase 0 orchestration, defer UI polish

---

## STATUS

✅ foundry-intel frontend FIXED and running  
✅ Upgrade path documented  
✅ Ready for Phase 0 with Twin-O-Matic as primary frontend  

**Next**: Phase 0 execution with all 19 cherry-picked components

