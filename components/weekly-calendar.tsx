"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import axios from "axios"
import React from "react"
import { useAuth } from "@clerk/nextjs"

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
  const { isLoaded, isSignedIn } = useAuth()
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return
    getCalendarEvents()
      .then(data => {
        setEvents(data)
        console.log("Geladene Events:", data)
      })
      .catch(() => setEvents([]))
  }, [isLoaded, isSignedIn])

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
    <Card className="h-full min-h-full border-none shadow-none bg-transparent" style={{height: '100%', background: 'transparent'}}>
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
      <CardContent className="h-full min-h-full bg-transparent" style={{height: '100%', background: 'transparent'}}>
        <div
          className="grid w-full h-full min-h-full bg-transparent"
          style={{
            display: 'grid',
            gridTemplateColumns: '60px repeat(7, 1fr)',
            gridTemplateRows: '40px repeat(24, 48px)',
            borderCollapse: 'collapse',
            minHeight: 40 + 48 * 24,
            height: '100%',
            position: 'relative',
            background: 'transparent',
          }}
        >
          {/* Kopfzeile */}
          <div className="border-b border-gray-600 bg-transparent" style={{ gridColumn: 1, gridRow: 1 }}></div>
          {daysToShow.map((date, idx) => (
            <div
              key={date.toISOString()}
              className="border-b border-gray-600 text-center font-medium bg-transparent"
              style={{ gridColumn: idx + 2, gridRow: 1 }}
            >
              <div>{days[date.getDay()]}</div>
              <div className="text-xs text-muted-foreground">{date.getDate()}</div>
            </div>
          ))}

          {/* Stundenraster */}
          {timeSlots.map((time, rowIdx) => (
            <React.Fragment key={rowIdx}>
              <div
                key={"time-" + time}
                className="border-b border-gray-600 text-xs text-muted-foreground flex items-center justify-end pr-2 bg-transparent"
                style={{ gridColumn: 1, gridRow: rowIdx + 2 }}
              >
                {time}
              </div>
              {daysToShow.map((date, colIdx) => (
                <div
                  key={"slot-" + colIdx + "-" + rowIdx}
                  className="border-b border-gray-600 bg-transparent"
                  style={{ gridColumn: colIdx + 2, gridRow: rowIdx + 2 }}
                ></div>
              ))}
            </React.Fragment>
          ))}

          {/* Events */}
          {events.map((event, idx) => {
            const eventStart = new Date(event.startTime)
            const eventEnd = new Date(event.endTime)
            const blocks = []
            for (let dayIdx = 0; dayIdx < daysToShow.length; dayIdx++) {
              const day = daysToShow[dayIdx]
              // Start und Ende des aktuellen Tages
              const dayStart = new Date(day)
              dayStart.setHours(0, 0, 0, 0)
              const dayEnd = new Date(day)
              dayEnd.setHours(23, 59, 59, 999)
              // Prüfe, ob das Event an diesem Tag sichtbar ist
              if (eventEnd < dayStart || eventStart > dayEnd) continue
              let blockStart = 0
              let blockEnd = 24
              if (eventStart.toDateString() === day.toDateString() && eventEnd.toDateString() === day.toDateString()) {
                // Start- und Endtag gleich
                blockStart = eventStart.getHours() + eventStart.getMinutes() / 60
                blockEnd = eventEnd.getHours() + eventEnd.getMinutes() / 60
              } else if (eventStart.toDateString() === day.toDateString() && eventEnd > dayEnd) {
                // Starttag, Event geht über diesen Tag hinaus
                blockStart = eventStart.getHours() + eventStart.getMinutes() / 60
                if (blockStart < 0.01) blockStart = 0 // Wenn Startzeit Mitternacht ist, wirklich ganz oben
                blockEnd = 24
              } else if (eventEnd.toDateString() === day.toDateString() && eventStart < dayStart) {
                // Endtag, Event hat vor diesem Tag begonnen
                blockStart = 0
                blockEnd = eventEnd.getHours() + eventEnd.getMinutes() / 60
              } else if (eventStart < dayStart && eventEnd > dayEnd) {
                // Zwischentag, Event geht über den ganzen Tag
                blockStart = 0
                blockEnd = 24
              } else {
                // Fallback: voller Tag
                blockStart = 0
                blockEnd = 24
              }
              if (blockEnd === blockStart) blockEnd = blockStart + 0.25
              // Grid-Zeilen berechnen
              let gridRowStart = 2 + blockStart
              let gridRowEnd = 2 + blockEnd
              gridRowStart = Math.max(2, Math.min(gridRowStart, 26))
              gridRowEnd = Math.max(gridRowStart + 0.01, Math.min(gridRowEnd, 26))
              blocks.push(
                <Dialog key={event.name + event.startTime + idx + '-' + dayIdx}>
                  <DialogTrigger asChild>
                    <div
                      style={{
                        gridColumn: dayIdx + 2,
                        gridRow: `${gridRowStart} / ${gridRowEnd}`,
                        background: event.color,
                        color: '#fff',
                        borderRadius: '0.5rem',
                        padding: '0.25rem',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        opacity: 0.95,
                        zIndex: 2,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        minHeight: '2px',
                        position: 'relative',
                      }}
                      onClick={() => setSelectedEvent(event)}
                    >
                      <div className="truncate font-medium">{event.name}</div>
                      <div className="truncate opacity-75" style={{whiteSpace: 'pre-line'}}>
                        {/* Start- und Enddatum (ohne Jahr) jeweils in eigener Zeile, 'till' am Ende der ersten Zeile */}
                        {(() => {
                          const start = new Date(event.startTime)
                          const end = new Date(event.endTime)
                          const startStr = `${start.getDate().toString().padStart(2, '0')}.${(start.getMonth()+1).toString().padStart(2, '0')}. ${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} until`
                          const endStr = `${end.getDate().toString().padStart(2, '0')}.${(end.getMonth()+1).toString().padStart(2, '0')}. ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                          return `${startStr}\n${endStr}`
                        })()}
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
            }
            return blocks
          })}
        </div>
      </CardContent>
    </Card>
  )
}
