const { Wallet, Provider, Contract } = require('zksync-web3')
require('dotenv').config()

async function main() {
  const privateKey = process.env.PRIVATE_KEY
  const l2ContractAddress = process.env.L2_CONTRACT

  const zkSyncProvider = new Provider('https://zksync2-testnet.zksync.dev')
  const wallet = new Wallet(privateKey, zkSyncProvider)
  const { abi } = require('../artifacts-zk/contracts/L2Contract.sol/L2Contract.json')

  const l2Contract = new Contract(l2ContractAddress, abi, wallet)
  const greeting = process.env.GREETING
  const tx = await l2Contract.sendGreetingMessageToL1(greeting)
  await tx.wait()
  console.log(`sent tx hash ${tx.hash}`)
  console.log(`https://goerli.explorer.zksync.io/tx/${tx.hash}`)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
