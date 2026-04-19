-- AlterTable
ALTER TABLE "User" ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");

-- DropIndex
DROP INDEX "User_id_key";

-- CreateTable
CREATE TABLE "VRChatUser" (
    "id" TEXT NOT NULL,
    "cookieData" TEXT NOT NULL,
    "vrcDisplayName" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "VRChatUser_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VRChatUser_userId_key" ON "VRChatUser"("userId");

-- AddForeignKey
ALTER TABLE "VRChatUser" ADD CONSTRAINT "VRChatUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
