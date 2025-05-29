import { PrismaClient } from "@prisma/client";
import type {
	GameInput,
	GamesInput,
	StatsInput,
	GameResponse,
} from "./zodSchemas";

const prisma = new PrismaClient();

async function getGamesByIdAndOpponentId(userId: string, opponentId: string) {
	const games = await prisma.game.findMany({
		where: {
			OR: [
				{ AND: [{ winnerId: userId }, { loserId: opponentId }] },
				{ AND: [{ winnerId: opponentId }, { loserId: userId }] },
			],
		},
		select: {
			winnerId: true,
			loserId: true,
			winnerScore: true,
			loserScore: true,
			gameId: true,
			createdAt: true,
		},
	});
	return games;
}

function statsCalculation(games: GamesInput, userId: string) {
	const initialStats: StatsInput = { total: 0, wins: 0, losses: 0 };
	const userStats: StatsInput = games.reduce(
		(acc: StatsInput, game: GameResponse) => {
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
	return userStats;
}

export async function createGame(game: GameInput) {
	await prisma.game.create({ data: game });
}

export async function getGameHistory(userId: string) {
	const games = await prisma.game.findMany({
		where: { OR: [{ winnerId: userId }, { loserId: userId }] },
		select: {
			winnerId: true,
			loserId: true,
			winnerScore: true,
			loserScore: true,
			createdAt: true,
		},
		orderBy: { createdAt: "desc" },
	});
	return games;
}

export async function getUserStats(userId: string) {
	const games = await getGameHistory(userId);
	if (!games || games.length === 0) return null;
	const userStats = statsCalculation(games, userId);
	return userStats;
}

export async function getHeadToHeadStats(userId: string, opponentId: string) {
	const games = await getGamesByIdAndOpponentId(userId, opponentId);
	if (!games || games.length === 0) return null;
	const headToHeadStats = statsCalculation(games, userId);
	return headToHeadStats;
}

export async function healthCheck() {
	await prisma.$queryRaw`SELECT 1`;
}
