//! Kani proof harnesses for the CCRE core.
//!
//! These are only compiled under `--features kani` and require the Kani
//! toolchain (`cargo kani`). A normal `cargo build` never touches this module.
#![cfg(feature = "kani")]

use crate::rta::{RawTemporalAttractor, LatticeNode};
use crate::uac_loss::uac_loss;

fn sample_model() -> RawTemporalAttractor {
    RawTemporalAttractor {
        tokens: vec!["hello".into()],
        intent_latent: vec![0.1, -0.2, 0.3],
        raw_logits: vec![0.5],
        timestamp_ms: 1,
    }
}

fn sample_lattice() -> Vec<LatticeNode> {
    vec![LatticeNode { index: 0, value: 0.5, neighbors: vec![1] }]
}

#[kani::proof]
fn check_arta_defect_nonneg() {
    let m = sample_model();
    assert!(m.arta_defect() >= 0.0);
}

#[kani::proof]
fn check_uac_loss_bounded() {
    let m = sample_model();
    let l = sample_lattice();
    let loss = uac_loss(&m, &l);
    assert!(loss >= 0.0 && loss <= 1.0);
}
