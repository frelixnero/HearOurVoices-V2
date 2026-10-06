-- AlterTable
ALTER TABLE "Election" ADD COLUMN     "registrationDeadline" TIMESTAMP(3),
ADD COLUMN     "earlyVotingStart" TIMESTAMP(3),
ADD COLUMN     "earlyVotingEnd" TIMESTAMP(3),
ADD COLUMN     "officialPortalUrl" TEXT;
