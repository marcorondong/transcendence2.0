# Blockchain

## Avalanche blockchain

Avalanche is type of blockchain where smart contracts will be deployed. I think of it like server where contracts are stored so they can be fetched and updated (_*so it is not really updating. When you are putting extra data on smart contract it is called transaction._) except this server is not 1 THE SERVER but multiple computers that are storing same data and validating. ~~In our case Avalanche network runner (behind the scenes of avalanche cli) is simulating few PCs (called nodes) and is running locally.~~. We are using avalanche Fuji testnet that uses fake AVAX currency for transaction. Fake AVAX you can get if you have more than 0 real AVAX on this [site](https://core.app/tools/testnet-faucet/?subnet=c&token=c)

## Solidity Smart Contract

Smart contract is self-executing piece of code stored on blockchain. In our case we are pushing one contract to blockchain and then using function of that deployed contract we will update (transact) each game of tournament. All we need to know is contract address on Fuji testnet and our contract address is `0x1d031C721F4A89845B716dF92410E0A90A8Fe1E4`.
First line in .sol file should be SPDX license identifiers. Like `// SPDX-License-Identifier: MIT` or `UNLICENSE` instead of MIT. Second thing is usually pragma that tells with which version of compiler should Smart contract be compiled to binary. It looks like `pragma solidity ^0.5.2;`. Once contract is deployed we can use its functions if we know both:

* blockchain address
* smart contract address on blockchain.

crypto wallet is also needed because interaction with blockchain is not free. Private key of wallet is all we need to to have full control of it so it should never be pushed on git. You can check file [recordGame](../ssg/pong-api/src/blockchain-transaction/recordGame.ts) on how is interaction done it our case. HACKERS YOU WILL NOT SEE MY PRIVATE WALLET HEHE 🖕 because it is in ENV file. Teammates I will send you on discord .env file

### SPDX

SPDX stands for Software Package Data Exchange. It is developed by Linux Foundation's SPDX Project to help developers, companies and tools communicate software licensing and security information in a clear and consistent way.

### Structure

Contract is similar to class of object-oriented language. Each contract can have:

* State Variables
* Functions
* Function Modifiers
* Events
* Errors
* Struct Types
* Enum Types

Special kind of contract also exist and they are: libraries and interfaces.

#### State variables

state variables are like attributes of class. it is declared as `<type> varName;`

#### Functions

Functions are executable units of code. Function can be internal or external and have different level of visibility and Function Modifiers.
`function abort() public view onlySeller {//code}`

#### Events

Events are convenience interface with the EVM (Etherium Virtual Machine) logging facilities. It is something like console.log on steroids for the blockchain
`event HighestBidIncreased(address bidder, uint amount);`

#### Errors

Descriptive names and data for failure situations. Cheaper than strings.
`error NotEnoughFunds(uint requested, uint available)`

#### Struct

struct is custom defined types that can group several variables

```solidity
struct Voter{ 
uint weight, 
bool voted, 
address delegate;
}
```

#### Enum Types

Enum is custom type with a finite set of "constant values"
`enum State {Created, Locked, Inactive}`

## Hardhat

after contract is written in solidity it should be compiled with `npx hardhat compile`
In hardhat project file `scripts/deploy.ts` is for deploying contract
`npx hardhat run scripts/deploy2.ts --network fuji` -> for deploying contract on fuji network once fuji network is set up

~~TournamentScores deployed to: 0x1d031C721F4A89845B716dF92410E0A90A8Fe1E4~~ old non checking owner
TournamentScores deployed to: 0x61B6Bd9d657D8106b3A683572b97C391E6b3F0f5

~~[Link to snowtrace of old TournamentScores contract](https://testnet.snowtrace.io/address/0x1d031C721F4A89845B716dF92410E0A90A8Fe1E4)~~  
~~[Link to snowtrace of our TournamentScores contract](https://testnet.snowtrace.io/address/0x61B6Bd9d657D8106b3A683572b97C391E6b3F0f5)~~
[Link to snowtrace of our TournamentScores contract](https://testnet.snowtrace.io/address/0xc2E65341CEd6bF8f371C77ea4d50C820f337C673)

### avalanche cli commands

IT IS NOT IMPORTANT SINCE I GAVE UP FROM LOCAL TESTNET APPROACH  
In order to use avalanche cli it should be first installed [official docs](https://build.avax.network/docs/tooling/get-avalanche-cli).
[Official video](https://www.youtube.com/watch?v=aLNttgQJCvE). _note: It is using outdated command `subnet`, use `blockchain` instead of that every time_

* `avalanche blockchain create filipChain` -> create AVALANCHE blockchain
* `avalanche network start` -> Avalanche network runner
* `avalanche blockchain deploy filipChain` -> deploy Blockchain on network
* `avalanche network status` -> avalanche network status
* `avalanche blockchain describe filipChain` -> all info about the chain. One of the most important thing there is this one private key account that have all fake currency and RPC URL.
* `rm -rf ~/.avalanche-cli/runs/*` -> run this to manually destroy all networks before starting fresh network with avalanche network start
Created blockchains are stored in `~/.avalanche-cli/subnets/<filipChainFolder>`
