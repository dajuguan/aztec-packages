import { AvmContext } from '../avm_context.js';
import { Field, TypeTag } from '../avm_memory_types.js';
import { initContext } from '../fixtures/index.js';
import { Add, Div, Mul, Sub } from './arithmetic.js';

describe('Arithmetic Instructions', () => {
  let context: AvmContext;

  beforeEach(() => {
    context = initContext();
  });

  describe('Add', () => {
    it('Should (de)serialize correctly', () => {
      const buf = Buffer.from([
        Add.opcode, // opcode
        0x01, // indirect
        TypeTag.FIELD, // inTag
        ...Buffer.from('12345678', 'hex'), // aOffset
        ...Buffer.from('23456789', 'hex'), // bOffset
        ...Buffer.from('3456789a', 'hex'), // dstOffset
      ]);
      const inst = new Add(
        /*indirect=*/ 0x01,
        /*inTag=*/ TypeTag.FIELD,
        /*aOffset=*/ 0x12345678,
        /*bOffset=*/ 0x23456789,
        /*dstOffset=*/ 0x3456789a,
      );

      expect(Add.deserialize(buf)).toEqual(inst);
      expect(inst.serialize()).toEqual(buf);
    });

    it('Should add correctly over field elements', async () => {
      const a = new Field(1n);
      const b = new Field(2n);

      context.machineState.memory.set(0, a);
      context.machineState.memory.set(1, b);

      await new Add(
        /*indirect=*/ 0,
        /*inTag=*/ TypeTag.FIELD,
        /*aOffset=*/ 0,
        /*bOffset=*/ 1,
        /*dstOffset=*/ 2,
      ).execute(context);

      const expected = new Field(3n);
      const actual = context.machineState.memory.get(2);
      expect(actual).toEqual(expected);
    });

    it('Should wrap around on addition', async () => {
      const a = new Field(1n);
      const b = new Field(Field.MODULUS - 1n);

      context.machineState.memory.set(0, a);
      context.machineState.memory.set(1, b);

      await new Add(
        /*indirect=*/ 0,
        /*inTag=*/ TypeTag.FIELD,
        /*aOffset=*/ 0,
        /*bOffset=*/ 1,
        /*dstOffset=*/ 2,
      ).execute(context);

      const expected = new Field(0n);
      const actual = context.machineState.memory.get(2);
      expect(actual).toEqual(expected);
    });
  });

  describe('Sub', () => {
    it('Should (de)serialize correctly', () => {
      const buf = Buffer.from([
        Sub.opcode, // opcode
        0x01, // indirect
        TypeTag.FIELD, // inTag
        ...Buffer.from('12345678', 'hex'), // aOffset
        ...Buffer.from('23456789', 'hex'), // bOffset
        ...Buffer.from('3456789a', 'hex'), // dstOffset
      ]);
      const inst = new Sub(
        /*indirect=*/ 0x01,
        /*inTag=*/ TypeTag.FIELD,
        /*aOffset=*/ 0x12345678,
        /*bOffset=*/ 0x23456789,
        /*dstOffset=*/ 0x3456789a,
      );

      expect(Sub.deserialize(buf)).toEqual(inst);
      expect(inst.serialize()).toEqual(buf);
    });

    it('Should subtract correctly over field elements', async () => {
      const a = new Field(1n);
      const b = new Field(2n);

      context.machineState.memory.set(0, a);
      context.machineState.memory.set(1, b);

      await new Sub(
        /*indirect=*/ 0,
        /*inTag=*/ TypeTag.FIELD,
        /*aOffset=*/ 0,
        /*bOffset=*/ 1,
        /*dstOffset=*/ 2,
      ).execute(context);

      const expected = new Field(Field.MODULUS - 1n);
      const actual = context.machineState.memory.get(2);
      expect(actual).toEqual(expected);
    });
  });

  describe('Mul', () => {
    it('Should (de)serialize correctly', () => {
      const buf = Buffer.from([
        Mul.opcode, // opcode
        0x01, // indirect
        TypeTag.FIELD, // inTag
        ...Buffer.from('12345678', 'hex'), // aOffset
        ...Buffer.from('23456789', 'hex'), // bOffset
        ...Buffer.from('3456789a', 'hex'), // dstOffset
      ]);
      const inst = new Mul(
        /*indirect=*/ 0x01,
        /*inTag=*/ TypeTag.FIELD,
        /*aOffset=*/ 0x12345678,
        /*bOffset=*/ 0x23456789,
        /*dstOffset=*/ 0x3456789a,
      );

      expect(Mul.deserialize(buf)).toEqual(inst);
      expect(inst.serialize()).toEqual(buf);
    });

    it('Should multiply correctly over field elements', async () => {
      const a = new Field(2n);
      const b = new Field(3n);

      context.machineState.memory.set(0, a);
      context.machineState.memory.set(1, b);

      await new Mul(
        /*indirect=*/ 0,
        /*inTag=*/ TypeTag.FIELD,
        /*aOffset=*/ 0,
        /*bOffset=*/ 1,
        /*dstOffset=*/ 2,
      ).execute(context);

      const expected = new Field(6n);
      const actual = context.machineState.memory.get(2);
      expect(actual).toEqual(expected);
    });

    it('Should wrap around on multiplication', async () => {
      const a = new Field(2n);
      const b = new Field(Field.MODULUS / 2n - 1n);

      context.machineState.memory.set(0, a);
      context.machineState.memory.set(1, b);

      await new Mul(
        /*indirect=*/ 0,
        /*inTag=*/ TypeTag.FIELD,
        /*aOffset=*/ 0,
        /*bOffset=*/ 1,
        /*dstOffset=*/ 2,
      ).execute(context);

      const expected = new Field(Field.MODULUS - 3n);
      const actual = context.machineState.memory.get(2);
      expect(actual).toEqual(expected);
    });
  });

  describe('Div', () => {
    it('Should (de)serialize correctly', () => {
      const buf = Buffer.from([
        Div.opcode, // opcode
        0x01, // indirect
        TypeTag.FIELD, // inTag
        ...Buffer.from('12345678', 'hex'), // aOffset
        ...Buffer.from('23456789', 'hex'), // bOffset
        ...Buffer.from('3456789a', 'hex'), // dstOffset
      ]);
      const inst = new Div(
        /*indirect=*/ 0x01,
        /*inTag=*/ TypeTag.FIELD,
        /*aOffset=*/ 0x12345678,
        /*bOffset=*/ 0x23456789,
        /*dstOffset=*/ 0x3456789a,
      );

      expect(Div.deserialize(buf)).toEqual(inst);
      expect(inst.serialize()).toEqual(buf);
    });

    it('Should perform field division', async () => {
      const a = new Field(10n);
      const b = new Field(5n);

      context.machineState.memory.set(0, a);
      context.machineState.memory.set(1, b);

      await new Div(
        /*indirect=*/ 0,
        /*inTag=*/ TypeTag.FIELD,
        /*aOffset=*/ 0,
        /*bOffset=*/ 1,
        /*dstOffset=*/ 2,
      ).execute(context);

      const actual = context.machineState.memory.get(2);
      expect(actual).toEqual(new Field(2));
    });
  });
});
