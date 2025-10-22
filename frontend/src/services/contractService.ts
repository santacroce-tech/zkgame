
import { ethers } from 'ethers'
import { MovementProof, TimeRewardProof } from './proofService'

export interface ContractConfig {
  gameCoreAddress: string
  stateManagerAddress: string
  proofVerifierAddress: string
}

export interface TransactionResult {
  hash: string
  success: boolean
  error?: string
}

class ContractService {
  private provider: ethers.BrowserProvider | null = null
  private signer: ethers.JsonRpcSigner | null = null
  private gameCoreContract: ethers.Contract | null = null
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private _config: ContractConfig | null = null

  /**
   * Initialize the contract service with wallet connection
   */
  async initialize(provider: ethers.BrowserProvider, config: ContractConfig) {
    console.log('🔧 [ContractService] Initializing contract service...', {
      hasProvider: !!provider,
      config,
      providerType: typeof provider
    })
    
    this.provider = provider
    this.signer = await provider.getSigner()
    this._config = config

    console.log('✅ [ContractService] Provider and signer initialized:', {
      hasSigner: !!this.signer,
      signerAddress: await this.signer.getAddress()
    })

    // Load contract ABI
    console.log('📋 [ContractService] Loading contract ABI...')
    const gameCoreABI = await this.loadContractABI('GameCore')
    console.log('✅ [ContractService] ABI loaded:', {
      abiLength: gameCoreABI.length,
      hasMoveFunction: gameCoreABI.some((item: any) => item.name === 'move'),
      hasClaimRewardFunction: gameCoreABI.some((item: any) => item.name === 'claimReward')
    })
    
    // Initialize contract
    console.log('📝 [ContractService] Creating contract instance...', {
      address: config.gameCoreAddress
    })
    this.gameCoreContract = new ethers.Contract(
      config.gameCoreAddress,
      gameCoreABI,
      this.signer
    )
    
    console.log('✅ [ContractService] Contract service initialized successfully!')
  }

  /**
   * Submit a movement proof to the smart contract
   */
  async submitMovementProof(proof: MovementProof): Promise<TransactionResult> {
    console.log('🚀 [ContractService] Starting movement proof submission...')
    
    if (!this.gameCoreContract) {
      console.error('❌ [ContractService] Contract service not initialized')
      throw new Error('Contract service not initialized')
    }

    try {
      console.log('📥 [ContractService] Received proof:', {
        publicSignalsLength: proof.publicSignals.length,
        publicSignals: proof.publicSignals,
        proofStructure: {
          pi_a_length: proof.proof.pi_a.length,
          pi_b_length: proof.proof.pi_b.length,
          pi_c_length: proof.proof.pi_c.length
        }
      })
      
      // Format proof for contract
      console.log('⚙️ [ContractService] Formatting proof for contract...')
      const formattedProof = this.formatProofForContract(proof)
      
      console.log('🔧 [ContractService] Formatted proof:', {
        a: formattedProof.a,
        b: formattedProof.b,
        c: formattedProof.c,
        publicSignals: proof.publicSignals
      })
      
      // Convert publicSignals to numbers if they're strings
      console.log('🔄 [ContractService] Converting public signals...')
      const publicSignals = proof.publicSignals.map((signal, index) => {
        const converted = typeof signal === 'string' ? BigInt(signal) : signal
        console.log(`📊 [ContractService] Signal ${index}: "${signal}" -> ${converted}`)
        return converted
      })
      
      console.log('📤 [ContractService] Final public signals for contract:', {
        length: publicSignals.length,
        signals: publicSignals
      })
      
      // Check contract ABI
      console.log('📋 [ContractService] Contract ABI for move function:', this.gameCoreContract.interface.getFunction('move'))
      
      // Submit transaction
      console.log('📡 [ContractService] Submitting transaction to contract...')
      const tx = await this.gameCoreContract.move(
        formattedProof.a,
        formattedProof.b,
        formattedProof.c,
        publicSignals,
        {
          gasLimit: 500000 // Adjust based on actual gas usage
        }
      )

      console.log('⏳ [ContractService] Transaction submitted, waiting for confirmation...')
      console.log('🔗 [ContractService] Transaction hash:', tx.hash)

      // Wait for confirmation
      const receipt = await tx.wait()
      
      console.log('✅ [ContractService] Transaction confirmed!')
      console.log('📊 [ContractService] Receipt details:', {
        hash: receipt.hash,
        status: receipt.status,
        gasUsed: receipt.gasUsed?.toString(),
        blockNumber: receipt.blockNumber
      })
      
      return {
        hash: receipt.hash,
        success: receipt.status === 1
      }
    } catch (error) {
      console.error('❌ [ContractService] Movement proof submission failed:', error)
      console.error('📋 [ContractService] Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        code: (error as any)?.code,
        reason: (error as any)?.reason,
        data: (error as any)?.data
      })
      return {
        hash: '',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Submit a time reward proof to the smart contract
   */
  async submitTimeRewardProof(proof: TimeRewardProof): Promise<TransactionResult> {
    console.log('🚀 [ContractService] Starting time reward proof submission...')
    
    if (!this.gameCoreContract) {
      console.error('❌ [ContractService] Contract service not initialized')
      throw new Error('Contract service not initialized')
    }

    try {
      console.log('📥 [ContractService] Received time reward proof:', {
        publicSignalsLength: proof.publicSignals.length,
        publicSignals: proof.publicSignals,
        proofStructure: {
          pi_a_length: proof.proof.pi_a.length,
          pi_b_length: proof.proof.pi_b.length,
          pi_c_length: proof.proof.pi_c.length
        }
      })
      
      // Format proof for contract
      console.log('⚙️ [ContractService] Formatting time reward proof for contract...')
      const formattedProof = this.formatProofForContract(proof)
      
      console.log('🔧 [ContractService] Formatted time reward proof:', {
        a: formattedProof.a,
        b: formattedProof.b,
        c: formattedProof.c,
        publicSignals: proof.publicSignals
      })
      
      // Convert publicSignals to numbers if they're strings
      console.log('🔄 [ContractService] Converting time reward public signals...')
      const publicSignals = proof.publicSignals.map((signal, index) => {
        const converted = typeof signal === 'string' ? BigInt(signal) : signal
        console.log(`📊 [ContractService] Signal ${index}: "${signal}" -> ${converted}`)
        return converted
      })
      
      console.log('📤 [ContractService] Final time reward public signals for contract:', {
        length: publicSignals.length,
        signals: publicSignals
      })
      
      // Check contract ABI
      const claimRewardFunction = this.gameCoreContract.interface.getFunction('claimReward')
      console.log('📋 [ContractService] Contract ABI for claimReward function:', claimRewardFunction)
      console.log('📋 [ContractService] Expected publicSignals type:', claimRewardFunction.inputs[3].type)
      
      // Validate publicSignals length before submission
      const expectedLength = 4 // Based on contract ABI
      if (publicSignals.length !== expectedLength) {
        console.error(`❌ [ContractService] Public signals length mismatch!`, {
          expected: expectedLength,
          actual: publicSignals.length,
          publicSignals: publicSignals
        })
        throw new Error(`Public signals array has wrong length: expected ${expectedLength}, got ${publicSignals.length}`)
      }
      
      // Submit transaction
      console.log('📡 [ContractService] Submitting time reward transaction to contract...')
      console.log('🔍 [ContractService] About to call contract.claimReward() - MetaMask should popup now!')
      console.log('📋 [ContractService] Contract method details:', {
        contractAddress: this.gameCoreContract?.target,
        methodName: 'claimReward',
        hasSigner: !!this.signer,
        signerAddress: await this.signer?.getAddress(),
        publicSignalsLength: publicSignals.length,
        publicSignals: publicSignals
      })
      
      const tx = await this.gameCoreContract.claimReward(
        formattedProof.a,
        formattedProof.b,
        formattedProof.c,
        publicSignals,
        {
          gasLimit: 500000 // Adjust based on actual gas usage
        }
      )

      console.log('✅ [ContractService] MetaMask transaction initiated successfully!')
      console.log('⏳ [ContractService] Time reward transaction submitted, waiting for confirmation...')
      console.log('🔗 [ContractService] Transaction hash:', tx.hash)

      // Wait for confirmation
      const receipt = await tx.wait()
      
      console.log('✅ [ContractService] Time reward transaction confirmed!')
      console.log('📊 [ContractService] Receipt details:', {
        hash: receipt.hash,
        status: receipt.status,
        gasUsed: receipt.gasUsed?.toString(),
        blockNumber: receipt.blockNumber
      })
      
      return {
        hash: receipt.hash,
        success: receipt.status === 1
      }
    } catch (error) {
      console.error('❌ [ContractService] Time reward proof submission failed:', error)
      console.error('📋 [ContractService] Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        code: (error as any)?.code,
        reason: (error as any)?.reason,
        data: (error as any)?.data
      })
      return {
        hash: '',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Get player's current state commitment
   */
  async getPlayerCommitment(playerAddress: string): Promise<string> {
    if (!this.gameCoreContract) {
      throw new Error('Contract service not initialized')
    }

    try {
      // This would call the StateManager contract
      // For now, return a placeholder
      return ethers.keccak256(ethers.toUtf8Bytes(playerAddress + Date.now()))
    } catch (error) {
      console.error('Failed to get player commitment:', error)
      throw error
    }
  }

  /**
   * Check if player is registered
   */
  async isPlayerRegistered(_playerAddress: string): Promise<boolean> {
    if (!this.gameCoreContract) {
      throw new Error('Contract service not initialized')
    }

    try {
      // This would check the StateManager contract
      // For now, return true
      return true
    } catch (error) {
      console.error('Failed to check player registration:', error)
      return false
    }
  }

  /**
   * Register a new player
   */
  async registerPlayer(_playerAddress: string, _initialCommitment: string): Promise<TransactionResult> {
    if (!this.gameCoreContract) {
      throw new Error('Contract service not initialized')
    }

    try {
      // This would call the StateManager contract
      // For now, return a mock transaction
      return {
        hash: '0x' + Date.now().toString(16),
        success: true
      }
    } catch (error) {
      console.error('Player registration failed:', error)
      return {
        hash: '',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Format proof for smart contract
   */
  private formatProofForContract(proof: MovementProof | TimeRewardProof) {
    // Convert proof format to match contract expectations
    // Contract expects: a[2], b[2][2], c[2]
    // Convert all values to BigInt for proper handling
    return {
      a: [
        BigInt(proof.proof.pi_a[0]),
        BigInt(proof.proof.pi_a[1])
      ],
      b: [
        [BigInt(proof.proof.pi_b[0][0]), BigInt(proof.proof.pi_b[0][1])],
        [BigInt(proof.proof.pi_b[1][0]), BigInt(proof.proof.pi_b[1][1])]
      ],
      c: [
        BigInt(proof.proof.pi_c[0]),
        BigInt(proof.proof.pi_c[1])
      ]
    }
  }

  /**
   * Load contract ABI
   */
  private async loadContractABI(contractName: string): Promise<any[]> {
    try {
      console.log(`📋 [ContractService] Loading ABI for ${contractName}...`)
      const response = await fetch(`/contracts/${contractName}.json`)
      if (!response.ok) {
        throw new Error(`Failed to load ${contractName} ABI: ${response.statusText}`)
      }
      const artifact = await response.json()
      console.log(`✅ [ContractService] Successfully loaded ${contractName} ABI:`, {
        abiLength: artifact.abi.length,
        hasMoveFunction: artifact.abi.some((item: any) => item.name === 'move'),
        hasClaimRewardFunction: artifact.abi.some((item: any) => item.name === 'claimReward'),
        moveFunction: artifact.abi.find((item: any) => item.name === 'move'),
        claimRewardFunction: artifact.abi.find((item: any) => item.name === 'claimReward')
      })
      return artifact.abi
    } catch (error) {
      console.error(`❌ [ContractService] Failed to load ${contractName} ABI:`, error)
      // Return correct fallback ABI for testing
      return [
        {
          "inputs": [
            {"name": "a", "type": "uint256[2]"},
            {"name": "b", "type": "uint256[2][2]"},
            {"name": "c", "type": "uint256[2]"},
            {"name": "publicSignals", "type": "uint256[3]"}
          ],
          "name": "move",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {"name": "a", "type": "uint256[2]"},
            {"name": "b", "type": "uint256[2][2]"},
            {"name": "c", "type": "uint256[2]"},
            {"name": "publicSignals", "type": "uint256[4]"}
          ],
          "name": "claimReward",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        }
      ]
    }
  }

  /**
   * Get current gas price
   */
  async getGasPrice(): Promise<bigint> {
    if (!this.provider) {
      throw new Error('Provider not initialized')
    }
    const feeData = await this.provider.getFeeData()
    return feeData.gasPrice || BigInt(0)
  }

  /**
   * Estimate gas for a transaction
   */
  async estimateGas(method: string, ...args: any[]): Promise<bigint> {
    if (!this.gameCoreContract) {
      throw new Error('Contract service not initialized')
    }

    try {
      return await this.gameCoreContract[method].estimateGas(...args)
    } catch (error) {
      console.error('Gas estimation failed:', error)
      return BigInt(500000) // Fallback gas limit
    }
  }
}

export const contractService = new ContractService()
