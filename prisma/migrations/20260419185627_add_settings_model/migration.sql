-- CreateTable
CREATE TABLE "Settings" (
    "id" TEXT NOT NULL,
    "reduced_motion" BOOLEAN NOT NULL DEFAULT false,
    "low_bandwidth" BOOLEAN NOT NULL DEFAULT false,
    "accent_colour" TEXT NOT NULL DEFAULT '#a29bfe',
    "notifications_enabled" BOOLEAN NOT NULL DEFAULT true,
    "notify_on_friend_join" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Settings_userId_key" ON "Settings"("userId");

-- AddForeignKey
ALTER TABLE "Settings" ADD CONSTRAINT "Settings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
