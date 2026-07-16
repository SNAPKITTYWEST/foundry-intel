#!/usr/bin/env node
import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

const trapPath = 'docs/protocols/phase-mirror-force-invoke.trap'

function read(root, path) {
  const full = join(root, path)
  if (!existsSync(full)) throw new Error(`missing ${path}`)
  return readFileSync(full, 'utf8')
}

function normalize(source) {
  return source.replace(/\r\n/g, '\n').trim()
}

export function evaluatePhaseMirrorForceInvoke(options = {}) {
  const root = options.root ?? process.cwd()
  const violations = []
  let source = ''

  try {
    source = normalize(read(root, trapPath))
  } catch (error) {
    return {
      status: 'FORCE_INVOKE_FAILED',
      trapPath,
      regression: 'UNREADABLE',
      checksum: null,
      finalRegister: null,
      violations: [error.message]
    }
  }

  const requiredLines = [
    'PHASE-MIRROR-FORCE-INVOKE-TRAP v1',
    'DO %1 <- #1',
    'PLEASE DO ,1 SUB #1 <- #51',
    'DO COME FROM (1)',
    'PLEASE DO (2) NEXT',
    'DO (1) NEXT',
    'NOTE --- THE TRAP GATE IS ACTIVE ---',
    'NOTE --- TO PASS, YOU MUST NAVIGATE THE REGRESSION ---',
    'DO COME FROM (3)',
    'DO NOT GIVE UP',
    'DO NOT PLEASE FORGIVE ME',
    'DO %1 <- #0',
    'PLEASE RESUME #1',
    '(2) DO NOT OBJURGATE',
    'PLEASE READ OUT ,1',
    'PLEASE COME FROM (2)',
    'DO (3) NEXT'
  ]

  for (const line of requiredLines) {
    if (!source.includes(line)) violations.push(`${trapPath}: missing trap line: ${line}`)
  }

  for (const label of ['(1)', '(2)', '(3)']) {
    if (!source.includes(label)) violations.push(`${trapPath}: missing regression label ${label}`)
  }

  const assignments = [...source.matchAll(/^DO %1 <- #(\d+)$/gm)].map((match) => Number(match[1]))
  const finalRegister = assignments.at(-1) ?? null
  if (assignments[0] !== 1) violations.push(`${trapPath}: %1 must open at #1`)
  if (finalRegister !== 0) violations.push(`${trapPath}: %1 must close at #0`)

  const readOuts = [...source.matchAll(/PLEASE READ OUT ,1/g)].length
  if (readOuts !== 1) violations.push(`${trapPath}: trap must read out exactly once`)

  const comeFroms = [...source.matchAll(/COME FROM/g)].length
  if (comeFroms < 3) violations.push(`${trapPath}: regression must keep at least three COME FROM edges`)

  const checksum = createHash('sha256').update(source).digest('hex').slice(0, 16)

  return {
    status: violations.length > 0 ? 'FORCE_INVOKE_FAILED' : 'FORCE_INVOKED_TRAP_ACTIVE',
    trapPath,
    regression: violations.length > 0 ? 'FAILED' : 'NAVIGATED',
    checksum,
    finalRegister,
    violations
  }
}

function print(result) {
  console.log('# Phase Mirror Force Invoke')
  console.log('')
  console.log(`status=${result.status}`)
  console.log(`regression=${result.regression}`)
  console.log(`trap=${result.trapPath}`)
  console.log(`checksum=${result.checksum}`)
  console.log(`final_register=${result.finalRegister}`)
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const result = evaluatePhaseMirrorForceInvoke()
  print(result)
  if (result.violations.length > 0) {
    for (const violation of result.violations) console.error(`phase mirror force invoke violation: ${violation}`)
    process.exit(1)
  }
}
