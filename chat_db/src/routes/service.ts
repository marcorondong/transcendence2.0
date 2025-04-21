import { PrismaClient } from "../../node_modules/generated/prisma";
import { CustomError } from "../errors/customError";
import { e, s } from "../errors/httpErrors";

const prisma = new PrismaClient();

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
	if (isUserInList) throw new CustomError(e.AlreadyBlocked, s.AlreadyBlocked);
	await prisma.user.update({
		where: { id: userId },
		data: { blockList: { connect: { id: friendId } } },
	});
}

export async function removeFromBlockList(id: string, friendId: string) {
	const isUserInBlockList = await getBlockStatus(id, friendId);
	if (!isUserInBlockList) throw new CustomError(e.NotBlocked, s.NotBlocked);
	await prisma.user.update({
		where: { id: id },
		data: { blockList: { disconnect: { id: friendId } } },
	});
}

export async function getBlockStatus(userId: string, friendId: string) {
	const existingUser = await getUserIfExists(userId);
	if (!existingUser) throw new CustomError(e.UserNotFound, s.UserNotFound);
	const existingFriend = await getUserIfExists(friendId);
	if (!existingFriend) throw new CustomError(e.UserNotFound, s.UserNotFound);
	for (const friend of existingUser.blockList)
		if (friend.id === friendId) return true;
	return false;
}

export async function getBlockList(userId: string) {
	const existingUser = await getUserIfExists(userId);
	if (!existingUser) throw new CustomError(e.UserNotFound, s.UserNotFound);
	return existingUser.blockList;
}
