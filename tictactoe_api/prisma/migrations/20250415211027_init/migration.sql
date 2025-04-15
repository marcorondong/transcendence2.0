-- CreateTable
CREATE TABLE "Player" (
    "id" TEXT NOT NULL PRIMARY KEY
);

-- CreateTable
CREATE TABLE "Game" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "playerXId" TEXT NOT NULL,
    "playerOId" TEXT NOT NULL,
    "result" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Game_playerXId_fkey" FOREIGN KEY ("playerXId") REFERENCES "Player" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Game_playerOId_fkey" FOREIGN KEY ("playerOId") REFERENCES "Player" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
