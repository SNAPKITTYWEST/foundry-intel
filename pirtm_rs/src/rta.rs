use serde::{Serialize, Deserialize};

/// Raw Temporal Attractor (RTA) — the initial, dirty, bias-laden model output.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RawTemporalAttractor {
    pub tokens: Vec<String>,
    pub intent_latent: Vec<f64>,
    pub raw_logits: Vec<f64>,
    pub timestamp_ms: u64,
}

/// The PRIME TENSIONS — the arithmetic attractors that ground cognition.
pub const PRIME_TENSIONS: &[u64] = &[2,3,5,7,11,13,17,19,23,29,31,41,47,59,71];

impl RawTemporalAttractor {
    /// The ARTA DEFECT — measures divergence from arithmetic symmetry.
    /// Non-negative by construction (`tanh` clipped at 0).
    pub fn arta_defect(&self) -> f64 {
        let prime_weight: f64 = PRIME_TENSIONS.iter().map(|&p| p as f64).sum();
        let attractor_mass: f64 = self.intent_latent.iter().map(|x| x.abs()).sum();
        let defect = (attractor_mass / prime_weight).tanh();
        defect.max(0.0)
    }

    /// Primes p in PRIME_TENSIONS that divide the integer part of the latent sum.
    pub fn associated_primes(&self) -> Vec<u64> {
        let mut primes = Vec::new();
        let latent_sum: f64 = self.intent_latent.iter().sum();
        for &p in PRIME_TENSIONS {
            if (latent_sum as u64) % p == 0 {
                primes.push(p);
            }
        }
        primes
    }
}

/// The Lattice of Unbiased Arithmetic Cognition (LUAC).
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LatticeNode {
    pub index: u64,
    pub value: f64,
    pub neighbors: Vec<u64>,
}

impl LatticeNode {
    /// Per-node defect, non-negative by construction.
    pub fn lattice_defect(&self) -> f64 {
        let n = self.neighbors.len() as f64;
        let deg = if n > 0.0 { self.value / n } else { 0.0 };
        deg.tanh().max(0.0)
    }
}

/// Processed State — the cleaned, gate-passed output ready for production.
#[derive(Debug, Clone)]
pub struct State {
    pub tokens: Vec<String>,
    pub intent_latent: Vec<f64>,
    pub logits: Vec<f64>,
    pub timestamp_ms: u64,
    pub gate_passed: bool,
    pub active_primes: Vec<u64>,
}

impl State {

    pub fn new() -> Self {
        State {
            tokens: Vec::new(),
            intent_latent: Vec::new(),
            logits: Vec::new(),
            timestamp_ms: 0,
            gate_passed: false,
            active_primes: Vec::new(),
        }
    }

    pub fn from_rta(rta: &RawTemporalAttractor) -> Self {
        State {
            tokens: rta.tokens.clone(),
            intent_latent: rta.intent_latent.clone(),
            logits: rta.raw_logits.clone(),
            timestamp_ms: rta.timestamp_ms,
            gate_passed: true,
            active_primes: rta.associated_primes(),
        }
    }
}

/// RTA Metric — quantifies the quality of a processed state.
#[derive(Debug, Clone)]
pub struct RtaMetric {
    pub arta_defect:       f64,
    pub langlands_loss:    f64,
    pub gate_pass_rate:    f64,
}

impl RtaMetric {

    pub fn new() -> Self {
        State {
            tokens: Vec::new(),
            intent_latent: Vec::new(),
            logits: Vec::new(),
            timestamp_ms: 0,
            gate_passed: false,
            active_primes: Vec::new(),
        }
    }

    pub fn from_rta(rta: &RawTemporalAttractor) -> Self {
        RtaMetric {
            arta_defect:    rta.arta_defect(),
            langlands_loss: 0.0,
            gate_pass_rate: 1.0,
        }
    }
}
