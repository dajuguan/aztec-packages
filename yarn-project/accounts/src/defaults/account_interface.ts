import {
  AccountInterface,
  AuthWitnessProvider,
  EntrypointInterface,
  TxExecutionOptions,
} from '@aztec/aztec.js/account';
import { AuthWitness, FunctionCall, TxExecutionRequest } from '@aztec/circuit-types';
import { CompleteAddress, Fr } from '@aztec/circuits.js';
import { NodeInfo } from '@aztec/types/interfaces';

import { DefaultAccountEntrypoint } from './account_entrypoint.js';

/**
 * Default implementation for an account interface. Requires that the account uses the default
 * entrypoint signature, which accept an AppPayload and a FeePayload as defined in noir-libs/aztec-noir/src/entrypoint module
 */
export class DefaultAccountInterface implements AccountInterface {
  protected entrypoint: EntrypointInterface;

  constructor(
    protected authWitnessProvider: AuthWitnessProvider,
    protected address: CompleteAddress,
    nodeInfo: Pick<NodeInfo, 'chainId' | 'protocolVersion'>,
  ) {
    this.entrypoint = new DefaultAccountEntrypoint(
      address.address,
      authWitnessProvider,
      nodeInfo.chainId,
      nodeInfo.protocolVersion,
    );
  }

  createTxExecutionRequest(executions: FunctionCall[], options?: TxExecutionOptions): Promise<TxExecutionRequest> {
    return this.entrypoint.createTxExecutionRequest(executions, options);
  }

  createAuthWitness(message: Fr): Promise<AuthWitness> {
    return this.authWitnessProvider.createAuthWitness(message);
  }

  getCompleteAddress(): CompleteAddress {
    return this.address;
  }
}
