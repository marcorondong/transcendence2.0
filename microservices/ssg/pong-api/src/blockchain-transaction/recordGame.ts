import { ethers } from "ethers";
import abi from "./TournamentScores.json"; // adjust path as needed
import { blockchainConfig } from "../config";
import fs from "fs";

const CONTRACT_ADDRESS = blockchainConfig.contract_address;
const FUJI_RPC_URL = blockchainConfig.fuji_rpc_url;

let WALLET_PRIVATE_KEY: string;

try {
	WALLET_PRIVATE_KEY = fs
		.readFileSync("/run/secrets/wallet_private_key", "utf8")
		.trim();
	console.log("Private wallet key loaded ✅ ");
} catch (err) {
	console.warn("⚠️ Private key secret not found:", err);
	WALLET_PRIVATE_KEY = "unknown";
}

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
