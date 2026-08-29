-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "mentorRating" INTEGER,
ADD COLUMN     "mentorRatingNote" TEXT,
ADD COLUMN     "ratedAt" TIMESTAMP(3);
