#include "barretenberg/common/test.hpp"
#include "barretenberg/goblin/mock_circuits.hpp"
#include "barretenberg/stdlib/primitives/curves/bn254.hpp"
#include "barretenberg/stdlib/recursion/honk/verifier/merge_recursive_verifier.hpp"
#include "barretenberg/ultra_honk/ultra_composer.hpp"

namespace bb::stdlib::recursion::goblin {

/**
 * @brief Test suite for recursive verification of Goblin Merge proofs
 * @details The recursive verification circuit is arithmetized using Goblin-style Ultra arithmetization
 * (GoblinUltraCircuitBuilder).
 *
 * @tparam Builder
 */
class RecursiveMergeVerifierTest : public testing::Test {

    // Types for recursive verifier circuit
    using RecursiveBuilder = GoblinUltraCircuitBuilder;
    using RecursiveMergeVerifier = MergeRecursiveVerifier_<RecursiveBuilder>;

    // Define types relevant for inner circuit
    using GoblinUltraComposer = UltraComposer_<GoblinUltraFlavor>;
    using InnerFlavor = GoblinUltraFlavor;
    using InnerComposer = GoblinUltraComposer;
    using InnerBuilder = typename InnerComposer::CircuitBuilder;

    // Define additional types for testing purposes
    using Commitment = InnerFlavor::Commitment;
    using FF = InnerFlavor::FF;
    using VerifierCommitmentKey = bb::VerifierCommitmentKey<curve::BN254>;
    using MergeProver = MergeProver_<InnerFlavor>;
    using MergeVerifier = MergeVerifier_<InnerFlavor>;

  public:
    static void SetUpTestSuite() { bb::srs::init_crs_factory("../srs_db/ignition"); }

    /**
     * @brief Test recursive merge verification for the ops generated by a sample circuit
     * @details We construct and verify an Ultra Honk proof of the recursive merge verifier circuit to check its
     * correctness rather than calling check_circuit since this functionality is incomplete for the Goblin
     * arithmetization
     */
    static void test_recursive_merge_verification()
    {
        auto op_queue = std::make_shared<ECCOpQueue>();

        InnerBuilder sample_circuit{ op_queue };
        GoblinMockCircuits::construct_simple_initial_circuit(sample_circuit);

        // Generate a proof over the inner circuit
        MergeProver merge_prover{ op_queue };
        auto merge_proof = merge_prover.construct_proof();

        // Create a recursive merge verification circuit for the merge proof
        RecursiveBuilder outer_circuit;
        RecursiveMergeVerifier verifier{ &outer_circuit };
        auto pairing_points = verifier.verify_proof(merge_proof);

        // Check for a failure flag in the recursive verifier circuit
        EXPECT_EQ(outer_circuit.failed(), false) << outer_circuit.err();

        // Check 1: Perform native merge verification then perform the pairing on the outputs of the recursive merge
        // verifier and check that the result agrees.
        MergeVerifier native_verifier;
        bool verified_native = native_verifier.verify_proof(merge_proof);
        VerifierCommitmentKey pcs_verification_key;
        auto verified_recursive =
            pcs_verification_key.pairing_check(pairing_points[0].get_value(), pairing_points[1].get_value());
        EXPECT_EQ(verified_native, verified_recursive);
        EXPECT_TRUE(verified_recursive);

        // Check 2: Ensure that the underlying native and recursive merge verification algorithms agree by ensuring
        // the manifests produced by each agree.
        auto recursive_manifest = verifier.transcript->get_manifest();
        auto native_manifest = native_verifier.transcript->get_manifest();
        for (size_t i = 0; i < recursive_manifest.size(); ++i) {
            EXPECT_EQ(recursive_manifest[i], native_manifest[i]);
        }

        // Check 3: Construct and verify a (goblin) ultra honk proof of the Merge recursive verifier circuit
        {
            GoblinUltraComposer composer;
            auto instance = composer.create_prover_instance(outer_circuit);
            auto prover = composer.create_prover(instance);
            auto verifier = composer.create_verifier(instance->verification_key);
            auto proof = prover.construct_proof();
            bool verified = verifier.verify_proof(proof);

            EXPECT_TRUE(verified);
        }
    }
};

TEST_F(RecursiveMergeVerifierTest, SingleRecursiveVerification)
{
    RecursiveMergeVerifierTest::test_recursive_merge_verification();
};

} // namespace bb::stdlib::recursion::goblin