// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");
const ethers = hre.ethers;
const BigNumber = ethers.BigNumber;

const Erc20Artifacts = require("../artifacts/contracts/ERC20Updated.sol/ERC20Updated.json");
const StakingArtifacts = require("../artifacts/contracts/StakingRewards.sol/StakingRewards.json");

async function main() {
	console.log("Withdraw script ran")
	console.log("-----------------------------------------------------------------------------------")

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

	// check {stakingContract} balance before withdraw
	const stakingContractSFTBalanceBefore = await selfFarmContract.balanceOf(sRContract.address)
	console.log("Staking Rewards {", sRContract.address, "} SFT balance before: ", stakingContractSFTBalanceBefore)
	const stakingContractONEBalanceBefore = await tokenOneContract.balanceOf(sRContract.address)
	console.log("Staking Rewards {", sRContract.address, "} ONE balance before: ", stakingContractONEBalanceBefore)
	const stakingContractTWOBalanceBefore = await tokenTwoContract.balanceOf(sRContract.address)
	console.log("Staking Rewards {", sRContract.address, "} TWO balance before: ", stakingContractTWOBalanceBefore)

	console.log("-----------------------------------------------------------------------------------")

	// withdraw amount for staker1
	const staker1withdraw = await sRContract.connect(staker1).withdraw(oneTokenVal.mul(500), { gasLimit: 3e7 })
	await staker1withdraw.wait()

	// check balance of {staker1}
	const staker1SFTBalance = await selfFarmContract.balanceOf(staker1.address)
	console.log("Staker1 {", staker1.address, "} SFT balance: ", staker1SFTBalance)
	const staker1ONEBalance = await tokenOneContract.balanceOf(staker1.address)
	console.log("Staker1 {", staker1.address, "} ONE balance: ", staker1ONEBalance)
	const staker1TWOBalance = await tokenTwoContract.balanceOf(staker1.address)
	console.log("Staker1 {", staker1.address, "} TWO balance: ", staker1TWOBalance)

	console.log("-----------------------------------------------------------------------------------")

	// withdraw amount for staker2
	const staker2withdraw = await sRContract.connect(staker2).withdraw(oneTokenVal.mul(500), { gasLimit: 3e7 })
	await staker2withdraw.wait()

	// check balance of {staker2}
	const staker2SFTBalance = await selfFarmContract.balanceOf(staker2.address)
	console.log("Staker2 {", staker2.address, "} SFT balance: ", staker2SFTBalance)
	const staker2ONEBalance = await tokenOneContract.balanceOf(staker2.address)
	console.log("Staker2 {", staker2.address, "} ONE balance: ", staker2ONEBalance)
	const staker2TWOBalance = await tokenTwoContract.balanceOf(staker2.address)
	console.log("Staker2 {", staker2.address, "} TWO balance: ", staker2TWOBalance)

	console.log("-----------------------------------------------------------------------------------")

	// withdraw amount for staker3
	const staker3withdraw = await sRContract.connect(staker3).withdraw(oneTokenVal.mul(500), { gasLimit: 3e7 })
	await staker3withdraw.wait()

	// check balance of {staker3}
	const staker3SFTBalance = await selfFarmContract.balanceOf(staker3.address)
	console.log(staker3.address, " Address SFT token balance: ", staker3SFTBalance, " tokens")
	const staker3ONEBalance = await tokenOneContract.balanceOf(staker3.address)
	console.log(staker3.address, " Address ONE token balance: ", staker3ONEBalance, " tokens")
	const staker3TWOBalance = await tokenTwoContract.balanceOf(staker3.address)
	console.log(staker3.address, " Address TWO token balance: ", staker3TWOBalance, " tokens")

	console.log("-----------------------------------------------------------------------------------")

	// check {stakingContract} balance after withdraw
	const stakingContractSFTBalanceAfter = await selfFarmContract.balanceOf(sRContract.address)
	console.log(sRContract.address, " Address SFT token balance after: ", stakingContractSFTBalanceAfter, " tokens")
	const stakingContractONEBalanceAfter = await tokenOneContract.balanceOf(sRContract.address)
	console.log(sRContract.address, " Address ONE token balance after: ", stakingContractONEBalanceAfter, " tokens")
	const stakingContractTWOBalanceAfter = await tokenTwoContract.balanceOf(sRContract.address)
	console.log(sRContract.address, " Address TWO token balance after: ", stakingContractTWOBalanceAfter, " tokens")

	console.log("-----------------------------------------------------------------------------------")
	console.log("Withdraw script ended")
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});