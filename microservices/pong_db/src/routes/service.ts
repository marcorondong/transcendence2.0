import { PrismaClient } from "../../node_modules/generated/prisma";
import httpError from "http-errors";
import type { GameInput, StatsInput } from "./zodSchemas";
import { statsResponseSchema } from "./zodSchemas";

const prisma = new PrismaClient();

async function getGamesById(userId: string) {
	const games = await prisma.game.findMany({
		where: { OR: [{ winnerId: userId }, { loserId: userId }] },
	});
	return games;
}

async function getGamesByIdAndOpponentId(userId: string, opponentId: string) {
	const games = await prisma.game.findMany({
		where: {
			OR: [
				{ AND: [{ winnerId: userId }, { loserId: opponentId }] },
				{ AND: [{ winnerId: opponentId }, { loserId: userId }] },
			],
		},
	});
	return games;
}

export async function getGameHistory(userId: string) {
	const gameHistory = await getGamesById(userId);
	return gameHistory;
}

export async function getTotalStats(userId: string) {
	const initialStats: StatsInput = statsResponseSchema.parse({
		total: 0,
		wins: 0,
		losses: 0,
	});
	const games = await getGamesById(userId);
	if (!games || games.length === 0) return initialStats;
	const totalStats = games.reduce(
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

async function getUserIfExists(userId: string) {
	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: { blockList: true },
	});
	return user;
}

export async function createUser(userId: string) {
	const existingUser = await getUserIfExists(userId);
	if (existingUser) return existingUser;
	const newUser = await prisma.user.create({
		data: { id: userId },
		select: { blockList: true },
	});
	return newUser;
}

export async function addToBlockList(userId: string, friendId: string) {
	const isUserInList = await getBlockStatus(userId, friendId);
	if (isUserInList) throw new httpError.Conflict("User already blocked");
	await prisma.user.update({
		where: { id: userId },
		data: { blockList: { connect: { id: friendId } } },
	});
}

export async function removeFromBlockList(id: string, friendId: string) {
	const isUserInBlockList = await getBlockStatus(id, friendId);
	if (!isUserInBlockList) throw new httpError.Conflict("User not blocked");
	await prisma.user.update({
		where: { id: id },
		data: { blockList: { disconnect: { id: friendId } } },
	});
}

export async function getBlockStatus(userId: string, friendId: string) {
	const existingUser = await getUserIfExists(userId);
	if (!existingUser) throw new httpError.NotFound("User not found");
	const existingFriend = await getUserIfExists(friendId);
	if (!existingFriend) throw new httpError.NotFound("User not found");
	for (const friend of existingUser.blockList)
		if (friend.id === friendId) return true;
	return false;
}

export async function getBlockList(userId: string) {
	const existingUser = await getUserIfExists(userId);
	if (!existingUser) throw new httpError.NotFound("User not found");
	return existingUser.blockList;
}
