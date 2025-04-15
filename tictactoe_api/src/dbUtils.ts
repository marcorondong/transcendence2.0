import { PrismaClient } from "./generated/prisma";

const prisma = new PrismaClient();

export async function createPlayerInDB(playerId: string) {
	const existing = await prisma.player.findUnique({
		where: { id: playerId },
	});

	if (existing) return; // or just return

	await prisma.player.create({
		data: { id: playerId },
	});
}
