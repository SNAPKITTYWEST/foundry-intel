:- use_module(library(http/json)).
:- use_module(library(filesex)).
:- use_module(library(process)).
:- use_module(library(readutil)).
:- use_module(library(sha)).

main :-
    current_prolog_flag(argv, Args),
    ( member('--check', Args) -> check_manifest ; build_frontend ).

build_frontend :-
    make_directory_path('dist'),
    compile_wasm,
    copy_file('src/loader.mjs', 'dist/loader.mjs'),
    copy_file('index.html', 'dist/index.html'),
    artifact('dist/foundation.wasm', Wasm),
    artifact('dist/loader.mjs', Loader),
    artifact('dist/index.html', Html),
    Manifest = _{
        name: "foundry-intel-wasm-frontend",
        version: "2.0.0",
        built: "deterministic-build_wasm.pl",
        entry: "index.html",
        artifacts: [Wasm, Loader, Html],
        constants: _{
            'TAU_R': 47.06998778,
            'CYCLE_108': 108,
            'RH_STATUS': "none"
        },
        open_crux: _{
            'ADR-055': "OPEN_CRUX - RH unproven",
            'ADR-062': "SILENCE_PENDING - Sigma Kernel Lean stubs incomplete"
        }
    },
    setup_call_cleanup(
        open('dist/manifest.json', write, Stream, [encoding(utf8)]),
        json_write_dict(Stream, Manifest, [width(128)]),
        close(Stream)
    ),
    nl,
    writeln('WASM frontend build complete'),
    format('  dist/foundation.wasm  ~w bytes~n', [Wasm.bytes]),
    format('  dist/loader.mjs       ~w bytes~n', [Loader.bytes]),
    format('  dist/index.html       ~w bytes~n', [Html.bytes]),
    writeln('  dist/manifest.json    written').

compile_wasm :-
    asc_script(Asc),
    process_create(
        path(node),
        [
            Asc,
            'assembly/foundation.ts',
            '--outFile', 'dist/foundation.wasm',
            '--optimize',
            '--runtime', stub
        ],
        [cwd('.'), process(Pid)]
    ),
    process_wait(Pid, Status),
    ( Status = exit(0) ->
        true
    ;   format(user_error, 'AssemblyScript compile failed: ~w~n', [Status]),
        halt(1)
    ).

asc_script(Asc) :-
    absolute_file_name('../../node_modules/assemblyscript/bin/asc.js', Asc, [access(read), file_errors(fail)]).

artifact(Path, Dict) :-
    read_file_to_codes(Path, Codes, [type(binary)]),
    length(Codes, Bytes),
    sha_hash(Codes, HashBytes, [algorithm(sha256)]),
    hash_atom(HashBytes, Sha),
    file_base_name(Path, File),
    Dict = _{file: File, bytes: Bytes, sha256: Sha}.

check_manifest :-
    ( exists_file('dist/manifest.json') ->
        true
    ;   format(user_error, 'WASM manifest missing: run npm run build --workspace @veneer/wasm-frontend first~n', []),
        halt(1)
    ),
    read_manifest(Manifest),
    forall(member(Record, Manifest.artifacts), check_artifact(Record)),
    writeln('WASM frontend manifest check passed').

read_manifest(Manifest) :-
    setup_call_cleanup(
        open('dist/manifest.json', read, Stream, [encoding(utf8)]),
        json_read_dict(Stream, Manifest),
        close(Stream)
    ).

check_artifact(Record) :-
    atom_string(FileAtom, Record.file),
    directory_file_path('dist', FileAtom, Path),
    artifact(Path, Actual),
    atom_string(Actual.sha256, ActualSha),
    ( Actual.bytes =:= Record.bytes,
      ActualSha = Record.sha256 ->
        true
    ;   format(user_error, 'WASM manifest mismatch: ~w~n', [Record.file]),
        halt(1)
    ).
