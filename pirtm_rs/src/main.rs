mod rta;
mod gates;
mod uac_loss;

use rta::{RawTemporalAttractor, LatticeNode};
use uac_loss::{uac_loss, issue_certificate};

fn main() {
    // 1. Local inference (no external API)
    let model = RawTemporalAttractor {
        tokens: vec!["hello".into(), "world".into()],
        intent_latent: vec![0.1, -0.2, 0.3],
        raw_logits: vec![0.5, 0.5],
        timestamp_ms: 1700000000000,
    };

    let lattice = vec![
        LatticeNode { index: 0, value: 0.5, neighbors: vec![1, 2] },
        LatticeNode { index: 1, value: 0.3, neighbors: vec![0] },
        LatticeNode { index: 2, value: 0.2, neighbors: vec![0] },
    ];

    // 2. Verify Phase Mirror (CNL -> ALP)
    println!("=== CCRE Phase Mirror ===");
    println!("RTA Defect: {:.4}", model.arta_defect());

    // 3. Compute UAC Loss
    let loss = uac_loss(&model, &lattice);
    println!("UAC Loss: {:.4}", loss);

    // 4. Issue Sovereign Certificate
    let cert = issue_certificate(&model, &lattice);
    println!("Certificate: {:?}", cert);

    if cert.is_unbiased {
        println!("STATUS: SOVEREIGN — Unbiased Arithmetic Cognition Verified.");
    } else {
        println!("STATUS: BIASED — Attractor Divergence Detected.");
    }
}
