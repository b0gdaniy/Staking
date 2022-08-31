// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");
const ethers = hre.ethers;
const Erc20Artifacts = require("../artifacts/contracts/ERC20.sol/ERC20Updated.json")

// let { selfFarm, tokenOne, tokenTwo, staking } = require("./deploy")

async function main() {
	// take owner of Staking contract and 3 accounts
	const [owner, staker1, staker2, staker3] = await ethers.getSigners()

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

	// minting 20000 SFT tokens for staker1
	await selfFarmContract.mint(staker1.address, 20000)
	const staker1Balance = await selfFarmContract.balanceOf(staker1.address)
	console.log(staker1Balance)

	// minting 20000 ONE tokens for staker2
	await tokenOneContract.mint(staker2.address, 20000)
	const staker2Balance = await tokenOneContract.balanceOf(staker2.address)
	console.log(staker2Balance)

	// minting 20000 TWO tokens for staker3
	await tokenTwoContract.mint(staker3.address, 20000)
	const staker3Balance = await tokenTwoContract.balanceOf(staker3.address)
	console.log(staker3Balance)

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});