"use client"

import { useState } from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface CalendarEvent {
  id: string
  title: string
  type: "study" | "deadline" | "blocker"
  date: string
  time?: string
  course?: string
}

const mockEvents: CalendarEvent[] = [
  {
    id: "1",
    title: "Math Study Session",
    type: "study",
    date: "2024-06-10",
    time: "09:00",
    course: "Mathematics",
  },
  {
    id: "2",
    title: "Physics Assignment Due",
    type: "deadline",
    date: "2024-06-15",
    time: "23:59",
    course: "Physics",
  },
  {
    id: "3",
    title: "Gym Session",
    type: "blocker",
    date: "2024-06-12",
    time: "18:00",
  },
]

export default function MonthlyCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events] = useState<CalendarEvent[]>(mockEvents)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day)
    }

    return days
  }

  const navigateMonth = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate)
    newDate.setMonth(currentDate.getMonth() + (direction === "next" ? 1 : -1))
    setCurrentDate(newDate)
  }

  const getEventsForDate = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`
    return events.filter((event) => event.date === dateStr)
  }

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

  const days = getDaysInMonth(currentDate)
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>Monthly Calendar</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => navigateMonth("prev")}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => navigateMonth("next")}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2">
                {/* Day headers */}
                {dayNames.map((day) => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                    {day}
                  </div>
                ))}

                {/* Calendar days */}
                {days.map((day, index) => (
                  <div
                    key={index}
                    className={`min-h-24 p-2 border rounded-lg ${day ? "hover:bg-muted/50 cursor-pointer" : ""}`}
                    onClick={() =>
                      day &&
                      setSelectedDate(
                        `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`,
                      )
                    }
                  >
                    {day && (
                      <>
                        <div className="text-sm font-medium mb-1">{day}</div>
                        <div className="space-y-1">
                          {getEventsForDate(day).map((event) => (
                            <Dialog key={event.id}>
                              <DialogTrigger asChild>
                                <Badge
                                  className={`text-xs cursor-pointer block truncate ${getEventColor(event.type)}`}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {event.title}
                                </Badge>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>{event.title}</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <span className="font-medium">Type: </span>
                                    <Badge className={getEventColor(event.type)}>
                                      {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                                    </Badge>
                                  </div>
                                  <div>
                                    <span className="font-medium">Date: </span>
                                    {new Date(event.date).toLocaleDateString()}
                                  </div>
                                  {event.time && (
                                    <div>
                                      <span className="font-medium">Time: </span>
                                      {event.time}
                                    </div>
                                  )}
                                  {event.course && (
                                    <div>
                                      <span className="font-medium">Course: </span>
                                      {event.course}
                                    </div>
                                  )}
                                </div>
                              </DialogContent>
                            </Dialog>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
