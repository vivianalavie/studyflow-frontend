import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { ClerkProvider, SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
    title: "StudyFlow - Smart Study Planner",
    description: "Personalized study planning and time management",
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <ClerkProvider>
            <html lang="en" suppressHydrationWarning>
                <body className={inter.className}>
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
                </body>
            </html>
        </ClerkProvider>
    )
}
