use crate::messaging::process_l1_to_l2_message_retrieved_in_public;

use dep::protocol_types::{address::{AztecAddress, EthAddress}, constants::L1_TO_L2_MESSAGE_LENGTH};

// Getters that will be converted by the transpiler into their
// own opcodes
struct AVMContext {}

impl AVMContext {
    // Empty new function enables retaining context.<value> syntax
    pub fn new() -> Self {
        Self {}
    }

    // OPCODES
    #[oracle(address)]
    pub fn address(self) -> AztecAddress {}

    #[oracle(storageAddress)]
    pub fn storage_address(self) -> AztecAddress {}

    #[oracle(origin)]
    pub fn origin(self) -> AztecAddress {}

    #[oracle(sender)]
    pub fn sender(self) -> AztecAddress {}

    #[oracle(portal)]
    pub fn portal(self) -> EthAddress {}

    #[oracle(feePerL1Gas)]
    pub fn fee_per_l1_gas(self) -> Field {}

    #[oracle(feePerL2Gas)]
    pub fn fee_per_l2_gas(self) -> Field {}

    #[oracle(feePerDaGas)]
    pub fn fee_per_da_gas(self) -> Field {}

    #[oracle(chainId)]
    pub fn chain_id(self) -> Field {}

    #[oracle(version)]
    pub fn version(self) -> Field {}

    #[oracle(blockNumber)]
    pub fn block_number(self) -> Field {}

    #[oracle(timestamp)]
    pub fn timestamp(self) -> Field {}

    // #[oracle(contractCallDepth)]
    // pub fn contract_call_depth(self) -> Field {}

    #[oracle(emitNoteHash)]
    pub fn emit_note_hash(self, note_hash: Field) {}

    #[oracle(nullifierExists)]
    pub fn check_nullifier_exists(self, nullifier: Field) -> u8 {}

    #[oracle(emitNullifier)]
    pub fn emit_nullifier(self, nullifier: Field) {}

    #[oracle(readL1ToL2Msg)]
    pub fn read_l1_to_l2_msg<MSG_SIZE>(
        self,
        msg_key: Field,
        msg_leaf_index: Field
    ) -> (u8, [Field; MSG_SIZE]) {}
    //   ^exists, ^message

    #[oracle(sendL2ToL1Msg)]
    pub fn send_l2_to_l1_msg(self, recipient: EthAddress, content: Field) {}
    #[oracle(sendL2ToL1Msg)]
    pub fn message_portal(&mut self, recipient: EthAddress, content: Field) {}

    // The functions below allow interface-equivalence with PrivateContext
    pub fn this_address(self) -> AztecAddress {
        self.address()
    }

    pub fn push_new_note_hash(self: &mut Self, note_hash: Field) {
        self.emit_note_hash(note_hash);
    }

    pub fn push_new_nullifier(self: &mut Self, nullifier: Field, _nullified_commitment: Field) {
        // Cannot nullify pending commitments in AVM, so `nullified_commitment` is not used
        self.emit_nullifier(nullifier);
    }

    pub fn consume_l1_to_l2_message(
        &mut self,
        msg_key: Field,
        msg_leaf_index: Field,
        content: Field,
        secret: Field,
        sender: EthAddress
    ) {
        let msg_read_results = self.read_l1_to_l2_msg(msg_key, msg_leaf_index);
        let exists: u8 = msg_read_results.0;
        // Forces message size to standard length. Should be able to support dynamic length messages in AVM!
        // TODO(4813): should l1ToL2 message length be dynamic?
        let message: [Field; L1_TO_L2_MESSAGE_LENGTH] = msg_read_results.1;

        assert(exists == 1, "Message does not exist");
        let nullifier = process_l1_to_l2_message_retrieved_in_public(
            self.address(),
            sender,
            self.chain_id(),
            self.version(),
            msg_key,
            msg_leaf_index,
            message,
            content,
            secret
        );

        self.emit_nullifier(nullifier)
    }
}
