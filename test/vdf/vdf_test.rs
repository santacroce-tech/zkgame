use zkgame_vdf::{VDFEngine, VDFInput};

#[test]
fn test_vdf_basic_computation() {
    let engine = VDFEngine::new();
    let input = VDFInput {
        player_id: 1,
        action_type: "test".to_string(),
        action_id: 1,
        timestamp: 1234567890,
        nonce: 1,
        random_salt: 12345,
    };
    
    let result = engine.compute(&input, 1000).expect("VDF computation failed");
    assert_eq!(result.iterations, 1000);
    assert!(!result.output.is_empty());
    assert!(!result.proof.is_empty());
}

#[test]
fn test_vdf_verification() {
    let engine = VDFEngine::new();
    let input = VDFInput {
        player_id: 1,
        action_type: "test".to_string(),
        action_id: 1,
        timestamp: 1234567890,
        nonce: 1,
        random_salt: 12345,
    };
    
    let result = engine.compute(&input, 1000).expect("VDF computation failed");
    let input_seed = engine.generate_input_seed(&input);
    let output = rug::Integer::from_str_radix(&result.output, 10).expect("Failed to parse output");
    let proof = rug::Integer::from_str_radix(&result.proof, 10).expect("Failed to parse proof");
    
    let is_valid = engine.verify(&input_seed, &output, 1000, &proof)
        .expect("Verification failed");
    assert!(is_valid);
}

#[test]
fn test_vdf_time_conversion() {
    let engine = VDFEngine::new();
    
    let seconds = 3600; // 1 hour
    let iterations = engine.time_to_iterations(seconds);
    assert_eq!(iterations, 3600 * 278); // 278 iterations per second
    
    let back_to_seconds = engine.iterations_to_time(iterations);
    assert_eq!(back_to_seconds, seconds);
}

#[test]
fn test_vdf_benchmark() {
    let engine = VDFEngine::new();
    let test_iterations = 1000;
    
    let rate = engine.benchmark(test_iterations).expect("Benchmark failed");
    assert!(rate > 0.0);
    println!("VDF computation rate: {} iterations/second", rate);
}

#[test]
fn test_vdf_input_binding() {
    let engine = VDFEngine::new();
    
    // Test that different inputs produce different seeds
    let input1 = VDFInput {
        player_id: 1,
        action_type: "craft".to_string(),
        action_id: 1,
        timestamp: 1234567890,
        nonce: 1,
        random_salt: 12345,
    };
    
    let input2 = VDFInput {
        player_id: 1,
        action_type: "craft".to_string(),
        action_id: 2, // Different action ID
        timestamp: 1234567890,
        nonce: 1,
        random_salt: 12345,
    };
    
    let seed1 = engine.generate_input_seed(&input1);
    let seed2 = engine.generate_input_seed(&input2);
    
    assert_ne!(seed1, seed2, "Different inputs should produce different seeds");
}

#[test]
fn test_vdf_proof_uniqueness() {
    let engine = VDFEngine::new();
    let input = VDFInput {
        player_id: 1,
        action_type: "test".to_string(),
        action_id: 1,
        timestamp: 1234567890,
        nonce: 1,
        random_salt: 12345,
    };
    
    // Compute VDF twice with same input
    let result1 = engine.compute(&input, 1000).expect("VDF computation failed");
    let result2 = engine.compute(&input, 1000).expect("VDF computation failed");
    
    // Output should be the same (deterministic)
    assert_eq!(result1.output, result2.output);
    assert_eq!(result1.proof, result2.proof);
}

#[test]
fn test_vdf_invalid_proof() {
    let engine = VDFEngine::new();
    let input = VDFInput {
        player_id: 1,
        action_type: "test".to_string(),
        action_id: 1,
        timestamp: 1234567890,
        nonce: 1,
        random_salt: 12345,
    };
    
    let result = engine.compute(&input, 1000).expect("VDF computation failed");
    let input_seed = engine.generate_input_seed(&input);
    let output = rug::Integer::from_str_radix(&result.output, 10).expect("Failed to parse output");
    
    // Create invalid proof
    let invalid_proof = rug::Integer::from(12345);
    
    let is_valid = engine.verify(&input_seed, &output, 1000, &invalid_proof)
        .expect("Verification failed");
    assert!(!is_valid, "Invalid proof should be rejected");
}
