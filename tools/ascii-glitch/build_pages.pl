% Copyright © 2026 SnapKitty Collective LLC. All rights reserved.
% Licensed under Business Source License 2.0 (BSL-2.0).
% Change Date: December 31, 2027 — after which, licensed under AGPL-3.0-only.
% See LICENSE for complete terms.

:- use_module(library(http/json)).
:- use_module(library(readutil)).
:- use_module(library(filesex)).

main :-
    current_prolog_flag(argv, Args),
    ( member('--check', Args) -> Mode = check ; Mode = write ),
    sync_wasm_pages(Mode),
    validate_static_pages,
    ( Mode = check ->
        writeln('pages check passed')
    ;   writeln('pages built')
    ).

validate_static_pages :-
    require_contains('docs/pages/index.html', 'THE SHARED PRIMORDIAL FOUNDATION'),
    require_contains('docs/pages/index.html', 'Before The Architecture'),
    require_contains('docs/pages/index.html', 'The Story Of This Repository'),
    require_contains('docs/pages/index.html', 'Why Contribute?'),
    require_contains('docs/pages/index.html', 'Talk To BOB About This Repository'),
    require_contains('docs/pages/index.html', 'DEVFLOW-FINANCE 2026-04-14'),
    require_contains('docs/pages/index.html', 'bob-chat.mjs'),
    require_contains('docs/pages/index.html', 'vllm-language-index.json'),
    require_contains('docs/pages/index.html', 'WASM Gate'),
    require_contains('docs/pages/index.html', 'OPEN_CRUX'),
    require_contains('docs/pages/index.html', 'SILENCE_PENDING'),
    require_contains('docs/pages/assets/bob-chat.mjs', 'streamVllm'),
    require_contains('docs/pages/llm/vllm-language-index.json', 'SPF-VLLM-LANGUAGE-INDEX-20260716'),
    require_contains('docs/pages/wasm/index.html', 'WASM Gate'),
    require_contains('docs/pages/assets/backend-glitch.css', '.story-grid'),
    require_contains('docs/pages/assets/backend-glitch.css', '.story-card'),
    require_contains('docs/pages/backend-ascii.txt', 'BACKEND ASCII GLITCH'),
    require_contains('docs/pages/backend-ascii.txt', 'THE SHARED PRIMORDIAL FOUNDATION'),
    require_contains('docs/pages/backend-ascii.txt', 'OPEN_CRUX'),
    require_contains('docs/pages/backend-ascii.txt', 'SILENCE_PENDING').

require_contains(Path, Needle) :-
    ( exists_file(Path) ->
        read_file_to_string(Path, Content, [encoding(utf8)]),
        ( sub_string(Content, _, _, _, Needle) ->
            true
        ;   format(user_error, 'pages check failed: marker missing~n  ~w~n  ~w~n', [Path, Needle]),
            halt(1)
        )
    ;   format(user_error, 'pages check failed: file missing~n  ~w~n', [Path]),
        halt(1)
    ).

read_json_dict(Path, Dict) :-
    setup_call_cleanup(
        open(Path, read, Stream, [encoding(utf8)]),
        json_read_dict(Stream, Dict),
        close(Stream)
    ).

q5_status(Q5, Id, Status) :-
    member(Record, Q5.records),
    text_string(Record.id, RecordId),
    text_string(Id, ExpectedId),
    RecordId = ExpectedId,
    Status = Record.status.

text_string(Value, Text) :-
    string(Value), !,
    Text = Value.
text_string(Value, Text) :-
    atom(Value), !,
    atom_string(Value, Text).
text_string(Value, Text) :-
    number(Value), !,
    number_string(Value, Text).

wasm_artifact(Wasm, File, Artifact) :-
    text_string(File, Expected),
    member(Artifact, Wasm.artifacts),
    text_string(Artifact.file, Actual),
    Actual = Expected.

wasm_summary(Wasm, Summary) :-
    wasm_artifact(Wasm, 'foundation.wasm', Artifact),
    text_string(Artifact.sha256, Sha),
    text_string(Wasm.tests, Tests),
    sub_string(Sha, 0, 12, _, ShortSha),
    format(string(Summary), 'foundation.wasm / ~w bytes / ~s / ~s',
           [Artifact.bytes, ShortSha, Tests]).

fit(Value, Width, Fitted) :-
    text_string(Value, Text),
    string_length(Text, Len),
    ( Len > Width ->
        PrefixLen is Width - 3,
        sub_string(Text, 0, PrefixLen, _, Prefix),
        string_concat(Prefix, '...', Short)
    ;   Short = Text
    ),
    string_length(Short, ShortLen),
    PadLen is Width - ShortLen,
    length(Pads, PadLen),
    maplist(=(' '), Pads),
    string_chars(Pad, Pads),
    string_concat(Short, Pad, Fitted).

block_row(Left, Right, Row) :-
    fit(Left, 31, L),
    fit(Right, 32, R),
    format(string(Row), '| ~w | ~w |', [L, R]).

ascii_page(Connector, Q5, Wasm, Adr055, Adr062, Ascii) :-
    text_string(Adr055, Adr055Text),
    text_string(Adr062, Adr062Text),
    wasm_summary(Wasm, WasmStatus),
    block_row(repo, Connector.repos.foundry_intel.repo, RepoRow),
    block_row(branch, Connector.repos.foundry_intel.branch, BranchRow),
    block_row(connector, Connector.status, ConnectorRow),
    block_row(pages, Connector.pages.status, PagesRow),
    block_row('WASM', WasmStatus, WasmRow),
    block_row(rebrand, Connector.rebrand.status, RebrandRow),
    block_row('governing ADR', Connector.rebrand.governing_adr, GoverningRow),
    block_row('Q(phi) total', Q5.q5_total, Q5Row),
    block_row('ADR-055', Adr055, Adr055Row),
    block_row('ADR-062', Adr062, Adr062Row),
    format(string(WasmLine), '  WASM = ~s', [WasmStatus]),
    format(string(Adr055Line), '  ADR-055 = ~s', [Adr055Text]),
    format(string(Adr062Line), '  ADR-062 = ~s', [Adr062Text]),
    atomic_list_concat([
        '/* FOUNDRY INTEL :: BACKEND ASCII GLITCH PAGE */',
        '/* Generated by tools/ascii-glitch/build_pages.pl */',
        '',
        '+------------------------------------------------------------------------+',
        '| THE SHARED PRIMORDIAL FOUNDATION                                       |',
        '| Foundry Intel, in care of Bel Esprit D''Accord                         |',
        '+-------------------------------+----------------------------------------+',
        RepoRow,
        BranchRow,
        ConnectorRow,
        PagesRow,
        WasmRow,
        RebrandRow,
        GoverningRow,
        Q5Row,
        Adr055Row,
        Adr062Row,
        '+-------------------------------+----------------------------------------+',
        '',
        'GKN-LEAN-LATCH     >>== theorem anchors ==>>',
        '       ||',
        '       \\\\/',
        '[ FOUNDRY-INTEL ] -- ADR -- XML -- WORM -- BOB -- PAGES -- WASM',
        '       /\\\\',
        '       ||',
        'FOUNDRY-F1-RT      <<== runtime evidence ==<<',
        '',
        '   .--.      .--.      .--.      .--.      .--.',
        '  /_00_\\____/_01_\\____/_02_\\____/_03_\\____/_04_\\',
        '  \\____/    \\____/    \\____/    \\____/    \\____/',
        '     | SOURCE | DATALOG | LEAN | TRUST | WORM |',
        '   .--.      .--.      .--.      .--.      .--.',
        '  /_05_\\____/_06_\\____/_07_\\____/_08_\\____/_09_\\',
        '  \\____/    \\____/    \\____/    \\____/    \\____/',
        '     | BOB | METATRON | PROBE | LH | ADR-301 |',
        '',
        'glitch discipline:',
        '  0000 evidence enters       1111 silence blocks',
        '  0101 open crux stays open  1010 WORM stays append-only',
        '  0110 pages render static   1001 frontend docked live',
        '  1100 wasm mirror sealed    0011 manifest hashes checked',
        '',
        'do not promote:',
        WasmLine,
        Adr055Line,
        Adr062Line,
        '  Q(phi) = metadata, not proof',
        '',
        'end transmission.'
    ], '\n', Ascii).

css_page(Css) :-
    atomic_list_concat([
        ':root {',
        '  color-scheme: dark;',
        '  --ink: #f4f1de;',
        '  --muted: #9fb3c8;',
        '  --line: #314155;',
        '  --panel: #10161d;',
        '  --panel-2: #141b24;',
        '  --bg: #080b10;',
        '  --amber: #f2b84b;',
        '  --cyan: #4dd8c8;',
        '  --rose: #ff5f73;',
        '  --green: #8bd17c;',
        '}',
        '',
        '* { box-sizing: border-box; }',
        'html { min-height: 100%; background: var(--bg); }',
        'body {',
        '  margin: 0;',
        '  min-height: 100%;',
        '  color: var(--ink);',
        '  background: #080b10;',
        '  font: 15px/1.55 ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace;',
        '}',
        'body::before {',
        '  content: "";',
        '  position: fixed;',
        '  inset: 0;',
        '  pointer-events: none;',
        '  opacity: 0.18;',
        '  background-image: repeating-linear-gradient(0deg, transparent 0 7px, #ffffff 8px);',
        '}',
        '',
        '.shell { width: min(1120px, calc(100vw - 32px)); margin: 0 auto; padding: 32px 0 48px; }',
        '.topline { display: flex; justify-content: space-between; gap: 16px; color: var(--muted); }',
        '.stamp { color: var(--green); }',
        'h1 { margin: 18px 0 8px; font-size: clamp(2rem, 7vw, 5rem); line-height: 0.95; letter-spacing: 0; }',
        '.subtitle { max-width: 820px; color: var(--muted); font-size: 1rem; }',
        '.grid { display: grid; grid-template-columns: minmax(0, 1.25fr) minmax(280px, 0.75fr); gap: 18px; margin-top: 26px; }',
        '.panel { border: 1px solid var(--line); background: var(--panel); border-radius: 8px; overflow: hidden; }',
        '.panel h2 { margin: 0; padding: 12px 14px; color: var(--amber); font-size: 0.9rem; border-bottom: 1px solid var(--line); background: var(--panel-2); }',
        'pre { margin: 0; padding: 16px; overflow: auto; min-height: 420px; color: var(--cyan); text-shadow: 1px 0 var(--rose); }',
        '.map { width: 100%; display: block; background: #0c1117; }',
        '.facts { display: grid; grid-template-columns: 1fr; gap: 0; }',
        '.fact { display: flex; justify-content: space-between; gap: 14px; padding: 12px 14px; border-top: 1px solid var(--line); }',
        '.fact:first-child { border-top: 0; }',
        '.fact b { color: var(--ink); }',
        '.fact span { color: var(--muted); text-align: right; overflow-wrap: anywhere; }',
        '.route { margin-top: 18px; border: 1px solid var(--line); border-radius: 8px; background: #0d131a; padding: 14px; color: var(--muted); }',
        '.route strong { color: var(--green); }',
        '.route a { color: var(--cyan); text-decoration: none; border-bottom: 1px solid color-mix(in srgb, var(--cyan), transparent 50%); }',
        '@media (max-width: 840px) {',
        '  .topline { flex-direction: column; }',
        '  .grid { grid-template-columns: 1fr; }',
        '  h1 { font-size: 2.25rem; }',
        '  pre { min-height: 300px; }',
        '}'
    ], '\n', Css).

html_page(Connector, Q5, Wasm, Adr055, Adr062, Ascii, Html) :-
    escape_html(Connector.repos.foundry_intel.repo, Repo),
    escape_html(Connector.status, ConnectorStatus),
    escape_html(Connector.rebrand.status, RebrandStatus),
    escape_html(Q5.q5_total, Q5Total),
    escape_html(Connector.rebrand.governing_adr, RebrandAdr),
    escape_html(Connector.handoff.status, HandoffStatus),
    wasm_summary(Wasm, WasmSummary),
    escape_html(WasmSummary, WasmSummarySafe),
    escape_html(Ascii, SafeAscii),
    format(string(TopRepo), '      <span>~s</span>', [Repo]),
    format(string(TopStamp), '      <span class="stamp">~s / ~s</span>', [ConnectorStatus, RebrandStatus]),
    format(string(PreBlock), '        <pre>~s</pre>', [SafeAscii]),
    format(string(Q5Fact), '          <div class="fact"><b>Q(phi)</b><span>~s</span></div>', [Q5Total]),
    format(string(Adr055Fact), '          <div class="fact"><b>ADR-055</b><span>~s</span></div>', [Adr055]),
    format(string(Adr062Fact), '          <div class="fact"><b>ADR-062</b><span>~s</span></div>', [Adr062]),
    format(string(RebrandFact), '          <div class="fact"><b>rebrand</b><span>~s</span></div>', [RebrandAdr]),
    format(string(HandoffFact), '          <div class="fact"><b>handoff</b><span>~s</span></div>', [HandoffStatus]),
    format(string(WasmFact), '          <div class="fact"><b>wasm</b><span>~s</span></div>', [WasmSummarySafe]),
    atomic_list_concat([
        '<!doctype html>',
        '<html lang="en">',
        '<head>',
        '  <meta charset="utf-8">',
        '  <meta name="viewport" content="width=device-width, initial-scale=1">',
        '  <title>Primordial Foundation Backend ASCII + WASM</title>',
        '  <meta name="description" content="Static backend ASCII/glitch page and WASM frontend ingress for Foundry Intel governance and Primordial Foundation transition.">',
        '  <link rel="stylesheet" href="assets/backend-glitch.css">',
        '</head>',
        '<body>',
        '  <main class="shell">',
        '    <div class="topline">',
        TopRepo,
        TopStamp,
        '    </div>',
        '    <h1>Backend ASCII Glitch</h1>',
        '    <p class="subtitle">Static Pages surface for the Foundry Intel governance hub. It renders the backend trust spine, connector state, open-crux boundaries, and the docked WASM frontend ingress.</p>',
        '    <section class="grid" aria-label="Backend page surface">',
        '      <div class="panel">',
        '        <h2>terminal signal</h2>',
        PreBlock,
        '      </div>',
        '      <aside class="panel">',
        '        <h2>connector facts</h2>',
        '        <div class="facts">',
        Q5Fact,
        Adr055Fact,
        Adr062Fact,
        WasmFact,
        RebrandFact,
        HandoffFact,
        '        </div>',
        '        <img class="map" src="../brand/foundry-intel-operating-map.svg" alt="Foundry Intel operating map">',
        '      </aside>',
        '    </section>',
        '    <div class="route"><strong>route:</strong> GKN Lean latch -&gt; Foundry Intel ADR/Q(phi)/XML/WORM/BOB -&gt; <a href="wasm/index.html">WASM frontend</a> -&gt; Foundry F1 receiver -&gt; evidence returns before claims become final.</div>',
        '  </main>',
        '</body>',
        '</html>'
    ], '\n', Html).

escape_html(Value, Escaped) :-
    text_string(Value, Text),
    split_string(Text, '&', '', A),
    atomic_list_concat(A, '&amp;', A1),
    split_string(A1, '<', '', B),
    atomic_list_concat(B, '&lt;', B1),
    split_string(B1, '>', '', C),
    atomic_list_concat(C, '&gt;', C1),
    split_string(C1, '"', '', D),
    atomic_list_concat(D, '&quot;', EscapedAtom),
    atom_string(EscapedAtom, Escaped).

write_generated(Mode, Path, Content) :-
    string_concat(Content, '\n', Normalized),
    ( Mode = check ->
        ( exists_file(Path) ->
            read_file_to_string(Path, Existing, [encoding(utf8)]),
            ( Existing = Normalized ->
                true
            ;   format(user_error, 'pages check failed: generated file is stale~n  ~w~n', [Path]),
                halt(1)
            )
        ;   format(user_error, 'pages check failed: generated file is missing~n  ~w~n', [Path]),
            halt(1)
        )
    ;   file_directory_name(Path, Dir),
        make_directory_path(Dir),
        setup_call_cleanup(
            open(Path, write, Stream, [encoding(utf8)]),
            write(Stream, Normalized),
            close(Stream)
        )
    ).

wasm_page_file('foundation.wasm').
wasm_page_file('loader.mjs').
wasm_page_file('manifest.json').

sync_wasm_pages(Mode) :-
    forall(wasm_page_file(File), sync_wasm_file(Mode, File)).

sync_wasm_file(write, File) :-
    wasm_paths(File, Src, Dst),
    ( exists_file(Src) ->
        file_directory_name(Dst, Dir),
        make_directory_path(Dir),
        copy_file(Src, Dst)
    ;   format(user_error, 'pages build failed: missing WASM source artifact~n  ~w~n', [Src]),
        halt(1)
    ).
sync_wasm_file(check, File) :-
    wasm_paths(File, Src, Dst),
    ( exists_file(Src), exists_file(Dst) ->
        read_binary_file(Src, SrcBytes),
        read_binary_file(Dst, DstBytes),
        ( SrcBytes = DstBytes ->
            true
        ;   format(user_error, 'pages check failed: WASM artifact is stale~n  ~w~n', [Dst]),
            halt(1)
        )
    ;   format(user_error, 'pages check failed: missing WASM page artifact~n  ~w~n', [Dst]),
        halt(1)
    ).

wasm_paths(File, Src, Dst) :-
    format(string(Src), 'apps/wasm-frontend/dist/~s', [File]),
    format(string(Dst), 'docs/pages/wasm/~s', [File]).

read_binary_file(Path, Codes) :-
    setup_call_cleanup(
        open(Path, read, Stream, [type(binary)]),
        read_stream_to_codes(Stream, Codes),
        close(Stream)
    ).
