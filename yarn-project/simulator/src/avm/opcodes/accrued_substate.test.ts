import { mock } from 'jest-mock-extended';

import { CommitmentsDB } from '../../index.js';
import { AvmContext } from '../avm_context.js';
import { Field, Uint8 } from '../avm_memory_types.js';
import { InstructionExecutionError } from '../errors.js';
import { initContext, initExecutionEnvironment, initHostStorage } from '../fixtures/index.js';
import { AvmPersistableStateManager } from '../journal/journal.js';
import {
  EmitNoteHash,
  EmitNullifier,
  EmitUnencryptedLog,
  NoteHashExists,
  NullifierExists,
  SendL2ToL1Message,
} from './accrued_substate.js';
import { StaticCallStorageAlterError } from './storage.js';

describe('Accrued Substate', () => {
  let context: AvmContext;

  beforeEach(() => {
    context = initContext();
  });

  describe('NoteHashExists', () => {
    it('Should (de)serialize correctly', () => {
      const buf = Buffer.from([
        NoteHashExists.opcode, // opcode
        0x01, // indirect
        ...Buffer.from('12345678', 'hex'), // noteHashOffset
        ...Buffer.from('23456789', 'hex'), // leafIndexOffset
        ...Buffer.from('456789AB', 'hex'), // existsOffset
      ]);
      const inst = new NoteHashExists(
        /*indirect=*/ 0x01,
        /*noteHashOffset=*/ 0x12345678,
        /*leafIndexOffset=*/ 0x23456789,
        /*existsOffset=*/ 0x456789ab,
      );

      expect(NoteHashExists.deserialize(buf)).toEqual(inst);
      expect(inst.serialize()).toEqual(buf);
    });

    it('Should correctly return false when noteHash does not exist', async () => {
      const noteHash = new Field(69n);
      const noteHashOffset = 0;
      const leafIndex = new Field(7n);
      const leafIndexOffset = 1;
      const existsOffset = 2;

      // mock host storage this so that persistable state's getCommitmentIndex returns UNDEFINED
      const commitmentsDb = mock<CommitmentsDB>();
      commitmentsDb.getCommitmentIndex.mockResolvedValue(Promise.resolve(undefined));
      const hostStorage = initHostStorage({ commitmentsDb });
      context = initContext({ persistableState: new AvmPersistableStateManager(hostStorage) });

      context.machineState.memory.set(noteHashOffset, noteHash);
      context.machineState.memory.set(leafIndexOffset, leafIndex);
      await new NoteHashExists(/*indirect=*/ 0, noteHashOffset, leafIndexOffset, existsOffset).execute(context);

      const exists = context.machineState.memory.getAs<Uint8>(existsOffset);
      expect(exists).toEqual(new Uint8(0));

      const journalState = context.persistableState.flush();
      expect(journalState.noteHashChecks).toEqual([
        expect.objectContaining({ exists: false, leafIndex: leafIndex.toFr(), noteHash: noteHash.toFr() }),
      ]);
    });

    it('Should correctly return false when note hash exists at a different leaf index', async () => {
      const noteHash = new Field(69n);
      const noteHashOffset = 0;
      const leafIndex = new Field(7n);
      const storedLeafIndex = 88n;
      const leafIndexOffset = 1;
      const existsOffset = 2;

      const commitmentsDb = mock<CommitmentsDB>();
      commitmentsDb.getCommitmentIndex.mockResolvedValue(Promise.resolve(storedLeafIndex));
      const hostStorage = initHostStorage({ commitmentsDb });
      context = initContext({ persistableState: new AvmPersistableStateManager(hostStorage) });

      context.machineState.memory.set(noteHashOffset, noteHash);
      context.machineState.memory.set(leafIndexOffset, leafIndex);
      await new NoteHashExists(/*indirect=*/ 0, noteHashOffset, leafIndexOffset, existsOffset).execute(context);

      const exists = context.machineState.memory.getAs<Uint8>(existsOffset);
      expect(exists).toEqual(new Uint8(0));

      const journalState = context.persistableState.flush();
      expect(journalState.noteHashChecks).toEqual([
        expect.objectContaining({ exists: false, leafIndex: leafIndex.toFr(), noteHash: noteHash.toFr() }),
      ]);
    });

    it('Should correctly return true when note hash exists at the given leaf index', async () => {
      const noteHash = new Field(69n);
      const noteHashOffset = 0;
      const leafIndex = new Field(7n);
      const storedLeafIndex = 7n;
      const leafIndexOffset = 1;
      const existsOffset = 2;

      const commitmentsDb = mock<CommitmentsDB>();
      commitmentsDb.getCommitmentIndex.mockResolvedValue(Promise.resolve(storedLeafIndex));
      const hostStorage = initHostStorage({ commitmentsDb });
      context = initContext({ persistableState: new AvmPersistableStateManager(hostStorage) });

      context.machineState.memory.set(noteHashOffset, noteHash);
      context.machineState.memory.set(leafIndexOffset, leafIndex);
      await new NoteHashExists(/*indirect=*/ 0, noteHashOffset, leafIndexOffset, existsOffset).execute(context);

      const exists = context.machineState.memory.getAs<Uint8>(existsOffset);
      expect(exists).toEqual(new Uint8(1));

      const journalState = context.persistableState.flush();
      expect(journalState.noteHashChecks).toEqual([
        expect.objectContaining({ exists: true, leafIndex: leafIndex.toFr(), noteHash: noteHash.toFr() }),
      ]);
    });
  });

  describe('EmitNoteHash', () => {
    it('Should (de)serialize correctly', () => {
      const buf = Buffer.from([
        EmitNoteHash.opcode, // opcode
        0x01, // indirect
        ...Buffer.from('12345678', 'hex'), // offset
      ]);
      const inst = new EmitNoteHash(/*indirect=*/ 0x01, /*offset=*/ 0x12345678);

      expect(EmitNoteHash.deserialize(buf)).toEqual(inst);
      expect(inst.serialize()).toEqual(buf);
    });

    it('Should append a new note hash correctly', async () => {
      const value = new Field(69n);
      context.machineState.memory.set(0, value);

      await new EmitNoteHash(/*indirect=*/ 0, /*offset=*/ 0).execute(context);

      const journalState = context.persistableState.flush();
      const expected = [value.toFr()];
      expect(journalState.newNoteHashes).toEqual(expected);
    });
  });

  describe('NullifierExists', () => {
    it('Should (de)serialize correctly', () => {
      const buf = Buffer.from([
        NullifierExists.opcode, // opcode
        0x01, // indirect
        ...Buffer.from('12345678', 'hex'), // nullifierOffset
        ...Buffer.from('456789AB', 'hex'), // existsOffset
      ]);
      const inst = new NullifierExists(
        /*indirect=*/ 0x01,
        /*nullifierOffset=*/ 0x12345678,
        /*existsOffset=*/ 0x456789ab,
      );

      expect(NullifierExists.deserialize(buf)).toEqual(inst);
      expect(inst.serialize()).toEqual(buf);
    });

    it('Should correctly show false when nullifier does not exist', async () => {
      const value = new Field(69n);
      const nullifierOffset = 0;
      const existsOffset = 1;

      // mock host storage this so that persistable state's checkNullifierExists returns UNDEFINED
      const commitmentsDb = mock<CommitmentsDB>();
      commitmentsDb.getNullifierIndex.mockResolvedValue(Promise.resolve(undefined));
      const hostStorage = initHostStorage({ commitmentsDb });
      context = initContext({ persistableState: new AvmPersistableStateManager(hostStorage) });

      context.machineState.memory.set(nullifierOffset, value);
      await new NullifierExists(/*indirect=*/ 0, nullifierOffset, existsOffset).execute(context);

      const exists = context.machineState.memory.getAs<Uint8>(existsOffset);
      expect(exists).toEqual(new Uint8(0));

      const journalState = context.persistableState.flush();
      expect(journalState.nullifierChecks.length).toEqual(1);
      expect(journalState.nullifierChecks[0].exists).toEqual(false);
    });

    it('Should correctly show true when nullifier exists', async () => {
      const value = new Field(69n);
      const nullifierOffset = 0;
      const existsOffset = 1;
      const storedLeafIndex = BigInt(42);

      // mock host storage this so that persistable state's checkNullifierExists returns true
      const commitmentsDb = mock<CommitmentsDB>();
      commitmentsDb.getNullifierIndex.mockResolvedValue(Promise.resolve(storedLeafIndex));
      const hostStorage = initHostStorage({ commitmentsDb });
      context = initContext({ persistableState: new AvmPersistableStateManager(hostStorage) });

      context.machineState.memory.set(nullifierOffset, value);
      await new NullifierExists(/*indirect=*/ 0, nullifierOffset, existsOffset).execute(context);

      const exists = context.machineState.memory.getAs<Uint8>(existsOffset);
      expect(exists).toEqual(new Uint8(1));

      const journalState = context.persistableState.flush();
      expect(journalState.nullifierChecks.length).toEqual(1);
      expect(journalState.nullifierChecks[0].exists).toEqual(true);
    });
  });

  describe('EmitNullifier', () => {
    it('Should (de)serialize correctly', () => {
      const buf = Buffer.from([
        EmitNullifier.opcode, // opcode
        0x01, // indirect
        ...Buffer.from('12345678', 'hex'), // offset
      ]);
      const inst = new EmitNullifier(/*indirect=*/ 0x01, /*offset=*/ 0x12345678);

      expect(EmitNullifier.deserialize(buf)).toEqual(inst);
      expect(inst.serialize()).toEqual(buf);
    });

    it('Should append a new nullifier correctly', async () => {
      const value = new Field(69n);
      context.machineState.memory.set(0, value);

      await new EmitNullifier(/*indirect=*/ 0, /*offset=*/ 0).execute(context);

      const journalState = context.persistableState.flush();
      const expected = [value.toFr()];
      expect(journalState.newNullifiers).toEqual(expected);
    });

    it('Nullifier collision reverts (same nullifier emitted twice)', async () => {
      const value = new Field(69n);
      context.machineState.memory.set(0, value);

      await new EmitNullifier(/*indirect=*/ 0, /*offset=*/ 0).execute(context);
      await expect(new EmitNullifier(/*indirect=*/ 0, /*offset=*/ 0).execute(context)).rejects.toThrowError(
        new InstructionExecutionError(
          `Attempted to emit duplicate nullifier ${value.toFr()} (storage address: ${
            context.environment.storageAddress
          }).`,
        ),
      );
    });

    it('Nullifier collision reverts (nullifier exists in host state)', async () => {
      const value = new Field(69n);
      const storedLeafIndex = BigInt(42);

      // Mock the nullifiers db to return a stored leaf index
      const commitmentsDb = mock<CommitmentsDB>();
      commitmentsDb.getNullifierIndex.mockResolvedValue(Promise.resolve(storedLeafIndex));
      const hostStorage = initHostStorage({ commitmentsDb });
      context = initContext({ persistableState: new AvmPersistableStateManager(hostStorage) });

      context.machineState.memory.set(0, value);
      await expect(new EmitNullifier(/*indirect=*/ 0, /*offset=*/ 0).execute(context)).rejects.toThrowError(
        new InstructionExecutionError(
          `Attempted to emit duplicate nullifier ${value.toFr()} (storage address: ${
            context.environment.storageAddress
          }).`,
        ),
      );
    });
  });

  describe('EmitUnencryptedLog', () => {
    it('Should (de)serialize correctly', () => {
      const buf = Buffer.from([
        EmitUnencryptedLog.opcode, // opcode
        0x01, // indirect
        ...Buffer.from('12345678', 'hex'), // offset
        ...Buffer.from('a2345678', 'hex'), // length
      ]);
      const inst = new EmitUnencryptedLog(/*indirect=*/ 0x01, /*offset=*/ 0x12345678, /*length=*/ 0xa2345678);

      expect(EmitUnencryptedLog.deserialize(buf)).toEqual(inst);
      expect(inst.serialize()).toEqual(buf);
    });

    it('Should append unencrypted logs correctly', async () => {
      const startOffset = 0;

      const values = [new Field(69n), new Field(420n), new Field(Field.MODULUS - 1n)];
      context.machineState.memory.setSlice(0, values);

      const length = values.length;

      await new EmitUnencryptedLog(/*indirect=*/ 0, /*offset=*/ startOffset, length).execute(context);

      const journalState = context.persistableState.flush();
      const expected = values.map(v => v.toFr());
      expect(journalState.newLogs).toEqual([expected]);
    });
  });

  describe('SendL2ToL1Message', () => {
    it('Should (de)serialize correctly', () => {
      const buf = Buffer.from([
        SendL2ToL1Message.opcode, // opcode
        0x01, // indirect
        ...Buffer.from('12345678', 'hex'), // offset
        ...Buffer.from('a2345678', 'hex'), // length
      ]);
      const inst = new SendL2ToL1Message(/*indirect=*/ 0x01, /*offset=*/ 0x12345678, /*length=*/ 0xa2345678);

      expect(SendL2ToL1Message.deserialize(buf)).toEqual(inst);
      expect(inst.serialize()).toEqual(buf);
    });

    it('Should append l1 to l2 messages correctly', async () => {
      const startOffset = 0;

      const values = [new Field(69n), new Field(420n), new Field(Field.MODULUS - 1n)];
      context.machineState.memory.setSlice(0, values);

      const length = values.length;

      await new SendL2ToL1Message(/*indirect=*/ 0, /*offset=*/ startOffset, length).execute(context);

      const journalState = context.persistableState.flush();
      const expected = values.map(v => v.toFr());
      expect(journalState.newL1Messages).toEqual([expected]);
    });
  });

  it('All substate emission instructions should fail within a static call', async () => {
    context = initContext({ env: initExecutionEnvironment({ isStaticCall: true }) });

    const instructions = [
      new EmitNoteHash(/*indirect=*/ 0, /*offset=*/ 0),
      new EmitNullifier(/*indirect=*/ 0, /*offset=*/ 0),
      new EmitUnencryptedLog(/*indirect=*/ 0, /*offset=*/ 0, 1),
      new SendL2ToL1Message(/*indirect=*/ 0, /*offset=*/ 0, 1),
    ];

    for (const instruction of instructions) {
      await expect(instruction.execute(context)).rejects.toThrow(StaticCallStorageAlterError);
    }
  });
});
