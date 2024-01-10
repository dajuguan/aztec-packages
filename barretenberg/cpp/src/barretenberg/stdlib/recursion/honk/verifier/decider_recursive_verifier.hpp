#pragma once
#include "barretenberg/flavor/goblin_ultra_recursive.hpp"
#include "barretenberg/flavor/ultra_recursive.hpp"
#include "barretenberg/plonk/proof_system/types/proof.hpp"
#include "barretenberg/stdlib/recursion/honk/transcript/transcript.hpp"
#include "barretenberg/sumcheck/sumcheck.hpp"

namespace proof_system::plonk::stdlib::recursion::honk {
template <typename Flavor> class DeciderRecursiveVerifier_ {
    using FF = typename Flavor::FF;
    using Commitment = typename Flavor::Commitment;
    using GroupElement = typename Flavor::GroupElement;
    using VerificationKey = typename Flavor::VerificationKey;
    using VerifierCommitmentKey = typename Flavor::VerifierCommitmentKey;
    using NativeVerificationKey = typename Flavor::NativeVerificationKey;
    using Builder = typename Flavor::CircuitBuilder;
    using AlphaType = typename Flavor::AlphaType;
    using PairingPoints = std::array<GroupElement, 2>;

  public:
    explicit DeciderRecursiveVerifier_(Builder* builder,
                                       const std::shared_ptr<NativeVerificationKey>& native_verifier_key);

    PairingPoints verify_proof(const plonk::proof& proof);

    std::shared_ptr<VerificationKey> key;
    std::map<std::string, Commitment> commitments;
    std::shared_ptr<VerifierCommitmentKey> pcs_verification_key;
    Builder* builder;
    std::shared_ptr<Transcript<Builder>> transcript;
};

extern template class DeciderRecursiveVerifier_<proof_system::honk::flavor::UltraRecursive_<UltraCircuitBuilder>>;
extern template class DeciderRecursiveVerifier_<proof_system::honk::flavor::UltraRecursive_<GoblinUltraCircuitBuilder>>;
extern template class DeciderRecursiveVerifier_<proof_system::honk::flavor::GoblinUltraRecursive>;
} // namespace proof_system::plonk::stdlib::recursion::honk