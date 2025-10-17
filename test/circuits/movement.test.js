const chai = require("chai");
const path = require("path");
const wasm_tester = require("circom_tester").wasm;

const assert = chai.assert;

describe("Movement Circuit", function () {
    let circuit;

    before(async function () {
        circuit = await wasm_tester(
            path.join(__dirname, "../../circuits/movement.circom")
        );
    });

    it("Should generate valid proof for valid movement", async function () {
        const input = {
            // Private inputs
            playerId: 1,
            oldX: 0,
            oldY: 0,
            newX: 1,
            newY: 0,
            inventory: new Array(64).fill(0),
            currency: 1000,
            lastClaimTime: 1234567890,
            ownedStores: new Array(10).fill(0),
            reputation: 1.0,
            experience: 0,
            nonce: 0,
            exploredCells: new Array(1000).fill(0),
            exploredProof: new Array(10).fill(0),
            exploredIndices: new Array(10).fill(0),
            
            // Public inputs
            oldStateCommitment: 123456789,
            newStateCommitment: 987654321,
            timestamp: 1234567891
        };

        const witness = await circuit.calculateWitness(input);
        await circuit.checkConstraints(witness);
    });

    it("Should fail for invalid movement (too far)", async function () {
        const input = {
            // Private inputs
            playerId: 1,
            oldX: 0,
            oldY: 0,
            newX: 5, // Too far - should fail
            newY: 0,
            inventory: new Array(64).fill(0),
            currency: 1000,
            lastClaimTime: 1234567890,
            ownedStores: new Array(10).fill(0),
            reputation: 1.0,
            experience: 0,
            nonce: 0,
            exploredCells: new Array(1000).fill(0),
            exploredProof: new Array(10).fill(0),
            exploredIndices: new Array(10).fill(0),
            
            // Public inputs
            oldStateCommitment: 123456789,
            newStateCommitment: 987654321,
            timestamp: 1234567891
        };

        try {
            const witness = await circuit.calculateWitness(input);
            await circuit.checkConstraints(witness);
            assert.fail("Should have failed for invalid movement");
        } catch (error) {
            // Expected to fail
            assert.isTrue(error.message.includes("Error"));
        }
    });

    it("Should fail for state commitment mismatch", async function () {
        const input = {
            // Private inputs
            playerId: 1,
            oldX: 0,
            oldY: 0,
            newX: 1,
            newY: 0,
            inventory: new Array(64).fill(0),
            currency: 1000,
            lastClaimTime: 1234567890,
            ownedStores: new Array(10).fill(0),
            reputation: 1.0,
            experience: 0,
            nonce: 0,
            exploredCells: new Array(1000).fill(0),
            exploredProof: new Array(10).fill(0),
            exploredIndices: new Array(10).fill(0),
            
            // Public inputs - wrong commitment
            oldStateCommitment: 999999999, // Wrong commitment
            newStateCommitment: 987654321,
            timestamp: 1234567891
        };

        try {
            const witness = await circuit.calculateWitness(input);
            await circuit.checkConstraints(witness);
            assert.fail("Should have failed for state commitment mismatch");
        } catch (error) {
            // Expected to fail
            assert.isTrue(error.message.includes("Error"));
        }
    });
});
