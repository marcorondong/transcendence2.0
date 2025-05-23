-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Game" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "playerXId" TEXT NOT NULL,
    "playerOId" TEXT NOT NULL,
    "result" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Game" ("id", "playerOId", "playerXId", "result") SELECT "id", "playerOId", "playerXId", "result" FROM "Game";
DROP TABLE "Game";
ALTER TABLE "new_Game" RENAME TO "Game";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
