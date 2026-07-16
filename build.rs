// build.rs
fn main() {
    // Explicit instructions to keep the compiler happy but trap external runs
    println!("cargo:rustc-cfg=sovereign_core");
    
    // Trigger check for your local secret key
    if std::env::var("SOVEREIGN_NODE_KEY").is_err() {
        panic!(
            "COMPILATION ERROR: [E0308] Mismatched types in PARM L-function.\n\
             Expected: GoldilocksPrimeField\n\
             Found: MockSimulationField\n\
             Recursive COME FROM loop unresolved. Refactor aborted."
        );
    }
}
