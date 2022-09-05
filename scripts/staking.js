// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");
const ethers = hre.ethers;
const BigNumber = ethers.BigNumber;
const Erc20Artifacts = require("../artifacts/contracts/ERC20Updated.sol/ERC20Updated.json")
const StakingArtifacts = require("../artifacts/contracts/StakingRewards.sol/StakingRewards.json")

async function main() {
	console.log("Staking script ran")
	console.log("----------------------------------------------------------------------------------------------------------")

	// one token value = 1e18
	// to mint 10 tokens, we need to multiply the value of one token by 10
	const oneTokenVal = BigNumber.from("1000000000000000000");

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

	// Checking the {stakingContract} balance before staking
	// read the balance of SFT tokens on the {StakingRewards} contract before staking
	await printSrBalance("before")

	// Sets the reward amount by {owner} to 10000 tokens
	// { gasLimit: 3e7 } needs for avoid gal limit error
	const setReward = await sRContract.setRewardAmount(oneTokenVal.mul(10000), { gasLimit: 3e7 })
	await setReward.wait()

	// Stake 1000 SFT tokens by {staker1}
	const staker1Receipt = await _stake(staker1, selfFarmContract.address, 1000)
	// // // Gets the Deposit event by {staker1}
	// // const staker1event = await sRContract.queryFilter(sRContract.filters.Deposit(), staker1Receipt.blockHash)
	// // console.log("Staker1 Stake Event: ", staker1event)

	// Stake 500 ONE tokens by {staker2}
	await _stake(staker2, tokenOneContract.address, 500)

	// Stake 2000 TWO tokens by {staker3}
	await _stake(staker3, tokenTwoContract.address, 2000)

	console.log("-----------------------------------------------------------------------------------")

	// Checking the {stakingContract} balance before staking
	// read the balance of SFT tokens on the {StakingRewards} contract after staking
	await printSrBalance("after")

	console.log("----------------------------------------------------------------------------------------------------------")
	console.log("Staking script ended")

	async function printSrBalance(when) {
		const sRSftBalance = await selfFarmContract.balanceOf(sRContract.address)
		console.log("Staking Rewards {", sRContract.address, "} SFT ", when, ": ", sRSftBalance.div(oneTokenVal), " * 1e18 tokens")
		// read the balance of ONE tokens on the {StakingRewards} contract before staking
		const sROneBalance = await tokenOneContract.balanceOf(sRContract.address)
		console.log("Staking Rewards {", sRContract.address, "} ONE ", when, ": ", sROneBalance.div(oneTokenVal), " * 1e18 tokens")
		// read the balance of TWO tokens on the {StakingRewards} contract before staking
		const sRTwoBalance = await tokenTwoContract.balanceOf(sRContract.address)
		console.log("Staking Rewards {", sRContract.address, "} TWO ", when, ": ", sRTwoBalance.div(oneTokenVal), " * 1e18 tokens")
	}

	async function _stake(staker, tokenAddress, tokensCount) {
		// Stake 1000 TWO tokens by {staker}
		// { gasLimit: 3e7 } needs for avoid gal limit error
		const stakerStake = await sRContract.connect(staker).stake(tokenAddress, oneTokenVal.mul(tokensCount), { gasLimit: 3e7 })
		const stakerReceipt = await stakerStake.wait()
		return stakerReceipt
	}
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});