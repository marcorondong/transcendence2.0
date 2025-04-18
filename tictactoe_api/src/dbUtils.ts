import { PrismaClient } from "./generated/prisma";

const prisma = new PrismaClient();

export async function createPlayerInDB(playerId: string) {
	const existing = await prisma.player.findUnique({
		where: { id: playerId },
	});

	if (existing) return;

	await prisma.player.create({
		data: { id: playerId },
	});
}

export async function createGameInDB(playerXId: string, playerOId: string, result: string) {
	await prisma.game.create({
		data: { playerXId, playerOId, result },
	});
}

export async function getGamesById(playerId: string) {
	const games = await prisma.game.findMany({
		where: {
			OR: [
				{ playerXId: playerId },
				{ playerOId: playerId },
			],
		},
	});
	return games;
}

export async function getGamesHeadToHead(playerId: string, opponentId: string) {
	const games = await prisma.game.findMany({
		where: {
			OR: [
				{
					AND: [
						{ playerXId: playerId },
						{ playerOId: opponentId },
					],
				},
				{
					AND: [
						{ playerXId: opponentId },
						{ playerOId: playerId },
					],
				},
			],
		},
	});
	return games;

}