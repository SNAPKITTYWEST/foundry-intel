%% ═══════════════════════════════════════════════════════════════════════════
%% ADR Loop — SnapKitty Production Hardening Feedback Circuit
%% Author: Ahmad Ali Parr, Bel Esprit D'Accord Irrevocable Trust
%% Version: 1.0 (2026-07-16)
%%
%% This module extends law-engine.pl with a self-feeding ADR loop:
%%
%%   EVIDENCE verdicts → new Datalog EDB facts (expansion_eligible/1)
%%   → expanded proof surface → law engine re-evaluates with wider context
%%
%% Usage:
%%   swipl -g "consult('docs/governance/law-engine.pl'),
%%             consult('docs/governance/adr-loop.pl'),
%%             run_adr_loop" -t halt
%%
%% The feedback circuit runs until fixpoint: no new expansion_eligible facts
%% are produced in a round (convergence under the Banach contractivity bound).
%% ═══════════════════════════════════════════════════════════════════════════

:- module(adr_loop, [
    run_adr_loop/0,
    expansion_eligible/1,
    loop_round/2,
    loop_until_fixpoint/1,
    adr_loop_status/1,
    prior_art_linked/2,
    grat_corpus_asset/2,
    synth_gate_expanded/2
]).

:- use_module('law-engine').
:- use_module(library(lists)).
:- use_module(library(aggregate)).

%% ── GRAT Corpus — THE SHARED PRIMORDIAL FOUNDATION ───────────────────────────
%% grat_corpus_asset(AssetID, Description)
%% Assets held by THE SHARED PRIMORDIAL FOUNDATION (EIN 42-6976431) that
%% constitute prior art for Veneer ADRs.

grat_corpus_asset('GRAT-ASSET-001', 'Foundry F1 Source Code — 10-layer Sedona Spine').
grat_corpus_asset('GRAT-ASSET-002', 'Formal Proofs — Boole (DOI:10.5281/zenodo.21268911)').
grat_corpus_asset('GRAT-ASSET-003', 'Formal Proofs — GKN I4 degree-4 homogeneity').
grat_corpus_asset('GRAT-ASSET-004', 'Formal Proofs — E7 generator symmetries on FTS56').
grat_corpus_asset('GRAT-ASSET-005', 'Sorry Engine Tooling — sledgehammer.py + roster_sweep.py').
grat_corpus_asset('GRAT-ASSET-006', 'ALP Closures — 13 sorry closures with prior art timestamps').
grat_corpus_asset('GRAT-ASSET-007', 'WORM Audit Chain — append-only SHA-256/Ed25519').
grat_corpus_asset('GRAT-ASSET-008', 'Prior Art Anchor — DEVFLOW-FINANCE 2026-04-14').
grat_corpus_asset('GRAT-ASSET-009', 'QuantumPartitionBridge.lean — Legendre duality, zero sorry').
grat_corpus_asset('GRAT-ASSET-010', 'RiemannMetatron.lean — zeta structural facts, zero sorry').
grat_corpus_asset('GRAT-ASSET-011', 'Foundry Intel Governance Hub — Primordial Foundation transition spine').

%% ── Prior Art Links — ADR ↔ External Citations ───────────────────────────────
%% prior_art_linked(ADR_ID, CitationKey)

prior_art_linked('ADR-052', 'bakalov2001').
prior_art_linked('ADR-052', 'drinfeld1987').
prior_art_linked('ADR-052', 'freedman2002').
prior_art_linked('ADR-052', 'thermal.axiom').
prior_art_linked('ADR-052', 'entropy.axiom').
prior_art_linked('ADR-052', 'GRAT-ASSET-009').  % QuantumPartitionBridge

prior_art_linked('ADR-053', 'lean4-demoura2021').
prior_art_linked('ADR-053', 'GRAT-ASSET-003').  % GKN I4 corpus

prior_art_linked('ADR-054', 'kani-verifier').
prior_art_linked('ADR-054', 'GRAT-ASSET-005').  % Sorry Engine

prior_art_linked('ADR-055', 'odlyzko1988').
prior_art_linked('ADR-055', 'titchmarsh1986').
prior_art_linked('ADR-055', 'backlund1914').
prior_art_linked('ADR-055', 'GRAT-ASSET-010'). % RiemannMetatron
prior_art_linked('ADR-055', 'doi:10.5281/zenodo.21268911').

prior_art_linked('ADR-058', 'bernstein1997').
prior_art_linked('ADR-058', 'GRAT-ASSET-008').  % DEVFLOW-FINANCE anchor

prior_art_linked('ADR-059', 'dawson2005').
prior_art_linked('ADR-059', 'banach1922').
prior_art_linked('ADR-059', 'thermal.axiom').

prior_art_linked('ADR-060', 'aaronson2016').
prior_art_linked('ADR-060', 'banach1922').
prior_art_linked('ADR-060', 'GRAT-ASSET-002').  % Boole proof

prior_art_linked('ADR-061', 'bakalov2001').
prior_art_linked('ADR-061', 'drinfeld1987').
prior_art_linked('ADR-061', 'freedman2002').
prior_art_linked('ADR-061', 'turaev1992').
prior_art_linked('ADR-061', 'doi:10.5281/zenodo.19068826').  % UOR

prior_art_linked('ADR-062', 'banach1922').
prior_art_linked('ADR-062', 'entropy.axiom').
prior_art_linked('ADR-062', 'rudin1976').

prior_art_linked('ADR-200', 'banach1922').
prior_art_linked('ADR-200', 'GRAT-ASSET-007').  % WORM Audit Chain
prior_art_linked('ADR-300', 'GRAT-ASSET-001').
prior_art_linked('ADR-300', 'GRAT-ASSET-008').
prior_art_linked('ADR-301', 'GRAT-ASSET-007').  % WORM Audit Chain
prior_art_linked('ADR-301', 'ADR-200').
prior_art_linked('ADR-301', 'ADR-300').
prior_art_linked('ADR-302', 'GRAT-ASSET-011').  % Foundry Intel transition spine
prior_art_linked('ADR-302', 'ADR-200').
prior_art_linked('ADR-302', 'ADR-300').
prior_art_linked('ADR-302', 'ADR-301').

%% ── Expansion Eligibility (Datalog EDB) ─────────────────────────────────────
%% expansion_eligible(ID) is asserted dynamically by the loop when an ADR
%% receives an EVIDENCE verdict. This expands the proof surface available
%% for the next round of verification.

:- dynamic expansion_eligible/1.

%% Mark an ADR as eligible for proof-surface expansion
assert_expansion(ID) :-
    ( expansion_eligible(ID) -> true ; assertz(expansion_eligible(ID)) ).

%% ── Synth Gate Expansion ─────────────────────────────────────────────────────
%% synth_gate_expanded(ADR_ID, SynthConstraint)
%% An expansion-eligible ADR unlocks additional SYNTH constraint checks
%% in the next feedback round.

synth_gate_expanded(ID, synth_prior_art_verified) :-
    expansion_eligible(ID),
    prior_art_linked(ID, _).

synth_gate_expanded(ID, synth_grat_corpus_anchored) :-
    expansion_eligible(ID),
    prior_art_linked(ID, GratAsset),
    grat_corpus_asset(GratAsset, _).

synth_gate_expanded(ID, synth_cross_reference_closed) :-
    expansion_eligible(ID),
    prior_art_linked(ID, _),
    % ADR is cross-referenced from another expanded ADR
    prior_art_linked(Other, ID),
    expansion_eligible(Other),
    Other \= ID.

%% ── Loop Round ───────────────────────────────────────────────────────────────
%% loop_round(+RoundN, -NewCount)
%% Run one round of the feedback circuit.
%% Returns the number of newly expansion-eligible ADRs.

loop_round(RoundN, NewCount) :-
    format("~n[ADR Loop — Round ~w]~n", [RoundN]),
    format("~`-t~60|~n"),
    %% Collect all ADRs not yet expansion-eligible
    findall(ID,
            ( adr(ID, _, _, _, _, _),
              \+ expansion_eligible(ID) ),
            Candidates),
    %% Run law engine on each candidate
    foldl(evaluate_candidate, Candidates, 0, NewCount),
    format("  Round ~w complete — ~w new EVIDENCE ADRs expansion-eligible~n", [RoundN, NewCount]).

evaluate_candidate(ID, Acc, NewAcc) :-
    ( adr_verdict(ID, 'EVIDENCE', Seal) ->
        assert_expansion(ID),
        format("  EVIDENCE  ~w  (seal: ~w)~n", [ID, Seal]),
        NewAcc is Acc + 1
    ;   format("  SILENCE   ~w~n", [ID]),
        NewAcc = Acc
    ).

%% ── Fixpoint Loop ─────────────────────────────────────────────────────────────
%% loop_until_fixpoint(-TotalRounds)
%% Run rounds until no new expansion-eligible ADRs in a round (fixpoint).
%% Bounded by 20 rounds as a safety ceiling (Banach contractivity: must converge).

loop_until_fixpoint(Rounds) :-
    loop_until_fixpoint_(1, Rounds).

loop_until_fixpoint_(Round, Round) :-
    loop_round(Round, 0), !.    % fixpoint: no new EVIDENCE
loop_until_fixpoint_(Round, Total) :-
    loop_round(Round, N),
    N > 0,
    ( Round < 20 ->
        Next is Round + 1,
        loop_until_fixpoint_(Next, Total)
    ;   format("  [WARN] Loop ceiling 20 rounds reached — manual inspection required~n"),
        Total = Round
    ).

%% ── Synth Expansion Report ───────────────────────────────────────────────────

report_synth_expansions :-
    format("~n[SYNTH Gate Expansions]~n"),
    format("~`-t~60|~n"),
    forall(
        ( expansion_eligible(ID),
          synth_gate_expanded(ID, Gate) ),
        format("  ~w → ~w~n", [ID, Gate])
    ).

%% ── Status ───────────────────────────────────────────────────────────────────

adr_loop_status(Status) :-
    aggregate_all(count, expansion_eligible(_), N),
    aggregate_all(count, adr(_, _, _, _, _, _), Total),
    ( N =:= Total -> Converged = full ; Converged = partial ),
    Status = adr_loop_status{
        expansion_eligible: N,
        total_adrs: Total,
        convergence: Converged
    }.

%% ── Top-Level Entry Point ─────────────────────────────────────────────────────

run_adr_loop :-
    format("~`=t~60|~n"),
    format("SnapKitty ADR Loop — Production Hardening Feedback Circuit~n"),
    format("Governed by ADR-200 (Parr Sovereignty Protocol)~n"),
    format("GRAT: THE SHARED PRIMORDIAL FOUNDATION (EIN 42-6976431)~n"),
    format("~`=t~60|~n"),
    loop_until_fixpoint(Rounds),
    report_synth_expansions,
    format("~n[Loop Converged — ~w rounds]~n", [Rounds]),
    adr_loop_status(S),
    format("  expansion_eligible: ~w / ~w~n", [S.expansion_eligible, S.total_adrs]),
    format("  convergence: ~w~n", [S.convergence]),
    format("~`=t~60|~n~n").

%% End adr-loop.pl
