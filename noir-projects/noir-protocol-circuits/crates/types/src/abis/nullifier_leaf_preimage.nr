global NULLIFIER_LEAF_PREIMAGE_LENGTH: u64 = 3;

use crate::{merkle_tree::leaf_preimage::LeafPreimage, traits::{Empty, Hash}};

struct NullifierLeafPreimage {
    nullifier : Field,
    next_nullifier :Field,
    next_index : u64,
}

impl Empty for NullifierLeafPreimage {
    fn empty() -> Self {
        Self {
            nullifier : 0,
            next_nullifier : 0,
            next_index : 0,
        }
    }
}

impl Hash for NullifierLeafPreimage {
    fn hash(self) -> Field {
        if self.is_empty() {
            0
        } else {
            dep::std::hash::pedersen_hash(self.serialize())
        }
    }
}

impl LeafPreimage for NullifierLeafPreimage {
    fn get_key(self) -> Field {
        self.nullifier
    }

    fn as_leaf(self) -> Field {
        self.hash()
    }
}

impl NullifierLeafPreimage {
    pub fn is_empty(self) -> bool {
        (self.nullifier == 0) & (self.next_nullifier == 0) & (self.next_index == 0)
    }

    pub fn serialize(self) -> [Field; NULLIFIER_LEAF_PREIMAGE_LENGTH] {
        [self.nullifier, self.next_nullifier, self.next_index as Field]
    }

    pub fn deserialize(fields: [Field; NULLIFIER_LEAF_PREIMAGE_LENGTH]) -> Self {
        Self { nullifier: fields[0], next_nullifier: fields[1], next_index: fields[2] as u64 }
    }
}
