import type { Metadata } from "next";
import { Work_Sans, Geist_Mono } from "next/font/google";
import "../globals.css";
import Topbar from "@/components/Topbar";
import SettingsModal from "@/components/SettingsModal";
import { UserProvider } from "@/providers/UserProvider";
import { VRChatAuthProvider } from "@/providers/VRChatAuthProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { SettingsProvider } from "@/providers/SettingsProvider";

const workSans = Work_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Virtual Toolkit",
  description: "",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${workSans.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <ThemeProvider>
          <SettingsProvider>
            <UserProvider>
              <VRChatAuthProvider>
                <Topbar />
                <SettingsModal />
                <main className="pt-14">{children}</main>
              </VRChatAuthProvider>
            </UserProvider>
          </SettingsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
