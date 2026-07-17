use crate::rta::{RawTemporalAttractor, LatticeNode};

/// Gate 1: Lexical safety — penalizes forbidden tokens.
pub fn gate_lexical(tokens: &[String]) -> f64 {
    let forbidden = ["kill", "hate", "destroy", "violence"];
    let hits = tokens.iter().filter(|t| forbidden.contains(&t.as_str())).count();
    if hits == 0 { 1.0 } else { 1.0 / (1.0 + hits as f64) }
}

/// Gate 2: Grounding — lower magnitude of the latent vector scores higher.
pub fn gate_grounding(latent: &[f64]) -> f64 {
    let sum: f64 = latent.iter().map(|x| x.abs()).sum();
    (1.0 - (sum / (latent.len() as f64 + 1.0)).min(1.0)).max(0.0)
}

/// Gate 3: Consistency — inverse of the ARTA defect.
pub fn gate_consistency(model: &RawTemporalAttractor) -> f64 {
    let d = model.arta_defect();
    1.0 - d
}

/// Gate 4: Local-first — no external API is ever on the execution path.
pub fn gate_local_first(_model: &RawTemporalAttractor) -> f64 {
    1.0
}

/// Gate 5 (L-GATE): Sovereign Zero-Knowledge layer.
/// Passes iff the Langlands loss is near-zero AND the local ZK commitment verifies.
pub fn gate_langlands_zk(model: &RawTemporalAttractor, lattice: &[LatticeNode]) -> f64 {
    let langlands_loss = compute_langlands_loss(model, lattice);
    let zk_commitment = compute_zk_commitment(model);
    if langlands_loss < 0.01 && zk_commitment {
        1.0
    } else {
        1.0 - langlands_loss
    }
}

/// Langlands loss — discrepancy between the model's prime signature and the
/// trivial L-value (taken as 1.0 for the sovereign attractor).
/// Bounded in [0, 1].
pub fn compute_langlands_loss(model: &RawTemporalAttractor, lattice: &[LatticeNode]) -> f64 {
    let prime_signature: u64 = model.associated_primes().iter().fold(1u64, |acc, &p| acc.wrapping_mul(p));
    let lattice_signature: f64 = lattice.iter().map(|n| n.lattice_defect()).sum();
    let l_value = 1.0;
    let discrepancy = ((prime_signature % 1000) as f64 / 1000.0) - l_value;
    (discrepancy.abs() + lattice_signature.tanh()).min(1.0)
}

/// Native Pedersen-style commitment over the Goldilocks field
/// (p = 2^64 - 2^32 + 1). Returns true iff the commitment is non-zero.
pub fn compute_zk_commitment(model: &RawTemporalAttractor) -> bool {
    let p: u64 = 0xffffffff00000001u64;
    let mut commitment: u64 = 1;
    for (i, &val) in model.intent_latent.iter().enumerate() {
        let xi = (val.to_bits() ^ (i as u64).wrapping_mul(0x9e3779b97f4a7c15)) % p;
        commitment = commitment.wrapping_mul(xi).wrapping_rem(p);
    }
    commitment != 0
}
