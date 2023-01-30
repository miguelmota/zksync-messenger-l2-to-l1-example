const { Provider, utils } = require('zksync-web3')
const wait = require('wait')
require('dotenv').config()

async function main() {
  const l1ContractAddress = process.env.L1_CONTRACT
  const l2ContractAddress = process.env.L2_CONTRACT
  const l2TransactionHash = process.env.L2_TX_HASH
  const greeting = process.env.GREETING

  const l1Provider = new ethers.providers.StaticJsonRpcProvider('https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161')
  const zkSyncProvider = new Provider('https://zksync2-testnet.zksync.dev')
  const l1ContractAbi = require('../artifacts-zk/contracts/L1Contract.sol/L1Contract.json').abi

  const iface = new ethers.utils.Interface(l1ContractAbi)
  const message = iface.encodeFunctionData('setGreeting', [greeting])
  const messageHash = ethers.utils.keccak256(message)

  console.log('Waiting for L1 block inclusion (this may take up to 1 hour)...')

  while (true) {
    const { l1BatchNumber, l1BatchTxIndex, blockNumber } = await zkSyncProvider.getTransactionReceipt(l2TransactionHash)
    if (l1BatchNumber) {
      const zkAddress = await zkSyncProvider.getMainContractAddress()
      const sender = l2ContractAddress
      const proofInfo = await zkSyncProvider.getMessageProof(blockNumber, sender, messageHash)
      if (!proofInfo) {
        throw new Error('No proof found')
      }
      const index = proofInfo.id
      const proof = proofInfo.proof

      const mailboxL1Contract = new ethers.Contract(zkAddress, utils.ZKSYNC_MAIN_ABI, l1Provider)

      // all the information of the message sent from L2
      const messageInfo = {
        txNumberInBlock: l1BatchTxIndex,
        sender,
        data: message
      }

      try {
        const result = await mailboxL1Contract.proveL2MessageInclusion(l1BatchNumber, index, messageInfo, proof)
        console.log('L2 block:', blockNumber)
        console.log('L1 Index for Tx in block:', l1BatchTxIndex)
        console.log('L1 Batch for block: ', l1BatchNumber)
        console.log('Inclusion proof:', proof)
        console.log('proveL2MessageInclusion:', result)
        break
      } catch (err) {}
    }
    await wait(5 * 1000)
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
