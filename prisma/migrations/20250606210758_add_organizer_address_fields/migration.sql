-- AlterTable
ALTER TABLE "OrganizerProfile" ADD COLUMN "defaultCity" TEXT;
ALTER TABLE "OrganizerProfile" ADD COLUMN "defaultCountry" TEXT;
ALTER TABLE "OrganizerProfile" ADD COLUMN "defaultLocationType" TEXT DEFAULT 'address';
ALTER TABLE "OrganizerProfile" ADD COLUMN "defaultState" TEXT;
ALTER TABLE "OrganizerProfile" ADD COLUMN "defaultStreetAddress" TEXT;
ALTER TABLE "OrganizerProfile" ADD COLUMN "defaultVirtualLink" TEXT;
ALTER TABLE "OrganizerProfile" ADD COLUMN "defaultVirtualPlatform" TEXT;
ALTER TABLE "OrganizerProfile" ADD COLUMN "defaultZipCode" TEXT;
