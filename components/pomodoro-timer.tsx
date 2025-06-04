"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Play, Pause, RotateCcw, Timer } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function PomodoroTimer() {
  const [timeLeft, setTimeLeft] = useState(25 * 60) // 25 minutes in seconds
  const [isActive, setIsActive] = useState(false)
  const [mode, setMode] = useState<"work" | "break">("work")

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((timeLeft) => timeLeft - 1)
      }, 1000)
    } else if (timeLeft === 0) {
      // Timer finished
      setIsActive(false)
      if (mode === "work") {
        setMode("break")
        setTimeLeft(5 * 60) // 5 minute break
      } else {
        setMode("work")
        setTimeLeft(25 * 60) // 25 minute work session
      }
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isActive, timeLeft, mode])

  const toggleTimer = () => {
    setIsActive(!isActive)
  }

  const resetTimer = () => {
    setIsActive(false)
    setMode("work")
    setTimeLeft(25 * 60)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <Card className="w-64">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Timer className="h-4 w-4" />
            <span className="text-sm font-medium">Pomodoro</span>
          </div>
          <Badge variant={mode === "work" ? "default" : "secondary"}>{mode === "work" ? "Work" : "Break"}</Badge>
        </div>

        <div className="text-center mb-4">
          <div className="text-2xl font-mono font-bold text-primary">{formatTime(timeLeft)}</div>
        </div>

        <div className="flex justify-center gap-2">
          <Button size="sm" onClick={toggleTimer} className="flex-1">
            {isActive ? (
              <>
                <Pause className="h-4 w-4 mr-1" />
                Pause
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-1" />
                Start
              </>
            )}
          </Button>

          <Button size="sm" variant="outline" onClick={resetTimer}>
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
