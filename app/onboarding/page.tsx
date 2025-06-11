"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { BookOpen, ArrowRight, ArrowLeft } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"


declare global {
  interface Window {
    Clerk: any;
  }
}


// Hilfsfunktion zum Generieren der Zeitoptionen
const generateTimeOptions = () => {
  const options = []
  for (let i = 0.5; i <= 6; i += 0.5) {
    options.push({
      value: i.toString(),
      label: i === 1 ? "1 hour" : `${i} hours`
    })
  }
  return options
}

const questions = [
  {
    id: 1,
    question: "Hey, what's your name?",
    type: "text",
    placeholder: "Enter your name",
  },
  {
    id: 2,
    question: "How many hours would you like to study in one study session?",
    type: "study-duration",
    options: generateTimeOptions(),
  },
  {
    id: 3,
    question: "When do you prefer studying?",
    type: "study-preferences",
    options: [
      { value: "morning", label: "Morning" },
      { value: "afternoon", label: "Afternoon" },
      { value: "evening", label: "Evening" },
      { value: "night", label: "Night" },
    ],
  },
  {
    id: 4,
    question: "What is the earliest possible study time in a day for you?",
    type: "time",
    placeholder: "Select earliest time",
  },
  {
    id: 5,
    question: "What is the latest possible study time in a day for you?",
    type: "time",
    placeholder: "Select latest time",
  },
  {
    id: 6,
    question: "On which days do you prefer not to study?",
    type: "checkbox",
    options: [
      { value: "monday", label: "Monday" },
      { value: "tuesday", label: "Tuesday" },
      { value: "wednesday", label: "Wednesday" },
      { value: "thursday", label: "Thursday" },
      { value: "friday", label: "Friday" },
      { value: "saturday", label: "Saturday" },
      { value: "sunday", label: "Sunday" },
    ],
  },
]

export default function OnboardingPage() {
  const { isLoaded, isSignedIn, userId } = useAuth()
  const router = useRouter()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<number, any>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAnswer = (questionId: number, value: any) => {
    setError(null)
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }))
  }

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1)
    } else {
      handleSubmit()
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1)
    }
  }

  const handleSubmit = async () => {
    setIsLoading(true)
  
    try {
      console.log("⏳ Start handleSubmit")
  
      if (!isLoaded || !isSignedIn || !userId) {
        console.warn("🚫 Noch nicht geladen oder nicht eingeloggt", { isLoaded, isSignedIn, userId })
        return
      }
  
      const token = await window.Clerk?.session?.getToken()

      console.log("🔑 JWT Token:", token)
  
      if (!token) {
        toast.error("❌ Kein Token erhalten – wahrscheinlich nicht eingeloggt.")
        return
      }
  
      const userData = {
        username: answers[1],
        maxStudyDuration: parseFloat(answers[2]),
        startLearningTime: answers[4],
        endLearningTime: answers[5],
        blackoutWeekdays: answers[6] || [],
      }
  
      console.log("📦 Daten, die gesendet werden:", userData)
  
      const response = await fetch(`http://localhost:8080/api/users?clerkUserId=${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
      })
  
      console.log("📡 Antwort vom Backend:", response.status)
  
      if (!response.ok) {
        const errText = await response.text()
        console.error("❌ Fehler-Response vom Backend:", errText)
        throw new Error("Fehler beim Speichern")
      }
  
      router.push("/dashboard")
    } catch (err) {
      console.error("🧨 Ausnahme in handleSubmit:", err)
      toast.error("Fehler beim Speichern deiner Daten.")
    } finally {
      setIsLoading(false)
    }
  }
  

  const progress = ((currentQuestion + 1) / questions.length) * 100
  const question = questions[currentQuestion]
  const currentAnswer = answers[question.id]

  const canProceed = () => {
    if (question.type === "text") {
      return currentAnswer && currentAnswer.trim() !== ""
    }
    if (question.type === "study-preferences") {
      return currentAnswer?.pref1 && currentAnswer?.pref2 && !error
    }
    return currentAnswer !== undefined && currentAnswer !== ""
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primary">StudyFlow Setup</h1>
              <p className="text-sm text-muted-foreground">Let's personalize your study experience</p>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>
                  Question {currentQuestion + 1} of {questions.length}
                </CardTitle>
                <CardDescription>Help us create your perfect study schedule</CardDescription>
              </div>
              <div className="text-sm text-muted-foreground">{Math.round(progress)}% complete</div>
            </div>
            <Progress value={progress} className="w-full" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-6">{question.question}</h3>

              {question.type === "text" && (
                <Input
                  type="text"
                  placeholder={question.placeholder}
                  value={currentAnswer || ""}
                  onChange={(e) => handleAnswer(question.id, e.target.value)}
                  className="text-lg"
                />
              )}

              {question.type === "study-duration" && (
                <div className="space-y-2">
                  <Select
                    value={currentAnswer || ""}
                    onValueChange={(value) => handleAnswer(question.id, value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select study duration" />
                    </SelectTrigger>
                    <SelectContent>
                      {question.options?.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {question.type === "study-preferences" && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label>Preference 1:</Label>
                    <Select
                      value={currentAnswer?.pref1 || ""}
                      onValueChange={(value) => {
                        const pref2 = currentAnswer?.pref2 || ""
                        if (value === pref2) {
                          setError("Please choose two preferences that differ!")
                          return
                        }
                        handleAnswer(question.id, { ...currentAnswer, pref1: value })
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your first preference" />
                      </SelectTrigger>
                      <SelectContent>
                        {question.options?.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Preference 2:</Label>
                    <Select
                      value={currentAnswer?.pref2 || ""}
                      onValueChange={(value) => {
                        const pref1 = currentAnswer?.pref1 || ""
                        if (value === pref1) {
                          setError("Please choose two preferences that differ!")
                          return
                        }
                        handleAnswer(question.id, { ...currentAnswer, pref2: value })
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your second preference" />
                      </SelectTrigger>
                      <SelectContent>
                        {question.options?.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {error && (
                    <div className="text-red-500 text-sm mt-2">{error}</div>
                  )}
                </div>
              )}

              {question.type === "time" && (
                <Input
                  type="time"
                  value={currentAnswer || ""}
                  onChange={(e) => handleAnswer(question.id, e.target.value)}
                  className="max-w-xs"
                />
              )}

              {question.type === "checkbox" && (
                <div className="space-y-3">
                  {question.options?.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={option.value}
                        checked={currentAnswer?.includes(option.value) || false}
                        onCheckedChange={(checked) => {
                          const current = currentAnswer || []
                          if (checked) {
                            handleAnswer(question.id, [...current, option.value])
                          } else {
                            handleAnswer(
                              question.id,
                              current.filter((v: string) => v !== option.value),
                            )
                          }
                        }}
                      />
                      <Label htmlFor={option.value}>{option.label}</Label>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              <Button
                onClick={handleNext}
                disabled={!canProceed()}
              >
                {currentQuestion === questions.length - 1 ? (
                  isLoading ? "Saving..." : "Finish"
                ) : (
                  <>
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
