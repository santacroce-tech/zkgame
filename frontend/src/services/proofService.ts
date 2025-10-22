
// @ts-ignore - snarkjs doesn't have complete TypeScript definitions
import { groth16 } from 'snarkjs'

export interface MovementProofInputs {
  playerId: string
  oldAreaId: number
  oldAreaType: number
  newAreaId: number
  newAreaType: number
  inventory: number[]
  currency: number
  lastClaimTime: number
  ownedStores: number[]
  reputation: number
  experience: number
  nonce: number
  exploredAreas: number[]
  timestamp: number
}

export interface MovementProof {
  proof: {
    pi_a: [string, string, string]
    pi_b: [[string, string], [string, string], [string, string]]
    pi_c: [string, string, string]
  }
  publicSignals: [string, string, string] // [oldCommitment, newCommitment, timestamp]
}

export interface TimeRewardProofInputs {
  playerId: string
  positionX: number
  positionY: number
  inventory: number[]
  currency: number
  lastClaimTime: number
  ownedStores: number[]
  reputation: number
  experience: number
  nonce: number
  exploredCells: number[]
  currentTime: number
  rewardAmount: number
}

export interface TimeRewardProof {
  proof: {
    pi_a: [string, string, string]
    pi_b: [[string, string], [string, string], [string, string]]
    pi_c: [string, string, string]
  }
  publicSignals: [string, string, string, string] // [oldCommitment, newCommitment, currentTime, rewardAmount]
}

export interface ProofGenerationStatus {
  isGenerating: boolean
  progress: number
  currentStep: string
  error?: string
}

class ProofService {
  private wasmPath = '/circuits/movement.wasm'
  private zkeyPath = '/circuits/movement_final.zkey'
  private vkeyPath = '/circuits/movement_verification_key.json'
  
  private timeRewardWasmPath = '/circuits/timeReward.wasm'
  private timeRewardZkeyPath = '/circuits/timeReward_final.zkey'
  private timeRewardVkeyPath = '/circuits/timeReward_verification_key.json'

  /**
   * Generate a movement proof
   */
  async generateMovementProof(inputs: MovementProofInputs): Promise<MovementProof> {
    try {
      console.log('🔍 [ProofService] Starting macro movement proof generation...')
      console.log('📥 [ProofService] Input data:', {
        playerId: inputs.playerId,
        oldPosition: { areaId: inputs.oldAreaId, areaType: inputs.oldAreaType },
        newPosition: { areaId: inputs.newAreaId, areaType: inputs.newAreaType },
        inventoryLength: inputs.inventory.length,
        currency: inputs.currency,
        timestamp: inputs.timestamp
      })
      
      // Prepare inputs for the circuit
      console.log('⚙️ [ProofService] Preparing circuit inputs...')
      const circuitInputs = this.prepareMovementInputs(inputs)
      console.log('📋 [ProofService] Circuit inputs prepared:', {
        playerId: circuitInputs.playerId,
        oldPosition: { areaId: circuitInputs.oldAreaId, areaType: circuitInputs.oldAreaType },
        newPosition: { areaId: circuitInputs.newAreaId, areaType: circuitInputs.newAreaType },
        inventoryLength: circuitInputs.inventory.length,
        timestamp: circuitInputs.timestamp,
        totalInputs: Object.keys(circuitInputs).length
      })
      
      // Generate the proof using snarkjs
      console.log('🔧 [ProofService] Generating proof with snarkjs...')
      console.log('📁 [ProofService] Using files:', {
        wasm: this.wasmPath,
        zkey: this.zkeyPath
      })
      
      const { proof, publicSignals } = await groth16.fullProve(
        circuitInputs, 
        this.wasmPath, 
        this.zkeyPath
      )
      
      console.log('✅ [ProofService] Proof generated successfully!')
      console.log('📊 [ProofService] Public signals:', {
        length: publicSignals.length,
        signals: publicSignals
      })
      console.log('🔐 [ProofService] Proof structure:', {
        pi_a_length: proof.pi_a.length,
        pi_b_length: proof.pi_b.length,
        pi_c_length: proof.pi_c.length,
        pi_a: proof.pi_a,
        pi_b: proof.pi_b,
        pi_c: proof.pi_c
      })
      
      const result = {
        proof: {
          pi_a: proof.pi_a,
          pi_b: proof.pi_b,
          pi_c: proof.pi_c
        },
        publicSignals: publicSignals as [string, string, string]
      }
      
      console.log('📤 [ProofService] Returning proof result:', {
        publicSignalsLength: result.publicSignals.length,
        publicSignals: result.publicSignals
      })
      
      return result
    } catch (error) {
      console.error('❌ [ProofService] Proof generation failed:', error)
      console.error('📋 [ProofService] Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      })
      throw new Error(`Failed to generate movement proof: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Generate a time reward proof
   */
  async generateTimeRewardProof(inputs: TimeRewardProofInputs): Promise<TimeRewardProof> {
    try {
      console.log('🔍 [ProofService] Starting time reward proof generation...')
      console.log('📥 [ProofService] Input data:', {
        playerId: inputs.playerId,
        position: { x: inputs.positionX, y: inputs.positionY },
        currency: inputs.currency,
        lastClaimTime: inputs.lastClaimTime,
        currentTime: inputs.currentTime,
        rewardAmount: inputs.rewardAmount,
        reputation: inputs.reputation
      })
      
      // Prepare inputs for the circuit
      console.log('⚙️ [ProofService] Preparing circuit inputs...')
      const circuitInputs = this.prepareTimeRewardInputs(inputs)
      console.log('📋 [ProofService] Circuit inputs prepared:', {
        playerId: circuitInputs.playerId,
        position: { x: circuitInputs.positionX, y: circuitInputs.positionY },
        currency: circuitInputs.currency,
        lastClaimTime: circuitInputs.lastClaimTime,
        currentTime: circuitInputs.currentTime,
        rewardAmount: circuitInputs.rewardAmount,
        totalInputs: Object.keys(circuitInputs).length
      })
      
      // Generate the proof using snarkjs
      console.log('🔧 [ProofService] Generating proof with snarkjs...')
      console.log('📁 [ProofService] Using files:', {
        wasm: this.timeRewardWasmPath,
        zkey: this.timeRewardZkeyPath
      })
      
      const { proof, publicSignals } = await groth16.fullProve(
        circuitInputs, 
        this.timeRewardWasmPath, 
        this.timeRewardZkeyPath
      )
      
      console.log('✅ [ProofService] Time reward proof generated successfully!')
      console.log('📊 [ProofService] Public signals:', {
        length: publicSignals.length,
        signals: publicSignals
      })
      console.log('🔐 [ProofService] Proof structure:', {
        pi_a_length: proof.pi_a.length,
        pi_b_length: proof.pi_b.length,
        pi_c_length: proof.pi_c.length,
        pi_a: proof.pi_a,
        pi_b: proof.pi_b,
        pi_c: proof.pi_c
      })
      
      // Validate that we have exactly 4 public signals as expected by the contract
      const expectedPublicSignalsLength = 4
      if (publicSignals.length !== expectedPublicSignalsLength) {
        console.error(`❌ [ProofService] Time reward proof has wrong number of public signals!`, {
          expected: expectedPublicSignalsLength,
          actual: publicSignals.length,
          publicSignals: publicSignals
        })
        throw new Error(`Time reward proof generated ${publicSignals.length} public signals, but contract expects ${expectedPublicSignalsLength}`)
      }
      
      const result = {
        proof: {
          pi_a: proof.pi_a,
          pi_b: proof.pi_b,
          pi_c: proof.pi_c
        },
        publicSignals: publicSignals as [string, string, string, string]
      }
      
      console.log('📤 [ProofService] Returning time reward proof result:', {
        publicSignalsLength: result.publicSignals.length,
        publicSignals: result.publicSignals
      })
      
      return result
    } catch (error) {
      console.error('❌ [ProofService] Time reward proof generation failed:', error)
      console.error('📋 [ProofService] Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      })
      throw new Error(`Failed to generate time reward proof: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Verify a movement proof
   */
  async verifyMovementProof(proof: MovementProof): Promise<boolean> {
    try {
      const vkey = await this.loadVerificationKey()
      return await groth16.verify(vkey, proof.publicSignals, proof.proof)
    } catch (error) {
      console.error('Proof verification failed:', error)
      return false
    }
  }

  /**
   * Prepare inputs for the macro movement circuit
   */
  private prepareMovementInputs(inputs: MovementProofInputs) {
    // Pad arrays to required sizes
    const inventory = this.padArray(inputs.inventory, 64, 0)
    const ownedStores = this.padArray(inputs.ownedStores, 10, 0)
    const exploredAreas = this.padArray(inputs.exploredAreas, 1000, 0)

    const circuitInputs = {
      // Private inputs - single values
      playerId: Number(inputs.playerId),
      oldAreaId: Number(inputs.oldAreaId),
      oldAreaType: Number(inputs.oldAreaType),
      newAreaId: Number(inputs.newAreaId),
      newAreaType: Number(inputs.newAreaType),
      currency: Number(inputs.currency),
      lastClaimTime: Number(inputs.lastClaimTime),
      reputation: Number(inputs.reputation),
      experience: Number(inputs.experience),
      nonce: Number(inputs.nonce),
      
      // Private inputs - arrays
      inventory: inventory.map(Number),
      ownedStores: ownedStores.map(Number),
      exploredAreas: exploredAreas.map(Number),
      exploredProof: new Array(10).fill(0), // Simplified for now
      exploredIndices: new Array(10).fill(0), // Simplified for now
      areaConnections: new Array(1000).fill(0), // Simplified for now
      
      // Public inputs (these will be included in publicSignals)
      timestamp: Number(inputs.timestamp)
    }

    // Debug logging to see the exact structure
    console.log('🔍 [ProofService] Detailed circuit input structure:')
    console.log('  Single values:', {
      playerId: circuitInputs.playerId,
      oldAreaId: circuitInputs.oldAreaId,
      oldAreaType: circuitInputs.oldAreaType,
      newAreaId: circuitInputs.newAreaId,
      newAreaType: circuitInputs.newAreaType,
      currency: circuitInputs.currency,
      lastClaimTime: circuitInputs.lastClaimTime,
      reputation: circuitInputs.reputation,
      experience: circuitInputs.experience,
      nonce: circuitInputs.nonce,
      timestamp: circuitInputs.timestamp
    })
    console.log('  Array lengths:', {
      inventory: circuitInputs.inventory.length,
      ownedStores: circuitInputs.ownedStores.length,
      exploredAreas: circuitInputs.exploredAreas.length,
      exploredProof: circuitInputs.exploredProof.length,
      exploredIndices: circuitInputs.exploredIndices.length,
      areaConnections: circuitInputs.areaConnections.length
    })
    console.log('  Array samples:', {
      inventory: circuitInputs.inventory.slice(0, 5),
      ownedStores: circuitInputs.ownedStores.slice(0, 5),
      exploredAreas: circuitInputs.exploredAreas.slice(0, 5)
    })

    return circuitInputs
  }

  /**
   * Prepare inputs for the time reward circuit
   */
  private prepareTimeRewardInputs(inputs: TimeRewardProofInputs) {
    // Pad arrays to required sizes
    const inventory = this.padArray(inputs.inventory, 64, 0)
    const ownedStores = this.padArray(inputs.ownedStores, 10, 0)
    const exploredCells = this.padArray(inputs.exploredCells, 1000, 0)

    const circuitInputs = {
      // Private inputs - single values
      playerId: Number(inputs.playerId),
      positionX: Number(inputs.positionX),
      positionY: Number(inputs.positionY),
      currency: Number(inputs.currency),
      lastClaimTime: Number(inputs.lastClaimTime),
      reputation: Number(inputs.reputation),
      experience: Number(inputs.experience),
      nonce: Number(inputs.nonce),
      currentTime: Number(inputs.currentTime),
      
      // Private inputs - arrays
      inventory: inventory.map(Number),
      ownedStores: ownedStores.map(Number),
      exploredCells: exploredCells.map(Number)
    }

    // Debug logging to see the exact structure
    console.log('🔍 [ProofService] Detailed time reward circuit input structure:')
    console.log('  Single values:', {
      playerId: circuitInputs.playerId,
      positionX: circuitInputs.positionX,
      positionY: circuitInputs.positionY,
      currency: circuitInputs.currency,
      lastClaimTime: circuitInputs.lastClaimTime,
      reputation: circuitInputs.reputation,
      experience: circuitInputs.experience,
      nonce: circuitInputs.nonce,
      currentTime: circuitInputs.currentTime
    })
    console.log('  Array lengths:', {
      inventory: circuitInputs.inventory.length,
      ownedStores: circuitInputs.ownedStores.length,
      exploredCells: circuitInputs.exploredCells.length
    })
    
    // Count total inputs
    const totalInputs = 9 + circuitInputs.inventory.length + circuitInputs.ownedStores.length + circuitInputs.exploredCells.length
    console.log('📊 [ProofService] Total input count:', totalInputs)
    console.log('📋 [ProofService] All circuit inputs:', circuitInputs)

    return circuitInputs
  }

  /**
   * Compute state commitment for time reward circuit
   */
  private computeTimeRewardStateCommitment(inputs: TimeRewardProofInputs, isNew: boolean): string {
    // Compute inventory hash (sum of all inventory values)
    const inventoryHash = inputs.inventory.reduce((sum, val) => sum + val, 0)
    
    // Compute stores hash (sum of all owned stores)
    const storesHash = inputs.ownedStores.reduce((sum, val) => sum + val, 0)
    
    // Compute explored hash (sum of all explored cells)
    const exploredHash = inputs.exploredCells.reduce((sum, val) => sum + val, 0)
    
    // Create input array exactly as the circuit does
    const inputs_array = [
      Number(inputs.playerId),
      inputs.positionX,
      inputs.positionY,
      isNew ? inputs.currency + inputs.rewardAmount : inputs.currency,
      isNew ? inputs.currentTime : inputs.lastClaimTime,
      inputs.reputation,
      inputs.experience,
      isNew ? inputs.nonce + 1 : inputs.nonce,
      inventoryHash,
      storesHash,
      exploredHash,
      inputs.currentTime
    ]
    
    // Use the same hash function as the circuit with modular arithmetic
    const FIELD_SIZE = BigInt('21888242871839275222246405745257275088548364400416034343698204186575808495617')
    
    let hash = BigInt(0)
    let multiplier = BigInt(1)
    
    for (let i = 0; i < inputs_array.length; i++) {
      const contribution = BigInt(inputs_array[i]) * multiplier
      hash = (hash + contribution) % FIELD_SIZE
      multiplier = (multiplier * BigInt(31)) % FIELD_SIZE
    }
    
    // Add non-linearity exactly as the circuit does
    hash = (hash * hash + hash) % FIELD_SIZE
    
    // Convert to hex string to match circuit output format
    return '0x' + hash.toString(16).padStart(64, '0')
  }

  /**
   * Compute state commitment hash
   * This matches the circuit's Poseidon implementation
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private _computeStateCommitment(state: any): string {
    // Compute inventory hash (sum of all inventory values)
    const inventoryHash = state.inventory.reduce((sum: number, val: number) => sum + val, 0)
    
    // Compute stores hash (sum of all owned stores)
    const storesHash = state.ownedStores.reduce((sum: number, val: number) => sum + val, 0)
    
    // Compute explored hash (sum of all explored cells)
    const exploredHash = state.exploredCells.reduce((sum: number, val: number) => sum + val, 0)
    
    // Create input array exactly as the circuit does
    const inputs = [
      Number(state.playerId),
      state.x,
      state.y,
      state.currency,
      state.lastClaimTime,
      state.reputation,
      state.experience,
      state.nonce,
      inventoryHash,
      storesHash,
      exploredHash,
      state.timestamp
    ]
    
    // Use the same hash function as the circuit with modular arithmetic
    // The field size for BN254 is approximately 2^254
    const FIELD_SIZE = BigInt('21888242871839275222246405745257275088548364400416034343698204186575808495617')
    
    let hash = BigInt(0)
    let multiplier = BigInt(1)
    
    for (let i = 0; i < inputs.length; i++) {
      const contribution = BigInt(inputs[i]) * multiplier
      hash = (hash + contribution) % FIELD_SIZE
      multiplier = (multiplier * BigInt(31)) % FIELD_SIZE // Prime number for better distribution
    }
    
    // Add non-linearity exactly as the circuit does
    hash = (hash * hash + hash) % FIELD_SIZE
    
    // Convert to hex string to match circuit output format
    return '0x' + hash.toString(16).padStart(64, '0')
  }

  /**
   * Compute new state commitment for movement
   * This matches the circuit's logic for updating the state
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private _computeNewStateCommitment(state: any, newX: number, newY: number): string {
    // Compute inventory hash (sum of all inventory values)
    const inventoryHash = state.inventory.reduce((sum: number, val: number) => sum + val, 0)
    
    // Compute stores hash (sum of all owned stores)
    const storesHash = state.ownedStores.reduce((sum: number, val: number) => sum + val, 0)
    
    // Compute explored hash (sum of all explored cells)
    const exploredHash = state.exploredCells.reduce((sum: number, val: number) => sum + val, 0)
    
    // Update explored hash exactly as the circuit does: exploredHash + newX * 1000 + newY
    const updatedExploredHash = exploredHash + newX * 1000 + newY
    
    // Create input array exactly as the circuit does for the new state
    const inputs = [
      Number(state.playerId),
      newX,
      newY,
      state.currency,
      state.lastClaimTime,
      state.reputation,
      state.experience + 10, // Movement XP
      state.nonce + 1, // Incremented nonce
      inventoryHash,
      storesHash,
      updatedExploredHash,
      state.timestamp
    ]
    
    // Use the same hash function as the circuit with modular arithmetic
    // The field size for BN254 is approximately 2^254
    const FIELD_SIZE = BigInt('21888242871839275222246405745257275088548364400416034343698204186575808495617')
    
    let hash = BigInt(0)
    let multiplier = BigInt(1)
    
    for (let i = 0; i < inputs.length; i++) {
      const contribution = BigInt(inputs[i]) * multiplier
      hash = (hash + contribution) % FIELD_SIZE
      multiplier = (multiplier * BigInt(31)) % FIELD_SIZE // Prime number for better distribution
    }
    
    // Add non-linearity exactly as the circuit does
    hash = (hash * hash + hash) % FIELD_SIZE
    
    // Convert to hex string to match circuit output format
    return '0x' + hash.toString(16).padStart(64, '0')
  }

  /**
   * Pad array to required size
   */
  private padArray(arr: number[], size: number, fillValue: number): number[] {
    const padded = [...arr]
    while (padded.length < size) {
      padded.push(fillValue)
    }
    return padded.slice(0, size)
  }


  /**
   * Load verification key
   */
  private async loadVerificationKey(): Promise<any> {
    const response = await fetch(this.vkeyPath)
    if (!response.ok) {
      throw new Error(`Failed to load verification key: ${response.statusText}`)
    }
    return await response.json()
  }
}

export const proofService = new ProofService()
