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
	console.log("----------------------------------------------------------------------------------------------------------")

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

	// Checking {stakingContract} balance before withdraw
	// read the balance of SFT tokens on the {StakingRewards} contract before staking
	await getBalanceOf(sRContract.address, true, "before")

	console.log("-----------------------------------------------------------------------------------")

	// Withdraw 500 SFT tokens for {staker1}
	const staker1withdraw = await sRContract.connect(staker1).withdraw(oneTokenVal.mul(500), { gasLimit: 3e7 })
	await staker1withdraw.wait()

	// Check balance of {staker1}
	// read the balance of SFT tokens on the {staker1}'s account
	await getBalanceOf(staker1.address, false, "")

	console.log("-----------------------------------------------------------------------------------")

	// Withdraw 500 SFT tokens for {staker2}
	const staker2withdraw = await sRContract.connect(staker2).withdraw(oneTokenVal.mul(500), { gasLimit: 3e7 })
	await staker2withdraw.wait()

	// Check balance of {staker2}
	// read the balance of SFT tokens on the {staker2}'s account
	await getBalanceOf(staker2.address, false, "")

	console.log("-----------------------------------------------------------------------------------")

	// Withdraw 500 SFT tokens for {staker3}
	const staker3withdraw = await sRContract.connect(staker3).withdraw(oneTokenVal.mul(500), { gasLimit: 3e7 })
	await staker3withdraw.wait()

	// Check balance of {staker3}
	// read the balance of SFT tokens on the {staker3}'s account
	await getBalanceOf(staker3.address, false, "")

	console.log("-----------------------------------------------------------------------------------")

	// Check {stakingContract} balance after withdraw
	// read the balance of SFT tokens on the {StakingRewards} contract after staking
	await getBalanceOf(sRContract.address, true, "after")

	console.log("----------------------------------------------------------------------------------------------------------")
	console.log("Withdraw script ended")

	async function getBalanceOf(address, isContract, when) {
		let stakerOrContract = "Staker "
		if (isContract) {
			stakerOrContract = "SR Contract"
		}

		// read the balance of SFT tokens on the {address} after staking
		const addressSftBalance = await selfFarmContract.balanceOf(address)
		console.log(stakerOrContract, " {", address, "} SFT ", when, ": ", addressSftBalance.div(oneTokenVal), " * 1e18 tokens")
		// read the balance of ONE tokens on the {address} staking
		const addressOneBalance = await tokenOneContract.balanceOf(address)
		console.log(stakerOrContract, " {", address, "} ONE ", when, ": ", addressOneBalance.div(oneTokenVal), " * 1e18 tokens")
		// read the balance of TWO tokens on the {address} staking
		const addressTwoBalance = await tokenTwoContract.balanceOf(address)
		console.log(stakerOrContract, " {", address, "} TWO ", when, ": ", addressTwoBalance.div(oneTokenVal), " * 1e18 tokens")
	}
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});