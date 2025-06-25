import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { ClerkProvider, SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Toaster } from "sonner"

const inter = Inter({ subsets: ["latin"] })

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000"

export const metadata: Metadata = {
    title: "StudyFlow - Smart Study Planner",
    description: "Personalized study planning and time management",
    icons: [{ rel: "icon", url: "/favicon.ico" }],
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
            <html lang="en" suppressHydrationWarning>
                <body className={GeistSans.className}>
                    <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
                        <header className="flex justify-end p-4">
                            <SignedOut>
                                <SignInButton />
                                <div className="ml-4">
                                    <SignUpButton />
                                </div>
                            </SignedOut>
                            <SignedIn>
                                <UserButton afterSignOutUrl="/" />
                            </SignedIn>
                        </header>
                        {children}
                    </ThemeProvider>
                    <Toaster />
                </body>
            </html>
        </ClerkProvider>
    )
}
