import { EmitNoteHash } from './accrued_substate.js';

describe('Testing alternative', () => {
  it('Test new serde', async () => {
    const arr: Uint8Array = Uint8Array.from([
      47, 1,
      //
      32, 32, 32, 32,
    ]);

    const buf = Buffer.from(arr);
    const opcode = EmitNoteHash.deserialize(buf);
    const serialized = opcode.serialize();
    expect(serialized).toEqual(buf);
  });
});
