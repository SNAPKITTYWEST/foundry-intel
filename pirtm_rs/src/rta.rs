use std::collections::{HashMap, HashSet};

#[derive(Debug, Clone, Default, PartialEq)]
pub struct State {
    pub active_primes: HashSet<u64>,
    pub joint_words: HashMap<(u64, u64), f64>,
}

impl State {
    pub fn new() -> Self {
        Self {
            active_primes: HashSet::new(),
            joint_words: HashMap::new(),
        }
    }

    pub fn insert_joint_word(&mut self, p: u64, q: u64, weight: f64) {
        let key = ordered_pair(p, q);
        self.joint_words.insert(key, weight.max(0.0));
    }

    pub fn langlands_trace(&self, p: u64) -> f64 {
        let mut trace = 0.0;
        for &q in &self.active_primes {
            if p != q {
                let key = ordered_pair(p, q);
                if let Some(&weight) = self.joint_words.get(&key) {
                    trace += weight;
                }
            }
        }
        trace
    }
}

pub trait RtaMetric {
    fn arta_defect(&self) -> f64;
    fn coherent_weight(&self) -> f64;
    fn rta_dist(&self, other: &Self) -> f64;
    fn l_dist(&self, other: &Self) -> f64;
    fn fit(&mut self, learning_rate: f64, tolerance: f64);
}

impl RtaMetric for State {
    fn arta_defect(&self) -> f64 {
        let mut defect = 0.0;
        for ((p, q), weight) in &self.joint_words {
            if self.active_primes.contains(p) && self.active_primes.contains(q) {
                defect += weight.max(0.0);
            }
        }
        defect
    }

    fn coherent_weight(&self) -> f64 {
        (self.active_primes.len() as f64) * 10.0
    }

    fn rta_dist(&self, other: &Self) -> f64 {
        let cw_diff = self.coherent_weight() - other.coherent_weight();
        let ad_diff = self.arta_defect() - other.arta_defect();
        (cw_diff * cw_diff + ad_diff * ad_diff).sqrt()
    }

    fn l_dist(&self, other: &Self) -> f64 {
        let common: HashSet<u64> = self
            .active_primes
            .intersection(&other.active_primes)
            .cloned()
            .collect();
        let mut dist = 0.0;
        for p in common {
            let d = self.langlands_trace(p) - other.langlands_trace(p);
            dist += d * d;
        }
        dist
    }

    fn fit(&mut self, learning_rate: f64, tolerance: f64) {
        if !learning_rate.is_finite() || !tolerance.is_finite() || learning_rate <= 0.0 {
            return;
        }

        let rate = learning_rate.clamp(0.0, 1.0);
        let target = tolerance.max(0.0);

        for _ in 0..100_000 {
            let current_defect = self.arta_defect();
            if current_defect <= target {
                break;
            }

            for weight in self.joint_words.values_mut() {
                if *weight > 0.0 {
                    *weight -= rate * *weight;
                    if *weight < 1e-12 {
                        *weight = 0.0;
                    }
                }
            }
        }
    }
}

fn ordered_pair(p: u64, q: u64) -> (u64, u64) {
    if p < q {
        (p, q)
    } else {
        (q, p)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn langlands_trace_uses_symmetric_joint_keys() {
        let mut state = State::new();
        state.active_primes.extend([2, 3, 5]);
        state.insert_joint_word(3, 2, 4.0);
        state.insert_joint_word(5, 2, 1.5);

        assert_eq!(state.langlands_trace(2), 5.5);
        assert_eq!(state.langlands_trace(3), 4.0);
    }

    #[test]
    fn fit_contracts_defect_to_tolerance() {
        let mut state = State::new();
        state.active_primes.extend([2, 3]);
        state.insert_joint_word(2, 3, 100.0);

        let before = state.arta_defect();
        state.fit(0.25, 1e-6);
        let after = state.arta_defect();

        assert!(after <= before);
        assert!(after <= 1e-6);
    }
}

#[cfg(kani)]
mod kani_proofs {
    use super::*;

    #[kani::proof]
    fn verify_fit_contracts_defect() {
        let mut state = State::new();
        let w: f64 = kani::any();
        kani::assume(w >= 0.0 && w <= 1000.0);

        state.active_primes.insert(2);
        state.active_primes.insert(3);
        state.joint_words.insert((2, 3), w);

        let d_initial = state.arta_defect();
        state.fit(0.1, 1e-6);
        let d_final = state.arta_defect();

        assert!(d_final <= d_initial);
        if d_initial > 1e-6 {
            assert!(d_final <= 1e-6);
        }
    }
}
