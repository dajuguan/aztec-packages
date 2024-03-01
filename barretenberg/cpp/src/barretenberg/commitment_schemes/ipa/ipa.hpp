#pragma once
#include "barretenberg/commitment_schemes/claim.hpp"
#include "barretenberg/commitment_schemes/verification_key.hpp"
#include "barretenberg/common/assert.hpp"
#include "barretenberg/ecc/scalar_multiplication/scalar_multiplication.hpp"
#include "barretenberg/transcript/transcript.hpp"
#include <cstddef>
#include <numeric>
#include <string>
#include <vector>

namespace bb {

/**
 * @brief IPA (inner-product argument) commitment scheme class. Conforms to the specification
 * https://hackmd.io/q-A8y6aITWyWJrvsGGMWNA?view. Given:
 *
 *1. An SRS (Structured Reference String) \f$\vec{G}=(G_0,G_1...,G_{d-1})\f$ with \f$G_i ∈ E(\mathbb{F}_p)\f$ and
 *\f$\mathbb{F}_r\f$ - the scalar field of the elliptic curve;
 *2. A polynomial \f$p(x)=\sum_{i=0}^{d-1}a_ix^i\f$ over field \f$F_r\f$, where the polynomial degree \f$d-1\f$ is such
 *that \f$d=2^k\f$
 *
 *The prover commits to the polynomial \f$p(x)\f$ by computing the scalar product
 *\f$[p(x)]=\langle\vec{p},\vec{G}\rangle\f$, where \f$\vec{p}=(a_0, a_1,..., a_{d-1})\f$​
 *
 *For a vector \f$\vec{v}=(v_0,v_1,...,v_{2n-1})\f$ of length \f$2n\f$ we'll denote
 *\f$\vec{v}_{low}=(v_0,v_1,...,v_{n-1})\f$ and \f$\vec{v}_{high}=(v_{n},v_{n+1},...v_{2n-1})\f$
 *
 **compute_opening_proof* procedure using 4 arguments:
 *
 *1. A commitment key *ck* containing the srs element
 *2. An opening pair \f$(\beta, p(\beta))\f$
 *3. The polynomial \f$p(x)\f$ in monomial form
 *4. The transcript for sending values to the verifier and receiving challenges
 *
 *The procedure runs as follows:
 *
 *1. Send the degree of \f$p(x)\f$ plus one, equal to \f$d\f$ to the verifier
 *2. Receive the generator challenge \f$u\f$ from the verifier
 *3. Compute the auxiliary generator \f$U=u\cdot G\f$, where \f$G\f$ is a generator of \f$E(\mathbb{F}_p)\f$​
 *4. Set \f$\vec{G}_0=\vec{G}\f$, \f$\vec{a}_0=\vec{p}\f$
 *5. Compute the vector \f$\vec{b}_0=(1,\beta,\beta^2,...,\beta^{d-1})\f$
 *6. Perform \f$k\f$ rounds (for \f$i \in \{0,...,k-1\}\f$) of:
 *   1. Compute
 *\f$L_i=\langle\vec{a}_{i\_low},\vec{G}_{i\_high}\rangle+\langle\vec{a}_{i\_low},\vec{b}_{i\_high}\rangle\cdot U\f$​
 *   2. Compute
 *\f$R_i=\langle\vec{a}_{i\_high},\vec{G}_{i\_low}\rangle+\langle\vec{a}_{i\_high},\vec{b}_{i\_low}\rangle\cdot U\f$
 *   3. Send \f$L_i\f$ and \f$R_i\f$ to the verifier
 *   4. Receive round challenge \f$r_i\f$ from the verifier​
 *   5. Compute \f$\vec{a}_{i+1}=\vec{a}_{i\_low}+r_i\cdot \vec{a}_{i\_high}\f$
 *   6. Compute \f$\vec{b}_{i+1}=\vec{b}_{i\_low}+r_i^{-1}\cdot \vec{b}_{i\_high}\f$​
 *   7. Compute \f$\vec{G}_{i+1}=\vec{G}_{i\_low}+r_i^{-1}\cdot \vec{G}_{i\_high}\f$
 *
 *7. Send the final \f$\vec{a}_{k-1}\f$ of length 1 to the verifier
 */
template <typename Curve> class IPA {
    using Fr = typename Curve::ScalarField;
    using GroupElement = typename Curve::Element;
    using Commitment = typename Curve::AffineElement;
    using CK = CommitmentKey<Curve>;
    using VK = VerifierCommitmentKey<Curve>;
    using Polynomial = bb::Polynomial<Fr>;

  public:
    /**
     * @brief Compute an inner product argument proof for opening a single polynomial at a single evaluation point
     *
     * @param ck The commitment key containing srs and pippenger_runtime_state for computing MSM
     * @param opening_pair (challenge, evaluation)
     * @param polynomial The witness polynomial whose opening proof needs to be computed
     * @param transcript Prover transcript
     * https://github.com/AztecProtocol/aztec-packages/pull/3434
     */
    static void compute_opening_proof(const std::shared_ptr<CK>& ck,
                                      const OpeningPair<Curve>& opening_pair,
                                      const Polynomial& polynomial,
                                      const std::shared_ptr<NativeTranscript>& transcript)
    {
        ASSERT(opening_pair.challenge != 0 && "The challenge point should not be zero");
        auto poly_degree_plus_1 = static_cast<size_t>(polynomial.size());
        transcript->send_to_verifier("IPA:poly_degree_plus_1", static_cast<uint32_t>(poly_degree_plus_1));
        const Fr generator_challenge = transcript->template get_challenge<Fr>("IPA:generator_challenge");
        auto aux_generator = Commitment::one() * generator_challenge;
        // Checks poly_degree is greater than zero and a power of two
        // In the future, we might want to consider if non-powers of two are needed
        ASSERT((poly_degree_plus_1 > 0) && (!(poly_degree_plus_1 & (poly_degree_plus_1 - 1))) &&
               "The polynomial degree plus 1 should be positive and a power of two");

        auto a_vec = polynomial;
        auto* srs_elements = ck->srs->get_monomial_points();
        std::vector<Commitment> G_vec_local(poly_degree_plus_1);

        // The SRS stored in the commitment key is the result after applying the pippenger point table so the
        // values at odd indices contain the point {srs[i-1].x * beta, srs[i-1].y}, where beta is the endomorphism
        // G_vec_local should use only the original SRS thus we extract only the even indices.
        run_loop_in_parallel_if_effective(
            poly_degree_plus_1,
            [&G_vec_local, srs_elements](size_t start, size_t end) {
                for (size_t i = start * 2; i < end * 2; i += 2) {
                    G_vec_local[i >> 1] = srs_elements[i];
                }
            },
            /*finite_field_additions_per_iteration=*/0,
            /*finite_field_multiplications_per_iteration=*/0,
            /*finite_field_inversions_per_iteration=*/0,
            /*group_element_additions_per_iteration=*/0,
            /*group_element_doublings_per_iteration=*/0,
            /*scalar_multiplications_per_iteration=*/0,
            /*sequential_copy_ops_per_iteration=*/1);

        std::vector<Fr> b_vec(poly_degree_plus_1);
        run_loop_in_parallel_if_effective(
            poly_degree_plus_1,
            [&b_vec, &opening_pair](size_t start, size_t end) {
                Fr b_power = opening_pair.challenge.pow(start);
                for (size_t i = start; i < end; i++) {
                    b_vec[i] = b_power;
                    b_power *= opening_pair.challenge;
                }
            },
            /*finite_field_additions_per_iteration=*/0,
            /*finite_field_multiplications_per_iteration=*/1);

        // Iterate for log(poly_degree) rounds to compute the round commitments.
        auto log_poly_degree = static_cast<size_t>(numeric::get_msb(poly_degree_plus_1));
        std::vector<GroupElement> L_elements(log_poly_degree);
        std::vector<GroupElement> R_elements(log_poly_degree);
        std::size_t round_size = poly_degree_plus_1;

        // Allocate vectors for parallel storage of partial products
        const size_t num_cpus = get_num_cpus();
        std::vector<Fr> partial_inner_prod_L(num_cpus);
        std::vector<Fr> partial_inner_prod_R(num_cpus);
        // Perform IPA rounds
        for (size_t i = 0; i < log_poly_degree; i++) {
            round_size >>= 1;
            // Set partial products to zero
            memset(&partial_inner_prod_L[0], 0, sizeof(Fr) * num_cpus);
            memset(&partial_inner_prod_R[0], 0, sizeof(Fr) * num_cpus);
            // Compute inner_prod_L := < a_vec_lo, b_vec_hi > and inner_prod_R := < a_vec_hi, b_vec_lo >
            Fr inner_prod_L = Fr::zero();
            Fr inner_prod_R = Fr::zero();
            // Run scalar product in parallel
            run_loop_in_parallel_if_effective_with_index(
                round_size,
                [&a_vec, &b_vec, round_size, &partial_inner_prod_L, &partial_inner_prod_R](
                    size_t start, size_t end, size_t workload_index) {
                    Fr current_inner_prod_L = Fr::zero();
                    Fr current_inner_prod_R = Fr::zero();
                    for (size_t j = start; j < end; j++) {
                        current_inner_prod_L += a_vec[j] * b_vec[round_size + j];
                        current_inner_prod_R += a_vec[round_size + j] * b_vec[j];
                    }
                    partial_inner_prod_L[workload_index] = current_inner_prod_L;
                    partial_inner_prod_R[workload_index] = current_inner_prod_R;
                },
                /*finite_field_additions_per_iteration=*/2,
                /*finite_field_multiplications_per_iteration=*/2);
            for (size_t j = 0; j < num_cpus; j++) {
                inner_prod_L += partial_inner_prod_L[j];
                inner_prod_R += partial_inner_prod_R[j];
            }

            // L_i = < a_vec_lo, G_vec_hi > + inner_prod_L * aux_generator
            L_elements[i] = bb::scalar_multiplication::pippenger_without_endomorphism_basis_points<Curve>(
                &a_vec[0], &G_vec_local[round_size], round_size, ck->pippenger_runtime_state);
            L_elements[i] += aux_generator * inner_prod_L;

            // R_i = < a_vec_hi, G_vec_lo > + inner_prod_R * aux_generator
            R_elements[i] = bb::scalar_multiplication::pippenger_without_endomorphism_basis_points<Curve>(
                &a_vec[round_size], &G_vec_local[0], round_size, ck->pippenger_runtime_state);
            R_elements[i] += aux_generator * inner_prod_R;

            std::string index = std::to_string(i);
            transcript->send_to_verifier("IPA:L_" + index, Commitment(L_elements[i]));
            transcript->send_to_verifier("IPA:R_" + index, Commitment(R_elements[i]));

            // Generate the round challenge.
            const Fr round_challenge = transcript->get_challenge<Fr>("IPA:round_challenge_" + index);
            const Fr round_challenge_inv = round_challenge.invert();

            auto G_hi = GroupElement::batch_mul_with_endomorphism(
                std::span{ G_vec_local.begin() + static_cast<long>(round_size),
                           G_vec_local.begin() + static_cast<long>(round_size * 2) },
                round_challenge_inv);

            // Update the vectors a_vec, b_vec and G_vec.
            // a_vec_next = a_vec_lo + a_vec_hi * round_challenge
            // b_vec_next = b_vec_lo + b_vec_hi * round_challenge_inv
            // G_vec_next = G_vec_lo + G_vec_hi * round_challenge_inv
            run_loop_in_parallel_if_effective(
                round_size,
                [&a_vec, &b_vec, round_challenge, round_challenge_inv, round_size](size_t start, size_t end) {
                    for (size_t j = start; j < end; j++) {
                        a_vec[j] += round_challenge * a_vec[round_size + j];
                        b_vec[j] += round_challenge_inv * b_vec[round_size + j];
                    }
                },
                /*finite_field_additions_per_iteration=*/4,
                /*finite_field_multiplications_per_iteration=*/8,
                /*finite_field_inversions_per_iteration=*/1);
            GroupElement::batch_affine_add(
                std::span{ G_vec_local.begin(), G_vec_local.begin() + static_cast<long>(round_size) },
                G_hi,
                G_vec_local);
        }

        transcript->send_to_verifier("IPA:a_0", a_vec[0]);
    }

    /**
     * @brief Verify the correctness of a Proof
     *
     * @param vk Verification_key containing srs and pippenger_runtime_state to be used for MSM
     * @param proof The proof containg L_vec, R_vec and a_zero
     * @param pub_input Data required to verify the proof
     *
     * @return true/false depending on if the proof verifies
     */
    static bool verify(const std::shared_ptr<VK>& vk,
                       const OpeningClaim<Curve>& opening_claim,
                       const std::shared_ptr<NativeTranscript>& transcript)
    {
        auto poly_degree_plus_1 =
            static_cast<uint32_t>(transcript->template receive_from_prover<typename Curve::BaseField>(
                "IPA:poly_degree_plus_1")); // note this is base field because this is a uint32_t, which should map to a
                                            // bb::fr, not a grumpkin::fr, which is a BaseField element for Grumpkin
        const Fr generator_challenge = transcript->template get_challenge<Fr>("IPA:generator_challenge");
        auto aux_generator = Commitment::one() * generator_challenge;

        auto log_poly_degree_plus_1 = static_cast<size_t>(numeric::get_msb(poly_degree_plus_1));

        // Compute C_prime
        GroupElement C_prime = opening_claim.commitment + (aux_generator * opening_claim.opening_pair.evaluation);

        // Compute C_zero = C_prime + ∑_{j ∈ [k]} u_j^{-1}L_j + ∑_{j ∈ [k]} u_jR_j
        auto pippenger_size = 2 * log_poly_degree_plus_1;
        std::vector<Fr> round_challenges(log_poly_degree_plus_1);
        std::vector<Fr> round_challenges_inv(log_poly_degree_plus_1);
        std::vector<Commitment> msm_elements(pippenger_size);
        std::vector<Fr> msm_scalars(pippenger_size);
        for (size_t i = 0; i < log_poly_degree_plus_1; i++) {
            std::string index = std::to_string(i);
            auto element_L = transcript->template receive_from_prover<Commitment>("IPA:L_" + index);
            auto element_R = transcript->template receive_from_prover<Commitment>("IPA:R_" + index);
            round_challenges[i] = transcript->template get_challenge<Fr>("IPA:round_challenge_" + index);
            round_challenges_inv[i] = round_challenges[i].invert();

            msm_elements[2 * i] = element_L;
            msm_elements[2 * i + 1] = element_R;
            msm_scalars[2 * i] = round_challenges_inv[i];
            msm_scalars[2 * i + 1] = round_challenges[i];
        }

        GroupElement LR_sums = bb::scalar_multiplication::pippenger_without_endomorphism_basis_points<Curve>(
            &msm_scalars[0], &msm_elements[0], pippenger_size, vk->pippenger_runtime_state);
        GroupElement C_zero = C_prime + LR_sums;

        /**
         * Compute b_zero where b_zero can be computed using the polynomial:
         *
         * g(X) = ∏_{i ∈ [k]} (1 + u_{k-i}^{-1}.X^{2^{i-1}}).
         *
         * b_zero = g(evaluation) = ∏_{i ∈ [k]} (1 + u_{k-i}^{-1}. (evaluation)^{2^{i-1}})
         */
        Fr b_zero = Fr::one();
        for (size_t i = 0; i < log_poly_degree_plus_1; i++) {
            auto exponent = static_cast<uint64_t>(Fr(2).pow(i));
            b_zero *= Fr::one() + (round_challenges_inv[log_poly_degree_plus_1 - 1 - i] *
                                   opening_claim.opening_pair.challenge.pow(exponent));
        }

        // Compute G_zero
        // First construct s_vec
        std::vector<Fr> s_vec(poly_degree_plus_1);
        // TODO(https://github.com/AztecProtocol/barretenberg/issues/857): This code is not efficient as its O(nlogn).
        // This can be optimized to be linear by computing a tree of products. Its very readable, so we're
        // leaving it unoptimized for now.
        run_loop_in_parallel_if_effective(
            poly_degree_plus_1,
            [&s_vec, &round_challenges_inv, log_poly_degree_plus_1](size_t start, size_t end) {
                for (size_t i = start; i < end; i++) {
                    Fr s_vec_scalar = Fr::one();
                    for (size_t j = (log_poly_degree_plus_1 - 1); j != size_t(-1); j--) {
                        auto bit = (i >> j) & 1;
                        bool b = static_cast<bool>(bit);
                        if (b) {
                            s_vec_scalar *= round_challenges_inv[log_poly_degree_plus_1 - 1 - j];
                        }
                    }
                    s_vec[i] = s_vec_scalar;
                }
            },
            /*finite_field_additions_per_iteration=*/0,
            /*finite_field_multiplications_per_iteration=*/log_poly_degree_plus_1);

        auto* srs_elements = vk->srs->get_monomial_points();

        // Copy the G_vector to local memory.
        std::vector<Commitment> G_vec_local(poly_degree_plus_1);

        // The SRS stored in the commitment key is the result after applying the pippenger point table so the
        // values at odd indices contain the point {srs[i-1].x * beta, srs[i-1].y}, where beta is the endomorphism
        // G_vec_local should use only the original SRS thus we extract only the even indices.
        run_loop_in_parallel_if_effective(
            poly_degree_plus_1,
            [&G_vec_local, srs_elements](size_t start, size_t end) {
                for (size_t i = start * 2; i < end * 2; i += 2) {
                    G_vec_local[i >> 1] = srs_elements[i];
                }
            },
            /*finite_field_additions_per_iteration=*/0,
            /*finite_field_multiplications_per_iteration=*/0,
            /*finite_field_inversions_per_iteration=*/0,
            /*group_element_additions_per_iteration=*/0,
            /*group_element_doublings_per_iteration=*/0,
            /*scalar_multiplications_per_iteration=*/0,
            /*sequential_copy_ops_per_iteration=*/1);

        auto G_zero = bb::scalar_multiplication::pippenger_without_endomorphism_basis_points<Curve>(
            &s_vec[0], &G_vec_local[0], poly_degree_plus_1, vk->pippenger_runtime_state);

        auto a_zero = transcript->template receive_from_prover<Fr>("IPA:a_0");

        GroupElement right_hand_side = G_zero * a_zero + aux_generator * a_zero * b_zero;

        return (C_zero.normalize() == right_hand_side.normalize());
    }
};

} // namespace bb