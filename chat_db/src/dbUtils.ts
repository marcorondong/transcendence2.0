import { PrismaClient } from "../node_modules/generated/prisma";

const prisma = new PrismaClient();

async function userExists(id: string) {
	const user = await prisma.user.findUnique({
		where: { id: id },
		include: { blockList: true },
	});
	return user;
}

export async function createUser(id: string) {
	try {
		const isUserExists = await userExists(id);
		if (isUserExists) {
			return isUserExists;
		}
		const newUser = await prisma.user.create({
			data: {
				id: id,
			},
			include: { blockList: true },
		});
		return newUser;
	} catch (error) {
		console.error("Error creating user:", error);
		throw error;
	}
}

export async function addToBlockList(id: string, friendId: string) {
	try {
		const user = await prisma.user.update({
			where: { id: id },
			data: {
				blockList: {
					connect: { id: friendId },
				},
			},
		});
		if (!user) {
			throw new Error("User not found");
		}
	} catch (error) {
		console.error("Error adding to block list:", error);
		throw error;
	}
}

export async function removeFromBlockList(id: string, friendId: string) {
	try {
		const user = await prisma.user.update({
			where: { id: id },
			data: {
				blockList: {
					disconnect: { id: friendId },
				},
			},
		});
		if (!user) {
			throw new Error("User not found");
		}
	} catch (error) {
		console.error("Error removing from block list:", error);
		throw error;
	}
}

export async function getBlockStatus(id: string, friendId: string) {
	try {
		const user = await prisma.user.findUnique({
			where: { id: id },
			select: {
				blockList: {
					where: { id: friendId },
					select: { id: true },
				},
			},
		});
		if (!user) {
			throw new Error("User not found");
		}
		return user.blockList.length > 0;
	} catch (error) {
		console.error("Error fetching block status:", error);
		throw error;
	}
}

export async function getBlockList(id: string) {
	try {
		const user = await prisma.user.findUnique({
			where: { id: id },
			include: { blockList: true },
		});
		if (!user) {
			throw new Error("User not found");
		}
		return user.blockList;
	} catch (error) {
		console.error("Error fetching block list:", error);
		throw error;
	}
}

// export async function getChatHistory(id: string, friendId: string) {
// 	try {
// 		return null;
// 	} catch (error) {
// 		console.error("Error fetching chat history:", error);
// 		throw error;
// 	}
// }
