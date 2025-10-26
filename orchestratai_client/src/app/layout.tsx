import type { Metadata } from "next";
import "./globals.css";
import { ChatProvider } from "@/components/providers/chat-provider";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "OrchestratAI",
  description: "AI-powered workflow orchestration platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.ReactElement {
  return (
    <html lang="en">
      <body>
        <ChatProvider>
          {children}
          <Toaster />
        </ChatProvider>
      </body>
    </html>
  );
}
