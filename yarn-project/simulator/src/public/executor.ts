import { GlobalVariables, Header, PublicCircuitPublicInputs } from '@aztec/circuits.js';
import { createDebugLogger } from '@aztec/foundation/log';

import { spawn } from 'child_process';
import fs from 'fs/promises';

import { Oracle, acvm, extractCallStack, extractReturnWitness } from '../acvm/index.js';
import { AvmContext } from '../avm/avm_context.js';
import { AvmMachineState } from '../avm/avm_machine_state.js';
import { AvmSimulator } from '../avm/avm_simulator.js';
import { HostStorage } from '../avm/journal/host_storage.js';
import { AvmPersistableStateManager } from '../avm/journal/index.js';
import {
  temporaryConvertAvmResults,
  temporaryCreateAvmExecutionEnvironment,
} from '../avm/temporary_executor_migration.js';
import { ExecutionError, createSimulationError } from '../common/errors.js';
import { SideEffectCounter } from '../common/index.js';
import { PackedArgsCache } from '../common/packed_args_cache.js';
import { AcirSimulator } from '../index.js';
import { CommitmentsDB, PublicContractsDB, PublicStateDB } from './db.js';
import { PublicExecution, PublicExecutionResult, checkValidStaticCall } from './execution.js';
import { PublicExecutionContext } from './public_execution_context.js';

/**
 * Execute a public function and return the execution result.
 */
export async function executePublicFunction(
  context: PublicExecutionContext,
  acir: Buffer,
  log = createDebugLogger('aztec:simulator:public_execution'),
): Promise<PublicExecutionResult> {
  const execution = context.execution;
  const { contractAddress, functionData } = execution;
  const selector = functionData.selector;
  log(`Executing public external function ${contractAddress.toString()}:${selector}`);

  const initialWitness = context.getInitialWitness();
  const acvmCallback = new Oracle(context);
  const { partialWitness } = await acvm(await AcirSimulator.getSolver(), acir, initialWitness, acvmCallback).catch(
    (err: Error) => {
      throw new ExecutionError(
        err.message,
        {
          contractAddress,
          functionSelector: selector,
        },
        extractCallStack(err),
        { cause: err },
      );
    },
  );

  const returnWitness = extractReturnWitness(acir, partialWitness);
  const {
    returnValues,
    newL2ToL1Msgs,
    newNoteHashes: newNoteHashesPadded,
    newNullifiers: newNullifiersPadded,
  } = PublicCircuitPublicInputs.fromFields(returnWitness);

  const newL2ToL1Messages = newL2ToL1Msgs.filter(v => !v.isEmpty());
  const newNoteHashes = newNoteHashesPadded.filter(v => !v.isEmpty());
  const newNullifiers = newNullifiersPadded.filter(v => !v.isEmpty());

  const { contractStorageReads, contractStorageUpdateRequests } = context.getStorageActionData();
  log(
    `Contract storage reads: ${contractStorageReads
      .map(r => r.toFriendlyJSON() + ` - sec: ${r.sideEffectCounter}`)
      .join(', ')}`,
  );

  const nestedExecutions = context.getNestedExecutions();
  const unencryptedLogs = context.getUnencryptedLogs();

  return {
    execution,
    newNoteHashes,
    newL2ToL1Messages,
    newNullifiers,
    contractStorageReads,
    contractStorageUpdateRequests,
    returnValues,
    nestedExecutions,
    unencryptedLogs,
  };
}

/**
 * Handles execution of public functions.
 */
export class PublicExecutor {
  constructor(
    private readonly stateDb: PublicStateDB,
    private readonly contractsDb: PublicContractsDB,
    private readonly commitmentsDb: CommitmentsDB,
    private readonly header: Header,
  ) {}

  /**
   * Executes a public execution request.
   * @param execution - The execution to run.
   * @param globalVariables - The global variables to use.
   * @returns The result of the run plus all nested runs.
   */
  public async simulate(execution: PublicExecution, globalVariables: GlobalVariables): Promise<PublicExecutionResult> {
    const selector = execution.functionData.selector;
    const acir = await this.contractsDb.getBytecode(execution.contractAddress, selector);
    if (!acir) {
      throw new Error(`Bytecode not found for ${execution.contractAddress}:${selector}`);
    }

    // Functions can request to pack arguments before calling other functions.
    // We use this cache to hold the packed arguments.
    const packedArgs = PackedArgsCache.create([]);

    const sideEffectCounter = new SideEffectCounter();

    const context = new PublicExecutionContext(
      execution,
      this.header,
      globalVariables,
      packedArgs,
      sideEffectCounter,
      this.stateDb,
      this.contractsDb,
      this.commitmentsDb,
    );

    let executionResult;

    try {
      executionResult = await executePublicFunction(context, acir);
    } catch (err) {
      throw createSimulationError(err instanceof Error ? err : new Error('Unknown error during public execution'));
    }

    if (executionResult.execution.callContext.isStaticCall) {
      checkValidStaticCall(
        executionResult.newNoteHashes,
        executionResult.newNullifiers,
        executionResult.contractStorageUpdateRequests,
        executionResult.newL2ToL1Messages,
        executionResult.unencryptedLogs,
      );
    }

    return executionResult;
  }

  /**
   * Executes a public execution request in the avm.
   * @param execution - The execution to run.
   * @param globalVariables - The global variables to use.
   * @returns The result of the run plus all nested runs.
   */
  public async simulateAvm(
    execution: PublicExecution,
    globalVariables: GlobalVariables,
  ): Promise<PublicExecutionResult> {
    // Temporary code to construct the AVM context
    // These data structures will permiate across the simulator when the public executor is phased out
    const hostStorage = new HostStorage(this.stateDb, this.contractsDb, this.commitmentsDb);
    const worldStateJournal = new AvmPersistableStateManager(hostStorage);
    const executionEnv = temporaryCreateAvmExecutionEnvironment(execution, globalVariables);
    const machineState = new AvmMachineState(0, 0, 0);

    const context = new AvmContext(worldStateJournal, executionEnv, machineState);
    const simulator = new AvmSimulator(context);

    const result = await simulator.execute();
    const newWorldState = context.persistableState.flush();
    return temporaryConvertAvmResults(execution, newWorldState, result);
  }

  /**
   * These functions are currently housed in the temporary executor as it relies on access to
   *  oracles like the contractsDB and this is the least intrusive way to achieve this.
   *  When we remove this Executor and become compatible with the kernel circuits, this will be movoed to Prover.
   *  but will eventually be moved
   */

  /**
   * Generates a proof for an associated avm execution.
   * @param execution - The execution to run.
   * @returns An AVM proof and the verification key.
   */
  public async getAvmProof(avmExecution: PublicExecution): Promise<Buffer[]> {
    // The paths for the barretenberg binary and the write path are hardcoded for now.
    // It is expected that this call will be only made from this file
    // We additionally need the path to a valid crs for proof generation.
    const bbPath = '../../barretenberg/cpp';
    const writePath = '/tmp';
    const { args, functionData, contractAddress } = avmExecution;
    const bytecode = await this.contractsDb.getBytecode(contractAddress, functionData.selector);
    await Promise.all([
      fs.writeFile(
        `${writePath}/calldata.bin`,
        args.map(c => c.toBuffer()),
      ),
      fs.writeFile(`${writePath}/avm_bytecode.bin`, bytecode!),
    ]);

    const bbBinary = spawn(`${bbPath}/build/bin/bb`, [
      'avm_prove',
      '-b',
      `${writePath}/avm_bytecode.bin`,
      '-d',
      `${writePath}/calldata.bin`,
      '-c',
      `${bbPath}/srs_db/ignition`,
      '-o',
      `${writePath}/proof`,
    ]);
    return new Promise(resolve => {
      bbBinary.on('close', () => {
        resolve(Promise.all([fs.readFile(`${writePath}/proof`), fs.readFile(`${writePath}/vk`)]));
      });
    });
  }
  /**
   * Verifies an AVM proof.
   * @param vk - The verification key to use.
   * @param proof - The proof to verify.
   * @returns True if the proof is valid, false otherwise.
   */
  async verifyAvmProof(vk: Buffer, proof: Buffer): Promise<boolean> {
    // The paths for the barretenberg binary and the write path are hardcoded for now.
    // It is expected that this call will be only made from this file
    const bbPath = '../../barretenberg/cpp';
    const writePath = '/tmp';
    await Promise.all([fs.writeFile(`${writePath}/vk`, vk), fs.writeFile(`${writePath}/proof`, proof)]);

    const bbBinary = spawn(`${bbPath}/build/bin/bb`, ['avm_verify', '-p', `${writePath}/proof`, '-vk', `/tmp/vk`]);
    return new Promise(resolve => {
      let result = Buffer.alloc(0);
      bbBinary.stdout.on('data', data => {
        result += data;
      });
      bbBinary.on('close', () => {
        resolve(result.toString() === '1' ? true : false);
      });
    });
  }
}
