import { ethers } from "hardhat";

async function main() {
  const ContractFactory = await ethers.getContractFactory("TournamentScores");
  const contract = await ContractFactory.deploy(); // ✅ no cast
  await contract.waitForDeployment(); // ✅ Ethers v6 version of `.deployed()`

  console.log(`TournamentScores deployed to: ${contract.target}`);
}
