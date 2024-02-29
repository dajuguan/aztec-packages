#pragma once

#include "barretenberg/ecc/curves/bn254/bn254.hpp"
#include "barretenberg/proof_system/circuit_builder/eccvm/eccvm_builder_types.hpp"

namespace bb {

enum EccOpCode { NULL_OP, ADD_ACCUM, MUL_ACCUM, EQUALITY };

/**
 * @brief Used to construct execution trace representations of elliptic curve operations.
 *
 * @details Currently the targets in execution traces are: four advice wires in UltraCircuitBuilder and 5 wires in the
 * ECCVM. In each case, the variable values are stored in this class, since the same values will need to be used later
 * by the TranslationVMCircuitBuilder. The circuit builders will store witness indices which are indices in the
 * ultra (resp. eccvm) ops members of this class (rather than in the builder's variables array).
 */
class ECCOpQueue {
    using Curve = curve::BN254;
    using Point = Curve::AffineElement;
    using Fr = Curve::ScalarField;
    using Fq = Curve::BaseField; // Grumpkin's scalar field
    Point point_at_infinity = Curve::Group::affine_point_at_infinity;

    // The operations written to the queue are also performed natively; the result is stored in accumulator
    Point accumulator = point_at_infinity;

  public:
    using ECCVMOperation = bb::eccvm::VMOperation<Curve::Group>;
    std::vector<ECCVMOperation> raw_ops;
    std::array<std::vector<Fr>, 4> ultra_ops; // ops encoded in the width-4 Ultra format

    size_t current_ultra_ops_size = 0;  // M_i
    size_t previous_ultra_ops_size = 0; // M_{i-1}

    std::array<Point, 4> ultra_ops_commitments;

    /**
     * @brief Construct a new ECCOpQueue object, populating it with some mock data that mimics interactions with a
     * previous circuit in order to avoid zero commitments in the merge protocol.
     *
     * @details Currently, our codebase cannot handle zero commitments
     * (https://github.com/AztecProtocol/barretenberg/issues/871) which will be encountered in the first iteration of
     * the transcript aggregation (merge) protocol if we start with an empty ECC op queue. This is because we call the
     * merge protocol every time we process a new circuit, even for the initial circuit. Therefore, we populate the ECC
     * op queue when constructed with some mock data of an arbitrary 'first' circuit  so the first merge prover can
     * proceed without issues. Isolating the mock operations in the constructor is appropriate because  across an entire
     * round of ClientIVC or Goblin accumulation, all circuits share the same ECC op queue.
     */
    ECCOpQueue() { populate_with_mock_initital_data(); }

    Point get_accumulator() { return accumulator; }

    /**
     * @brief Prepend the information from the previous queue (used before accumulation/merge proof to be able to run
     * circuit construction separately)
     *
     * @param previous
     */
    void prepend_previous_queue(const ECCOpQueue& previous)
    {
        // Allocate enough space
        std::vector<ECCVMOperation> raw_ops_updated(raw_ops.size() + previous.raw_ops.size());
        // Copy the previous raw ops to the beginning of the new vector
        std::copy(previous.raw_ops.begin(), previous.raw_ops.end(), raw_ops_updated.begin());
        // Copy the raw ops from current queue after the ones from the previous queue (concatenate them)
        std::copy(raw_ops.begin(),
                  raw_ops.end(),
                  std::next(raw_ops_updated.begin(), static_cast<long>(previous.raw_ops.size())));

        // Swap raw_ops underlying storage
        raw_ops.swap(raw_ops_updated);
        // Do the same 3 operations for ultra_ops
        for (size_t i = 0; i < 4; i++) {
            // Allocate new vector
            std::vector<Fr> current_ultra_op(ultra_ops[i].size() + previous.ultra_ops[i].size());
            // Copy the previous ultra ops to the beginning of the new vector
            std::copy(previous.ultra_ops[i].begin(), previous.ultra_ops[i].end(), current_ultra_op.begin());
            // Copy the ultra ops from current queue after the ones from the previous queue (concatenate them)
            std::copy(ultra_ops[i].begin(),
                      ultra_ops[i].end(),
                      std::next(current_ultra_op.begin(), static_cast<long>(previous.ultra_ops[i].size())));
            // Swap storage
            ultra_ops[i].swap(current_ultra_op);
        }
        // Update sizes
        current_ultra_ops_size += previous.ultra_ops[0].size();
        previous_ultra_ops_size += previous.ultra_ops[0].size();
        // Update commitments
        ultra_ops_commitments = previous.ultra_ops_commitments;
    }

    /**
     * @brief Enable using std::swap on queues
     *
     */
    friend void swap(ECCOpQueue& lhs, ECCOpQueue& rhs)
    {
        // Swap vectors
        lhs.raw_ops.swap(rhs.raw_ops);
        for (size_t i = 0; i < 4; i++) {
            lhs.ultra_ops[i].swap(rhs.ultra_ops[i]);
        }
        // Swap sizes
        size_t temp = lhs.current_ultra_ops_size;
        lhs.current_ultra_ops_size = rhs.current_ultra_ops_size;
        rhs.current_ultra_ops_size = temp;
        temp = lhs.previous_ultra_ops_size;
        lhs.previous_ultra_ops_size = rhs.previous_ultra_ops_size;
        rhs.previous_ultra_ops_size = temp;
        // Swap commitments
        auto commit_temp = lhs.ultra_ops_commitments;
        lhs.ultra_ops_commitments = rhs.ultra_ops_commitments;
        rhs.ultra_ops_commitments = commit_temp;
    }

    /**
     * @brief Set the current and previous size of the ultra_ops transcript
     *
     * @details previous_ultra_ops_size = M_{i-1} is needed by the prover to extract the previous aggregate op
     * queue transcript T_{i-1} from the current one T_i. This method should be called when a circuit is 'finalized'.
     */
    void set_size_data()
    {
        previous_ultra_ops_size = current_ultra_ops_size;
        current_ultra_ops_size = ultra_ops[0].size();
    }

    [[nodiscard]] size_t get_previous_size() const { return previous_ultra_ops_size; }
    [[nodiscard]] size_t get_current_size() const { return current_ultra_ops_size; }

    void set_commitment_data(std::array<Point, 4>& commitments) { ultra_ops_commitments = commitments; }

    /**
     * @brief Get a 'view' of the current ultra ops object
     *
     * @return std::vector<std::span<Fr>>
     */
    std::vector<std::span<Fr>> get_aggregate_transcript()
    {
        std::vector<std::span<Fr>> result;
        result.reserve(ultra_ops.size());
        for (auto& entry : ultra_ops) {
            result.emplace_back(entry);
        }
        return result;
    }

    /**
     * @brief Get a 'view' of the previous ultra ops object
     *
     * @return std::vector<std::span<Fr>>
     */
    std::vector<std::span<Fr>> get_previous_aggregate_transcript()
    {
        std::vector<std::span<Fr>> result;
        result.reserve(ultra_ops.size());
        // Construct T_{i-1} as a view of size M_{i-1} into T_i
        for (auto& entry : ultra_ops) {
            result.emplace_back(entry.begin(), previous_ultra_ops_size);
        }
        return result;
    }

    /**
     * @brief Write point addition op to queue and natively perform addition
     *
     * @param to_add
     */
    void add_accumulate(const Point& to_add)
    {
        // Update the accumulator natively
        accumulator = accumulator + to_add;

        // Store the operation
        raw_ops.emplace_back(ECCVMOperation{
            .add = true,
            .mul = false,
            .eq = false,
            .reset = false,
            .base_point = to_add,
            .z1 = 0,
            .z2 = 0,
            .mul_scalar_full = 0,
        });
    }

    /**
     * @brief Write multiply and add op to queue and natively perform operation
     *
     * @param to_add
     */
    void mul_accumulate(const Point& to_mul, const Fr& scalar)
    {
        // Update the accumulator natively
        accumulator = accumulator + to_mul * scalar;

        // Store the operation
        Fr z1 = 0;
        Fr z2 = 0;
        auto converted = scalar.from_montgomery_form();
        Fr::split_into_endomorphism_scalars(converted, z1, z2);
        z1 = z1.to_montgomery_form();
        z2 = z2.to_montgomery_form();
        raw_ops.emplace_back(ECCVMOperation{
            .add = false,
            .mul = true,
            .eq = false,
            .reset = false,
            .base_point = to_mul,
            .z1 = z1,
            .z2 = z2,
            .mul_scalar_full = scalar,
        });
    }

    /**
     * @brief Write equality op using internal accumulator point
     *
     * @return current internal accumulator point (prior to reset to 0)
     */
    Point eq()
    {
        auto expected = accumulator;
        accumulator.self_set_infinity(); // TODO(luke): is this always desired?

        raw_ops.emplace_back(ECCVMOperation{
            .add = false,
            .mul = false,
            .eq = true,
            .reset = true,
            .base_point = expected,
            .z1 = 0,
            .z2 = 0,
            .mul_scalar_full = 0,
        });

        return expected;
    }

    /**
     * @brief Write empty row to queue
     *
     */
    void empty_row()
    {
        raw_ops.emplace_back(ECCVMOperation{
            .add = false,
            .mul = false,
            .eq = false,
            .reset = false,
            .base_point = point_at_infinity,
            .z1 = 0,
            .z2 = 0,
            .mul_scalar_full = 0,
        });
    }

  private:
    /**
     * @brief TESTING PURPOSES ONLY: Populate ECC op queue with mock data as stand in for "previous circuit" in tests
     * @details TODO(#723): We currently cannot support Goblin proofs (specifically, transcript aggregation) if there
     * is not existing data in the ECC op queue (since this leads to zero-commitment issues). This method populates the
     * op queue with mock data so that the prover of an arbitrary 'first' circuit can behave as if it were not the
     * prover over the first circuit in the stack. This method should be removed entirely once this is resolved.
     *
     * @param op_queue
     */
    void populate_with_mock_initital_data()
    {
        // Add a single row of data to the op queue and commit to each column as [1] * FF(data)
        std::array<Point, 4> mock_op_queue_commitments;
        for (size_t idx = 0; idx < 4; idx++) {
            auto mock_data = Fr::random_element();
            this->ultra_ops[idx].emplace_back(mock_data);
            mock_op_queue_commitments[idx] = Point::one() * mock_data;
        }
        // Set some internal data based on the size of the op queue data
        this->set_size_data();
        // Add the commitments to the op queue data for use by the next circuit
        this->set_commitment_data(mock_op_queue_commitments);
    }
};

} // namespace bb
