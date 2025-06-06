/*
  Warnings:

  - Added the required column `inviteToken` to the `Invitee` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Invitee" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "inviteToken" TEXT NOT NULL,
    "hasAccessed" BOOLEAN NOT NULL DEFAULT false,
    "accessedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Invitee_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Invitee" ("createdAt", "email", "eventId", "hasAccessed", "id", "updatedAt") SELECT "createdAt", "email", "eventId", "hasAccessed", "id", "updatedAt" FROM "Invitee";
DROP TABLE "Invitee";
ALTER TABLE "new_Invitee" RENAME TO "Invitee";
CREATE UNIQUE INDEX "Invitee_inviteToken_key" ON "Invitee"("inviteToken");
CREATE UNIQUE INDEX "Invitee_email_eventId_key" ON "Invitee"("email", "eventId");
CREATE TABLE "new_Registration" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "customQuestions" JSONB,
    "status" TEXT NOT NULL DEFAULT 'registered',
    "referralId" TEXT,
    "invitedByToken" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Registration_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Registration_referralId_fkey" FOREIGN KEY ("referralId") REFERENCES "Referral" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Registration_invitedByToken_fkey" FOREIGN KEY ("invitedByToken") REFERENCES "Invitee" ("inviteToken") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Registration" ("createdAt", "customQuestions", "email", "eventId", "id", "name", "referralId", "status", "updatedAt") SELECT "createdAt", "customQuestions", "email", "eventId", "id", "name", "referralId", "status", "updatedAt" FROM "Registration";
DROP TABLE "Registration";
ALTER TABLE "new_Registration" RENAME TO "Registration";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
