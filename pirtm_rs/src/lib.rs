pub mod gates;
pub mod rta;
pub mod uac_loss;

// Re-export the types that main.rs and tests actually use
pub use gates::{gate_langlands, GateFailure, GateResult};
pub use rta::{RawTemporalAttractor, LatticeNode, State, RtaMetric};
pub use uac_loss::{uac_loss, issue_certificate, SovereignCertificate};

// Compatibility aliases for anything importing the old names
pub use uac_loss::uac_loss as uac_total_loss;
pub use rta::State as ArithmeticBinduAttractor;

/// LanglandsLossConfig — configuration for the Langlands loss computation.
#[derive(Debug, Clone)]
pub struct LanglandsLossConfig {
    pub tau_r: f64,
    pub cycle_108: u64,
}

impl Default for LanglandsLossConfig {
    fn default() -> Self { LanglandsLossConfig { tau_r: 47.06998778, cycle_108: 108 } }
}
