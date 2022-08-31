// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");
const ethers = hre.ethers;

async function main() {
  // takes owner of Staking contract
  const [owner] = await ethers.getSigners()

  // deploy {selfFarmToken}
  const erc20SelfFarm = await deployErc20(owner, "SelfFarmToken", "SFT")

  // deploy {tokenOne}
  const erc20One = await deployErc20(owner, "TokenOne", "ONE")

  // deploy {tokenTwo}
  const erc20Two = await deployErc20(owner, "TokenTwo", "TWO")

  // deploy {StakingRewards}
  const Staking = await ethers.getContractFactory("StakingRewards", owner)
  const staking = await Staking.deploy(erc20SelfFarm.address, erc20One.address, erc20Two.address)
  await staking.deployed()

  console.log("Staking Rewards: ", staking.address)
}

async function deployErc20(deployer, tokenName, tokenSign) {
  const Erc20 = await ethers.getContractFactory("ERC20Updated", deployer)
  const erc20 = await Erc20.deploy(tokenName, tokenSign)
  await erc20.deployed()

  console.log("ERC20 ", tokenName, ": ", erc20.address)

  return erc20
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
