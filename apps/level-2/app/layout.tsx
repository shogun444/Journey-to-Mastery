import type { Metadata } from "next"
import localFont from "next/font/local"
import { Providers } from "./providers"
import "./globals.css"

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
})

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
})

export const metadata: Metadata = {
  title: "Stellar Swap",
  description: "Token Swap Interface on Stellar DEX",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var t = localStorage.getItem("theme");
                if (t === "light") {
                  document.documentElement.className = "light";
                } else {
                  document.documentElement.className = "dark";
                }
              } catch(e) {}
            `,
          }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased noise-overlay`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
