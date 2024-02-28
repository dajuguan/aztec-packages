mod l1_to_l2_message;
mod l1_to_l2_message_getter_data;

use l1_to_l2_message_getter_data::make_l1_to_l2_message_getter_data;

use crate::oracle::get_l1_to_l2_message::get_l1_to_l2_message_call;
use crate::messaging::l1_to_l2_message::L1ToL2Message;
use crate::avm::hash::sha256;

use dep::std::merkle::compute_merkle_root;

use dep::protocol_types::{address::{AztecAddress, EthAddress}, constants::{L1_TO_L2_MESSAGE_LENGTH}, utils::arr_copy_slice};

// Returns the nullifier for the message
pub fn process_l1_to_l2_message(
    l1_to_l2_root: Field,
    storage_contract_address: AztecAddress,
    portal_contract_address: EthAddress,
    chain_id: Field,
    version: Field,
    msg_key: Field,
    content: Field,
    secret: Field
) -> Field {
    let returned_message = get_l1_to_l2_message_call(msg_key);
    let l1_to_l2_message_data = make_l1_to_l2_message_getter_data(returned_message, 0, secret);

    // Check that the returned message is actually the message we looked up
    let msg_hash = l1_to_l2_message_data.message.hash();
    assert(msg_hash == msg_key, "Message not matching requested key");

    // Check that the message is in the tree
    let root = compute_merkle_root(
        msg_hash,
        l1_to_l2_message_data.leaf_index,
        l1_to_l2_message_data.sibling_path
    );
    assert(root == l1_to_l2_root, "Message not in state");

    // Validate this is the target contract
    assert(l1_to_l2_message_data.message.recipient.eq(storage_contract_address), "Invalid recipient");

    // Validate the sender is the portal contract
    assert(l1_to_l2_message_data.message.sender.eq(portal_contract_address), "Invalid sender");

    // Validate the chain id is correct
    assert(l1_to_l2_message_data.message.chainId == chain_id, "Invalid Chainid");

    // Validate the version is correct
    assert(l1_to_l2_message_data.message.version == version, "Invalid Version");

    // Validate the message hash is correct
    assert(l1_to_l2_message_data.message.content == content, "Invalid Content");

    // Validate the message secret is correct
    l1_to_l2_message_data.message.validate_message_secret();

    // Compute Nullifier
    l1_to_l2_message_data.message.compute_nullifier()
}

pub fn process_l1_to_l2_message_retrieved_in_public(
    storage_contract_address: AztecAddress,
    portal_contract_address: EthAddress,
    chain_id: Field,
    version: Field,
    msg_key: Field,
    msg_leaf_index: Field,
    raw_message: [Field; L1_TO_L2_MESSAGE_LENGTH],
    content: Field,
    secret: Field
) -> Field {
    let message = L1ToL2Message::deserialize(
        arr_copy_slice(raw_message, [0; L1_TO_L2_MESSAGE_LENGTH], 0),
        secret,
        msg_leaf_index
    );
    // TODO: do we have to do all this validation? Or can we trust that the sequencer provided the proper message?

    // Check that the returned message is actually the message we looked up
    let msg_hash = sha256(message.serialize())[0];
    assert(msg_hash == msg_key, "Message not matching requested key");
    // TODO: will this ^ be done by the AVM circuit?

    // Validate this is the target contract
    assert(message.recipient.eq(storage_contract_address), "Invalid recipient");
    // Validate the sender is the portal contract
    assert(message.sender.eq(portal_contract_address), "Invalid sender");
    // Validate the chain id is correct
    assert(message.chainId == chain_id, "Invalid Chainid");
    // Validate the version is correct
    assert(message.version == version, "Invalid Version");
    // Validate the message hash is correct
    assert(message.content == content, "Invalid Content");
    // Validate the message secret is correct
    message.validate_message_secret();
    // Compute Nullifier
    message.compute_nullifier_from_hash(msg_hash)
}
