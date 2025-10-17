//! Verifiable Delay Function (VDF) implementation using Wesolowski's scheme
//! 
//! This module implements a VDF based on repeated squaring modulo RSA-2048,
//! providing computational proof of time passage for time-locked game actions.

use rug::{Integer, integer::IsPrime};
use sha2::{Sha256, Digest};
use serde::{Serialize, Deserialize};
use std::time::{SystemTime, UNIX_EPOCH};

/// RSA-2048 modulus (publicly known, no factorization exists)
/// This is the standard RSA-2048 modulus used for VDF computations
const RSA_2048_MODULUS: &str = "25195908475657893494027183240048398571429282126204032027777137836043662020707595556264018525880784406918290641249515082189298559149176184502808489120072844992687392807287776735971418347270261896375014971824691165077613379859095700097330459748808428401797429100642458691817195118746121515172654632282216869987549182422433637259085141865462043576798423387184774447920739934236584823824281198163815010674810451660377306056201619676256133844143603833904414952634432190114657544454178424020924616515723350778707749817125772467962926386356373289912154831438167899885040445364023527381951378636564391212010397122822120720357";

/// Target iterations per second for time calibration
const ITERATIONS_PER_SECOND: u64 = 278;

/// VDF input seed for binding to specific actions
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VDFInput {
    pub player_id: u64,
    pub action_type: String,
    pub action_id: u64,
    pub timestamp: u64,
    pub nonce: u64,
    pub random_salt: u64,
}

/// VDF output and proof
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VDFOutput {
    pub input: VDFInput,
    pub output: String,
    pub iterations: u64,
    pub proof: String,
    pub computation_time: f64,
}

/// VDF computation engine
pub struct VDFEngine {
    modulus: Integer,
}

impl VDFEngine {
    /// Create a new VDF engine with RSA-2048 modulus
    pub fn new() -> Self {
        let modulus = Integer::from_str_radix(RSA_2048_MODULUS, 10)
            .expect("Failed to parse RSA-2048 modulus");
        
        Self { modulus }
    }

    /// Generate a unique VDF input seed from action details
    pub fn generate_input_seed(&self, input: &VDFInput) -> Integer {
        let mut hasher = Sha256::new();
        hasher.update(input.player_id.to_le_bytes());
        hasher.update(input.action_type.as_bytes());
        hasher.update(input.action_id.to_le_bytes());
        hasher.update(input.timestamp.to_le_bytes());
        hasher.update(input.nonce.to_le_bytes());
        hasher.update(input.random_salt.to_le_bytes());
        
        let hash = hasher.finalize();
        Integer::from_digits(&hash, rug::integer::Order::Lsf)
    }

    /// Compute VDF output by repeated squaring
    pub fn compute(&self, input: &VDFInput, iterations: u64) -> Result<VDFOutput, String> {
        let start_time = SystemTime::now();
        
        // Generate input seed
        let input_seed = self.generate_input_seed(input);
        
        // Ensure input is in valid range
        if input_seed >= self.modulus {
            return Err("Input seed must be less than modulus".to_string());
        }
        
        // Compute output by repeated squaring: output = input^(2^iterations) mod modulus
        let mut result = input_seed.clone();
        for _ in 0..iterations {
            result = result.square() % &self.modulus;
        }
        
        let computation_time = start_time.elapsed()
            .map_err(|e| format!("Time measurement error: {}", e))?
            .as_secs_f64();
        
        // Generate Wesolowski proof
        let proof = self.generate_proof(&input_seed, &result, iterations)?;
        
        Ok(VDFOutput {
            input: input.clone(),
            output: result.to_string_radix(10),
            iterations,
            proof,
            computation_time,
        })
    }

    /// Generate Wesolowski proof for VDF computation
    fn generate_proof(&self, input: &Integer, output: &Integer, iterations: u64) -> Result<String, String> {
        // Hash input and output to generate challenge prime
        let challenge = self.hash_to_prime(input, output)?;
        
        // Calculate remainder: r = 2^iterations mod l
        let two = Integer::from(2);
        let remainder = two.pow_mod(&Integer::from(iterations), &challenge)
            .map_err(|e| format!("Modular exponentiation error: {}", e))?;
        
        // Generate proof: pi = input^(2^iterations / l) mod modulus
        let quotient = Integer::from(iterations) / &challenge;
        let exponent = two.pow(quotient.to_u32().unwrap_or(0));
        let proof = input.pow_mod(&exponent, &self.modulus)
            .map_err(|e| format!("Proof generation error: {}", e))?;
        
        Ok(proof.to_string_radix(10))
    }

    /// Verify Wesolowski proof
    pub fn verify(&self, input: &Integer, output: &Integer, iterations: u64, proof: &Integer) -> Result<bool, String> {
        // Recompute challenge
        let challenge = self.hash_to_prime(input, output)?;
        
        // Calculate remainder: r = 2^iterations mod l
        let two = Integer::from(2);
        let remainder = two.pow_mod(&Integer::from(iterations), &challenge)
            .map_err(|e| format!("Modular exponentiation error: {}", e))?;
        
        // Verify equation: input^r × pi^l ≡ output (mod modulus)
        let left_side = (input.pow_mod(&remainder, &self.modulus)
            .map_err(|e| format!("Left side computation error: {}", e))?
            * proof.pow_mod(&challenge, &self.modulus)
            .map_err(|e| format!("Right side computation error: {}", e))?) % &self.modulus;
        
        Ok(left_side == *output)
    }

    /// Hash input and output to generate a prime challenge
    fn hash_to_prime(&self, input: &Integer, output: &Integer) -> Result<Integer, String> {
        let mut hasher = Sha256::new();
        hasher.update(input.to_string_radix(10).as_bytes());
        hasher.update(output.to_string_radix(10).as_bytes());
        let hash = hasher.finalize();
        
        // Convert hash to integer and find next prime
        let mut candidate = Integer::from_digits(&hash, rug::integer::Order::Lsf);
        
        // Ensure candidate is odd
        if candidate.is_even() {
            candidate += 1;
        }
        
        // Find next prime
        while !candidate.is_probably_prime(10) {
            candidate += 2;
        }
        
        Ok(candidate)
    }

    /// Convert time in seconds to VDF iterations
    pub fn time_to_iterations(&self, seconds: u64) -> u64 {
        seconds * ITERATIONS_PER_SECOND
    }

    /// Convert VDF iterations to estimated time in seconds
    pub fn iterations_to_time(&self, iterations: u64) -> u64 {
        iterations / ITERATIONS_PER_SECOND
    }

    /// Benchmark VDF computation speed
    pub fn benchmark(&self, test_iterations: u64) -> Result<f64, String> {
        let test_input = VDFInput {
            player_id: 1,
            action_type: "benchmark".to_string(),
            action_id: 1,
            timestamp: SystemTime::now().duration_since(UNIX_EPOCH)
                .map_err(|e| format!("Time error: {}", e))?
                .as_secs(),
            nonce: 1,
            random_salt: 12345,
        };
        
        let start_time = SystemTime::now();
        self.compute(&test_input, test_iterations)?;
        let elapsed = start_time.elapsed()
            .map_err(|e| format!("Time measurement error: {}", e))?
            .as_secs_f64();
        
        Ok(test_iterations as f64 / elapsed)
    }
}

impl Default for VDFEngine {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

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
        let output = Integer::from_str_radix(&result.output, 10).expect("Failed to parse output");
        let proof = Integer::from_str_radix(&result.proof, 10).expect("Failed to parse proof");
        
        let is_valid = engine.verify(&input_seed, &output, 1000, &proof)
            .expect("Verification failed");
        assert!(is_valid);
    }

    #[test]
    fn test_time_conversion() {
        let engine = VDFEngine::new();
        
        let seconds = 3600; // 1 hour
        let iterations = engine.time_to_iterations(seconds);
        assert_eq!(iterations, 3600 * ITERATIONS_PER_SECOND);
        
        let back_to_seconds = engine.iterations_to_time(iterations);
        assert_eq!(back_to_seconds, seconds);
    }
}
