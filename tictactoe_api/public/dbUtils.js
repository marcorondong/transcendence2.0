"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPlayerInDB = createPlayerInDB;
const prisma_1 = require("./generated/prisma");
const prisma = new prisma_1.PrismaClient();
async function createPlayerInDB(playerId) {
    const existing = await prisma.player.findUnique({
        where: { id: playerId },
    });
    if (existing)
        return;
    await prisma.player.create({
        data: { id: playerId },
    });
}
//# sourceMappingURL=dbUtils.js.map