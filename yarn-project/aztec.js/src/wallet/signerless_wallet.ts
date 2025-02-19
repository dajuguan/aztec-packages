import { AuthWitness, FunctionCall, PackedArguments, TxExecutionRequest } from '@aztec/circuit-types';
import { CompleteAddress, Fr, TxContext } from '@aztec/circuits.js';

import { BaseWallet } from './base_wallet.js';

/**
 * Wallet implementation which creates a transaction request directly to the requested contract without any signing.
 */
export class SignerlessWallet extends BaseWallet {
  async createTxExecutionRequest(executions: FunctionCall[]): Promise<TxExecutionRequest> {
    if (executions.length !== 1) {
      throw new Error(`Unexpected number of executions. Expected 1 but received ${executions.length}.`);
    }
    const [execution] = executions;
    const packedArguments = PackedArguments.fromArgs(execution.args);
    const { chainId, protocolVersion } = await this.pxe.getNodeInfo();
    const txContext = TxContext.empty(chainId, protocolVersion);
    return Promise.resolve(
      new TxExecutionRequest(
        execution.to,
        execution.functionData,
        packedArguments.hash,
        txContext,
        [packedArguments],
        [],
      ),
    );
  }

  getCompleteAddress(): CompleteAddress {
    throw new Error('Method not implemented.');
  }

  createAuthWitness(_message: Fr): Promise<AuthWitness> {
    throw new Error('Method not implemented.');
  }
}
