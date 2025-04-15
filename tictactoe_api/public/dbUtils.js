"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPlayerInDB = createPlayerInDB;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
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