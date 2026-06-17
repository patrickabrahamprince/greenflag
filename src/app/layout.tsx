import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import { ToastProvider } from "@/components/Toast";
import AppInitializer from "@/components/AppInitializer";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-body",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
});

export const metadata = {
  title: "Greenflag — For those who do",
  description: "Private dating with intention. Actions over algorithms.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0A0A0A",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} h-full antialiased`}>
      <body className="min-h-full bg-bg text-text font-body">
        <div className="noise" />
        <ToastProvider>
          <AppInitializer>
            {children}
          </AppInitializer>
        </ToastProvider>
        <BottomNav />
      </body>
    </html>
  );
}
