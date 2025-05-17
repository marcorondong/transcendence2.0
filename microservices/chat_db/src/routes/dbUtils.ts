import { PrismaClient } from "../../node_modules/generated/prisma";

const prisma = new PrismaClient();

export async function createUser(userId: string) {
	const user = await prisma.user.create({
		data: { userId: userId },
		select: { blockList: true },
	});
	return user;
}

export async function isUserExists(userId: string): Promise<boolean> {
	const user = await prisma.user.findUnique({
		where: { userId },
	});
	return !!user;
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
