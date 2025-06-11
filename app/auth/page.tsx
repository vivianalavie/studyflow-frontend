"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@clerk/nextjs"
import { SignInButton, SignUpButton } from "@clerk/nextjs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen } from "lucide-react"

export default function AuthPage() {
  const { isLoaded, isSignedIn } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push('/onboarding')
    }
  }, [isLoaded, isSignedIn, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primary">StudyFlow</h1>
              <p className="text-sm text-muted-foreground">Smart Study Planner</p>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Welcome to StudyFlow</CardTitle>
            <CardDescription>Sign in to your account or create a new one to get started.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <SignInButton mode="modal">
              <button className="w-full py-2 px-4 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors">
                Sign In
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="w-full py-2 px-4 border border-primary text-primary rounded-md hover:bg-primary/10 transition-colors">
                Create Account
              </button>
            </SignUpButton>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
