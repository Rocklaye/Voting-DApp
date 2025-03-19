import { VotingProvider } from "@/context/voting-context";
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <VotingProvider>{children}</VotingProvider>
      </body>
    </html>
  );
}