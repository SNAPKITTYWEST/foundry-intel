use pirtm_rs::{
    gate_langlands, uac_total_loss, ArithmeticBinduAttractor, GateFailure, LanglandsLossConfig,
    LanglandsZKConfig, RtaMetric, State,
};

#[test]
fn sovereign_pipeline_converges_and_passes_gate() {
    let mut state = State::new();
    state.active_primes.extend([2, 3, 5, 7, 11]);
    state.insert_joint_word(2, 3, 4.5);
    state.insert_joint_word(3, 5, 1.2);

    let before_defect = state.arta_defect();
    let before_loss = uac_total_loss(&state, LanglandsLossConfig::default());

    state.fit(0.1, 1e-7);

    let after_defect = state.arta_defect();
    let after_loss = uac_total_loss(&state, LanglandsLossConfig::default());

    assert!(after_defect <= before_defect);
    assert!(after_defect <= 1e-7);
    assert!(after_loss <= before_loss);
    assert!(gate_langlands(&state, 1e-12, Some(LanglandsZKConfig::default())).is_ok());
}

#[test]
fn langlands_gate_fails_closed_for_invalid_threshold() {
    let mut state = State::new();
    state.active_primes.push(2);

    let result = gate_langlands(&state, 0.0, None);
    assert!(matches!(result, Err(GateFailure::GaloisError(_, _))));
}

#[test]
fn arithmetic_bindu_distance_is_zero_at_origin() {
    let state = State::new();
    let attractor = ArithmeticBinduAttractor::new();
    assert_eq!(attractor.distance(&state), 0.0);
}
