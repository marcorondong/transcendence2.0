import { PrismaClient } from "../../node_modules/generated/prisma";
import httpError from "http-errors";

const prisma = new PrismaClient();

async function getUserIfExists(userId: string) {
	const user = await prisma.user.findUnique({
		where: { userId: userId },
		select: { blockList: true },
	});
	return user;
}

export async function createUser(userId: string) {
	const existingUser = await getUserIfExists(userId);
	if (existingUser) return existingUser;
	const user = await prisma.user.create({
		data: { userId: userId },
		select: { blockList: true },
	});
	return user;
}

export async function addToBlockList(userId: string, friendId: string) {
	const isUserInList = await getBlockStatus(userId, friendId);
	if (isUserInList) throw new httpError.Conflict("User already blocked");
	await prisma.user.update({
		where: { userId: userId },
		data: { blockList: { connect: { userId: friendId } } },
	});
}

export async function removeFromBlockList(userId: string, friendId: string) {
	const isUserInBlockList = await getBlockStatus(userId, friendId);
	if (!isUserInBlockList) throw new httpError.Conflict("User not blocked");
	await prisma.user.update({
		where: { userId: userId },
		data: { blockList: { disconnect: { userId: friendId } } },
	});
}

export async function getBlockStatus(userId: string, friendId: string) {
	const existingUser = await getUserIfExists(userId);
	if (!existingUser) throw new httpError.NotFound("User not found");
	const existingFriend = await getUserIfExists(friendId);
	if (!existingFriend) throw new httpError.NotFound("Friend user not found");
	for (const friend of existingUser.blockList)
		if (friend.userId === friendId) return true;
	return false;
}

export async function getBlockList(userId: string) {
	const existingUser = await getUserIfExists(userId);
	if (!existingUser) throw new httpError.NotFound("User not found");
	return existingUser.blockList;
}
