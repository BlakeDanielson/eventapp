-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Event" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "time" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "bio" TEXT NOT NULL,
    "agenda" TEXT NOT NULL,
    "qa" TEXT,
    "imageUrl" TEXT,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'public',
    "hasTickets" BOOLEAN NOT NULL DEFAULT false,
    "requiresTickets" BOOLEAN NOT NULL DEFAULT false,
    "qaEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Event" ("agenda", "bio", "createdAt", "date", "hasTickets", "id", "imageUrl", "location", "qa", "requiresTickets", "status", "time", "title", "updatedAt", "userId") SELECT "agenda", "bio", "createdAt", "date", "hasTickets", "id", "imageUrl", "location", "qa", "requiresTickets", "status", "time", "title", "updatedAt", "userId" FROM "Event";
DROP TABLE "Event";
ALTER TABLE "new_Event" RENAME TO "Event";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
