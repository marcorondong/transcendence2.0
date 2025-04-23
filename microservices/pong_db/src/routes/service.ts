import { PrismaClient } from "../../node_modules/generated/prisma";
import type { GameInput, GamesInput, StatsInput } from "./zodSchemas";
import httpError from "http-errors";

export const prisma = new PrismaClient();

async function getGamesByIdAndOpponentId(userId: string, opponentId: string) {
	const games = await prisma.game.findMany({
		where: {
			OR: [
				{ AND: [{ winnerId: userId }, { loserId: opponentId }] },
				{ AND: [{ winnerId: opponentId }, { loserId: userId }] },
			],
		},
		select: { winnerId: true, loserId: true },
	});
	if (!games || games.length === 0) {
		throw new httpError.NotFound(
			"No games found for this user and opponent",
		);
	}
	return games;
}

function statsCalculation(games: GamesInput, userId: string) {
	const initialStats: StatsInput = { total: 0, wins: 0, losses: 0 };
	const totalStats: StatsInput = games.reduce(
		(acc: StatsInput, game: GameInput) => {
			if (game.winnerId === userId) {
				acc.wins++;
			} else {
				acc.losses++;
			}
			acc.total++;
			return acc;
		},
		initialStats,
	);
	return totalStats;
}

export async function createGame(winnerId: string, loserId: string) {
	await prisma.game.create({ data: { winnerId, loserId } });
}

export async function getGameHistory(userId: string) {
	const games = await prisma.game.findMany({
		where: { OR: [{ winnerId: userId }, { loserId: userId }] },
		select: { winnerId: true, loserId: true },
	});
	if (!games || games.length === 0) {
		throw new httpError.NotFound("No games found for this user");
	}
	return games;
}

export async function getTotalStats(userId: string) {
	const initialStats: StatsInput = { total: 0, wins: 0, losses: 0 };
	const games = await getGameHistory(userId);
	if (!games || games.length === 0) return initialStats;
	const totalStats = statsCalculation(games, userId);
	return totalStats;
}

export async function getHeadToHeadStats(userId: string, opponentId: string) {
	const initialStats: StatsInput = { total: 0, wins: 0, losses: 0 };
	const games = await getGamesByIdAndOpponentId(userId, opponentId);
	const totalStats = statsCalculation(games, userId);
	return totalStats;
}
