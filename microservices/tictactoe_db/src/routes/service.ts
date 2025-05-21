import { PrismaClient } from "@prisma/client";
import type { GameInput, GamesInput, ResultInput } from "./zodSchemas";
import httpError from "http-errors";

const prisma = new PrismaClient();

async function getGamesByIdAndOpponentId(playerId: string, opponentId: string) {
	const games = await prisma.game.findMany({
		where: {
			OR: [
				{
					AND: [{ playerXId: playerId }, { playerOId: opponentId }],
				},
				{
					AND: [{ playerXId: opponentId }, { playerOId: playerId }],
				},
			],
		},
	});
	if (!games || games.length === 0) {
		throw new httpError.NotFound(
			"No games found for this user and opponent",
		);
	}
	return games;
}

function statsCalculation(games: GamesInput, userId: string) {
	const totalStats = {
		total: 0,
		wins: 0,
		losses: 0,
		draws: 0,
	};
	games.forEach((game: GameInput) => {
		if (game.result === "DRAW") totalStats.draws++;
		else if (
			(game.result === "X" && game.playerXId === userId) ||
			(game.result === "O" && game.playerOId === userId)
		)
			totalStats.wins++;
		else totalStats.losses++;
		totalStats.total++;
	});
	return totalStats;
}

export async function createGame(
	playerXId: string,
	playerOId: string,
	result: ResultInput,
) {
	await prisma.game.create({ data: { playerXId, playerOId, result } });
}

export async function getGameHistory(userId: string) {
	const games = await prisma.game.findMany({
		where: { OR: [{ playerXId: userId }, { playerOId: userId }] },
		select: { playerXId: true, playerOId: true, result: true },
	});
	if (!games || games.length === 0) {
		throw new httpError.NotFound("No games found for this user");
	}
	return games;
}

export async function getTotalStats(userId: string) {
	const games = await getGameHistory(userId);
	const totalStats = statsCalculation(games, userId);
	return totalStats;
}

export async function getHeadToHeadStats(userId: string, opponentId: string) {
	const games = await getGamesByIdAndOpponentId(userId, opponentId);
	const totalStats = statsCalculation(games, userId);
	return totalStats;
}
