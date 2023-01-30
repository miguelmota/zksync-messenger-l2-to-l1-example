# zkSync Messenger L2->L1 Example

> Send a message from L2 zkSync testnet to L1 Goerli and execute message on L1 Goerli after proving inclusion.

## Example

There's two contracts; `L2Contract.sol` and `L1Contract.sol`

The L2 contract has a method `sendGreetingMessageToL1` that sends a message to L1 contract to set a greeting message on L1 contract.

The L1 contract has a method `consumeMessageFromL2` that checks that the message was included in L2 block using zksync `proveL2MessageInclusion` and executes `setGreeting` call on itself which can only be called if the message was send by the L2 contract.

### Files

- [`L2Contract.sol`](./contracts/L2Contract.sol)
- [`L1Contract.sol`](./contracts/L1Contract.sol)
- [`deployL2.js`](./deploy/deploy.js)
- [`deployL1.js`](./scripts/deployL1.js)
- [`sendL2ToL1Message.js`](./scripts/sendL2ToL1Message.js)
- [`waitForInclusion.js`](./scripts/waitForInclusion.js)
- [`executeMessageOnL1.js`](./scripts/executeMessageOnL1.js)
- [`getGreetingOnL1.js`](./scripts/getGreetingOnL1.js)

### Set Signer

Create `.env`

```sh
PRIVATE_KEY=123...
```

Make sure private key has funds on both zkSync testnet and Goerli.

### Compile Contracts

```sh
npx hardhat compile
```

### Deploy L2 Contract

Command

```sh
npx hardhat deploy-zksync --network zksync
```

Output

```sh
deployed to 0xf32971F66593AbBd4D032015FAa0222871895b68
```

### Deploy L1 Contract

Command

```sh
L2_CONTRACT=0xf32971F66593AbBd4D032015FAa0222871895b68 \
npx hardhat run --network goerli scripts/deployL1.js
```

Output

```sh
deployed to 0x9F2FFbF506cb803c184Ba0Cd3586e0bDFf23b772
```

### Send L2->L1 Message

Command

```sh
GREETING="hello world" \
L2_CONTRACT=0xf32971F66593AbBd4D032015FAa0222871895b68 \
npx hardhat run --network zksync scripts/sendL2ToL1Message.js
```

Output

```sh
sent tx hash 0x56b1779fb907fb1349594d417106ebc05c4f9b226703d11f4b9bb6a5f0208995
https://goerli.explorer.zksync.io/tx/0x56b1779fb907fb1349594d417106ebc05c4f9b226703d11f4b9bb6a5f0208995
```

### Wait for L1 Block Inclusion

Command

```sh
GREETING="hello world" \
L2_CONTRACT=0xf32971F66593AbBd4D032015FAa0222871895b68 \
L2_TX_HASH=0x56b1779fb907fb1349594d417106ebc05c4f9b226703d11f4b9bb6a5f0208995 \
npx hardhat run --network zksync scripts/waitForInclusion.js
```

Output

```sh
Waiting for L1 block inclusion (this may take up to 1 hour)...
L2 block: 5905135
L1 Index for Tx in block: 158
L1 Batch for block:  625353
Inclusion proof: [
  '0x9fc4abd6bd666a7a823c8565e53fd3b8c6f2e43d1859dd149c9c9600d77ea6c0',
  '0x612469e30d8f8915e68010312c953e8a0b3a942a7e3aaee989abfe70b9b0ec32',
  '0xfa24ab9fb3ad04ddcba2053773fafb91795e00dd4d2a18289ede57c0de35fda9',
  '0xd680791eca0636c988524e180ffa9732d8fcacd3d78960be289af616cd0e65f3',
  '0x9425a8eb5db9d4594b7f77f65c5c2b33782c3a475e76b45af589b929694a5064',
  '0x6c84e6cd4a6b04f6f2bf1d67e4bc5cbb3b1ce2bf3a951ff515e6c3115eb1811e',
  '0x66d7c5983afe44cf15ea8cf565b34c6c31ff0cb4dd744524f7842b942d08770d',
  '0xb04e5ee349086985f74b73971ce9dfe76bbed95c84906c5dffd96504e1e5396c',
  '0xac506ecb5465659b3a927143f6d724f91d8d9c4bdb2463aee111d9aa869874db'
]
proveL2MessageInclusion: true
```

### Execute Message on L1

Command

```sh
GREETING="hello world" \
L1_CONTRACT=0x9F2FFbF506cb803c184Ba0Cd3586e0bDFf23b772 \
L2_CONTRACT=0xf32971F66593AbBd4D032015FAa0222871895b68 \
L2_TX_HASH=0x56b1779fb907fb1349594d417106ebc05c4f9b226703d11f4b9bb6a5f0208995 \
npx hardhat run --network zksync scripts/executeMessageOnL1.js
```

Output

```sh
sent tx hash 0x3b2dbbf2b65414cee1338bd1e2bce82588bf4aa86f057fc6e7651935ed43fde4
https://goerli.etherscan.io/tx/0x3b2dbbf2b65414cee1338bd1e2bce82588bf4aa86f057fc6e7651935ed43fde4
```

### Get Greeting on L1

Command

```sh
L1_CONTRACT=0x9F2FFbF506cb803c184Ba0Cd3586e0bDFf23b772 \
npx hardhat run --network zksync scripts/getGreetingOnL1.js
```

Output

```sh
greeting: hello world
```

## License

[MIT](./LICENSE) @ [Miguel Mota](https://github.com/miguelmota)
