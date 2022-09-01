// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");
const ethers = hre.ethers;
const Erc20Artifacts = require("../artifacts/contracts/ERC20Updated.sol/ERC20Updated.json")
const StakingArtifacts = require("../artifacts/contracts/StakingRewards.sol/StakingRewards.json")

async function main() {
	// take owner of Staking contract and 3 accounts
	const [owner, staker1, staker2, staker3] = await ethers.getSigners()

	// linked deployed {stakingContract}
	const sRContract = new ethers.Contract(
		"0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",
		StakingArtifacts.abi,
		owner
	)

	// linked deployed {selfFarmToken}
	const selfFarmContract = new ethers.Contract(
		"0x5FbDB2315678afecb367f032d93F642f64180aa3",
		Erc20Artifacts.abi,
		owner
	)

	// linked deployed {tokenOneToken}
	const tokenOneContract = new ethers.Contract(
		"0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
		Erc20Artifacts.abi,
		owner
	)

	// linked deployed {tokenTwoToken}
	const tokenTwoContract = new ethers.Contract(
		"0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
		Erc20Artifacts.abi,
		owner
	)

	// rewards for 3 stakers
	const staker1getRewards = await sRContract.connect(staker1).getRewards({ gasLimit: 3e7 })
	const staker1receipt = await staker1getRewards.wait()
	// const staker1event = await sRContract.queryFilter(sRContract.filters.Deposit(), staker1receipt.blockHash)
	// console.log("Staker1 Stake Event: ", staker1event)
	checkBalanceFor(staker1.address)

	const staker2getRewards = await sRContract.connect(staker2).getRewards({ gasLimit: 3e7 })
	const staker2receipt = await staker2getRewards.wait()
	// const staker2event = await sRContract.queryFilter(sRContract.filters.Deposit(), staker2receipt.blockHash)
	// console.log("Staker2 Stake Event: ", staker2event)
	checkBalanceFor(staker2.address)

	const staker3getRewards = await sRContract.connect(staker3).getRewards({ gasLimit: 3e7 })
	const staker3receipt = await staker3getRewards.wait()
	// const staker3event = await sRContract.queryFilter(sRContract.filters.Deposit(), staker3receipt.blockHash)
	// console.log("Staker3 Stake Event: ", staker3event)
	checkBalanceFor(staker3.address)

	checkBalanceFor(sRContract.address)
}

// check balance for {address}
async function checkBalanceFor(_address) {
	const addressSFTBalance = await selfFarmContract.balanceOf(_address.address)
	console.log(_address, " Address SFT token balance: ", addressSFTBalance)

	const addressONEBalance = await tokenOneContract.balanceOf(_address.address)
	console.log(_address, " Address ONE token balance: ", addressONEBalance)

	const addressTWOBalance = await tokenTwoContract.balanceOf(_address.address)
	console.log(_address, " Address TWO token balance: ", addressTWOBalance)
}


// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});