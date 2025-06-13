"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Play, Pause, RotateCcw } from "lucide-react"
import { Input } from "@/components/ui/input"

export function PomodoroTimer() {
  const [timeLeft, setTimeLeft] = useState(25 * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState("")

  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1)
      }, 1000)
    } else if (timeLeft === 0) {
      setIsRunning(false)
    }

    return () => clearInterval(interval)
  }, [isRunning, timeLeft])

  const toggleTimer = () => {
    setIsRunning(!isRunning)
  }

  const resetTimer = () => {
    setIsRunning(false)
    setTimeLeft(25 * 60)
    setIsEditing(false)
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  const handleTimeClick = () => {
    if (!isRunning) {
      setIsEditing(true)
      setEditValue(formatTime(timeLeft))
    }
  }

  const handleTimeSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const [minutes, seconds] = editValue.split(":").map(Number)
    if (!isNaN(minutes) && !isNaN(seconds) && minutes >= 0 && seconds >= 0 && seconds < 60) {
      setTimeLeft(minutes * 60 + seconds)
    }
    setIsEditing(false)
  }

  return (
    <div className="flex flex-col items-center gap-8">
      {isEditing ? (
        <form onSubmit={handleTimeSubmit} className="flex items-center gap-2">
          <Input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="text-[12rem] font-mono w-[24rem] text-center"
            placeholder="MM:SS"
            autoFocus
            onBlur={handleTimeSubmit}
          />
        </form>
      ) : (
        <div 
          className="text-[12rem] font-mono cursor-pointer select-none hover:opacity-80 transition-opacity" 
          onClick={handleTimeClick}
        >
          {formatTime(timeLeft)}
        </div>
      )}
      
      <div className="flex gap-4">
        <Button
          variant="outline"
          size="lg"
          onClick={toggleTimer}
          className="w-32 h-12 text-lg"
        >
          {isRunning ? (
            <>
              <Pause className="h-6 w-6 mr-2" />
              Pause
            </>
          ) : (
            <>
              <Play className="h-6 w-6 mr-2" />
              Start
            </>
          )}
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={resetTimer}
          className="w-32 h-12 text-lg"
        >
          <RotateCcw className="h-6 w-6 mr-2" />
          Reset
        </Button>
      </div>
    </div>
  )
}
