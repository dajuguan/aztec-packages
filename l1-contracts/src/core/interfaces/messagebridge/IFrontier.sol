// SPDX-License-Identifier: Apache-2.0
// Copyright 2023 Aztec Labs.
pragma solidity >=0.8.18;

interface IFrontier {
  function insertLeaf(bytes32 _leaf) external returns (uint256);

  function root() external view returns (bytes32);

  function isFull() external view returns (bool);
}
