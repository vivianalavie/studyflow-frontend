"use client"

import { useState, useEffect, useRef, useLayoutEffect } from "react"
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
  courseId?: string
}

interface Course {
  id: string;
  name: string;
  color?: string;
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

// Helper function: HEX to RGBA with alpha
function hexToRgba(hex: string, alpha: number) {
  let c = hex.replace('#', '');
  if (c.length === 3) {
    c = c[0] + c[0] + c[1] + c[1] + c[2] + c[2];
  }
  const num = parseInt(c, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r},${g},${b},${alpha})`;
}

// Mapping from color names to HEX colors (like on the courses page)
const colorHexMap: Record<string, string> = {
  blue: "#3b82f6",
  green: "#22c55e",
  red: "#ef4444",
  yellow: "#facc15",
  purple: "#a21caf",
  pink: "#ec4899",
  indigo: "#6366f1",
  teal: "#14b8a6",
};

export function WeeklyCalendar({ onlyTwoDays = false, scrollToEventRequest, courses = [] }: { onlyTwoDays?: boolean, scrollToEventRequest?: { name: string, startTime: string }, courses?: Course[] }) {
  const { isLoaded, isSignedIn } = useAuth()
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const scrollRequestRef = useRef<{ name: string, startTime: string } | null>(null);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return
    getCalendarEvents()
      .then(data => {
        // Set course color as HEX value for AUTOMATIC events
        const eventsWithColor = data.map((event: CalendarEvent) => {
          if (event.type === "AUTOMATIC" && event.courseId && courses.length > 0) {
            const course = courses.find(c => c.id === event.courseId)
            if (course && course.color) {
              // Use mapping to always get a HEX value
              return { ...event, color: colorHexMap[course.color] || "#3b82f6" }
            }
          }
          return event
        })
        setEvents(eventsWithColor)
        console.log("Loaded events:", eventsWithColor)
      })
      .catch(() => setEvents([]))
  }, [isLoaded, isSignedIn, courses])

  useLayoutEffect(() => {
    if (!scrollToEventRequest) return;
    scrollRequestRef.current = scrollToEventRequest;
    const eventDate = new Date(scrollToEventRequest.startTime);
    // Check if appointment is in current week
    const weekStart = new Date(currentWeek);
    weekStart.setDate(currentWeek.getDate() - currentWeek.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    if (eventDate < weekStart || eventDate > weekEnd) {
      // Set week to the event's week
      const newWeek = new Date(eventDate);
      newWeek.setDate(eventDate.getDate() - eventDate.getDay());
      setCurrentWeek(newWeek);
      return;
    }
    // Scroll after rendering
    setTimeout(() => {
      const id = `event-${btoa(encodeURIComponent(scrollToEventRequest.name + '_' + scrollToEventRequest.startTime))}`;
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('ring-2', 'ring-red-500');
        // Make background darker
        const origBg = el.style.backgroundColor;
        el.style.backgroundColor = 'rgba(0, 40, 120, 0.85)'; // darker blue, alternatively: via filter
        setTimeout(() => {
          el.classList.remove('ring-2', 'ring-red-500');
          el.style.backgroundColor = origBg;
        }, 2000);
      }
      scrollRequestRef.current = null;
    }, 200);
  }, [scrollToEventRequest, currentWeek]);

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

  // Helper function: Filter events for a day
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

  // Helper function for robust day comparison (without time)
  function isSameDay(a: Date, b: Date) {
    return a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate();
  }

  // Helper function: Calculate percentage position and height for an event block (00:00-24:00)
  const getEventBlockStyle = (event: CalendarEvent) => {
    const dayStart = 0 // 00:00 in minutes
    const dayEnd = 24 * 60 // 24:00 in minutes
    const eventStart = new Date(event.startTime)
    const eventEnd = new Date(event.endTime)
    const startMinutes = eventStart.getHours() * 60 + eventStart.getMinutes()
    const endMinutes = eventEnd.getHours() * 60 + eventEnd.getMinutes()
    // Limit to visible area
    const topMinutes = Math.max(startMinutes, dayStart)
    const bottomMinutes = Math.min(endMinutes, dayEnd)
    const totalMinutes = dayEnd - dayStart
    if (bottomMinutes <= dayStart || topMinutes >= dayEnd) return null;
    const top = ((topMinutes - dayStart) / totalMinutes) * 100
    let height = ((bottomMinutes - topMinutes) / totalMinutes) * 100
    // Minimum 2px height
    const minHeightPercent = (2 / 768) * 100
    if (height < minHeightPercent) height = minHeightPercent
    // Determine color code
    let bgColor = "#3b82f6"; // Default: blue
    if (event.color) {
      if (event.color.startsWith("#")) {
        bgColor = event.color;
      } else if (colorHexMap[event.color]) {
        bgColor = colorHexMap[event.color];
      }
    }
    return {
      top: `${top}%`,
      height: `${height}%`,
      left: 0,
      right: 0,
      position: 'absolute' as const,
      background: event.color.startsWith('#') 
        ? hexToRgba(event.color, 1) 
        : hexToRgba(colorHexMap[event.color] || "#3b82f6", 1),
      color: '#fff',
      borderRadius: '0.5rem',
      padding: '0.25rem',
      fontSize: '0.75rem',
      cursor: 'pointer',
      opacity: 1,
      zIndex: 2,
      boxShadow: undefined,
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
          {/* Header */}
          <div className="bg-transparent" style={{ gridColumn: '1 / span 8', gridRow: 1, borderBottom: '1.5px solid var(--border)' }}></div>
          {daysToShow.map((date, idx) => (
            <div
              key={date.toISOString()}
              className="text-center font-medium bg-transparent"
              style={{ gridColumn: idx + 2, gridRow: 1, borderBottom: '1px solid var(--border)' }}
            >
              <div>{days[date.getDay()]}</div>
              <div className="text-xs text-muted-foreground">{date.getDate()}</div>
            </div>
          ))}

          {/* Hour grid */}
          {timeSlots.map((time, rowIdx) => (
            <React.Fragment key={rowIdx}>
              <div
                key={"time-" + time}
                className="text-xs text-muted-foreground flex items-center justify-end pr-2 bg-transparent"
                style={{
                  gridColumn: 1, gridRow: rowIdx + 2,
                  borderBottom: '1px solid var(--border)',
                }}
              >
                {time}
              </div>
              {daysToShow.map((date, colIdx) => (
                <div
                  key={date.toISOString() + '-' + rowIdx}
                  style={{
                    gridColumn: colIdx + 2,
                    gridRow: rowIdx + 2,
                    borderBottom: '1px solid var(--border)',
                    borderRight: colIdx === daysToShow.length - 1 ? undefined : '1px solid var(--border)',
                    background: 'transparent',
                    zIndex: 1,
                    pointerEvents: 'none',
                  }}
                />
              ))}
            </React.Fragment>
          ))}

          {/* Event overlay */}
          {daysToShow.map((date, colIdx) => (
            <div
              key={date.toISOString() + '-overlay'}
              style={{
                gridColumn: colIdx + 2,
                gridRow: '2 / span 24',
                position: 'relative',
                pointerEvents: 'none',
                zIndex: 3,
              }}
            >
              {events.map((event, idx) => {
                const eventStart = new Date(event.startTime)
                const eventEnd = new Date(event.endTime)
                // Check if event is visible on this day
                const dayStart = new Date(date)
                dayStart.setHours(0, 0, 0, 0)
                const dayEnd = new Date(date)
                dayEnd.setHours(23, 59, 59, 999)
                if (eventEnd <= dayStart || eventStart >= dayEnd) return null
                // Calculate top and height in percentage for this day
                let top = 0, height = 0
                if (isSameDay(eventStart, date) && isSameDay(eventEnd, date)) {
                  // Start and end day same (single day)
                  top = (eventStart.getHours() * 60 + eventStart.getMinutes()) / (24 * 60) * 100
                  height = ((eventEnd.getTime() - eventStart.getTime()) / (1000 * 60)) / (24 * 60) * 100
                } else if (isSameDay(eventStart, date)) {
                  // Start day
                  top = (eventStart.getHours() * 60 + eventStart.getMinutes()) / (24 * 60) * 100
                  height = (24 * 60 - (eventStart.getHours() * 60 + eventStart.getMinutes())) / (24 * 60) * 100
                } else if (isSameDay(eventEnd, date)) {
                  // End day
                  top = 0
                  height = ((eventEnd.getHours() * 60 + eventEnd.getMinutes())) / (24 * 60) * 100
                } else if (eventStart < dayStart && eventEnd > dayEnd) {
                  // Middle day
                  top = 0
                  height = 100
                } else {
                  // Fallback: full day
                  top = 0
                  height = 100
                }
                // Minimum 2px height
                const minHeightPercent = (2 / (24 * 48)) * 100
                if (height < minHeightPercent) height = minHeightPercent
                const showOnlyTitle = height < 6; // ca. 6% corresponds to ~28px at 480px height
                return (
                  <Dialog key={event.name + event.startTime + idx + '-' + colIdx}>
                    <DialogTrigger asChild>
                      <div
                        id={`event-${btoa(encodeURIComponent(event.name + '_' + event.startTime))}`}
                        style={{
                          position: 'absolute',
                          left: 2,
                          right: 2,
                          top: `${top}%`,
                          height: `${height}%`,
                          background: event.color.startsWith('#') 
                            ? hexToRgba(event.color, 0.85) 
                            : hexToRgba(colorHexMap[event.color] || "#3b82f6", 0.85),
                          color: '#fff',
                          borderRadius: '0.5rem',
                          padding: '0.25rem',
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          opacity: 1,
                          zIndex: 2,
                          boxShadow: undefined,
                          minHeight: '2px',
                          pointerEvents: 'auto', // Dialog remains clickable
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                        }}
                        onClick={() => setSelectedEvent(event)}
                      >
                        <div className="truncate font-medium">{event.name}</div>
                        {!showOnlyTitle && (
                          <div className="truncate opacity-75" style={{whiteSpace: 'pre-line'}}>
                            {(() => {
                              const start = new Date(event.startTime)
                              const end = new Date(event.endTime)
                              const startStr = `${start.getDate().toString().padStart(2, '0')}.${(start.getMonth()+1).toString().padStart(2, '0')}. ${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} until`
                              const endStr = `${end.getDate().toString().padStart(2, '0')}.${(end.getMonth()+1).toString().padStart(2, '0')}. ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                              return `${startStr}\n${endStr}`
                            })()}
                          </div>
                        )}
                      </div>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{event.name}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Type</Label>
                          <Badge style={{ background: event.color, color: '#fff' }}>{event.type}</Badge>
                        </div>
                        <div>
                          <Label>Time</Label>
                          <p>
                            {new Date(event.startTime).toLocaleString([], { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            {' - '}
                            {new Date(event.endTime).toLocaleString([], { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        <div>
                          <Label>Description</Label>
                          {event.description && (
                            <p>{event.description}</p>
                          )}
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                )
              })}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
