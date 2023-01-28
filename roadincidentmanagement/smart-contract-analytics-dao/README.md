# Lagrange Contracts

1. `LagrangeDAOToken` is an ERC-20 contract
2. `LagrangePlatform` rewards users for uploading data and models to the Langrange Platform
3. `SpacePayment` allows users to purchase spaces

## Functions

## LagrangeDAOToken.sol

LagrangeDaoToken is a ERC-20 contract for LAD tokens, used to pay for spaces and computing over data. LAD has an 1B token cap with 15% initial mint.

- `initialize(address holder)` initially mint the 15% of token cap to the `holder` address

## LangrangePlatform.sol

Users will upload data and models to the server and call this contract to request the upload reward. The backend will verify the data/model is uploaded and reward the uploader.

- `rewardDataUpload(string wcid, uint size)`

The uploader gets rewarded 1 LAD if the data is under 1GB, otherwise they receive 0.5 LAD per GB. This emits a `DataUpload` event for the backend to verify.

- `rewardModelUpload(string wcid)`

The uploader gets rewarded 2 LAD for a model. This emits a `ModelUpload` event for the backend to verify.

- `withdraw(uint amount)` the owner can withdraw LAD tokens from the contract.

## SpacePayment.sol

Handles payment for spaces and manages their expiry blocks.

- `deposit(uint amount)` Users can deposit LAD into the contract, must call `approve` on the ERC-20 first.

- `balanceOf(address account)` get the account LAD balance in the contract

- `hardwareInfo(uint hardwareType)` get the `name` and `pricePerBlock` of a hardware type

- `buySpace(uint hardwareType, uint blocks)`

Users can purchase space with a numbered hardware type used for computing, as well as the number of blocks for duration

- `extendSpace(uint spaceId, uint blocks)` extends space by a number of blocks at the same hardware price

- `isExpired(uint spaceId)` checks the duration of the space with the current block number to see if the block is expired or not

- `spaceInfo(uint spaceId)` returns the space info such as the owner, the hardware type, and expiry block

- `changeHardware(uint hardwareType, string newName, uint newPrice)` the owner can change the hardware types

- `withdraw(uint amount)` the owner can withdraw LAD tokens from the contract.
