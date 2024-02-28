import { Fr } from '@aztec/foundation/fields';

import { HostStorage } from './host_storage.js';
import { Nullifiers } from './nullifiers.js';
import { PublicStorage } from './public_storage.js';
import { WorldStateAccessTrace } from './trace.js';
import { TracedL1toL2MessageRead, TracedNullifierCheck } from './trace_types.js';
import { EthAddress, L2ToL1Message } from '@aztec/circuits.js';

/**
 * Data held within the journal
 */
export type JournalData = {
  newNoteHashes: Fr[];
  nullifierChecks: TracedNullifierCheck[];
  newNullifiers: Fr[];
  l1ToL2MessageReads: TracedL1toL2MessageRead[];

  newL1Messages: L2ToL1Message[];
  newLogs: Fr[][];

  /** contract address -\> key -\> value */
  currentStorageValue: Map<bigint, Map<bigint, Fr>>;

  /** contract address -\> key -\> value[] (stored in order of access) */
  storageWrites: Map<bigint, Map<bigint, Fr[]>>;
  /** contract address -\> key -\> value[] (stored in order of access) */
  storageReads: Map<bigint, Map<bigint, Fr[]>>;
};

/**
 * A class to manage persistable AVM state for contract calls.
 * Maintains a cache of the current world state,
 * a trace of all world state accesses, and a list of accrued substate items.
 *
 * The simulator should make any world state and accrued substate queries through this object.
 *
 * Manages merging of successful/reverted child state into current state.
 */
export class AvmPersistableStateManager {
  /** Reference to node storage */
  public readonly hostStorage: HostStorage;

  /** World State */
  /** Public storage, including cached writes */
  private publicStorage: PublicStorage;
  /** Nullifier set, including cached/recently-emitted nullifiers */
  private nullifiers: Nullifiers;

  /** World State Access Trace */
  private trace: WorldStateAccessTrace;

  /** Accrued Substate **/
  private newL1Messages: L2ToL1Message[] = [];
  private newLogs: Fr[][] = [];

  constructor(hostStorage: HostStorage, parent?: AvmPersistableStateManager) {
    this.hostStorage = hostStorage;
    this.publicStorage = new PublicStorage(hostStorage.publicStateDb, parent?.publicStorage);
    this.nullifiers = new Nullifiers(hostStorage.commitmentsDb, parent?.nullifiers);
    this.trace = new WorldStateAccessTrace(parent?.trace);
  }

  /**
   * Create a new state manager forked from this one
   */
  public fork() {
    return new AvmPersistableStateManager(this.hostStorage, this);
  }

  /**
   * Write to public storage, journal/trace the write.
   *
   * @param storageAddress - the address of the contract whose storage is being written to
   * @param slot - the slot in the contract's storage being written to
   * @param value - the value being written to the slot
   */
  public writeStorage(storageAddress: Fr, slot: Fr, value: Fr) {
    // Cache storage writes for later reference/reads
    this.publicStorage.write(storageAddress, slot, value);
    // Trace all storage writes (even reverted ones)
    this.trace.tracePublicStorageWrite(storageAddress, slot, value);
  }

  /**
   * Read from public storage, trace the read.
   *
   * @param storageAddress - the address of the contract whose storage is being read from
   * @param slot - the slot in the contract's storage being read from
   * @returns the latest value written to slot, or 0 if never written to before
   */
  public async readStorage(storageAddress: Fr, slot: Fr): Promise<Fr> {
    const [_exists, value] = await this.publicStorage.read(storageAddress, slot);
    // We want to keep track of all performed reads (even reverted ones)
    this.trace.tracePublicStorageRead(storageAddress, slot, value);
    return Promise.resolve(value);
  }

  public writeNoteHash(noteHash: Fr) {
    this.trace.traceNewNoteHash(/*storageAddress*/ Fr.ZERO, noteHash);
  }

  public async checkNullifierExists(storageAddress: Fr, nullifier: Fr): Promise<boolean> {
    const [exists, isPending, leafIndex] = await this.nullifiers.checkExists(storageAddress, nullifier);
    this.trace.traceNullifierCheck(storageAddress, nullifier, exists, isPending, leafIndex);
    return Promise.resolve(exists);
  }

  public async writeNullifier(storageAddress: Fr, nullifier: Fr) {
    // Cache pending nullifiers for later access
    await this.nullifiers.append(storageAddress, nullifier);
    // Trace all nullifier creations (even reverted ones)
    this.trace.traceNewNullifier(storageAddress, nullifier);
  }

  public async readL1ToL2Message(msgKey: Fr, msgLeafIndex: Fr): Promise<[boolean, Fr[]]> {
    // TODO: variation of getL1ToL2Message that take leafIndex as argument
    const gotMessage = await this.hostStorage.commitmentsDb.getL1ToL2Message(msgKey);
    const exists = gotMessage !== undefined && gotMessage.index == msgLeafIndex.toBigInt();
    const message = gotMessage.message.toFields();
    this.trace.traceL1ToL2MessageRead(msgKey, msgLeafIndex, exists, message);
    return Promise.resolve([exists, message]);
  }

  public writeL1Message(recipient: EthAddress | Fr, content: Fr) {
    const recipientAddress = recipient instanceof EthAddress ? recipient : EthAddress.fromField(recipient);
    this.newL1Messages.push(new L2ToL1Message(recipientAddress, content));
  }

  public writeLog(log: Fr[]) {
    this.newLogs.push(log);
  }

  /**
   * Accept nested world state modifications, merging in its trace and accrued substate
   */
  public acceptNestedCallState(nestedJournal: AvmPersistableStateManager) {
    // Merge Public Storage
    this.publicStorage.acceptAndMerge(nestedJournal.publicStorage);

    // Merge World State Access Trace
    this.trace.acceptAndMerge(nestedJournal.trace);

    // Accrued Substate
    this.newL1Messages = this.newL1Messages.concat(nestedJournal.newL1Messages);
    this.newLogs = this.newLogs.concat(nestedJournal.newLogs);
  }

  /**
   * Reject nested world state, merging in its trace, but not accepting any state modifications
   */
  public rejectNestedCallState(nestedJournal: AvmPersistableStateManager) {
    // Merge World State Access Trace
    this.trace.acceptAndMerge(nestedJournal.trace);
  }

  /**
   * Access the current state of the journal
   *
   * @returns a JournalData object
   */
  public flush(): JournalData {
    return {
      newNoteHashes: this.trace.newNoteHashes,
      nullifierChecks: this.trace.nullifierChecks,
      newNullifiers: this.trace.newNullifiers,
      l1ToL2MessageReads: this.trace.l1toL2MessageReads,
      newL1Messages: this.newL1Messages,
      newLogs: this.newLogs,
      currentStorageValue: this.publicStorage.getCache().cachePerContract,
      storageReads: this.trace.publicStorageReads,
      storageWrites: this.trace.publicStorageWrites,
    };
  }
}
