const { expect } = require("chai")
const { ethers } = require("hardhat")

let tokensAmount = 10

let delay = ms => new Promise(res => setTimeout(res, ms))

describe("StakingRewards", () => {
	// addresses for using in tests
	let owner, staker1, staker2, staker3
	// contracts addresses for using in tests
	let erc20Sft, erc20One, erc20Two, staking

	beforeEach(async () => {
		// takes 4 first addresses from hardhat network
		[owner, staker1, staker2, staker3] = await ethers.getSigners()

		// deploy {SFT}
		erc20Sft = await deployErc20(owner, "SelfFarmToken", "SFT")

		// deploy {ONE}
		erc20One = await deployErc20(owner, "TokenOne", "ONE")

		// deploy {TWO}
		erc20Two = await deployErc20(owner, "TokenTwo", "TWO")

		// deploy {StakingRewards}
		const Staking = await ethers.getContractFactory("StakingRewards", owner)
		staking = await Staking.deploy(erc20Sft.address, erc20One.address, erc20Two.address)
		await staking.deployed()
	})
	it("deployed", async () => {
		expect(staking.address).to.be.properAddress
		expect(erc20Sft.address).to.be.properAddress
		expect(erc20One.address).to.be.properAddress
		expect(erc20Two.address).to.be.properAddress
	})
	it("have 0 any tokens by default", async () => {
		const staker1balance = await tokensBalance(staker1.address, 1, erc20Sft, erc20One, erc20Two)
		const staker2balance = await tokensBalance(staker2.address, 2, erc20Sft, erc20One, erc20Two)
		const staker3balance = await tokensBalance(staker3.address, 3, erc20Sft, erc20One, erc20Two)

		for (let i = 0; i < 3; ++i) {
			expect(staker1balance[i]).to.eq(0)
			expect(staker2balance[i]).to.eq(0)
			expect(staker3balance[i]).to.eq(0)
		}
	})
	it("possible to mint any tokens", async () => {
		const staker1BalanceAfterMint = await mintTokens(staker1.address, 1, erc20Sft, erc20One, erc20Two, tokensAmount)
		const staker2BalanceAfterMint = await mintTokens(staker2.address, 2, erc20Sft, erc20One, erc20Two, tokensAmount)
		const staker3BalanceAfterMint = await mintTokens(staker3.address, 3, erc20Sft, erc20One, erc20Two, tokensAmount)

		for (let i = 0; i < 3; ++i) {
			expect(staker1BalanceAfterMint[i]).to.eq(tokensAmount)
			expect(staker2BalanceAfterMint[i]).to.eq(tokensAmount)
			expect(staker3BalanceAfterMint[i]).to.eq(tokensAmount)
		}
	})
	it("possible to enter staking with any tokens", async () => {
		// mint {tokensAmount} SFT, ONE, TWO tokens to stakers
		const staker1Sft = await erc20Sft.mint(staker1.address, tokensAmount)
		await staker1Sft.wait()
		const staker2One = await erc20One.mint(staker2.address, tokensAmount)
		await staker2One.wait()
		const staker3Two = await erc20Two.mint(staker3.address, tokensAmount)
		await staker3Two.wait()

		const sftAllowance = await erc20Sft.connect(staker1).increaseAllowance(staking.address, tokensAmount)
		await sftAllowance.wait()
		const oneAllowance = await erc20One.connect(staker2).increaseAllowance(staking.address, tokensAmount)
		await oneAllowance.wait()
		const twoAllowance = await erc20Two.connect(staker3).increaseAllowance(staking.address, tokensAmount)
		await twoAllowance.wait()

		expect(() => staking.connect(staker1).stake(erc20Sft.address, tokensAmount))
			.to.changeTokenBalances(erc20Sft, [staker1, staking], [-tokensAmount, tokensAmount])

		expect(() => staking.connect(staker2).stake(erc20One.address, tokensAmount))
			.to.changeTokenBalances(erc20One, [staker2, staking], [-tokensAmount, tokensAmount])

		expect(() => staking.connect(staker3).stake(erc20Two.address, tokensAmount))
			.to.changeTokenBalances(erc20Two, [staker3, staking], [-tokensAmount, tokensAmount])
	})
	it("possible to withdraw any tokens", async () => {
		// mint {tokensAmount} SFT, ONE, TWO tokens to stakers
		const staker1Sft = await erc20Sft.mint(staker1.address, tokensAmount)
		await staker1Sft.wait()
		const staker2One = await erc20One.mint(staker2.address, tokensAmount)
		await staker2One.wait()
		const staker3Two = await erc20Two.mint(staker3.address, tokensAmount)
		await staker3Two.wait()

		const sftAllowance = await erc20Sft.connect(staker1).increaseAllowance(staking.address, tokensAmount)
		await sftAllowance.wait()
		const oneAllowance = await erc20One.connect(staker2).increaseAllowance(staking.address, tokensAmount)
		await oneAllowance.wait()
		const twoAllowance = await erc20Two.connect(staker3).increaseAllowance(staking.address, tokensAmount)
		await twoAllowance.wait()

		const staker1Stake = await staking.connect(staker1).stake(erc20Sft.address, tokensAmount)
		await staker1Stake.wait()
		const staker2Stake = await staking.connect(staker2).stake(erc20One.address, tokensAmount)
		await staker2Stake.wait()
		const staker3Stake = await staking.connect(staker3).stake(erc20Two.address, tokensAmount)
		await staker3Stake.wait()

		expect(() => staking.connect(staker1).withdraw(tokensAmount))
			.to.changeTokenBalances(erc20Sft, [staker1, staking], [tokensAmount, -tokensAmount])

		expect(() => staking.connect(staker2).withdraw(tokensAmount))
			.to.changeTokenBalances(erc20One, [staker2, staking], [tokensAmount, -tokensAmount])

		expect(() => staking.connect(staker3).withdraw(tokensAmount))
			.to.changeTokenBalances(erc20Two, [staker3, staking], [tokensAmount, -tokensAmount])
	})
	it("gives rewards", async () => {
		// mint {tokensAmount} SFT tokens to stakers
		const staker1Sft = await erc20Sft.mint(staker1.address, tokensAmount)
		await staker1Sft.wait()

		const sftAllowance = await erc20Sft.connect(staker1).increaseAllowance(staking.address, tokensAmount)
		await sftAllowance.wait()

		const staker1Stake = await staking.connect(staker1).stake(erc20Sft.address, tokensAmount)
		await staker1Stake.wait()

		await delay(2000)

		expect(() => staking.connect(staker1).getRewards())
			.to.changeTokenBalances(erc20Sft, [staker1, staking], [tokensAmount, -tokensAmount])
	})
	it("sets the duration only by owner", async () => {
		await expect(staking.connect(staker1).setDuration(10000000)).to.be.reverted
	})
	it("can be minted only by owner", async () => {
		await expect(erc20Sft.connect(staker1).mint(staker1.address, 1e5)).to.be.reverted
	})
})

async function mintTokens(staker, stakerNum, sft, one, two, amount) {
	const sftMinted = await sft.mint(staker, amount)
	await sftMinted.wait()
	const oneMinted = await one.mint(staker, amount)
	await oneMinted.wait()
	const twoMinted = await two.mint(staker, amount)
	await twoMinted.wait()

	const stakerBalance = tokensBalance(staker, stakerNum, sft, one, two)

	return stakerBalance
}

// read the balance of SFT, ONE, TWO tokens on the {staker}'s account
async function tokensBalance(staker, stakerNum, sft, one, two) {
	const stakerSft = await sft.balanceOf(staker)
	const stakerOne = await one.balanceOf(staker)
	const stakerTwo = await two.balanceOf(staker)

	console.log("Staker", stakerNum, " SFT:", stakerSft, " ONE: ", stakerOne, " TWO: ", stakerTwo)

	return [stakerSft, stakerOne, stakerTwo]
}

// deploy any tokens
async function deployErc20(deployer, tokenName, tokenSign) {
	const Erc20 = await ethers.getContractFactory("ERC20Updated", deployer)
	const erc20 = await Erc20.deploy(tokenName, tokenSign)
	await erc20.deployed()

	return erc20
}