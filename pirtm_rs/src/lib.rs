pub mod gates;
pub mod rta;
pub mod uac_loss;

pub use gates::{gate_langlands, GateFailure, GateResult, LanglandsZKConfig};
pub use rta::{RawTemporalAttractor, LatticeNode, State, RtaMetric, ArithmeticBinduAttractor};
pub use uac_loss::{uac_loss, issue_certificate, SovereignCertificate};

/// LanglandsLossConfig — configuration for the Langlands loss computation.
#[derive(Debug, Clone)]
pub struct LanglandsLossConfig {
    pub tau_r:     f64,
    pub cycle_108: u64,
}

impl Default for LanglandsLossConfig {
    fn default() -> Self { LanglandsLossConfig { tau_r: 47.06998778, cycle_108: 108 } }
}

/// uac_total_loss — convenience wrapper taking (&State, LanglandsLossConfig).
pub fn uac_total_loss(state: &State, _config: LanglandsLossConfig) -> f64 {
    // Compute UAC loss from state directly
    let defect = state.arta_defect();
    let gate_factor = if state.gate_passed { 0.0 } else { 1.0 };
    (defect + gate_factor * 0.5).min(1.0)
}
