use std::env;
use std::fs;
use std::path::PathBuf;

const PUBLIC_KEY_PATH: &str = "docs/keys/sovereign-node-build-public.asc";
const KEY_META_PATH: &str = "docs/keys/sovereign-node-build.json";

fn main() {
    println!("cargo:rustc-cfg=sovereign_core");
    println!("cargo:rerun-if-env-changed=SOVEREIGN_NODE_KEY");
    println!("cargo:rerun-if-changed={PUBLIC_KEY_PATH}");
    println!("cargo:rerun-if-changed={KEY_META_PATH}");

    require_public_key(PathBuf::from(PUBLIC_KEY_PATH), PathBuf::from(KEY_META_PATH));

    if env::var("SOVEREIGN_NODE_KEY").is_ok() {
        println!("cargo:rustc-cfg=sovereign_node_key_present");
    }
}

fn require_public_key(public_key_path: PathBuf, metadata_path: PathBuf) {
    let public_key = fs::read_to_string(&public_key_path).unwrap_or_else(|error| {
        panic!(
            "sovereign node public build key is required at {}: {error}",
            public_key_path.display()
        )
    });
    if !public_key.contains("-----BEGIN PGP PUBLIC KEY BLOCK-----")
        || !public_key.contains("-----END PGP PUBLIC KEY BLOCK-----")
    {
        panic!("sovereign node build key must be an armored PGP public key block");
    }

    let metadata = fs::read_to_string(&metadata_path).unwrap_or_else(|error| {
        panic!(
            "sovereign node public build key metadata is required at {}: {error}",
            metadata_path.display()
        )
    });
    if !metadata.contains("427AB4A1C0E64A7AB22B0F116ABDA4A46FDDCB60")
        || !metadata.contains("576245485b17accf4078c6507714e564311767dc15d4e1e16037949a29517123")
    {
        panic!("sovereign node key metadata does not match the pinned public key");
    }
}
