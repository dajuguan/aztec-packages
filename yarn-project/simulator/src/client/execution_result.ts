import { FunctionL2Logs, Note } from '@aztec/circuit-types';
import { NoteHashReadRequestMembershipWitness, PrivateCallStackItem, PublicCallRequest } from '@aztec/circuits.js';
import { DecodedReturn } from '@aztec/foundation/abi';
import { Fr } from '@aztec/foundation/fields';

import { ACVMField } from '../acvm/index.js';

/**
 * The contents of a new note.
 */
export interface NoteAndSlot {
  /** The note. */
  note: Note;
  /** The storage slot of the note. */
  storageSlot: Fr;
  /** The note type identifier. */
  noteTypeId: Fr;
}

/**
 * The result of executing a private function.
 */
export interface ExecutionResult {
  // Needed for prover
  /** The ACIR bytecode. */
  acir: Buffer;
  /** The verification key. */
  vk: Buffer;
  /** The partial witness. */
  partialWitness: Map<number, ACVMField>;
  // Needed for the verifier (kernel)
  /** The call stack item. */
  callStackItem: PrivateCallStackItem;
  /** The partially filled-in read request membership witnesses for commitments being read. */
  noteHashReadRequestPartialWitnesses: NoteHashReadRequestMembershipWitness[];
  // Needed when we enable chained txs. The new notes can be cached and used in a later transaction.
  /** The notes created in the executed function. */
  newNotes: NoteAndSlot[];
  /** The decoded return values of the executed function. */
  returnValues: DecodedReturn;
  /** The nested executions. */
  nestedExecutions: this[];
  /** Enqueued public function execution requests to be picked up by the sequencer. */
  enqueuedPublicFunctionCalls: PublicCallRequest[];
  /**
   * Encrypted logs emitted during execution of this function call.
   * Note: These are preimages to `encryptedLogsHash`.
   */
  encryptedLogs: FunctionL2Logs;
  /**
   * Unencrypted logs emitted during execution of this function call.
   * Note: These are preimages to `unencryptedLogsHash`.
   */
  unencryptedLogs: FunctionL2Logs;
}

/**
 * Collect all encrypted logs across all nested executions.
 * @param execResult - The topmost execution result.
 * @returns All encrypted logs.
 */
export function collectEncryptedLogs(execResult: ExecutionResult): FunctionL2Logs[] {
  // without the .reverse(), the logs will be in a queue like fashion which is wrong as the kernel processes it like a stack.
  return [execResult.encryptedLogs, ...[...execResult.nestedExecutions].reverse().flatMap(collectEncryptedLogs)];
}

/**
 * Collect all unencrypted logs across all nested executions.
 * @param execResult - The topmost execution result.
 * @returns All unencrypted logs.
 */
export function collectUnencryptedLogs(execResult: ExecutionResult): FunctionL2Logs[] {
  // without the .reverse(), the logs will be in a queue like fashion which is wrong as the kernel processes it like a stack.
  return [execResult.unencryptedLogs, ...[...execResult.nestedExecutions].reverse().flatMap(collectUnencryptedLogs)];
}

/**
 * Collect all enqueued public function calls across all nested executions.
 * @param execResult - The topmost execution result.
 * @returns All enqueued public function calls.
 */
export function collectEnqueuedPublicFunctionCalls(execResult: ExecutionResult): PublicCallRequest[] {
  // without the reverse sort, the logs will be in a queue like fashion which is wrong
  // as the kernel processes it like a stack, popping items off and pushing them to output
  return [
    ...execResult.enqueuedPublicFunctionCalls,
    ...[...execResult.nestedExecutions].flatMap(collectEnqueuedPublicFunctionCalls),
  ].sort((a, b) => b.callContext.startSideEffectCounter - a.callContext.startSideEffectCounter);
}
