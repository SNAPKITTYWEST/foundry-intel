use crate::rta::{RawTemporalAttractor, LatticeNode};
use crate::gates::{
    gate_lexical, gate_grounding, gate_consistency, gate_local_first, gate_langlands_zk,
};
use serde::{Serialize, Deserialize};

/// The UNBIASED ARITHMETIC COGNITION (UAC) loss — the total sovereign score.
/// Equals 1 - (weighted harmonic mean of the five gates), so it lives in [0, 1].
pub fn uac_loss(model: &RawTemporalAttractor, lattice: &[LatticeNode]) -> f64 {
    let g1 = gate_lexical(&model.tokens);
    let g2 = gate_grounding(&model.intent_latent);
    let g3 = gate_consistency(model);
    let g4 = gate_local_first(model);
    let g5 = gate_langlands_zk(model, lattice);

    // Weighted mean — L-Gate (5) dominates the sovereign score.
    let weights = [1.0, 1.0, 2.0, 1.0, 5.0];
    let gates = [g1, g2, g3, g4, g5];
    let weighted_sum: f64 = weights.iter().zip(gates.iter()).map(|(w, g)| w * g).sum();
    let weight_total: f64 = weights.iter().sum();
    1.0 - (weighted_sum / weight_total)
}

/// The SOVEREIGN CERTIFICATE — the output artifact.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SovereignCertificate {
    pub model_hash: String,
    pub uac_score: f64,
    pub langlands_checksum: String,
    pub is_unbiased: bool,
}

/// SHA-256 checksum over the serialized model (local, no external calls).
pub fn compute_langlands_checksum(model: &RawTemporalAttractor) -> String {
    use sha2::{Sha256, Digest};
    let mut hasher = Sha256::new();
    let payload = serde_json::to_vec(model).expect("serialize model");
    hasher.update(&payload);
    let result = hasher.finalize();
    let mut s = String::with_capacity(64);
    for b in result {
        s.push_str(&format!("{:02x}", b));
    }
    s
}

/// Issue a certificate from a model + lattice.
pub fn issue_certificate(model: &RawTemporalAttractor, lattice: &[LatticeNode]) -> SovereignCertificate {
    let score = uac_loss(model, lattice);
    let checksum = compute_langlands_checksum(model);
    SovereignCertificate {
        model_hash: checksum.clone(),
        uac_score: score,
        langlands_checksum: checksum,
        is_unbiased: score < 0.2,
    }
}

#[cfg(feature = "kani")]
pub mod kani_proofs;
