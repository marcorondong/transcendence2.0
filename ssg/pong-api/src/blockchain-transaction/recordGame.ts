import { ethers } from "ethers";
import * as dotenv from "dotenv";
import abi from "./TournamentScores.json"; // adjust path as needed
import path from "path";

const env = dotenv.config({
	path: path.resolve(__dirname, "../../.env")
});

if(env.error)
{
	console.warn("Failed to load .env file with data for contract transaction", env.error);
}

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS!;
const FUJI_RPC_URL = process.env.FUJI_RPC_URL!;
const PRIVATE_KEY = process.env.PRIVATE_KEY!;

// try {
// 	const provider = new ethers.JsonRpcProvider(FUJI_RPC_URL);
// 	const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
// 	const contract = new ethers.Contract(CONTRACT_ADDRESS, abi.abi, wallet);
// }
// catch (error)
// {
// 	console.error("Failed to fetch contract or set up")
// }


export async function recordGame(
  gameId: string,
  player1: string,
  player2: string,
  score1: number,
  score2: number
) {
	try{
		const provider = new ethers.JsonRpcProvider(FUJI_RPC_URL);
		const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

		const contract = new ethers.Contract(CONTRACT_ADDRESS, abi.abi, wallet);

		const tx = await contract.recordGame(gameId, player1, player2, score1, score2);
		await tx.wait();
		console.log(`✅ Game recorded on blockchain: ${gameId}`);
	}
	catch (error)
	{
		console.error("❌ Failed to record game on blockchain:", error);
	}
}

// export async function interpretGame()
// {
// 	try{

// 	}
// }

// Example: call this when your backend detects a finished game
// recordGame("game_xyz", "Alice", "Bob", 3, 2).catch(console.error);
