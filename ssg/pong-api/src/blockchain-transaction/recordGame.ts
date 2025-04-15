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

//TODO: THIS functions are used for interacting with transactions of contract. Aka fetching game record from blockchain.
//They will not be part of pong api, but separate service that is not required by subject. IF Filip will have time for that
// export async function interpretGame(gameId: string)
// {
// 	try{
// 		const provider = new ethers.JsonRpcProvider(FUJI_RPC_URL);
// 		const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
// 		const contract = new ethers.Contract(CONTRACT_ADDRESS, abi.abi, wallet);

// 		const game = await contract.getGame(gameId);
// 		console.log(`✅ Game fetched: ${gameId}`, game);
// 	}
// 	catch (error)
// 	{
// 		console.error("❌ Failed to fetch game from blockchain:", error);
// 	}
// }
// export async function gameLog(gameId: string)
// {
// 	try{
// 		const provider = new ethers.JsonRpcProvider(FUJI_RPC_URL);
// 		const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
// 		const contract = new ethers.Contract(CONTRACT_ADDRESS, abi.abi, wallet);
// 		const game = await contract.getGameLog(gameId);
// 		console.log(`✅ Game log fetched: ${gameId}`, game);
// 	}
// 	catch (error)
// 	{
// 		console.error("❌ Failed to fetch game log from blockchain:", error);
// 	}
// }
// export async function listenToGameLogs() {
// 	try {
// 		const provider = new ethers.JsonRpcProvider(FUJI_RPC_URL);
// 		const contract = new ethers.Contract(CONTRACT_ADDRESS, abi.abi, provider);
// 		contract.on("GameLog", (gameId, player1Id, player1Score, player2Id, player2Score, timestamp) => {
// 			console.log("📡 GameLog Event:");
// 			console.log("  🎮 Game ID:     ", gameId);
// 			console.log("  👤 Player 1:     ", player1Id, "Score:", player1Score);
// 			console.log("  👤 Player 2:     ", player2Id, "Score:", player2Score);
// 			console.log("  🕒 Timestamp:    ", new Date(timestamp * 1000).toLocaleString());
// 			console.log("──────────────────────────────────────────────");
// 		});
// 		console.log("✅ Listening for GameLog events...");
// 	} catch (error) {
// 		console.error("❌ Failed to set up GameLog listener:", error);
// 	}
// }
