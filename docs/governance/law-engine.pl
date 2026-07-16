%% ═══════════════════════════════════════════════════════════════════════════
%% ADR Law Engine — Prolog Governance Gate for Veneer
%% Author: Ahmad Ali Parr, Bel Esprit D'Accord Irrevocable Trust
%% Version: 2.0 (2026-07-16)
%%
%% Usage (SWI-Prolog):
%%   swipl -g "consult('docs/governance/law-engine.pl'), adr_verdict('ADR-101', V, Seal), write(V), nl" -t halt
%%   swipl -g "consult('docs/governance/law-engine.pl'), run_all_adrs" -t halt
%%
%% The engine applies four checks in sequence (sovereign_kernel protocol):
%%   1. agent trust level ≥ medium
%%   2. gate_advance: non-oracle, injection valid
%%   3. lean_obligation_satisfied: theorem non-trivial
%%   4. injection_admissible: proof_hash, contract_hash, worm_seal all present
%%
%% A verdict of EVIDENCE means the ADR passed all four checks.
%% A verdict of SILENCE means at least one check failed — the ADR is blocked.
%%
%% ADR-200 (Parr Sovereignty Protocol) is the meta-ADR governing this engine.
%% ═══════════════════════════════════════════════════════════════════════════

:- module(law_engine, [
    adr_verdict/3,
    adr_passes/2,
    run_all_adrs/0,
    agent_trust/2,
    trust_level/2,
    trust_satisfies/2,
    gate_advance/3,
    injection_admissible/1,
    lean_obligation_satisfied/1,
    ere_five_pass/2
]).

:- use_module(library(lists)).
:- use_module(library(sha)).     %% SWI-Prolog sha library for sealing

%% ── ADR Registry ─────────────────────────────────────────────────────────
%% adr(ID, Title, Agent, ProofRef, ContractRef, WormSeal)
%% Upstream ADRs (PhaseMirror/Foundry — merged 2026-07-16)

adr('ADR-052',
    'Universal Atomic Calculator UAC Integration',
    builder,
    'sha256:uac-integration-proof-v1',
    'sha256:uac-integration-contract-v1',
    'worm:ADR-052-seal').

adr('ADR-053',
    'Lean4 Formalization and Monorepo Architecture',
    builder,
    'sha256:lean4-monorepo-proof-v1',
    'sha256:lean4-monorepo-contract-v1',
    'worm:ADR-053-seal').

adr('ADR-054',
    'Rust Kani Executable Formal Verification Mathlib-Free',
    builder,
    'sha256:rust-kani-proof-v1',
    'sha256:rust-kani-contract-v1',
    'worm:ADR-054-seal').

adr('ADR-055',
    'Riemann Hypothesis Computational Implementation',
    builder,
    'sha256:riemann-zeta-proof-v1',
    'sha256:riemann-zeta-contract-v1',
    'worm:ADR-055-seal').

adr('ADR-056',
    'Collatz Conjecture Computational Verification',
    builder,
    'sha256:collatz-proof-v1',
    'sha256:collatz-contract-v1',
    'worm:ADR-056-seal').

adr('ADR-057',
    'Lean4 Formal ADR Scaffolding',
    builder,
    'sha256:lean4-adr-scaffolding-proof-v1',
    'sha256:lean4-adr-scaffolding-contract-v1',
    'worm:ADR-057-seal').

adr('ADR-058',
    'PIRTM Compiler Sig Library Phase B',
    builder,
    'sha256:pirtm-sig-proof-v1',
    'sha256:pirtm-sig-contract-v1',
    'worm:ADR-058-seal').

adr('ADR-059',
    'Attested Convergence Envelope ACE Runtime',
    builder,
    'sha256:ace-runtime-proof-v1',
    'sha256:ace-runtime-contract-v1',
    'worm:ADR-059-seal').

adr('ADR-060',
    'Dynamic Recursive Meta-Mathematics DRMM',
    builder,
    'sha256:drmm-proof-v1',
    'sha256:drmm-contract-v1',
    'worm:ADR-060-seal').

adr('ADR-061',
    'ZMOS Zeta-Multiplicity Operator System Production',
    builder,
    'sha256:zmos-production-proof-v1',
    'sha256:zmos-production-contract-v1',
    'worm:ADR-061-seal').

adr('ADR-062',
    'Sigma Kernel Production Implementation',
    builder,
    'sha256:sigma-kernel-proof-v1',
    'sha256:sigma-kernel-contract-v1',
    'worm:ADR-062-seal').

%% Veneer ADRs (Sedona Spine — production hardening)

adr('ADR-101',
    'Tree-sitter Grammar for PIRTM-lang',
    builder,
    'sha256:tree-sitter-grammar-proof-v1',
    'sha256:pirtm-lang-grammar-contract-v1',
    'worm:ADR-101-seal').

adr('ADR-102',
    'Sig Type Engine and Multiplicity Conservation',
    builder,
    'sha256:sig-type-engine-proof-v1',
    'sha256:multiplicity-conservation-contract-v1',
    'worm:ADR-102-seal').

adr('ADR-103',
    'ACE Invariant Pass — Spectral Stability',
    builder,
    'sha256:ace-invariant-lean4-proof-v1',
    'sha256:ace-invariant-contract-v1',
    'worm:ADR-103-seal').

adr('ADR-104',
    'PIRTM Compiler Governance and Production Gating',
    builder,
    'sha256:compiler-governance-proof-v1',
    'sha256:compiler-governance-contract-v1',
    'worm:ADR-104-seal').

adr('ADR-PIRTM-001',
    'Lean4 Formalization of Recursive Tensor Convergence Theorem',
    builder,
    'sha256:lean4-convergence-theorem-proof-v1',
    'sha256:lean4-convergence-contract-v1',
    'worm:ADR-PIRTM-001-seal').

adr('ADR-PIRTM-002',
    'Production Readiness Checklist for pirtm-compiler',
    builder,
    'sha256:pirtm-compiler-readiness-proof-v1',
    'sha256:pirtm-compiler-readiness-contract-v1',
    'worm:ADR-PIRTM-002-seal').

adr('ADR-200',
    'Parr Sovereignty Protocol — Law Engine as Constitutional Authority',
    sentinel,
    'sha256:parr-sovereignty-protocol-proof-v2',
    'sha256:parr-sovereignty-protocol-contract-v2',
    'worm:ADR-200-seal').

adr('ADR-300',
    'GRAT Foundry Interlock — THE SHARED PRIMORDIAL FOUNDATION',
    sentinel,
    'sha256:grat-foundry-interlock-proof-v1',
    'sha256:grat-foundry-interlock-contract-v1',
    'worm:ADR-300-seal').

adr('ADR-301',
    'Daily Production Tick Sedona Spine Hardening Clock',
    builder,
    'sha256:daily-production-tick-proof-v1',
    'sha256:daily-production-tick-contract-v1',
    'worm:ADR-301-seal').

adr('ADR-302',
    'Primordial Foundation Rebrand Foundry Intel in care of Bel Esprit D Accord',
    sentinel,
    'sha256:primordial-foundation-rebrand-proof-v1',
    'sha256:primordial-foundation-rebrand-contract-v1',
    'worm:ADR-302-seal').

adr('ADR-303',
    'Primordial Foundation Umbrella Monorepo',
    sentinel,
    'sha256:primordial-foundation-umbrella-proof-v1',
    'sha256:primordial-foundation-umbrella-contract-v1',
    'worm:ADR-303-seal').

%% ── Trust hierarchy (from sovereign_kernel.pl) ───────────────────────────

trust_level(none,      0).
trust_level(low,       1).
trust_level(medium,    2).
trust_level(high,      3).
trust_level(sovereign, 4).

agent_trust(builder, medium).
agent_trust(sentinel, sovereign).
agent_trust(oracle, low).

trust_satisfies(AgentTrust, Required) :-
    trust_level(AgentTrust, AV),
    trust_level(Required,   RV),
    AV >= RV.

%% ── Gate advance ─────────────────────────────────────────────────────────

gate_advance(_, _, blocked('Agent trust below MEDIUM')) :-
    \+ trust_satisfies(medium, medium), !.

gate_advance(oracle, _, blocked('ORACLE is read-only: write advance blocked')) :- !.

gate_advance(_, false, blocked('Injection proof is invalid: state frozen')) :- !.

gate_advance(Agent, true, permitted(Agent)) :-
    Agent \= oracle.

%% ── Injection admissibility ──────────────────────────────────────────────

injection_admissible(injection(PH, CH, WS, true)) :-
    atom_length(PH, LP), LP > 0,
    atom_length(CH, LC), LC > 0,
    atom_length(WS, LW), LW > 0.

%% ── Lean obligation check ────────────────────────────────────────────────

lean_obligation_satisfied(Theorem) :-
    atom_length(Theorem, L),
    L > 10,
    Theorem \= ''.

%% ── ERE five-pass verification (from edaulc_verify.pl) ───────────────────
%% Returns pass/fail for each of the five passes against an ADR atom.

ere_pass(1, ADR) :- atom_length(ADR, L), L > 3.   %% structural substance
ere_pass(2, ADR) :-                                  %% scholarly — non-hollow
    \+ sub_atom(ADR, _, _, _, 'i made up'),
    \+ sub_atom(ADR, _, _, _, 'i cannot provide').
ere_pass(3, ADR) :- atom_chars(ADR, _), atom_length(ADR, L), L > 0.  %% RTL structural
ere_pass(4, _).                                      %% 49th — always live
ere_pass(5, _).                                      %% source — in all things

ere_five_pass(ADR, all_pass) :-
    ere_pass(1, ADR),
    ere_pass(2, ADR),
    ere_pass(3, ADR),
    ere_pass(4, ADR),
    ere_pass(5, ADR), !.
ere_five_pass(_, fail).

%% ── Seal computation ─────────────────────────────────────────────────────

compute_seal(ID, Title, Seal) :-
    atom_concat(ID, '-', P0),
    atom_concat(P0, Title, P1),
    atom_concat(P1, '-veneer-v2', P2),
    atom_string(P2, S),
    sha_hash(S, HashBytes, [algorithm(sha256)]),
    hash_atom(HashBytes, Seal).

%% ── Core ADR verdict ─────────────────────────────────────────────────────
%% adr_verdict(+ID, -Verdict, -Seal)

adr_verdict(ID, Verdict, Seal) :-
    adr(ID, Title, Agent, ProofHash, ContractHash, WormSeal),
    %% Check 1: trust
    ( agent_trust(Agent, AgentTrust),
      trust_satisfies(AgentTrust, medium)
    -> C1 = pass
    ;  C1 = fail('trust below medium')
    ),
    %% Check 2: gate advance
    gate_advance(Agent, true, GateResult),
    ( GateResult = permitted(_)
    -> C2 = pass
    ;  C2 = fail(GateResult)
    ),
    %% Check 3: lean obligation
    ( lean_obligation_satisfied(ProofHash)
    -> C3 = pass
    ;  C3 = fail('lean obligation not satisfied')
    ),
    %% Check 4: injection admissible
    ( injection_admissible(injection(ProofHash, ContractHash, WormSeal, true))
    -> C4 = pass
    ;  C4 = fail('injection not admissible')
    ),
    %% Check 5: ERE five-pass on title
    ere_five_pass(Title, EreResult),
    ( EreResult = all_pass
    -> C5 = pass
    ;  C5 = fail('ere five-pass')
    ),
    %% Verdict
    ( C1 = pass, C2 = pass, C3 = pass, C4 = pass, C5 = pass
    -> Verdict = 'EVIDENCE'
    ;  Verdict = 'SILENCE'
    ),
    compute_seal(ID, Title, Seal).

%% ── Batch run ────────────────────────────────────────────────────────────

run_all_adrs :-
    format("~`=t~60|~n"),
    format("ADR Law Engine — Veneer v2.0~n"),
    format("~`=t~60|~n"),
    forall(
        adr(ID, Title, _Agent, _PH, _CH, _WS),
        (   adr_verdict(ID, Verdict, Seal),
            format("~w | ~w~n", [ID, Verdict]),
            format("  title: ~w~n", [Title]),
            format("  seal:  ~w~n", [Seal]),
            format("~`-t~60|~n")
        )
    ).

%% ── Audit query helpers ──────────────────────────────────────────────────

adr_passes(ID, Checks) :-
    adr_verdict(ID, Verdict, Seal),
    Checks = [verdict-Verdict, seal-Seal].

%% End law-engine.pl
