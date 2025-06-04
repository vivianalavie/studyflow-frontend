"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { BookOpen, ArrowRight, ArrowLeft } from "lucide-react"

const questions = [
  {
    id: 1,
    question: "How many hours would you like to study in one study session?",
    type: "radio",
    options: [
      { value: "0.5", label: "30 minutes" },
      { value: "1", label: "1 hour" },
      { value: "1.5", label: "1.5 hours" },
      { value: "2", label: "2 hours" },
      { value: "3", label: "3+ hours" },
    ],
  },
  {
    id: 2,
    question: "Do you prefer studying in the morning, afternoon, evening, or at night?",
    type: "radio",
    options: [
      { value: "morning", label: "Morning (6 AM - 12 PM)" },
      { value: "afternoon", label: "Afternoon (12 PM - 6 PM)" },
      { value: "evening", label: "Evening (6 PM - 10 PM)" },
      { value: "night", label: "Night (10 PM - 6 AM)" },
    ],
  },
  {
    id: 3,
    question: "What is the earliest possible study time in a day for you?",
    type: "time",
    placeholder: "Select earliest time",
  },
  {
    id: 4,
    question: "What is the latest possible study time in a day for you?",
    type: "time",
    placeholder: "Select latest time",
  },
  {
    id: 5,
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
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<number, any>>({})
  const [isLoading, setIsLoading] = useState(false)

  const handleAnswer = (questionId: number, value: any) => {
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

    // Simulate API call to submit quiz answers
    setTimeout(() => {
      setIsLoading(false)
      window.location.href = "/dashboard"
    }, 1500)
  }

  const progress = ((currentQuestion + 1) / questions.length) * 100
  const question = questions[currentQuestion]
  const currentAnswer = answers[question.id]

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
              <h3 className="text-lg font-medium mb-4">{question.question}</h3>

              {question.type === "radio" && (
                <RadioGroup value={currentAnswer || ""} onValueChange={(value) => handleAnswer(question.id, value)}>
                  {question.options?.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={option.value} id={option.value} />
                      <Label htmlFor={option.value}>{option.label}</Label>
                    </div>
                  ))}
                </RadioGroup>
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

            <div className="flex justify-between pt-6">
              <Button variant="outline" onClick={handlePrevious} disabled={currentQuestion === 0}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>

              <Button
                onClick={handleNext}
                disabled={
                  !currentAnswer || (question.type === "checkbox" && (!currentAnswer || currentAnswer.length === 0))
                }
              >
                {currentQuestion === questions.length - 1 ? (
                  isLoading ? (
                    "Setting up..."
                  ) : (
                    "Complete Setup"
                  )
                ) : (
                  <>
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
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
