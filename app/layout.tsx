import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { CardNicknamesProvider } from "@/components/providers/CardNicknamesProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FinClarity",
  description: "Your money is somewhere. FinClarity shows you where.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* Apply saved theme before first paint to prevent flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||t==='paper')document.documentElement.classList.add(t)}catch(e){}})()`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <CardNicknamesProvider>{children}</CardNicknamesProvider>
      </body>
    </html>
  );
}
