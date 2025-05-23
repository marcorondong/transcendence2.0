import { PrismaClient } from "@prisma/client";
import httpError from "http-errors";

const prisma = new PrismaClient();

export async function createUser(userId: string) {
	await prisma.user.create({ data: { userId: userId } });
}

export async function isUserExists(userId: string): Promise<boolean> {
	const user = await prisma.user.findUnique({ where: { userId } });
	return !!user;
}

export async function ft_blockList(userId: string) {
	const user = await prisma.user.findUnique({
		where: { userId },
		select: { blockList: true },
	});
	if (!user) throw new httpError.NotFound("User not found");
	return user.blockList;
}

export async function getBlockStatus(userId: string, friendId: string) {
	const userBlockList = await ft_blockList(userId);
	const isFiendExist = await isUserExists(friendId);
	if (!isFiendExist) throw new httpError.NotFound("Friend not found");
	for (const friend of userBlockList)
		if (friend.userId === friendId) return true;
	return false;
}

export async function connectUser(userId: string, friendId: string) {
	await prisma.user.update({
		where: { userId: userId },
		data: { blockList: { connect: { userId: friendId } } },
	});
}

export async function disconnectUser(userId: string, friendId: string) {
	await prisma.user.update({
		where: { userId: userId },
		data: { blockList: { disconnect: { userId: friendId } } },
	});
}

export async function healthCheck() {
	await prisma.$queryRaw`SELECT 1`;
}
