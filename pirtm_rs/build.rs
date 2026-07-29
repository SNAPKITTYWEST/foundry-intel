// Copyright © 2026 SnapKitty Collective LLC. All rights reserved.
// Licensed under Business Source License 2.0 (BSL-2.0).
// Change Date: December 31, 2027 — after which, licensed under AGPL-3.0-only.
// See LICENSE for complete terms.

use std::env;
use std::fs;
use std::path::PathBuf;

const PUBLIC_KEY_PATH: &str = "docs/keys/sovereign-node-build-public.asc";
const KEY_META_PATH: &str = "docs/keys/sovereign-node-build.json";
const EXPECTED_PUBLIC_KEY_SHA256: &str =
    "576245485b17accf4078c6507714e564311767dc15d4e1e16037949a29517123";
const EXPECTED_FINGERPRINT: &str = "427AB4A1C0E64A7AB22B0F116ABDA4A46FDDCB60";
const BUILD_HEALTH_MARKER: &str = "PUBLIC_KEY_VALIDATED_20260716T211343Z";

fn main() {
    println!("cargo:rustc-cfg=sovereign_core");
    println!("cargo:rerun-if-env-changed=SOVEREIGN_NODE_KEY");

    let manifest_dir = PathBuf::from(env::var("CARGO_MANIFEST_DIR").expect("CARGO_MANIFEST_DIR is set by Cargo"));
    let repo_root = manifest_dir
        .parent()
        .expect("pirtm_rs lives directly under the repository root");

    let key_path = repo_root.join(PUBLIC_KEY_PATH);
    let meta_path = repo_root.join(KEY_META_PATH);
    println!("cargo:rerun-if-changed={}", key_path.display());
    println!("cargo:rerun-if-changed={}", meta_path.display());

    let public_key = fs::read_to_string(&key_path).unwrap_or_else(|error| {
        panic!(
            "sovereign node public build key is required at {}: {error}",
            key_path.display()
        )
    });
    let normalized_key = public_key.replace("\r\n", "\n");
    if !normalized_key.contains("-----BEGIN PGP PUBLIC KEY BLOCK-----")
        || !normalized_key.contains("-----END PGP PUBLIC KEY BLOCK-----")
    {
        panic!("sovereign node build key must be an armored PGP public key block");
    }

    let actual_hash = sha256_hex(normalized_key.as_bytes());
    if actual_hash != EXPECTED_PUBLIC_KEY_SHA256 {
        panic!(
            "sovereign node public key hash mismatch: expected {EXPECTED_PUBLIC_KEY_SHA256}, got {actual_hash}"
        );
    }

    let metadata = fs::read_to_string(&meta_path).unwrap_or_else(|error| {
        panic!(
            "sovereign node public build key metadata is required at {}: {error}",
            meta_path.display()
        )
    });
    if !metadata.contains(EXPECTED_FINGERPRINT) || !metadata.contains(EXPECTED_PUBLIC_KEY_SHA256) {
        panic!("sovereign node key metadata does not match the pinned public key");
    }

    println!("cargo:rustc-env=SPF_SOVEREIGN_BUILD_HEALTH={BUILD_HEALTH_MARKER}");
    println!("cargo:rustc-cfg=sovereign_build_health_20260716");

    if env::var("SOVEREIGN_NODE_KEY").is_ok() {
        println!("cargo:rustc-cfg=sovereign_node_key_present");
    }
}

fn sha256_hex(bytes: &[u8]) -> String {
    let mut state = Sha256::new();
    state.update(bytes);
    state.finalize_hex()
}

struct Sha256 {
    h: [u32; 8],
    len: u64,
    buffer: Vec<u8>,
}

impl Sha256 {
    fn new() -> Self {
        Self {
            h: [
                0x6a09e667,
                0xbb67ae85,
                0x3c6ef372,
                0xa54ff53a,
                0x510e527f,
                0x9b05688c,
                0x1f83d9ab,
                0x5be0cd19,
            ],
            len: 0,
            buffer: Vec::new(),
        }
    }

    fn update(&mut self, bytes: &[u8]) {
        self.len = self.len.wrapping_add((bytes.len() as u64) * 8);
        self.buffer.extend_from_slice(bytes);
        while self.buffer.len() >= 64 {
            let block: Vec<u8> = self.buffer.drain(..64).collect();
            self.compress(&block);
        }
    }

    fn finalize_hex(mut self) -> String {
        self.buffer.push(0x80);
        while (self.buffer.len() % 64) != 56 {
            self.buffer.push(0);
        }
        self.buffer.extend_from_slice(&self.len.to_be_bytes());
        while !self.buffer.is_empty() {
            let block: Vec<u8> = self.buffer.drain(..64).collect();
            self.compress(&block);
        }
        self.h.iter().map(|word| format!("{word:08x}")).collect()
    }

    fn compress(&mut self, block: &[u8]) {
        let mut w = [0u32; 64];
        for (index, chunk) in block.chunks_exact(4).take(16).enumerate() {
            w[index] = u32::from_be_bytes([chunk[0], chunk[1], chunk[2], chunk[3]]);
        }
        for index in 16..64 {
            let s0 = w[index - 15].rotate_right(7) ^ w[index - 15].rotate_right(18) ^ (w[index - 15] >> 3);
            let s1 = w[index - 2].rotate_right(17) ^ w[index - 2].rotate_right(19) ^ (w[index - 2] >> 10);
            w[index] = w[index - 16]
                .wrapping_add(s0)
                .wrapping_add(w[index - 7])
                .wrapping_add(s1);
        }

        let mut a = self.h[0];
        let mut b = self.h[1];
        let mut c = self.h[2];
        let mut d = self.h[3];
        let mut e = self.h[4];
        let mut f = self.h[5];
        let mut g = self.h[6];
        let mut h = self.h[7];

        for index in 0..64 {
            let s1 = e.rotate_right(6) ^ e.rotate_right(11) ^ e.rotate_right(25);
            let ch = (e & f) ^ ((!e) & g);
            let temp1 = h
                .wrapping_add(s1)
                .wrapping_add(ch)
                .wrapping_add(K[index])
                .wrapping_add(w[index]);
            let s0 = a.rotate_right(2) ^ a.rotate_right(13) ^ a.rotate_right(22);
            let maj = (a & b) ^ (a & c) ^ (b & c);
            let temp2 = s0.wrapping_add(maj);

            h = g;
            g = f;
            f = e;
            e = d.wrapping_add(temp1);
            d = c;
            c = b;
            b = a;
            a = temp1.wrapping_add(temp2);
        }

        self.h[0] = self.h[0].wrapping_add(a);
        self.h[1] = self.h[1].wrapping_add(b);
        self.h[2] = self.h[2].wrapping_add(c);
        self.h[3] = self.h[3].wrapping_add(d);
        self.h[4] = self.h[4].wrapping_add(e);
        self.h[5] = self.h[5].wrapping_add(f);
        self.h[6] = self.h[6].wrapping_add(g);
        self.h[7] = self.h[7].wrapping_add(h);
    }
}

const K: [u32; 64] = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4,
    0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe,
    0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f,
    0x4a7484aa, 0x5cb0a9dc, 0x76f988da, 0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7,
    0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc,
    0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b,
    0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070, 0x19a4c116,
    0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7,
    0xc67178f2,
];
