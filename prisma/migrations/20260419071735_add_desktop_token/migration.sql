-- CreateTable
CREATE TABLE "DesktopToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "DesktopToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DesktopToken_token_key" ON "DesktopToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "DesktopToken_userId_key" ON "DesktopToken"("userId");

-- AddForeignKey
ALTER TABLE "DesktopToken" ADD CONSTRAINT "DesktopToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
