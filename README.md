<h1 align="center">🪙Staking Rewards contract🪙</h1>
<p align='center'>
    <img src='https://nft-arty.com/wp-content/uploads/2022/04/what-is-staking-800x533-1.png' alt='screenshot' width="600" height="400" />
</p>

<h2 align="center">👷‍♂️How to use Hardhat in this Project👷‍♂️</h2>

Try running some of the following tasks:

- to get help commands: `npx hardhat help`
- to test contract by hardhat unit testing: `npx hardhat test`
- to run hardhat localhost network: `npx hardhat node`

- try to use this commands separately in hardhat localhost network:
```shell
// 1) to deploy contract
npx hardhat run scripts/deploy.js --network localhost
// 2) to mint some tokens
npx hardhat run scripts/minting.js --network localhost
// 3) to enter staking
npx hardhat run scripts/staking.js --network localhost
// 4) to get rewards
npx hardhat run scripts/getRewards.js --network localhost
// 5) to get your staked tokens
npx hardhat run scripts/withdraw.js --network localhost
```
- or use short version of this commands in hardhat localhost network:
0) to run deploy -> mint -> enter staking: `npm run enterStaking`
1) to deploy contract: `npm run deploy`
2) to mint some tokens: `npm run mint`
3) to enter staking: `npm run stake`
4) to get rewards: `npm run rewards`
5) to get your staked tokens: `npm run withdraw`
- or use one command to run these commands sequentially in hardhat localhost network: `npm test`
