

#include "./toy_composer.hpp"
#include "barretenberg/proof_system/circuit_builder/generated/toy_circuit_builder.hpp"
#include "barretenberg/proof_system/composer/composer_lib.hpp"
#include "barretenberg/proof_system/composer/permutation_lib.hpp"
#include "barretenberg/vm/generated/toy_verifier.hpp"

namespace bb {

using Flavor = ToyFlavor;
void ToyComposer::compute_witness(CircuitConstructor& circuit)
{
    if (computed_witness) {
        return;
    }

    auto polynomials = circuit.compute_polynomials();

    for (auto [key_poly, prover_poly] : zip_view(proving_key->get_all(), polynomials.get_unshifted())) {
        ASSERT(flavor_get_label(*proving_key, key_poly) == flavor_get_label(polynomials, prover_poly));
        key_poly = prover_poly;
    }

    computed_witness = true;
}

ToyProver ToyComposer::create_prover(CircuitConstructor& circuit_constructor)
{
    compute_proving_key(circuit_constructor);
    compute_witness(circuit_constructor);
    compute_commitment_key(circuit_constructor.get_circuit_subgroup_size());

    ToyProver output_state(proving_key, commitment_key);

    return output_state;
}

ToyVerifier ToyComposer::create_verifier(CircuitConstructor& circuit_constructor)
{
    auto verification_key = compute_verification_key(circuit_constructor);

    ToyVerifier output_state(verification_key);

    auto pcs_verification_key = std::make_unique<VerifierCommitmentKey>();

    output_state.pcs_verification_key = std::move(pcs_verification_key);

    return output_state;
}

std::shared_ptr<Flavor::ProvingKey> ToyComposer::compute_proving_key(CircuitConstructor& circuit_constructor)
{
    if (proving_key) {
        return proving_key;
    }

    // Initialize proving_key
    {
        const size_t subgroup_size = circuit_constructor.get_circuit_subgroup_size();
        proving_key = std::make_shared<Flavor::ProvingKey>(subgroup_size, 0);
    }

    proving_key->contains_recursive_proof = false;

    return proving_key;
}

std::shared_ptr<Flavor::VerificationKey> ToyComposer::compute_verification_key(CircuitConstructor& circuit_constructor)
{
    if (verification_key) {
        return verification_key;
    }

    if (!proving_key) {
        compute_proving_key(circuit_constructor);
    }

    verification_key =
        std::make_shared<Flavor::VerificationKey>(proving_key->circuit_size, proving_key->num_public_inputs);

    return verification_key;
}

} // namespace bb
