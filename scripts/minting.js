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

async function main() {
	console.log("Minting script ran")
	console.log("----------------------------------------------------------------------------------------------------------")

	// one token value = 1e18
	// to mint 10 tokens, we need to multiply the value of one token by 10
	const oneTokenVal = BigNumber.from("1000000000000000000");

	// take owner of {StakingRewards} contract and 3 accounts
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

	// Minting 100000 SFT tokens for {StakingRewards} contract
	const sRContractMint = await selfFarmContract.mint("0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9", oneTokenVal.mul(100000))
	await sRContractMint.wait()
	// read the balance of SFT tokens on the {StakingRewards} contract
	// gets the balance of {StakingRewards}
	await getBalanceOf("0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9", await selfFarmContract.symbol())

	console.log("-----------------------------------------------------------------------------------")

	// Minting 5000 SFT tokens for {staker1}
	const staker1Mint = await selfFarmContract.mint(staker1.address, oneTokenVal.mul(5000))
	await staker1Mint.wait()
	// gets the balance of {staker1}
	const staker1Token = await getBalanceOf(staker1.address, await selfFarmContract.symbol())
	// increase {staker1}'s allowance to Staking Rewards contract
	const increaseAllowanceByStaker1 = await selfFarmContract.connect(staker1).increaseAllowance("0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9", staker1Token)
	await increaseAllowanceByStaker1.wait()

	console.log("-----------------------------------------------------------------------------------")

	// Minting 5000 ONE tokens for {staker2}
	const staker2Mint = await tokenOneContract.mint(staker2.address, oneTokenVal.mul(5000))
	await staker2Mint.wait()
	// gets the balance of {staker2}
	const staker2Token = await getBalanceOf(staker2.address, await tokenOneContract.symbol())
	// increase {staker2}'s allowance to Staking Rewards contract
	const increaseAllowanceByStaker2 = await tokenOneContract.connect(staker2).increaseAllowance("0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9", staker2Token)
	await increaseAllowanceByStaker2.wait()

	console.log("-----------------------------------------------------------------------------------")

	// Minting 5000 TWO tokens for {staker3}
	const staker3Mint = await tokenTwoContract.mint(staker3.address, oneTokenVal.mul(5000))
	await staker3Mint.wait()
	// gets the balance of {staker3}
	const staker3Token = await getBalanceOf(staker3.address, await tokenTwoContract.symbol())
	// increase {staker3}'s allowance to Staking Rewards contract
	const increaseAllowanceByStaker3 = await tokenTwoContract.connect(staker3).increaseAllowance("0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9", staker3Token)
	await increaseAllowanceByStaker3.wait()

	console.log("----------------------------------------------------------------------------------------------------------")
	console.log("Minting script ended")

	async function getBalanceOf(staker, tokenSign) {
		// read the balance of SFT tokens on the {staker}'s account
		const stakerSft = await selfFarmContract.balanceOf(staker)
		// read the balance of ONE tokens on the {staker}'s account
		const stakerOne = await tokenOneContract.balanceOf(staker)
		// read the balance of TWO tokens on the {staker}'s account
		const stakerTwo = await tokenTwoContract.balanceOf(staker)

		const token = await gtZero(stakerSft, stakerOne, stakerTwo)

		// check {staker}'s balance
		console.log("Staker {", staker, "} ", tokenSign, ": ", token.div(oneTokenVal), " * 1e18 tokens")

		return token
	}
}

async function gtZero(x, y, z) {
	return x > 0 ? x :
		y > 0 ? y :
			z
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
