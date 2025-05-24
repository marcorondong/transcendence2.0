import { ethers } from "ethers";
import * as dotenv from "dotenv";
import abi from "./TournamentScores.json"; // adjust path as needed
import path from "path";
import { blockchainConfig } from "../config";

const env = dotenv.config({
	path: path.resolve(__dirname, "../../.env"),
});

if (env.error) {
	console.warn(
		"❌ Failed to load .env file with data for contract transaction. Check if env file is placed in microservice root as ./.env",
		env.error,
	);
} else {
	console.log(
		"✅ Environment file for setting up wallet and blockchain loaded",
	);
}

const CONTRACT_ADDRESS = blockchainConfig.contract_address;
const FUJI_RPC_URL = blockchainConfig.fuji_rpc_url;
const WALLET_PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY!;

export async function recordGameOnBlockchain(
	gameId: string,
	tournamentId: string,
	stageName: string,
	player1: string,
	player2: string,
	score1: number,
	score2: number,
) {
	try {
		const provider = new ethers.JsonRpcProvider(FUJI_RPC_URL);
		const wallet = new ethers.Wallet(WALLET_PRIVATE_KEY, provider);
		const contract = new ethers.Contract(CONTRACT_ADDRESS, abi.abi, wallet);

		const tx = await contract.recordGame(
			gameId,
			tournamentId,
			stageName,
			player1,
			player2,
			score1,
			score2,
		);
		await tx.wait();
		console.log(`✅ Game recorded on blockchain:\n\tGameId: ${gameId}
			\n\tPlayer1: ${player1}, Score: ${score1}
			\n\tPlayer2: ${player2}, Score: ${score2}`);
	} catch (error) {
		console.error("❌ Failed to record game on blockchain:", error);
	}
}

function replacer(_key: string, value: any) {
	return typeof value === "bigint" ? value.toString() : value;
}

export async function interpretGame(gameId: string): Promise<string | false> {
	try {
		const provider = new ethers.JsonRpcProvider(FUJI_RPC_URL);
		const wallet = new ethers.Wallet(WALLET_PRIVATE_KEY, provider);
		const contract = new ethers.Contract(CONTRACT_ADDRESS, abi.abi, wallet);

		const game = await contract.getGame(gameId);
		console.log(`✅ Game fetched: ${gameId}`, game);
		return JSON.stringify(game, replacer);
	} catch (error) {
		console.error("❌ Failed to fetch game from blockchain:", error);
		return false;
	}
}
export async function gameLog(gameId: string): Promise<string | false> {
	try {
		const provider = new ethers.JsonRpcProvider(FUJI_RPC_URL);
		const wallet = new ethers.Wallet(WALLET_PRIVATE_KEY, provider);
		const contract = new ethers.Contract(CONTRACT_ADDRESS, abi.abi, wallet);
		const game = await contract.getGameLog(gameId);
		console.log(`✅ Game log fetched: ${gameId}`, game);
		return game.toString();
	} catch (error) {
		console.error("❌ Failed to fetch game log from blockchain:", error);
		return false;
	}
}
export async function listenToGameLogs() {
	try {
		const provider = new ethers.JsonRpcProvider(FUJI_RPC_URL);
		const contract = new ethers.Contract(
			CONTRACT_ADDRESS,
			abi.abi,
			provider,
		);
		contract.on(
			"GameLog",
			(
				gameId,
				player1Id,
				player1Score,
				player2Id,
				player2Score,
				timestamp,
			) => {
				console.log("📡 GameLog Event:");
				console.log("  🎮 Game ID:     ", gameId);
				console.log(
					"  👤 Player 1:     ",
					player1Id,
					"Score:",
					player1Score,
				);
				console.log(
					"  👤 Player 2:     ",
					player2Id,
					"Score:",
					player2Score,
				);
				console.log(
					"  🕒 Timestamp:    ",
					new Date(timestamp * 1000).toLocaleString(),
				);
				console.log("──────────────────────────────────────────────");
			},
		);
		console.log("✅ Listening for GameLog events...");
	} catch (error) {
		console.error("❌ Failed to set up GameLog listener:", error);
	}
}
