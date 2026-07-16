use pirtm_rs::{
    gate_langlands, uac_total_loss, ArithmeticBinduAttractor, LanglandsLossConfig,
    LanglandsZKConfig, RtaMetric, State,
};

fn main() {
    println!("Launching Sovereign CCRE Verification Platform...");

    let mut state = State::new();
    for p in [2, 3, 5, 7, 11] {
        state.active_primes.insert(p);
    }

    state.insert_joint_word(2, 3, 4.5);
    state.insert_joint_word(3, 5, 1.2);

    println!("[Pre-fit Defect]: {:.6}", state.arta_defect());
    state.fit(0.1, 1e-7);
    println!("[Post-fit Defect]: {:.6}", state.arta_defect());

    let cfg = LanglandsLossConfig::default();
    println!("[UAC Loss]: {:.12}", uac_total_loss(&state, cfg));

    let zk_config = LanglandsZKConfig::default();
    match gate_langlands(&state, 1e-12, Some(zk_config)) {
        Ok(_) => println!("Gate Status: ACCEPTED (Monster identity anchored)"),
        Err(e) => println!("Gate Status: REJECTED ({e})"),
    }

    let attractor = ArithmeticBinduAttractor::new();
    println!("[Bindu Distance]: {:.12}", attractor.distance(&state));
}
