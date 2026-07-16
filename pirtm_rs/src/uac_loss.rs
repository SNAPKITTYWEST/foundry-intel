use crate::gates::{
    associated_primes, GaloisRepresentation, LanglandsPairing, MonsterConjugacyClass,
    ALL_MONSTER_CLASSES,
};
use crate::rta::{RtaMetric, State};

#[derive(Debug, Clone, Copy, PartialEq)]
pub struct LanglandsLossConfig {
    pub lambda_langlands: f64,
    pub prime_bound: u64,
    pub tolerance: f64,
    pub include_conductor: bool,
}

impl Default for LanglandsLossConfig {
    fn default() -> Self {
        Self {
            lambda_langlands: 0.1,
            prime_bound: 100,
            tolerance: 1e-12,
            include_conductor: true,
        }
    }
}

pub fn langlands_loss(state: &State, config: LanglandsLossConfig) -> f64 {
    let mut total_loss = 0.0;
    let activated = activated_monster_classes(state, config.prime_bound);

    for class in activated {
        let repr = match GaloisRepresentation::with_goldilocks(class) {
            Ok(r) => r,
            Err(_) => {
                total_loss += 1.0;
                continue;
            }
        };
        let pairing = LanglandsPairing::new(repr);
        match pairing.special_value_at_one() {
            Ok(l_val) => {
                let diff = l_val - 1.0;
                total_loss += diff * diff;
                if config.include_conductor {
                    total_loss += (class.level as f64).ln_1p() * config.tolerance;
                }
            }
            Err(_) => total_loss += 1.0,
        }
    }

    config.lambda_langlands.max(0.0) * total_loss
}

pub fn uac_total_loss(state: &State, config: LanglandsLossConfig) -> f64 {
    state.arta_defect() + langlands_loss(state, config)
}

fn activated_monster_classes(state: &State, prime_bound: u64) -> Vec<MonsterConjugacyClass> {
    let mut activated = Vec::new();
    for class in ALL_MONSTER_CLASSES {
        let assoc = associated_primes(class);
        if assoc
            .iter()
            .any(|p| *p <= prime_bound && state.active_primes.contains(p))
        {
            activated.push(*class);
        }
    }
    activated
}

#[derive(Debug, Clone, PartialEq)]
pub struct ArithmeticBinduAttractor {
    pub target_class: MonsterConjugacyClass,
    pub target_l_value: f64,
    pub tolerance: f64,
}

impl ArithmeticBinduAttractor {
    pub fn new() -> Self {
        Self {
            target_class: MonsterConjugacyClass::IDENTITY,
            target_l_value: 1.0,
            tolerance: 1e-6,
        }
    }

    pub fn distance(&self, state: &State) -> f64 {
        let bindu = State::new();
        let rta_dist = state.rta_dist(&bindu);
        let l_dist = state.l_dist(&bindu);

        let repr = match GaloisRepresentation::with_goldilocks(self.target_class) {
            Ok(r) => r,
            Err(_) => return rta_dist + l_dist + 1e6,
        };
        let pairing = LanglandsPairing::new(repr);
        let l_val = match pairing.special_value_at_one() {
            Ok(v) => v,
            Err(_) => return rta_dist + l_dist + 1e6,
        };

        let langlands_dist = (l_val - self.target_l_value).abs();
        rta_dist + l_dist + langlands_dist
    }

    pub fn is_at_attractor(&self, state: &State) -> bool {
        self.distance(state) < self.tolerance
    }
}

impl Default for ArithmeticBinduAttractor {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn bindu_accepts_empty_state() {
        let attractor = ArithmeticBinduAttractor::new();
        assert!(attractor.is_at_attractor(&State::new()));
    }

    #[test]
    fn uac_loss_drops_after_fit() {
        let mut state = State::new();
        state.active_primes.extend([2, 3]);
        state.insert_joint_word(2, 3, 5.0);
        let cfg = LanglandsLossConfig::default();

        let before = uac_total_loss(&state, cfg);
        state.fit(0.5, 1e-6);
        let after = uac_total_loss(&state, cfg);

        assert!(after <= before);
    }
}
