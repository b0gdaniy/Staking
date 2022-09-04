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
		const staker1balance = await tokensBalance(staker1.address)
		const staker2balance = await tokensBalance(staker2.address)
		const staker3balance = await tokensBalance(staker3.address)

		for (let i = 0; i < 3; ++i) {
			expect(staker1balance[i]).to.eq(0)
			expect(staker2balance[i]).to.eq(0)
			expect(staker3balance[i]).to.eq(0)
		}
	})
	it("possible to mint any tokens", async () => {
		const staker1BalanceAfterMint = await mintTokens(staker1.address, tokensAmount)

		for (let i = 0; i < 3; ++i) {
			expect(staker1BalanceAfterMint[i]).to.eq(tokensAmount)
		}
	})
	it("possible to enter staking with any tokens", async () => {
		// mint {tokensAmount} SFT, ONE, TWO tokens to stakers
		await mintTokens(staker1.address, tokensAmount)

		await _increaseAllowance(staker1, tokensAmount)

		expect(() => staking.connect(staker1).stake(erc20Sft.address, tokensAmount))
			.to.changeTokenBalances(erc20Sft, [staker1, staking], [-tokensAmount, tokensAmount])

		expect(() => staking.connect(staker1).stake(erc20One.address, tokensAmount))
			.to.changeTokenBalances(erc20One, [staker1, staking], [-tokensAmount, tokensAmount])

		expect(() => staking.connect(staker1).stake(erc20Two.address, tokensAmount))
			.to.changeTokenBalances(erc20Two, [staker1, staking], [-tokensAmount, tokensAmount])
	})
	it("possible to withdraw any tokens", async () => {
		// mint {tokensAmount} SFT, ONE, TWO tokens to stakers
		await mintTokens(staker1.address, tokensAmount)

		await _increaseAllowance(staker1, tokensAmount)

		await _stake(staker1)

		expect(() => staking.connect(staker1).withdraw(tokensAmount))
			.to.changeTokenBalances(erc20Sft, [staker1, staking], [tokensAmount, -tokensAmount])

		expect(() => staking.connect(staker1).withdraw(tokensAmount))
			.to.changeTokenBalances(erc20One, [staker1, staking], [tokensAmount, -tokensAmount])

		expect(() => staking.connect(staker1).withdraw(tokensAmount))
			.to.changeTokenBalances(erc20Two, [staker1, staking], [tokensAmount, -tokensAmount])
	})
	it("gives rewards", async () => {
		// mint {tokensAmount} SFT tokens to stakers
		await mintTokens(staker1.address, tokensAmount)

		await _increaseAllowance(staker1, tokensAmount)

		await _stake(staker1)

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

	// deploy any tokens
	async function deployErc20(deployer, tokenName, tokenSign) {
		const Erc20 = await ethers.getContractFactory("ERC20Updated", deployer)
		const erc20 = await Erc20.deploy(tokenName, tokenSign)
		await erc20.deployed()

		return erc20
	}

	// read the balance of SFT, ONE, TWO tokens on the {staker}'s account
	async function tokensBalance(staker) {
		const stakerSft = await erc20Sft.balanceOf(staker)
		const stakerOne = await erc20One.balanceOf(staker)
		const stakerTwo = await erc20Two.balanceOf(staker)

		console.log("Staker {", staker, "} SFT:", stakerSft, " ONE: ", stakerOne, " TWO: ", stakerTwo)

		return [stakerSft, stakerOne, stakerTwo]
	}

	// mint SFT, ONE, TWO tokens to {staker} with {amount}
	async function mintTokens(staker, amount) {
		const sftMinted = await erc20Sft.mint(staker, amount)
		await sftMinted.wait()
		const oneMinted = await erc20One.mint(staker, amount)
		await oneMinted.wait()
		const twoMinted = await erc20Two.mint(staker, amount)
		await twoMinted.wait()

		const stakerBalance = tokensBalance(staker)

		return stakerBalance
	}

	// increases allowance from {staker} to StakingRewards
	async function _increaseAllowance(staker, amount) {
		const sftAllowance = await erc20Sft.connect(staker).increaseAllowance(staking.address, amount)
		await sftAllowance.wait()
		const oneAllowance = await erc20One.connect(staker).increaseAllowance(staking.address, amount)
		await oneAllowance.wait()
		const twoAllowance = await erc20Two.connect(staker).increaseAllowance(staking.address, amount)
		await twoAllowance.wait()
	}

	// stake SFT, ONE, TWO tokens to StakingRewards
	async function _stake(staker) {
		const stakeSft = await staking.connect(staker).stake(erc20Sft.address, tokensAmount)
		await stakeSft.wait()
		const stakeOne = await staking.connect(staker).stake(erc20One.address, tokensAmount)
		await stakeOne.wait()
		const stakeTwo = await staking.connect(staker).stake(erc20Two.address, tokensAmount)
		await stakeTwo.wait()
	}
})