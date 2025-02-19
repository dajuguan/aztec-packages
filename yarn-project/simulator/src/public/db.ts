import { NullifierMembershipWitness } from '@aztec/circuit-types';
import { EthAddress, FunctionSelector, L1_TO_L2_MSG_TREE_HEIGHT } from '@aztec/circuits.js';
import { AztecAddress } from '@aztec/foundation/aztec-address';
import { Fr } from '@aztec/foundation/fields';

import { MessageLoadOracleInputs } from '../acvm/index.js';

/**
 * Database interface for providing access to public state.
 */
export interface PublicStateDB {
  /**
   * Reads a value from public storage, returning zero if none.
   * @param contract - Owner of the storage.
   * @param slot - Slot to read in the contract storage.
   * @returns The current value in the storage slot.
   */
  storageRead(contract: AztecAddress, slot: Fr): Promise<Fr>;

  /**
   * Records a write to public storage.
   * @param contract - Owner of the storage.
   * @param slot - Slot to read in the contract storage.
   * @param newValue - The new value to store.
   * @returns Nothing.
   */
  storageWrite(contract: AztecAddress, slot: Fr, newValue: Fr): Promise<void>;

  /**
   * Commit the pending changes to the DB.
   * @returns Nothing.
   */
  commit(): Promise<void>;

  /**
   * Rollback the pending changes.
   * @returns Nothing.
   */
  rollback(): Promise<void>;
}

/**
 * Database interface for providing access to public contract data.
 */
export interface PublicContractsDB {
  /**
   * Returns the brillig (public bytecode) of a function.
   * @param address - The contract address that owns this function.
   * @param selector - The selector for the function.
   * @returns The bytecode or undefined if not found.
   */
  getBytecode(address: AztecAddress, selector: FunctionSelector): Promise<Buffer | undefined>;

  /**
   * Returns whether a function is internal or not.
   * @param address - The contract address that owns this function.
   * @param selector - The selector for the function.
   * @returns The `isInternal` flag found, undefined if not found.
   */
  getIsInternal(address: AztecAddress, selector: FunctionSelector): Promise<boolean | undefined>;

  /**
   * Returns the portal contract address for an L2 address.
   * @param address - The L2 contract address.
   * @returns The portal contract address or undefined if not found.
   */
  getPortalContractAddress(address: AztecAddress): Promise<EthAddress | undefined>;
}

/** Database interface for providing access to commitment tree, l1 to l2 message tree, and nullifier tree. */
export interface CommitmentsDB {
  /**
   * Gets a confirmed L1 to L2 message for the given entry key.
   * TODO(Maddiaa): Can be combined with aztec-node method that does the same thing.
   * @param entryKey - The entry key.
   * @returns - The l1 to l2 message object
   */
  getL1ToL2MembershipWitness(entryKey: Fr): Promise<MessageLoadOracleInputs<typeof L1_TO_L2_MSG_TREE_HEIGHT>>;

  /**
   * Gets the index of a commitment in the note hash tree.
   * @param commitment - The commitment.
   * @returns - The index of the commitment. Undefined if it does not exist in the tree.
   */
  getCommitmentIndex(commitment: Fr): Promise<bigint | undefined>;

  /**
   * Gets the index of a nullifier in the nullifier tree.
   * @param nullifier - The nullifier.
   * @returns - The index of the nullifier. Undefined if it does not exist in the tree.
   */
  getNullifierIndex(nullifier: Fr): Promise<bigint | undefined>;

  /**
   * Returns a nullifier membership witness for the given nullifier or undefined if not found.
   * REFACTOR: Same as getL1ToL2MembershipWitness, can be combined with aztec-node method that does almost the same thing.
   * @param nullifier - Nullifier we're looking for.
   */
  getNullifierMembershipWitnessAtLatestBlock(nullifier: Fr): Promise<NullifierMembershipWitness | undefined>;
}
