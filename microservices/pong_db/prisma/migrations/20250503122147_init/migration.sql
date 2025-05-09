-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Game" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "winnerId" TEXT NOT NULL,
    "loserId" TEXT NOT NULL,
    "winnerScore" INTEGER NOT NULL,
    "loserScore" INTEGER NOT NULL,
    "gameId" TEXT NOT NULL,
    "createdAt" TEXT NOT NULL
);
INSERT INTO "new_Game" ("createdAt", "gameId", "id", "loserId", "loserScore", "winnerId", "winnerScore") SELECT "createdAt", "gameId", "id", "loserId", "loserScore", "winnerId", "winnerScore" FROM "Game";
DROP TABLE "Game";
ALTER TABLE "new_Game" RENAME TO "Game";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
