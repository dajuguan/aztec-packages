// WARNING: FILE CODE GENERATED BY BINDGEN UTILITY. DO NOT EDIT!
/* eslint-disable @typescript-eslint/no-unused-vars */
import { BarretenbergWasmWorker, BarretenbergWasm } from '../barretenberg_wasm/index.js';
import {
  BufferDeserializer,
  NumberDeserializer,
  VectorDeserializer,
  BoolDeserializer,
  StringDeserializer,
  serializeBufferable,
  OutputType,
} from '../serialize/index.js';
import { Fr, Fq, Point, Buffer32, Buffer128, Ptr } from '../types/index.js';

export class BarretenbergApi {
  constructor(protected wasm: BarretenbergWasmWorker) {}

  async pedersenCommit(inputsBuffer: Fr[]): Promise<Point> {
    const inArgs = [inputsBuffer].map(serializeBufferable);
    const outTypes: OutputType[] = [Point];
    const result = await this.wasm.callWasmExport(
      'pedersen_commit',
      inArgs,
      outTypes.map(t => t.SIZE_IN_BYTES),
    );
    const out = result.map((r, i) => outTypes[i].fromBuffer(r));
    return out[0];
  }

  async pedersenHash(inputsBuffer: Fr[], hashIndex: number): Promise<Fr> {
    const inArgs = [inputsBuffer, hashIndex].map(serializeBufferable);
    const outTypes: OutputType[] = [Fr];
    const result = await this.wasm.callWasmExport(
      'pedersen_hash',
      inArgs,
      outTypes.map(t => t.SIZE_IN_BYTES),
    );
    const out = result.map((r, i) => outTypes[i].fromBuffer(r));
    return out[0];
  }

  async pedersenHashBuffer(inputBuffer: Uint8Array, hashIndex: number): Promise<Fr> {
    const inArgs = [inputBuffer, hashIndex].map(serializeBufferable);
    const outTypes: OutputType[] = [Fr];
    const result = await this.wasm.callWasmExport(
      'pedersen_hash_buffer',
      inArgs,
      outTypes.map(t => t.SIZE_IN_BYTES),
    );
    const out = result.map((r, i) => outTypes[i].fromBuffer(r));
    return out[0];
  }

  async blake2s(data: Uint8Array): Promise<Buffer32> {
    const inArgs = [data].map(serializeBufferable);
    const outTypes: OutputType[] = [Buffer32];
    const result = await this.wasm.callWasmExport(
      'blake2s',
      inArgs,
      outTypes.map(t => t.SIZE_IN_BYTES),
    );
    const out = result.map((r, i) => outTypes[i].fromBuffer(r));
    return out[0];
  }

  async blake2sToField(data: Uint8Array): Promise<Fr> {
    const inArgs = [data].map(serializeBufferable);
    const outTypes: OutputType[] = [Fr];
    const result = await this.wasm.callWasmExport(
      'blake2s_to_field_',
      inArgs,
      outTypes.map(t => t.SIZE_IN_BYTES),
    );
    const out = result.map((r, i) => outTypes[i].fromBuffer(r));
    return out[0];
  }

  async schnorrComputePublicKey(privateKey: Fr): Promise<Point> {
    const inArgs = [privateKey].map(serializeBufferable);
    const outTypes: OutputType[] = [Point];
    const result = await this.wasm.callWasmExport(
      'schnorr_compute_public_key',
      inArgs,
      outTypes.map(t => t.SIZE_IN_BYTES),
    );
    const out = result.map((r, i) => outTypes[i].fromBuffer(r));
    return out[0];
  }

  async schnorrNegatePublicKey(publicKeyBuffer: Point): Promise<Point> {
    const inArgs = [publicKeyBuffer].map(serializeBufferable);
    const outTypes: OutputType[] = [Point];
    const result = await this.wasm.callWasmExport(
      'schnorr_negate_public_key',
      inArgs,
      outTypes.map(t => t.SIZE_IN_BYTES),
    );
    const out = result.map((r, i) => outTypes[i].fromBuffer(r));
    return out[0];
  }

  async schnorrConstructSignature(message: Uint8Array, privateKey: Fr): Promise<[Buffer32, Buffer32]> {
    const inArgs = [message, privateKey].map(serializeBufferable);
    const outTypes: OutputType[] = [Buffer32, Buffer32];
    const result = await this.wasm.callWasmExport(
      'schnorr_construct_signature',
      inArgs,
      outTypes.map(t => t.SIZE_IN_BYTES),
    );
    const out = result.map((r, i) => outTypes[i].fromBuffer(r));
    return out as any;
  }

  async schnorrVerifySignature(message: Uint8Array, pubKey: Point, sigS: Buffer32, sigE: Buffer32): Promise<boolean> {
    const inArgs = [message, pubKey, sigS, sigE].map(serializeBufferable);
    const outTypes: OutputType[] = [BoolDeserializer()];
    const result = await this.wasm.callWasmExport(
      'schnorr_verify_signature',
      inArgs,
      outTypes.map(t => t.SIZE_IN_BYTES),
    );
    const out = result.map((r, i) => outTypes[i].fromBuffer(r));
    return out[0];
  }

  async schnorrMultisigCreateMultisigPublicKey(privateKey: Fq): Promise<Buffer128> {
    const inArgs = [privateKey].map(serializeBufferable);
    const outTypes: OutputType[] = [Buffer128];
    const result = await this.wasm.callWasmExport(
      'schnorr_multisig_create_multisig_public_key',
      inArgs,
      outTypes.map(t => t.SIZE_IN_BYTES),
    );
    const out = result.map((r, i) => outTypes[i].fromBuffer(r));
    return out[0];
  }

  async schnorrMultisigValidateAndCombineSignerPubkeys(signerPubkeyBuf: Buffer128[]): Promise<[Point, boolean]> {
    const inArgs = [signerPubkeyBuf].map(serializeBufferable);
    const outTypes: OutputType[] = [Point, BoolDeserializer()];
    const result = await this.wasm.callWasmExport(
      'schnorr_multisig_validate_and_combine_signer_pubkeys',
      inArgs,
      outTypes.map(t => t.SIZE_IN_BYTES),
    );
    const out = result.map((r, i) => outTypes[i].fromBuffer(r));
    return out as any;
  }

  async schnorrMultisigConstructSignatureRound1(): Promise<[Buffer128, Buffer128]> {
    const inArgs = [].map(serializeBufferable);
    const outTypes: OutputType[] = [Buffer128, Buffer128];
    const result = await this.wasm.callWasmExport(
      'schnorr_multisig_construct_signature_round_1',
      inArgs,
      outTypes.map(t => t.SIZE_IN_BYTES),
    );
    const out = result.map((r, i) => outTypes[i].fromBuffer(r));
    return out as any;
  }

  async schnorrMultisigConstructSignatureRound2(
    message: Uint8Array,
    privateKey: Fq,
    signerRoundOnePrivateBuf: Buffer128,
    signerPubkeysBuf: Buffer128[],
    roundOnePublicBuf: Buffer128[],
  ): Promise<[Fq, boolean]> {
    const inArgs = [message, privateKey, signerRoundOnePrivateBuf, signerPubkeysBuf, roundOnePublicBuf].map(
      serializeBufferable,
    );
    const outTypes: OutputType[] = [Fq, BoolDeserializer()];
    const result = await this.wasm.callWasmExport(
      'schnorr_multisig_construct_signature_round_2',
      inArgs,
      outTypes.map(t => t.SIZE_IN_BYTES),
    );
    const out = result.map((r, i) => outTypes[i].fromBuffer(r));
    return out as any;
  }

  async schnorrMultisigCombineSignatures(
    message: Uint8Array,
    signerPubkeysBuf: Buffer128[],
    roundOneBuf: Buffer128[],
    roundTwoBuf: Fq[],
  ): Promise<[Buffer32, Buffer32, boolean]> {
    const inArgs = [message, signerPubkeysBuf, roundOneBuf, roundTwoBuf].map(serializeBufferable);
    const outTypes: OutputType[] = [Buffer32, Buffer32, BoolDeserializer()];
    const result = await this.wasm.callWasmExport(
      'schnorr_multisig_combine_signatures',
      inArgs,
      outTypes.map(t => t.SIZE_IN_BYTES),
    );
    const out = result.map((r, i) => outTypes[i].fromBuffer(r));
    return out as any;
  }

  async aesEncryptBufferCbc(input: Uint8Array, iv: Uint8Array, key: Uint8Array, length: number): Promise<Uint8Array> {
    const inArgs = [input, iv, key, length].map(serializeBufferable);
    const outTypes: OutputType[] = [BufferDeserializer()];
    const result = await this.wasm.callWasmExport(
      'aes_encrypt_buffer_cbc',
      inArgs,
      outTypes.map(t => t.SIZE_IN_BYTES),
    );
    const out = result.map((r, i) => outTypes[i].fromBuffer(r));
    return out[0];
  }

  async aesDecryptBufferCbc(input: Uint8Array, iv: Uint8Array, key: Uint8Array, length: number): Promise<Uint8Array> {
    const inArgs = [input, iv, key, length].map(serializeBufferable);
    const outTypes: OutputType[] = [BufferDeserializer()];
    const result = await this.wasm.callWasmExport(
      'aes_decrypt_buffer_cbc',
      inArgs,
      outTypes.map(t => t.SIZE_IN_BYTES),
    );
    const out = result.map((r, i) => outTypes[i].fromBuffer(r));
    return out[0];
  }

  async srsInitSrs(pointsBuf: Uint8Array, numPoints: number, g2PointBuf: Uint8Array): Promise<void> {
    const inArgs = [pointsBuf, numPoints, g2PointBuf].map(serializeBufferable);
    const outTypes: OutputType[] = [];
    const result = await this.wasm.callWasmExport(
      'srs_init_srs',
      inArgs,
      outTypes.map(t => t.SIZE_IN_BYTES),
    );
    const out = result.map((r, i) => outTypes[i].fromBuffer(r));
    return;
  }

  async examplesSimpleCreateAndVerifyProof(): Promise<boolean> {
    const inArgs = [].map(serializeBufferable);
    const outTypes: OutputType[] = [BoolDeserializer()];
    const result = await this.wasm.callWasmExport(
      'examples_simple_create_and_verify_proof',
      inArgs,
      outTypes.map(t => t.SIZE_IN_BYTES),
    );
    const out = result.map((r, i) => outTypes[i].fromBuffer(r));
    return out[0];
  }

  async testThreads(threads: number, iterations: number): Promise<number> {
    const inArgs = [threads, iterations].map(serializeBufferable);
    const outTypes: OutputType[] = [NumberDeserializer()];
    const result = await this.wasm.callWasmExport(
      'test_threads',
      inArgs,
      outTypes.map(t => t.SIZE_IN_BYTES),
    );
    const out = result.map((r, i) => outTypes[i].fromBuffer(r));
    return out[0];
  }

  async commonInitSlabAllocator(circuitSize: number): Promise<void> {
    const inArgs = [circuitSize].map(serializeBufferable);
    const outTypes: OutputType[] = [];
    const result = await this.wasm.callWasmExport(
      'common_init_slab_allocator',
      inArgs,
      outTypes.map(t => t.SIZE_IN_BYTES),
    );
    const out = result.map((r, i) => outTypes[i].fromBuffer(r));
    return;
  }

  async acirGetCircuitSizes(constraintSystemBuf: Uint8Array): Promise<[number, number, number]> {
    const inArgs = [constraintSystemBuf].map(serializeBufferable);
    const outTypes: OutputType[] = [NumberDeserializer(), NumberDeserializer(), NumberDeserializer()];
    const result = await this.wasm.callWasmExport(
      'acir_get_circuit_sizes',
      inArgs,
      outTypes.map(t => t.SIZE_IN_BYTES),
    );
    const out = result.map((r, i) => outTypes[i].fromBuffer(r));
    return out as any;
  }

  async acirNewAcirComposer(sizeHint: number): Promise<Ptr> {
    const inArgs = [sizeHint].map(serializeBufferable);
    const outTypes: OutputType[] = [Ptr];
    const result = await this.wasm.callWasmExport(
      'acir_new_acir_composer',
      inArgs,
      outTypes.map(t => t.SIZE_IN_BYTES),
    );
    const out = result.map((r, i) => outTypes[i].fromBuffer(r));
    return out[0];
  }

  async acirDeleteAcirComposer(acirComposerPtr: Ptr): Promise<void> {
    const inArgs = [acirComposerPtr].map(serializeBufferable);
    const outTypes: OutputType[] = [];
    const result = await this.wasm.callWasmExport(
      'acir_delete_acir_composer',
      inArgs,
      outTypes.map(t => t.SIZE_IN_BYTES),
    );
    const out = result.map((r, i) => outTypes[i].fromBuffer(r));
    return;
  }

  async acirCreateCircuit(acirComposerPtr: Ptr, constraintSystemBuf: Uint8Array, sizeHint: number): Promise<void> {
    const inArgs = [acirComposerPtr, constraintSystemBuf, sizeHint].map(serializeBufferable);
    const outTypes: OutputType[] = [];
    const result = await this.wasm.callWasmExport(
      'acir_create_circuit',
      inArgs,
      outTypes.map(t => t.SIZE_IN_BYTES),
    );
    const out = result.map((r, i) => outTypes[i].fromBuffer(r));
    return;
  }

  async acirInitProvingKey(acirComposerPtr: Ptr, constraintSystemBuf: Uint8Array): Promise<void> {
    const inArgs = [acirComposerPtr, constraintSystemBuf].map(serializeBufferable);
    const outTypes: OutputType[] = [];
    const result = await this.wasm.callWasmExport(
      'acir_init_proving_key',
      inArgs,
      outTypes.map(t => t.SIZE_IN_BYTES),
    );
    const out = result.map((r, i) => outTypes[i].fromBuffer(r));
    return;
  }

  async acirCreateProof(
    acirComposerPtr: Ptr,
    constraintSystemBuf: Uint8Array,
    witnessBuf: Uint8Array,
    isRecursive: boolean,
  ): Promise<Uint8Array> {
    const inArgs = [acirComposerPtr, constraintSystemBuf, witnessBuf, isRecursive].map(serializeBufferable);
    const outTypes: OutputType[] = [BufferDeserializer()];
    const result = await this.wasm.callWasmExport(
      'acir_create_proof',
      inArgs,
      outTypes.map(t => t.SIZE_IN_BYTES),
    );
    const out = result.map((r, i) => outTypes[i].fromBuffer(r));
    return out[0];
  }

  async acirCreateGoblinProof(
    acirComposerPtr: Ptr,
    constraintSystemBuf: Uint8Array,
    witnessBuf: Uint8Array,
    isRecursive: boolean,
  ): Promise<Uint8Array> {
    const inArgs = [acirComposerPtr, constraintSystemBuf, witnessBuf, isRecursive].map(serializeBufferable);
    const outTypes: OutputType[] = [BufferDeserializer()];
    const result = await this.wasm.callWasmExport(
      'acir_create_goblin_proof',
      inArgs,
      outTypes.map(t => t.SIZE_IN_BYTES),
    );
    const out = result.map((r, i) => outTypes[i].fromBuffer(r));
    return out[0];
  }

  async acirLoadVerificationKey(acirComposerPtr: Ptr, vkBuf: Uint8Array): Promise<void> {
    const inArgs = [acirComposerPtr, vkBuf].map(serializeBufferable);
    const outTypes: OutputType[] = [];
    const result = await this.wasm.callWasmExport(
      'acir_load_verification_key',
      inArgs,
      outTypes.map(t => t.SIZE_IN_BYTES),
    );
    const out = result.map((r, i) => outTypes[i].fromBuffer(r));
    return;
  }

  async acirInitVerificationKey(acirComposerPtr: Ptr): Promise<void> {
    const inArgs = [acirComposerPtr].map(serializeBufferable);
    const outTypes: OutputType[] = [];
    const result = await this.wasm.callWasmExport(
      'acir_init_verification_key',
      inArgs,
      outTypes.map(t => t.SIZE_IN_BYTES),
    );
    const out = result.map((r, i) => outTypes[i].fromBuffer(r));
    return;
  }

  async acirGetVerificationKey(acirComposerPtr: Ptr): Promise<Uint8Array> {
    const inArgs = [acirComposerPtr].map(serializeBufferable);
    const outTypes: OutputType[] = [BufferDeserializer()];
    const result = await this.wasm.callWasmExport(
      'acir_get_verification_key',
      inArgs,
      outTypes.map(t => t.SIZE_IN_BYTES),
    );
    const out = result.map((r, i) => outTypes[i].fromBuffer(r));
    return out[0];
  }

  async acirGetProvingKey(acirComposerPtr: Ptr, acirVec: Uint8Array): Promise<Uint8Array> {
    const inArgs = [acirComposerPtr, acirVec].map(serializeBufferable);
    const outTypes: OutputType[] = [BufferDeserializer()];
    const result = await this.wasm.callWasmExport(
      'acir_get_proving_key',
      inArgs,
      outTypes.map(t => t.SIZE_IN_BYTES),
    );
    const out = result.map((r, i) => outTypes[i].fromBuffer(r));
    return out[0];
  }

  async acirVerifyProof(acirComposerPtr: Ptr, proofBuf: Uint8Array, isRecursive: boolean): Promise<boolean> {
    const inArgs = [acirComposerPtr, proofBuf, isRecursive].map(serializeBufferable);
    const outTypes: OutputType[] = [BoolDeserializer()];
    const result = await this.wasm.callWasmExport(
      'acir_verify_proof',
      inArgs,
      outTypes.map(t => t.SIZE_IN_BYTES),
    );
    const out = result.map((r, i) => outTypes[i].fromBuffer(r));
    return out[0];
  }

  async acirVerifyProofGoblin(acirComposerPtr: Ptr, proofBuf: Uint8Array, isRecursive: boolean): Promise<boolean> {
    const inArgs = [acirComposerPtr, proofBuf, isRecursive].map(serializeBufferable);
    const outTypes: OutputType[] = [BoolDeserializer()];
    const result = await this.wasm.callWasmExport(
      'acir_verify_proof_goblin',
      inArgs,
      outTypes.map(t => t.SIZE_IN_BYTES),
    );
    const out = result.map((r, i) => outTypes[i].fromBuffer(r));
    return out[0];
  }

  async acirGetSolidityVerifier(acirComposerPtr: Ptr): Promise<string> {
    const inArgs = [acirComposerPtr].map(serializeBufferable);
    const outTypes: OutputType[] = [StringDeserializer()];
    const result = await this.wasm.callWasmExport(
      'acir_get_solidity_verifier',
      inArgs,
      outTypes.map(t => t.SIZE_IN_BYTES),
    );
    const out = result.map((r, i) => outTypes[i].fromBuffer(r));
    return out[0];
  }

  async acirSerializeProofIntoFields(
    acirComposerPtr: Ptr,
    proofBuf: Uint8Array,
    numInnerPublicInputs: number,
  ): Promise<Fr[]> {
    const inArgs = [acirComposerPtr, proofBuf, numInnerPublicInputs].map(serializeBufferable);
    const outTypes: OutputType[] = [VectorDeserializer(Fr)];
    const result = await this.wasm.callWasmExport(
      'acir_serialize_proof_into_fields',
      inArgs,
      outTypes.map(t => t.SIZE_IN_BYTES),
    );
    const out = result.map((r, i) => outTypes[i].fromBuffer(r));
    return out[0];
  }

  async acirSerializeVerificationKeyIntoFields(acirComposerPtr: Ptr): Promise<[Fr[], Fr]> {
    const inArgs = [acirComposerPtr].map(serializeBufferable);
    const outTypes: OutputType[] = [VectorDeserializer(Fr), Fr];
    const result = await this.wasm.callWasmExport(
      'acir_serialize_verification_key_into_fields',
      inArgs,
      outTypes.map(t => t.SIZE_IN_BYTES),
    );
    const out = result.map((r, i) => outTypes[i].fromBuffer(r));
    return out as any;
  }
}
export class BarretenbergApiSync {
  constructor(protected wasm: BarretenbergWasm) {}

  pedersenCommit(inputsBuffer: Fr[]): Point {
    const inArgs = [inputsBuffer].map(serializeBufferable);
    const outTypes: OutputType[] = [Point];
    const result = this.wasm.callWasmExport(
      'pedersen_commit',
      inArgs,
      outTypes.map(t => t.SIZE_IN_BYTES),
    );
    const out = result.map((r, i) => outTypes[i].fromBuffer(r));
    return out[0];
  }

  pedersenHash(inputsBuffer: Fr[], hashIndex: number): Fr {
    const inArgs = [inputsBuffer, hashIndex].map(serializeBufferable);
    const outTypes: OutputType[] = [Fr];
    const result = this.wasm.callWasmExport(
      'pedersen_hash',
      inArgs,
      outTypes.map(t => t.SIZE_IN_BYTES),
    );
    const out = result.map((r, i) => outTypes[i].fromBuffer(r));
    return out[0];
  }

  pedersenHashBuffer(inputBuffer: Uint8Array, hashIndex: number): Fr {
    const inArgs = [inputBuffer, hashIndex].map(serializeBufferable);
    const outTypes: OutputType[] = [Fr];
    const result = this.wasm.callWasmExport(
      'pedersen_hash_buffer',
      inArgs,
      outTypes.map(t => t.SIZE_IN_BYTES),
    );
    const out = result.map((r, i) => outTypes[i].fromBuffer(r));
    return out[0];
  }

  blake2s(data: Uint8Array): Buffer32 {
    const inArgs = [data].map(serializeBufferable);
    const outTypes: OutputType[] = [Buffer32];
    const result = this.wasm.callWasmExport(
      'blake2s',
      inArgs,
      outTypes.map(t => t.SIZE_IN_BYTES),
    );
    const out = result.map((r, i) => outTypes[i].fromBuffer(r));
    return out[0];
  }

  blake2sToField(data: Uint8Array): Fr {
    const inArgs = [data].map(serializeBufferable);
    const outTypes: OutputType[] = [Fr];
    const result = this.wasm.callWasmExport(
      'blake2s_to_field_',
      inArgs,
      outTypes.map(t => t.SIZE_IN_BYTES),
    );
    const out = result.map((r, i) => outTypes[i].fromBuffer(r));
    return out[0];
  }

  schnorrComputePublicKey(privateKey: Fr): Point {
    const inArgs = [privateKey].map(serializeBufferable);
    const outTypes: OutputType[] = [Point];
    const result = this.wasm.callWasmExport(
      'schnorr_compute_public_key',
      inArgs,
      outTypes.map(t => t.SIZE_IN_BYTES),
    );
    const out = result.map((r, i) => outTypes[i].fromBuffer(r));
    return out[0];
  }

  schnorrNegatePublicKey(publicKeyBuffer: Point): Point {
    const inArgs = [publicKeyBuffer].map(serializeBufferable);
    const outTypes: OutputType[] = [Point];
    const result = this.wasm.callWasmExport(
      'schnorr_negate_public_key',
      inArgs,
      outTypes.map(t => t.SIZE_IN_BYTES),
    );
    const out = result.map((r, i) => outTypes[i].fromBuffer(r));
    return out[0];
  }

  schnorrConstructSignature(message: Uint8Array, privateKey: Fr): [Buffer32, Buffer32] {
    const inArgs = [message, privateKey].map(serializeBufferable);
    const outTypes: OutputType[] = [Buffer32, Buffer32];
    const result = this.wasm.callWasmExport(
      'schnorr_construct_signature',
      inArgs,
      outTypes.map(t => t.SIZE_IN_BYTES),
    );
    const out = result.map((r, i) => outTypes[i].fromBuffer(r));
    return out as any;
  }

  schnorrVerifySignature(message: Uint8Array, pubKey: Point, sigS: Buffer32, sigE: Buffer32): boolean {
    const inArgs = [message, pubKey, sigS, sigE].map(serializeBufferable);
    const outTypes: OutputType[] = [BoolDeserializer()];
    const result = this.wasm.callWasmExport(
      'schnorr_verify_signature',
      inArgs,
      outTypes.map(t => t.SIZE_IN_BYTES),
    );
    const out = result.map((r, i) => outTypes[i].fromBuffer(r));
    return out[0];
  }

  schnorrMultisigCreateMultisigPublicKey(privateKey: Fq): Buffer128 {
    const inArgs = [privateKey].map(serializeBufferable);
    const outTypes: OutputType[] = [Buffer128];
    const result = this.wasm.callWasmExport(
      'schnorr_multisig_create_multisig_public_key',
      inArgs,
      outTypes.map(t => t.SIZE_IN_BYTES),
    );
    const out = result.map((r, i) => outTypes[i].fromBuffer(r));
    return out[0];
  }

  schnorrMultisigValidateAndCombineSignerPubkeys(signerPubkeyBuf: Buffer128[]): [Point, boolean] {
    const inArgs = [signerPubkeyBuf].map(serializeBufferable);
    const outTypes: OutputType[] = [Point, BoolDeserializer()];
    const result = this.wasm.callWasmExport(
      'schnorr_multisig_validate_and_combine_signer_pubkeys',
      inArgs,
      outTypes.map(t => t.SIZE_IN_BYTES),
    );
    const out = result.map((r, i) => outTypes[i].fromBuffer(r));
    return out as any;
  }

  schnorrMultisigConstructSignatureRound1(): [Buffer128, Buffer128] {
    const inArgs = [].map(serializeBufferable);
    const outTypes: OutputType[] = [Buffer128, Buffer128];
    const result = this.wasm.callWasmExport(
      'schnorr_multisig_construct_signature_round_1',
      inArgs,
      outTypes.map(t => t.SIZE_IN_BYTES),
    );
    const out = result.map((r, i) => outTypes[i].fromBuffer(r));
    return out as any;
  }

  schnorrMultisigConstructSignatureRound2(
    message: Uint8Array,
    privateKey: Fq,
    signerRoundOnePrivateBuf: Buffer128,
    signerPubkeysBuf: Buffer128[],
    roundOnePublicBuf: Buffer128[],
  ): [Fq, boolean] {
    const inArgs = [message, privateKey, signerRoundOnePrivateBuf, signerPubkeysBuf, roundOnePublicBuf].map(
      serializeBufferable,
    );
    const outTypes: OutputType[] = [Fq, BoolDeserializer()];
    const result = this.wasm.callWasmExport(
      'schnorr_multisig_construct_signature_round_2',
      inArgs,
      outTypes.map(t => t.SIZE_IN_BYTES),
    );
    const out = result.map((r, i) => outTypes[i].fromBuffer(r));
    return out as any;
  }

  schnorrMultisigCombineSignatures(
    message: Uint8Array,
    signerPubkeysBuf: Buffer128[],
    roundOneBuf: Buffer128[],
    roundTwoBuf: Fq[],
  ): [Buffer32, Buffer32, boolean] {
    const inArgs = [message, signerPubkeysBuf, roundOneBuf, roundTwoBuf].map(serializeBufferable);
    const outTypes: OutputType[] = [Buffer32, Buffer32, BoolDeserializer()];
    const result = this.wasm.callWasmExport(
      'schnorr_multisig_combine_signatures',
      inArgs,
      outTypes.map(t => t.SIZE_IN_BYTES),
    );
    const out = result.map((r, i) => outTypes[i].fromBuffer(r));
    return out as any;
  }

  aesEncryptBufferCbc(input: Uint8Array, iv: Uint8Array, key: Uint8Array, length: number): Uint8Array {
    const inArgs = [input, iv, key, length].map(serializeBufferable);
    const outTypes: OutputType[] = [BufferDeserializer()];
    const result = this.wasm.callWasmExport(
      'aes_encrypt_buffer_cbc',
      inArgs,
      outTypes.map(t => t.SIZE_IN_BYTES),
    );
    const out = result.map((r, i) => outTypes[i].fromBuffer(r));
    return out[0];
  }

  aesDecryptBufferCbc(input: Uint8Array, iv: Uint8Array, key: Uint8Array, length: number): Uint8Array {
    const inArgs = [input, iv, key, length].map(serializeBufferable);
    const outTypes: OutputType[] = [BufferDeserializer()];
    const result = this.wasm.callWasmExport(
      'aes_decrypt_buffer_cbc',
      inArgs,
      outTypes.map(t => t.SIZE_IN_BYTES),
    );
    const out = result.map((r, i) => outTypes[i].fromBuffer(r));
    return out[0];
  }

  srsInitSrs(pointsBuf: Uint8Array, numPoints: number, g2PointBuf: Uint8Array): void {
    const inArgs = [pointsBuf, numPoints, g2PointBuf].map(serializeBufferable);
    const outTypes: OutputType[] = [];
    const result = this.wasm.callWasmExport(
      'srs_init_srs',
      inArgs,
      outTypes.map(t => t.SIZE_IN_BYTES),
    );
    const out = result.map((r, i) => outTypes[i].fromBuffer(r));
    return;
  }

  examplesSimpleCreateAndVerifyProof(): boolean {
    const inArgs = [].map(serializeBufferable);
    const outTypes: OutputType[] = [BoolDeserializer()];
    const result = this.wasm.callWasmExport(
      'examples_simple_create_and_verify_proof',
      inArgs,
      outTypes.map(t => t.SIZE_IN_BYTES),
    );
    const out = result.map((r, i) => outTypes[i].fromBuffer(r));
    return out[0];
  }

  testThreads(threads: number, iterations: number): number {
    const inArgs = [threads, iterations].map(serializeBufferable);
    const outTypes: OutputType[] = [NumberDeserializer()];
    const result = this.wasm.callWasmExport(
      'test_threads',
      inArgs,
      outTypes.map(t => t.SIZE_IN_BYTES),
    );
    const out = result.map((r, i) => outTypes[i].fromBuffer(r));
    return out[0];
  }

  commonInitSlabAllocator(circuitSize: number): void {
    const inArgs = [circuitSize].map(serializeBufferable);
    const outTypes: OutputType[] = [];
    const result = this.wasm.callWasmExport(
      'common_init_slab_allocator',
      inArgs,
      outTypes.map(t => t.SIZE_IN_BYTES),
    );
    const out = result.map((r, i) => outTypes[i].fromBuffer(r));
    return;
  }

  acirGetCircuitSizes(constraintSystemBuf: Uint8Array): [number, number, number] {
    const inArgs = [constraintSystemBuf].map(serializeBufferable);
    const outTypes: OutputType[] = [NumberDeserializer(), NumberDeserializer(), NumberDeserializer()];
    const result = this.wasm.callWasmExport(
      'acir_get_circuit_sizes',
      inArgs,
      outTypes.map(t => t.SIZE_IN_BYTES),
    );
    const out = result.map((r, i) => outTypes[i].fromBuffer(r));
    return out as any;
  }

  acirNewAcirComposer(sizeHint: number): Ptr {
    const inArgs = [sizeHint].map(serializeBufferable);
    const outTypes: OutputType[] = [Ptr];
    const result = this.wasm.callWasmExport(
      'acir_new_acir_composer',
      inArgs,
      outTypes.map(t => t.SIZE_IN_BYTES),
    );
    const out = result.map((r, i) => outTypes[i].fromBuffer(r));
    return out[0];
  }

  acirDeleteAcirComposer(acirComposerPtr: Ptr): void {
    const inArgs = [acirComposerPtr].map(serializeBufferable);
    const outTypes: OutputType[] = [];
    const result = this.wasm.callWasmExport(
      'acir_delete_acir_composer',
      inArgs,
      outTypes.map(t => t.SIZE_IN_BYTES),
    );
    const out = result.map((r, i) => outTypes[i].fromBuffer(r));
    return;
  }

  acirCreateCircuit(acirComposerPtr: Ptr, constraintSystemBuf: Uint8Array, sizeHint: number): void {
    const inArgs = [acirComposerPtr, constraintSystemBuf, sizeHint].map(serializeBufferable);
    const outTypes: OutputType[] = [];
    const result = this.wasm.callWasmExport(
      'acir_create_circuit',
      inArgs,
      outTypes.map(t => t.SIZE_IN_BYTES),
    );
    const out = result.map((r, i) => outTypes[i].fromBuffer(r));
    return;
  }

  acirInitProvingKey(acirComposerPtr: Ptr, constraintSystemBuf: Uint8Array): void {
    const inArgs = [acirComposerPtr, constraintSystemBuf].map(serializeBufferable);
    const outTypes: OutputType[] = [];
    const result = this.wasm.callWasmExport(
      'acir_init_proving_key',
      inArgs,
      outTypes.map(t => t.SIZE_IN_BYTES),
    );
    const out = result.map((r, i) => outTypes[i].fromBuffer(r));
    return;
  }

  acirCreateProof(
    acirComposerPtr: Ptr,
    constraintSystemBuf: Uint8Array,
    witnessBuf: Uint8Array,
    isRecursive: boolean,
  ): Uint8Array {
    const inArgs = [acirComposerPtr, constraintSystemBuf, witnessBuf, isRecursive].map(serializeBufferable);
    const outTypes: OutputType[] = [BufferDeserializer()];
    const result = this.wasm.callWasmExport(
      'acir_create_proof',
      inArgs,
      outTypes.map(t => t.SIZE_IN_BYTES),
    );
    const out = result.map((r, i) => outTypes[i].fromBuffer(r));
    return out[0];
  }

  acirCreateGoblinProof(
    acirComposerPtr: Ptr,
    constraintSystemBuf: Uint8Array,
    witnessBuf: Uint8Array,
    isRecursive: boolean,
  ): Uint8Array {
    const inArgs = [acirComposerPtr, constraintSystemBuf, witnessBuf, isRecursive].map(serializeBufferable);
    const outTypes: OutputType[] = [BufferDeserializer()];
    const result = this.wasm.callWasmExport(
      'acir_create_goblin_proof',
      inArgs,
      outTypes.map(t => t.SIZE_IN_BYTES),
    );
    const out = result.map((r, i) => outTypes[i].fromBuffer(r));
    return out[0];
  }

  acirLoadVerificationKey(acirComposerPtr: Ptr, vkBuf: Uint8Array): void {
    const inArgs = [acirComposerPtr, vkBuf].map(serializeBufferable);
    const outTypes: OutputType[] = [];
    const result = this.wasm.callWasmExport(
      'acir_load_verification_key',
      inArgs,
      outTypes.map(t => t.SIZE_IN_BYTES),
    );
    const out = result.map((r, i) => outTypes[i].fromBuffer(r));
    return;
  }

  acirInitVerificationKey(acirComposerPtr: Ptr): void {
    const inArgs = [acirComposerPtr].map(serializeBufferable);
    const outTypes: OutputType[] = [];
    const result = this.wasm.callWasmExport(
      'acir_init_verification_key',
      inArgs,
      outTypes.map(t => t.SIZE_IN_BYTES),
    );
    const out = result.map((r, i) => outTypes[i].fromBuffer(r));
    return;
  }

  acirGetVerificationKey(acirComposerPtr: Ptr): Uint8Array {
    const inArgs = [acirComposerPtr].map(serializeBufferable);
    const outTypes: OutputType[] = [BufferDeserializer()];
    const result = this.wasm.callWasmExport(
      'acir_get_verification_key',
      inArgs,
      outTypes.map(t => t.SIZE_IN_BYTES),
    );
    const out = result.map((r, i) => outTypes[i].fromBuffer(r));
    return out[0];
  }

  acirGetProvingKey(acirComposerPtr: Ptr, acirVec: Uint8Array): Uint8Array {
    const inArgs = [acirComposerPtr, acirVec].map(serializeBufferable);
    const outTypes: OutputType[] = [BufferDeserializer()];
    const result = this.wasm.callWasmExport(
      'acir_get_proving_key',
      inArgs,
      outTypes.map(t => t.SIZE_IN_BYTES),
    );
    const out = result.map((r, i) => outTypes[i].fromBuffer(r));
    return out[0];
  }

  acirVerifyProof(acirComposerPtr: Ptr, proofBuf: Uint8Array, isRecursive: boolean): boolean {
    const inArgs = [acirComposerPtr, proofBuf, isRecursive].map(serializeBufferable);
    const outTypes: OutputType[] = [BoolDeserializer()];
    const result = this.wasm.callWasmExport(
      'acir_verify_proof',
      inArgs,
      outTypes.map(t => t.SIZE_IN_BYTES),
    );
    const out = result.map((r, i) => outTypes[i].fromBuffer(r));
    return out[0];
  }

  acirVerifyProofGoblin(acirComposerPtr: Ptr, proofBuf: Uint8Array, isRecursive: boolean): boolean {
    const inArgs = [acirComposerPtr, proofBuf, isRecursive].map(serializeBufferable);
    const outTypes: OutputType[] = [BoolDeserializer()];
    const result = this.wasm.callWasmExport(
      'acir_verify_proof_goblin',
      inArgs,
      outTypes.map(t => t.SIZE_IN_BYTES),
    );
    const out = result.map((r, i) => outTypes[i].fromBuffer(r));
    return out[0];
  }

  acirGetSolidityVerifier(acirComposerPtr: Ptr): string {
    const inArgs = [acirComposerPtr].map(serializeBufferable);
    const outTypes: OutputType[] = [StringDeserializer()];
    const result = this.wasm.callWasmExport(
      'acir_get_solidity_verifier',
      inArgs,
      outTypes.map(t => t.SIZE_IN_BYTES),
    );
    const out = result.map((r, i) => outTypes[i].fromBuffer(r));
    return out[0];
  }

  acirSerializeProofIntoFields(acirComposerPtr: Ptr, proofBuf: Uint8Array, numInnerPublicInputs: number): Fr[] {
    const inArgs = [acirComposerPtr, proofBuf, numInnerPublicInputs].map(serializeBufferable);
    const outTypes: OutputType[] = [VectorDeserializer(Fr)];
    const result = this.wasm.callWasmExport(
      'acir_serialize_proof_into_fields',
      inArgs,
      outTypes.map(t => t.SIZE_IN_BYTES),
    );
    const out = result.map((r, i) => outTypes[i].fromBuffer(r));
    return out[0];
  }

  acirSerializeVerificationKeyIntoFields(acirComposerPtr: Ptr): [Fr[], Fr] {
    const inArgs = [acirComposerPtr].map(serializeBufferable);
    const outTypes: OutputType[] = [VectorDeserializer(Fr), Fr];
    const result = this.wasm.callWasmExport(
      'acir_serialize_verification_key_into_fields',
      inArgs,
      outTypes.map(t => t.SIZE_IN_BYTES),
    );
    const out = result.map((r, i) => outTypes[i].fromBuffer(r));
    return out as any;
  }
}
