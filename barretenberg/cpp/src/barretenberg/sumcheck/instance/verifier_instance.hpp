#pragma once
#include "barretenberg/flavor/flavor.hpp"
#include "barretenberg/relations/relation_parameters.hpp"

namespace bb {
/**
 * @brief The VerifierInstance encapsulates all the necessary information for a Goblin Ultra Honk Verifier to verify a
 * proof (sumcheck + Zeromorph). In the context of folding, this is returned by the Protogalaxy verifier with non-zero
 * target sum and gate challenges.
 *
 * @details This is ϕ in the paper.
 */
template <class Flavor, size_t NUM_ = 2> class VerifierInstance_ {
  public:
    using FF = typename Flavor::FF;
    using VerificationKey = typename Flavor::VerificationKey;
    using VerifierCommitmentKey = typename Flavor::VerifierCommitmentKey;
    using WitnessCommitments = typename Flavor::WitnessCommitments;
    using CommitmentLabels = typename Flavor::CommitmentLabels;
    using RelationSeparator = typename Flavor::RelationSeparator;

    std::shared_ptr<VerificationKey> verification_key;
    // TODO(https://github.com/AztecProtocol/barretenberg/issues/881)?: Access throutgh vk by making sure vk is
    // initialized in Protogalaxy?
    std::shared_ptr<VerifierCommitmentKey> pcs_verification_key;
    std::vector<FF> public_inputs;
    size_t pub_inputs_offset = 0;
    size_t public_input_size;
    size_t instance_size;
    size_t log_instance_size;
    RelationParameters<FF> relation_parameters;
    RelationSeparator alphas;
    bool is_accumulator = false;

    // The folding parameters (\vec{β}, e) which are set for accumulators (i.e. relaxed instances).
    std::vector<FF> gate_challenges;
    FF target_sum;

    WitnessCommitments witness_commitments;
    CommitmentLabels commitment_labels;
    VerifierInstance_()
        : pcs_verification_key(std::make_shared<VerifierCommitmentKey>()){};
    VerifierInstance_(std::shared_ptr<VerificationKey> vk)
        : verification_key(std::move(vk))
        , pcs_verification_key(std::make_shared<VerifierCommitmentKey>())
    {}
};
} // namespace bb