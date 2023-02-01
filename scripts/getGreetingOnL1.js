const { Contract, ethers } = require('ethers')
require('dotenv').config()

async function main() {
  const l1ContractAddress = process.env.L1_CONTRACT

  const l1Provider = new ethers.providers.StaticJsonRpcProvider('https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161')
  const l1ContractAbi = require('../artifacts/contracts/L1Contract.sol/L1Contract.json').abi
  const l1Contract = new Contract(l1ContractAddress, l1ContractAbi, l1Provider)
  const greeting = await l1Contract.greet()
  console.log(`greeting: ${greeting}`)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
