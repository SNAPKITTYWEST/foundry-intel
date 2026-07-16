# Sovereign Node Build Key

This directory contains the repository-level public OpenPGP trust anchor for
Rust crate builds.

```text
docs/keys/sovereign-node-build-public.asc
docs/keys/sovereign-node-build.json
```

The public key is intentionally outside individual Rust crates. Each Rust crate
build script must resolve this public key from the repository root before
compilation proceeds.

`SOVEREIGN_NODE_KEY` remains supported as a local/private sovereign signal, but
private key material must not be committed. The repo guard and `.gitignore`
rules are configured to keep private key files out of source control.

SOVEREIGN_NODE_KEY remains supported for local builds without committing private
key material.

Run:

```sh
npm run sovereign:key:guard
cargo test --manifest-path pirtm_rs/Cargo.toml
```
