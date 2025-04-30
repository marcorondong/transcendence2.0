import httpError from "http-errors";
import { createUser, getUserIfExists, connectUser, disconnectUser } from "./dbUtils";

export async function createOrGetUser(userId: string) {
	const existingUser = await getUserIfExists(userId);
	if (existingUser) return existingUser;
	const user = await createUser(userId);
	return user;
}

export async function addToBlockList(userId: string, friendId: string) {
	const isUserInList = await getBlockStatus(userId, friendId);
	if (isUserInList) throw new httpError.Conflict("User already blocked");
	await connectUser(userId, friendId);
}

export async function removeFromBlockList(userId: string, friendId: string) {
	const isUserInBlockList = await getBlockStatus(userId, friendId);
	if (!isUserInBlockList) throw new httpError.Conflict("User not blocked");
	await disconnectUser(userId, friendId);
}

export async function toggleBlock(userId: string, friendId: string) {
	const isUserInBlockList = await getBlockStatus(userId, friendId);
	if (isUserInBlockList) await disconnectUser(userId, friendId);
	else await connectUser(userId, friendId);
}

export async function getBlockStatus(userId: string, friendId: string) {
	if (userId === friendId) throw new httpError.BadRequest("userId and friendId cannot be the same");
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
