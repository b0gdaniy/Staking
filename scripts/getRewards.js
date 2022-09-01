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

	const stakingContractSFTBalanceBefore = await selfFarmContract.balanceOf(sRContract.address)
	console.log(sRContract.address, " Address SFT token balance before: ", stakingContractSFTBalanceBefore, " tokens")

	console.log("-----------------------------------------------------------------------------------")

	// rewards for 3 stakers
	const staker1getRewards = await sRContract.connect(staker1).getRewards({ gasLimit: 3e7 })
	const staker1receipt = await staker1getRewards.wait()

	// check balance for {staker1}
	const staker1SFTBalance = await selfFarmContract.balanceOf(staker1.address)
	console.log(staker1.address, " Address SFT token balance: ", staker1SFTBalance, " tokens")

	console.log("-----------------------------------------------------------------------------------")

	const staker2getRewards = await sRContract.connect(staker2).getRewards({ gasLimit: 3e7 })
	const staker2receipt = await staker2getRewards.wait()

	// check balance for {staker2}
	const staker2SFTBalance = await selfFarmContract.balanceOf(staker2.address)
	console.log(staker2.address, " Address SFT token balance: ", staker2SFTBalance, " tokens")

	console.log("-----------------------------------------------------------------------------------")

	const staker3getRewards = await sRContract.connect(staker3).getRewards({ gasLimit: 3e7 })
	const staker3receipt = await staker3getRewards.wait()

	// check balance for {staker3}
	const staker3SFTBalance = await selfFarmContract.balanceOf(staker3.address)
	console.log(staker3.address, " Address SFT token balance: ", staker3SFTBalance, " tokens")

	console.log("-----------------------------------------------------------------------------------")

	const stakingContractSFTBalanceAfter = await selfFarmContract.balanceOf(sRContract.address)
	console.log(sRContract.address, " Address SFT token balance after: ", stakingContractSFTBalanceAfter, " tokens")

	// // const addressONEBalanceS = await tokenOneContract.balanceOf(sRContract.address)
	// // console.log(sRContract.address, " Address ONE token balance: ", addressONEBalanceS)

	// // const addressTWOBalanceS = await tokenTwoContract.balanceOf(sRContract.address)
	// // console.log(sRContract.address, " Address TWO token balance: ", addressTWOBalanceS)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});