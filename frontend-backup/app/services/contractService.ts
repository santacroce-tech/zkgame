'use client'

import { ethers } from 'ethers'
import { MovementProof } from './proofService'

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
  private config: ContractConfig | null = null

  /**
   * Initialize the contract service with wallet connection
   */
  async initialize(provider: ethers.BrowserProvider, config: ContractConfig) {
    this.provider = provider
    this.signer = await provider.getSigner()
    this.config = config

    // Load contract ABI
    const gameCoreABI = await this.loadContractABI('GameCore')
    
    // Initialize contract
    this.gameCoreContract = new ethers.Contract(
      config.gameCoreAddress,
      gameCoreABI,
      this.signer
    )
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
  async isPlayerRegistered(playerAddress: string): Promise<boolean> {
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
  async registerPlayer(playerAddress: string, initialCommitment: string): Promise<TransactionResult> {
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
  private formatProofForContract(proof: MovementProof) {
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
      const response = await fetch(`/contracts/${contractName}.json`)
      if (!response.ok) {
        throw new Error(`Failed to load ${contractName} ABI`)
      }
      const artifact = await response.json()
      return artifact.abi
    } catch (error) {
      console.error(`Failed to load ${contractName} ABI:`, error)
      // Return minimal ABI for testing
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
