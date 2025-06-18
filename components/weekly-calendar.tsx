"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import axios from "axios"

interface CalendarEvent {
  name: string
  description: string
  startTime: string // ISO-String
  endTime: string   // ISO-String
  type: "AUTOMATIC" | "PERSONAL"
  color: string
}

const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
const timeSlots = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, "0")}:00`)

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

async function getCalendarEvents(): Promise<CalendarEvent[]> {
  const token = await window.Clerk?.session?.getToken();
  if (!token) {
    throw new Error("Not logged in");
  }
  const response = await fetch(`${API_BASE_URL}/api/calendar/events`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!response.ok) {
    throw new Error('Error fetching calendar events');
  }
  return response.json();
}

export function WeeklyCalendar({ onlyTwoDays = false }: { onlyTwoDays?: boolean }) {
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)

  useEffect(() => {
    getCalendarEvents()
      .then(data => {
        setEvents(data)
        console.log("Geladene Events:", data)
      })
      .catch(() => setEvents([]))
  }, [])

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
  const daysToShow = onlyTwoDays ? [weekDates[new Date().getDay()], weekDates[(new Date().getDay() + 1) % 7]] : weekDates;

  const getEventColor = (color: string) => {
    return color ? color : "bg-gray-200"
  }

  const navigateWeek = (direction: "prev" | "next") => {
    const newDate = new Date(currentWeek)
    newDate.setDate(currentWeek.getDate() + (direction === "next" ? 7 : -7))
    setCurrentWeek(newDate)
  }

  // Hilfsfunktion: Events für einen Tag und Stunde filtern (Slot-Logik)
  const getEventsForDayAndHour = (date: Date, hour: string) => {
    const slotStart = new Date(date)
    slotStart.setHours(parseInt(hour), 0, 0, 0)
    const slotEnd = new Date(slotStart)
    slotEnd.setHours(slotStart.getHours() + 1)
    return events.filter(event => {
      const eventStart = new Date(event.startTime)
      const eventEnd = new Date(event.endTime)
      // Event beginnt vor Ende des Slots und endet nach Start des Slots
      return (
        eventStart < slotEnd && eventEnd > slotStart &&
        eventStart.getFullYear() === date.getFullYear() &&
        eventStart.getMonth() === date.getMonth()
      )
    })
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
        <div className={`grid ${onlyTwoDays ? 'grid-cols-3' : 'grid-cols-8'} gap-2 flex-1`} style={{ height: '100%' }}>
          {/* Time column */}
          <div className="space-y-2">
            <div className="h-8"></div>
            {timeSlots.slice(6, 24).map((time, idx) => (
              <div key={time} className={`h-8 text-xs text-muted-foreground flex items-center border-t border-gray-100 ${idx === timeSlots.slice(6, 24).length - 1 ? 'border-b' : ''}`}>
                {time}
              </div>
            ))}
          </div>

          {/* Day columns */}
          {daysToShow.map((date) => (
            <div key={date.toISOString()} className="space-y-2">
              <div className="h-8 text-center">
                <div className="text-sm font-medium">{days[date.getDay()]}</div>
                <div className="text-xs text-muted-foreground">{date.getDate()}</div>
              </div>

              <div className="relative space-y-1">
                {timeSlots.slice(6, 24).map((time) => (
                  <div key={time} className="h-8 border-t border-gray-100 relative">
                    {getEventsForDayAndHour(date, time.split(":")[0]).map((event, idx) => (
                      <Dialog key={event.name + event.startTime + idx}>
                        <DialogTrigger asChild>
                          <div
                            className={`absolute inset-x-0 top-0 h-full rounded text-xs p-1 cursor-pointer hover:opacity-80`}
                            style={{ background: event.color, color: '#fff' }}
                            onClick={() => setSelectedEvent(event)}
                          >
                            <div className="truncate font-medium">{event.name}</div>
                            <div className="truncate opacity-75">
                              {new Date(event.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              -
                              {new Date(event.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>{event.name}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label>Typ</Label>
                              <Badge style={{ background: event.color, color: '#fff' }}>{event.type}</Badge>
                            </div>
                            <div>
                              <Label>Zeit</Label>
                              <p>
                                {new Date(event.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(event.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                            {event.description && (
                              <div>
                                <Label>Beschreibung</Label>
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
