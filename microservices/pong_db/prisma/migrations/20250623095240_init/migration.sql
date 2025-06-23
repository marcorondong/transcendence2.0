-- CreateTable
CREATE TABLE "Game" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "winnerId" TEXT NOT NULL,
    "loserId" TEXT NOT NULL,
    "winnerScore" INTEGER NOT NULL,
    "loserScore" INTEGER NOT NULL,
    "gameId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
