#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()

function fail(message) {
  console.error(`PIRTM artifact check failed: ${message}`)
  process.exit(1)
}

function read(path) {
  const full = join(root, path)
  if (!existsSync(full)) fail(`missing ${path}`)
  return readFileSync(full, 'utf8')
}

const required = [
  'pirtm_rs/Cargo.toml',
  'pirtm_rs/src/lib.rs',
  'pirtm_rs/src/main.rs',
  'pirtm_rs/src/rta.rs',
  'pirtm_rs/src/gates.rs',
  'pirtm_rs/src/uac_loss.rs',
  'pirtm_rs/tests/sovereign_pipeline.rs',
  'lean-substrate/src/Core.lean',
  'lean-substrate/src/Core/PARM.lean',
  'lean-substrate/src/ADR.lean',
  'lean-substrate/src/ADR/PhaseMirror.lean'
]

for (const path of required) read(path)

const cargo = read('pirtm_rs/Cargo.toml')
if (!/name\s*=\s*"pirtm_rs"/.test(cargo)) fail('Cargo package name must be pirtm_rs')

for (const path of [
  'pirtm_rs/src/rta.rs',
  'pirtm_rs/src/gates.rs',
  'pirtm_rs/src/uac_loss.rs',
  'pirtm_rs/src/main.rs',
  'pirtm_rs/tests/sovereign_pipeline.rs'
]) {
  const source = read(path)
  if (/\b(todo!|unimplemented!|dbg!)\b/.test(source)) fail(`${path} contains development macro`)
}

for (const path of [
  'lean-substrate/src/Core/PARM.lean',
  'lean-substrate/src/ADR/PhaseMirror.lean'
]) {
  const source = read(path)
  if (/\bsorry\b/.test(source)) fail(`${path} contains Lean placeholder token`)
  if (/\baxiom\b/.test(source)) fail(`${path} contains axiom token`)
}

const parm = read('lean-substrate/src/Core/PARM.lean')
if (!/theorem sealed_state_pos/.test(parm)) fail('Core/PARM.lean missing sealed_state_pos theorem')
if (!/theorem sealed_state_loop_pos/.test(parm)) fail('Core/PARM.lean missing sealed_state_loop_pos theorem')

const phaseMirror = read('lean-substrate/src/ADR/PhaseMirror.lean')
if (!/theorem step_preserves/.test(phaseMirror)) fail('PhaseMirror.lean missing step_preserves theorem')
if (!/theorem alp_preserves_rta/.test(phaseMirror)) fail('PhaseMirror.lean missing alp_preserves_rta theorem')
if (!/theorem cnl_evaluation_deterministic/.test(phaseMirror)) fail('PhaseMirror.lean missing deterministic CNL theorem')

console.log('PIRTM artifact check passed')
