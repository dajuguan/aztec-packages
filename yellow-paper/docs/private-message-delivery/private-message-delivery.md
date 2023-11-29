---
sidebar_position: 1
---

# Private Message Delivery

## Requirements

Maintaining the core tenet of privacy within the Aztec Network imposes a number of requirements on it. If Alice executes a function that generates state for Bob:

1. Alice will need to encrypt that state such that Bob, and only Bob is able to decrypt it.
2. Alice will need to broadcast the encrypted state so as to make it available for Bob to retrieve.
3. Alice will need to broadcast a 'tag' alongside the encrypted state. This tag must be identifiable by Bob's chosen [note discovery protocol](./note-discovery.md) but not identifiable by any third party.

Fulfilling these requirements will enable users to privately identify, retrieve, decrypt and spend their application state.

## Constraining Message Delivery

The network will constrain:

1. The encryption of a user's note.
2. The generation of the tag for that note.
3. The publication of that note to the correct data availability layer.

Constraining [note encryption](./encryption-and-decryption.md) and tagging will be done through protocol defined functions within a user's account contract. The advantages of this approach are:

1. It enables a user to select their preferred [note discovery protocol](./note-discovery.md)  and/or encryption scheme.
2. It ensures that notes are correctly encrypted with a user's public encryption key.
3. It ensures that notes are correctly tagged for a user's chosen [note discovery protocol](./note-discovery.md) .
4. It provides scope for upgrading these functions or introducing new schemes as the field progresses.
5. It protects applications from malicious account contracts providing unprovable functions.

Constraining publication to the correct data availability layer will be performed via a combination of the protocol circuits and the rollup contract on L1.

## User Handshaking

One function that is useful regardless of the preferred note discovery and encryption schemes is for user's to be notified when they have been sent a note from another user for the first time. To achieve this we will deploy a 'user handshaking' contract that can be used to create a private note for a recipient containing the sender's details (e.g. public key). Network participants will be able to retrieve these notes, decrypt them and use the contents to guide them in the generation of tags of notes to retrieve.
