"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

interface CalendarEvent {
  id: string
  title: string
  type: "study" | "deadline" | "blocker"
  startTime: string
  endTime: string
  day: number
  description?: string
  course?: string
}

const mockEvents: CalendarEvent[] = [
  {
    id: "1",
    title: "Math Study Session",
    type: "study",
    startTime: "09:00",
    endTime: "11:00",
    day: 1,
    course: "Mathematics",
    description: "Algebra and calculus review",
  },
  {
    id: "2",
    title: "Physics Assignment Due",
    type: "deadline",
    startTime: "23:59",
    endTime: "23:59",
    day: 3,
    course: "Physics",
    description: "Quantum mechanics problem set",
  },
  {
    id: "3",
    title: "Gym Session",
    type: "blocker",
    startTime: "18:00",
    endTime: "19:30",
    day: 2,
    description: "Personal workout time",
  },
]

const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
const timeSlots = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, "0")}:00`)

export function WeeklyCalendar() {
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [events, setEvents] = useState<CalendarEvent[]>(mockEvents)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)

  const getWeekDates = (date: Date) => {
    const week = []
    const startDate = new Date(date)
    startDate.setDate(date.getDate() - date.getDay())

    for (let i = 0; i < 7; i++) {
      const day = new Date(startDate)
      day.setDate(startDate.getDate() + i)
      week.push(day)
    }
    return week
  }

  const weekDates = getWeekDates(currentWeek)

  const getEventColor = (type: string) => {
    switch (type) {
      case "study":
        return "bg-primary text-primary-foreground"
      case "deadline":
        return "bg-red-500 text-white"
      case "blocker":
        return "bg-gray-500 text-white"
      default:
        return "bg-gray-200"
    }
  }

  const navigateWeek = (direction: "prev" | "next") => {
    const newDate = new Date(currentWeek)
    newDate.setDate(currentWeek.getDate() + (direction === "next" ? 7 : -7))
    setCurrentWeek(newDate)
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Weekly Calendar</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigateWeek("prev")}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium">
              {weekDates[0].toLocaleDateString()} - {weekDates[6].toLocaleDateString()}
            </span>
            <Button variant="outline" size="sm" onClick={() => navigateWeek("next")}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-8 gap-2 h-96 overflow-auto">
          {/* Time column */}
          <div className="space-y-2">
            <div className="h-8"></div>
            {timeSlots.slice(6, 24).map((time) => (
              <div key={time} className="h-8 text-xs text-muted-foreground flex items-center">
                {time}
              </div>
            ))}
          </div>

          {/* Day columns */}
          {days.map((day, dayIndex) => (
            <div key={day} className="space-y-2">
              <div className="h-8 text-center">
                <div className="text-sm font-medium">{day}</div>
                <div className="text-xs text-muted-foreground">{weekDates[dayIndex].getDate()}</div>
              </div>

              <div className="relative space-y-1">
                {timeSlots.slice(6, 24).map((time, timeIndex) => (
                  <div key={time} className="h-8 border-t border-gray-100 relative">
                    {events
                      .filter((event) => event.day === dayIndex && event.startTime.startsWith(time.split(":")[0]))
                      .map((event) => (
                        <Dialog key={event.id}>
                          <DialogTrigger asChild>
                            <div
                              className={`absolute inset-x-0 top-0 h-full rounded text-xs p-1 cursor-pointer hover:opacity-80 ${getEventColor(event.type)}`}
                              onClick={() => setSelectedEvent(event)}
                            >
                              <div className="truncate font-medium">{event.title}</div>
                              <div className="truncate opacity-75">
                                {event.startTime}-{event.endTime}
                              </div>
                            </div>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>{event.title}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label>Type</Label>
                                <Badge className={getEventColor(event.type)}>
                                  {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                                </Badge>
                              </div>
                              <div>
                                <Label>Time</Label>
                                <p>
                                  {event.startTime} - {event.endTime}
                                </p>
                              </div>
                              {event.course && (
                                <div>
                                  <Label>Course</Label>
                                  <p>{event.course}</p>
                                </div>
                              )}
                              {event.description && (
                                <div>
                                  <Label>Description</Label>
                                  <p>{event.description}</p>
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                      ))}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
