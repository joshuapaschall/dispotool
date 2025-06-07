import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import MainLayout from "@/components/layout/main-layout"
import { ThemeProvider } from "@/components/theme-provider"

export const metadata: Metadata = {
  title: "DispoTool - Real Estate Dispositions",
  description: "Disposition tool for real estate investors to sell their properties",
  generator: "Next.js",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="light">
          <MainLayout>{children}</MainLayout>
        </ThemeProvider>
      </body>
    </html>
  )
}
