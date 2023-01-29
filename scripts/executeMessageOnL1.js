const { Wallet, Provider, Contract, utils } = require('zksync-web3')
const { ethers } = require('ethers')
require('dotenv').config()

async function main() {
  const privateKey = process.env.PRIVATE_KEY
  const l1ContractAddress = process.env.L1_CONTRACT
  const l2ContractAddress = process.env.L2_CONTRACT
  const l2TransactionHash = process.env.L2_TX_HASH
  const greeting = process.env.GREETING

  const l1Provider = new ethers.providers.StaticJsonRpcProvider('https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161')
  const zkSyncProvider = new Provider('https://zksync2-testnet.zksync.dev')
  const wallet = new Wallet(privateKey, l1Provider)
  const l1ContractAbi = require('../artifacts-zk/contracts/L1Contract.sol/L1Contract.json').abi

  const iface = new ethers.utils.Interface(l1ContractAbi)
  const message = iface.encodeFunctionData('setGreeting', [greeting])
  const messageHash = ethers.utils.keccak256(message)

  const l2Receipt = await zkSyncProvider.getTransactionReceipt(l2TransactionHash)
  const { l1BatchNumber, l1BatchTxIndex } = await zkSyncProvider.getTransactionReceipt(l2TransactionHash)

  const zkSyncAddress = await zkSyncProvider.getMainContractAddress()
  const blockNumber = l1BatchNumber
  const txNumberInBlock = l1BatchTxIndex
  const sender = l2ContractAddress
  const proofInfo = await zkSyncProvider.getMessageProof(l2Receipt.blockNumber, sender, messageHash)
  if (!proofInfo) {
    throw new Error('No proof found')
  }
  const index = proofInfo.id
  const proof = proofInfo.proof

  const l1Contract = new Contract(l1ContractAddress, l1ContractAbi, wallet)
  const tx = await l1Contract.consumeMessageFromL2(
    zkSyncAddress,
    blockNumber,
    index,
    txNumberInBlock,
    sender,
    message,
    proof
  )
  await tx.wait()
  console.log(`sent tx hash ${tx.hash}`)
  console.log(`https://goerli.etherscan.io/tx/${tx.hash}`)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
