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

  // Hilfsfunktion: Events für einen Tag filtern
  const getEventsForDay = (date: Date) => {
    return events.filter(event => {
      const eventStart = new Date(event.startTime)
      return (
        eventStart.getFullYear() === date.getFullYear() &&
        eventStart.getMonth() === date.getMonth() &&
        eventStart.getDate() === date.getDate()
      )
    })
  }

  // Hilfsfunktion: Prozentuale Position und Höhe für einen Event-Block berechnen (00:00-24:00)
  const getEventBlockStyle = (event: CalendarEvent) => {
    const dayStart = 0 // 00:00 in Minuten
    const dayEnd = 24 * 60 // 24:00 in Minuten
    const eventStart = new Date(event.startTime)
    const eventEnd = new Date(event.endTime)
    const startMinutes = eventStart.getHours() * 60 + eventStart.getMinutes()
    const endMinutes = eventEnd.getHours() * 60 + eventEnd.getMinutes()
    // Begrenze auf den sichtbaren Bereich
    const topMinutes = Math.max(startMinutes, dayStart)
    const bottomMinutes = Math.min(endMinutes, dayEnd)
    const totalMinutes = dayEnd - dayStart
    if (bottomMinutes <= dayStart || topMinutes >= dayEnd) return null;
    const top = ((topMinutes - dayStart) / totalMinutes) * 100
    let height = ((bottomMinutes - topMinutes) / totalMinutes) * 100
    // Mindestens 2px Höhe
    const minHeightPercent = (2 / 768) * 100
    if (height < minHeightPercent) height = minHeightPercent
    return {
      top: `${top}%`,
      height: `${height}%`,
      left: 0,
      right: 0,
      position: 'absolute' as const,
      background: event.color,
      color: '#fff',
      borderRadius: '0.5rem',
      padding: '0.25rem',
      fontSize: '0.75rem',
      cursor: 'pointer',
      opacity: 0.95,
      zIndex: 2,
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
    }
  }

  return (
    <Card className="h-full border-none shadow-none bg-transparent">
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
        <div className="relative w-full h-full" style={{ minHeight: 32 * 24 + 40 }}>
          {/* Kopfzeile: Wochentage */}
          <div className="flex pl-[40px] mb-2" style={{ height: 40 }}>
            {daysToShow.map((date) => (
              <div key={date.toISOString()} className="flex-1 text-center font-medium flex flex-col justify-center">
                <span>{days[date.getDay()]}</span>
                <span className="text-xs text-muted-foreground">{date.getDate()}</span>
              </div>
            ))}
          </div>
          {/* Trennlinie */}
          <div className="w-full h-px bg-gray-600 mb-1" style={{ marginLeft: 40 }}></div>
          {/* Raster: Uhrzeiten + Linien */}
          <div className="absolute inset-x-0" style={{ top: 40, zIndex: 0, width: '100%', height: 32 * 24 }}>
            {timeSlots.map((time, idx) => (
              <div key={time} className="flex items-center h-8 text-xs text-muted-foreground w-full">
                <span style={{ minWidth: 40 }}>{time}</span>
                {daysToShow.map((date) => (
                  <div key={date.toISOString()} className="flex-1 border-b border-gray-500/40 h-full"></div>
                ))}
              </div>
            ))}
          </div>
          {/* Events absolut darüber, mit Offset für Kopfzeile */}
          <div className="absolute left-[40px]" style={{ top: 40, width: 'calc(100% - 40px)', height: 32 * 24, zIndex: 10 }}>
            <div className="relative w-full h-full">
              {daysToShow.map((date) => (
                <div key={date.toISOString()} className="absolute" style={{ left: `${(daysToShow.indexOf(date) / daysToShow.length) * 100}%`, width: `${100 / daysToShow.length}%`, height: '100%' }}>
                  {getEventsForDay(date).map((event, idx) => {
                    const style = getEventBlockStyle(event);
                    if (!style) return null;
                    return (
                      <Dialog key={event.name + event.startTime + idx}>
                        <DialogTrigger asChild>
                          <div
                            style={style}
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
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
