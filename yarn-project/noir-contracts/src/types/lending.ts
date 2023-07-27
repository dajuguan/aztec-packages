/* Autogenerated file, do not edit! */

/* eslint-disable */
import {
  AztecAddress,
  Contract,
  ContractFunctionInteraction,
  ContractMethod,
  DeployMethod,
  Wallet,
} from '@aztec/aztec.js';
import { ContractAbi } from '@aztec/foundation/abi';
import { Fr, Point } from '@aztec/foundation/fields';
import { AztecRPC, PublicKey } from '@aztec/types';

import { LendingContractAbi } from '../artifacts/index.js';

/**
 * Type-safe interface for contract Lending;
 */
export class LendingContract extends Contract {
  constructor(
    /** The deployed contract's address. */
    address: AztecAddress,
    /** The wallet. */
    wallet: Wallet,
  ) {
    super(address, LendingContractAbi, wallet);
  }

  /**
   * Creates a tx to deploy a new instance of this contract.
   */
  public static deploy(rpc: AztecRPC) {
    return new DeployMethod(Point.ZERO, rpc, LendingContractAbi, Array.from(arguments).slice(1));
  }

  /**
   * Creates a tx to deploy a new instance of this contract using the specified public key to derive the address.
   */
  public static deployWithPublicKey(rpc: AztecRPC, publicKey: PublicKey) {
    return new DeployMethod(publicKey, rpc, LendingContractAbi, Array.from(arguments).slice(2));
  }

  /**
   * Returns this contract's ABI.
   */
  public static get abi(): ContractAbi {
    return LendingContractAbi;
  }

  /** Type-safe wrappers for the public methods exposed by the contract. */
  public methods!: {
    /** _borrow(owner: field, amount: field) */
    _borrow: ((
      owner: Fr | bigint | number | { toField: () => Fr },
      amount: Fr | bigint | number | { toField: () => Fr },
    ) => ContractFunctionInteraction) &
      Pick<ContractMethod, 'selector'>;

    /** _deposit(owner: field, amount: field) */
    _deposit: ((
      owner: Fr | bigint | number | { toField: () => Fr },
      amount: Fr | bigint | number | { toField: () => Fr },
    ) => ContractFunctionInteraction) &
      Pick<ContractMethod, 'selector'>;

    /** _repay(owner: field, amount: field) */
    _repay: ((
      owner: Fr | bigint | number | { toField: () => Fr },
      amount: Fr | bigint | number | { toField: () => Fr },
    ) => ContractFunctionInteraction) &
      Pick<ContractMethod, 'selector'>;

    /** _withdraw(owner: field, amount: field) */
    _withdraw: ((
      owner: Fr | bigint | number | { toField: () => Fr },
      amount: Fr | bigint | number | { toField: () => Fr },
    ) => ContractFunctionInteraction) &
      Pick<ContractMethod, 'selector'>;

    /** borrow_private(secret: field, amount: field) */
    borrow_private: ((
      secret: Fr | bigint | number | { toField: () => Fr },
      amount: Fr | bigint | number | { toField: () => Fr },
    ) => ContractFunctionInteraction) &
      Pick<ContractMethod, 'selector'>;

    /** borrow_public(amount: field) */
    borrow_public: ((amount: Fr | bigint | number | { toField: () => Fr }) => ContractFunctionInteraction) &
      Pick<ContractMethod, 'selector'>;

    /** deposit_private(secret: field, owner: field, amount: field) */
    deposit_private: ((
      secret: Fr | bigint | number | { toField: () => Fr },
      owner: Fr | bigint | number | { toField: () => Fr },
      amount: Fr | bigint | number | { toField: () => Fr },
    ) => ContractFunctionInteraction) &
      Pick<ContractMethod, 'selector'>;

    /** deposit_public(owner: field, amount: field) */
    deposit_public: ((
      owner: Fr | bigint | number | { toField: () => Fr },
      amount: Fr | bigint | number | { toField: () => Fr },
    ) => ContractFunctionInteraction) &
      Pick<ContractMethod, 'selector'>;

    /** init() */
    init: (() => ContractFunctionInteraction) & Pick<ContractMethod, 'selector'>;

    /** repay_private(secret: field, owner: field, amount: field) */
    repay_private: ((
      secret: Fr | bigint | number | { toField: () => Fr },
      owner: Fr | bigint | number | { toField: () => Fr },
      amount: Fr | bigint | number | { toField: () => Fr },
    ) => ContractFunctionInteraction) &
      Pick<ContractMethod, 'selector'>;

    /** repay_public(owner: field, amount: field) */
    repay_public: ((
      owner: Fr | bigint | number | { toField: () => Fr },
      amount: Fr | bigint | number | { toField: () => Fr },
    ) => ContractFunctionInteraction) &
      Pick<ContractMethod, 'selector'>;

    /** update_tot() */
    update_tot: (() => ContractFunctionInteraction) & Pick<ContractMethod, 'selector'>;

    /** withdraw_private(secret: field, amount: field) */
    withdraw_private: ((
      secret: Fr | bigint | number | { toField: () => Fr },
      amount: Fr | bigint | number | { toField: () => Fr },
    ) => ContractFunctionInteraction) &
      Pick<ContractMethod, 'selector'>;

    /** withdraw_public(amount: field) */
    withdraw_public: ((amount: Fr | bigint | number | { toField: () => Fr }) => ContractFunctionInteraction) &
      Pick<ContractMethod, 'selector'>;
  };
}
