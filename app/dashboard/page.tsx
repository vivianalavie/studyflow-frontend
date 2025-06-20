"use client"

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { WeeklyCalendar } from "@/components/weekly-calendar"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { useState, useEffect } from "react"
import { CheckCircle, Circle, Play } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { getAssignments } from "@/app/api/assignments"
import { Assignment } from "@/types/assignment"
import { Course, getCourses } from "@/app/api/courses"

// Mapping von Farbnamen zu Tailwind-Klassen für die Badge-Umrandung
const borderColorClassMap: Record<string, string> = {
  blue: "border-blue-500 text-blue-500",
  green: "border-green-500 text-green-500",
  red: "border-red-500 text-red-500",
  yellow: "border-yellow-400 text-yellow-400",
  purple: "border-purple-500 text-purple-500",
  pink: "border-pink-500 text-pink-500",
  indigo: "border-indigo-500 text-indigo-500",
  teal: "border-teal-500 text-teal-500",
}

export default function DashboardPage() {
  // Hardcodierte ToDos
  const [todos, setTodos] = useState([
    { id: 1, text: "Mathe Zusammenfassung fertig machen", done: false },
    { id: 2, text: "Einkaufen: Brot, Milch, Eier", done: false },
  ])

  // Assignments für Algorithm-Bereich
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  useEffect(() => {
    async function fetchData() {
      try {
        const [assignmentsRaw, coursesRaw] = await Promise.all([
          getAssignments(),
          getCourses()
        ])
        setCourses(coursesRaw)
        // Mappe courseName, courseColor, courseTotalPoints wie auf der Assignments-Seite
        const assignmentsWithCourseInfo = assignmentsRaw.map(assignment => {
          const course = coursesRaw.find(course => course.id === assignment.courseId)
          return {
            ...assignment,
            courseName: course?.name || "Unknown Course",
            courseColor: course?.color || "blue",
            courseTotalPoints: course?.totalPoints || 0
          }
        })
        setAssignments(assignmentsWithCourseInfo)
      } catch {
        setAssignments([])
      }
    }
    fetchData()
  }, [])

  function toggleTodo(id: number) {
    setTodos(todos => todos.map(todo => todo.id === id ? { ...todo, done: !todo.done } : todo))
  }

  function getDifficultyColor(difficulty: Assignment["difficulty"]) {
    switch (difficulty) {
      case "VERY_EASY": return "bg-green-500 text-white border-green-500";
      case "EASY": return "bg-green-100 text-green-800 border-green-200";
      case "NORMAL": return "bg-blue-100 text-blue-800 border-blue-300";
      case "DIFFICULT": return "bg-red-100 text-red-800 border-red-200";
      case "VERY_DIFFICULT": return "bg-red-600 text-white border-red-600";
      default: return "bg-gray-100 text-gray-800 border-gray-300";
    }
  }

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
                <BreadcrumbPage>Dashboard</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 h-full">
          <div className="flex flex-row gap-4 h-full flex-1">
            <div className="w-1/2 h-full flex flex-col flex-1">
              {/* To-Do Bereich */}
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-4">To-Dos</h2>
                <div className="space-y-3">
                  {todos.map(todo => (
                    <Card key={todo.id} className="shadow-sm border border-gray-200">
                      <CardContent className="flex items-center justify-between py-1 px-2 min-h-0 h-8">
                        <span className={todo.done ? "line-through text-muted-foreground" : ""}>{todo.text}</span>
                        <button onClick={() => toggleTodo(todo.id)} className="ml-2" aria-label="Abhaken">
                          {todo.done ? (
                            <CheckCircle className="text-green-500 w-5 h-5" />
                          ) : (
                            <Circle className="text-gray-400 w-5 h-5" />
                          )}
                        </button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
              {/* Algorithm Bereich */}
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-4">Algorithm</h2>
                <div className="space-y-3">
                  {assignments.map(assignment => (
                    <Card key={assignment.id} className="shadow-sm border border-gray-200">
                      <CardContent className="flex items-center justify-between py-2 px-3 min-h-0 h-12">
                        <div className="flex flex-col gap-1">
                          <span className="font-medium text-base">{assignment.title}</span>
                          <div className="flex gap-2 items-center">
                            <Badge variant="outline" className={borderColorClassMap[assignment.courseColor || "blue"]}>
                              {assignment.courseName ? assignment.courseName : "Kein Kurs"}
                            </Badge>
                            <Badge className={getDifficultyColor(assignment.difficulty)}>{assignment.difficulty}</Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(assignment.deadline).toLocaleDateString()}
                            </span>
                            <span className="text-xs">{assignment.totalAchievablePoints}/{assignment.courseTotalPoints} pts</span>
                          </div>
                        </div>
                        <button className="ml-4" aria-label="Algorithmus starten">
                          <Play className="w-6 h-6 text-primary" />
                        </button>
                      </CardContent>
                    </Card>
                  ))}
                  {assignments.length === 0 && <div className="text-muted-foreground text-sm">Keine Assignments gefunden.</div>}
                </div>
              </div>
            </div>
            <div className="w-1/2 h-full flex flex-col flex-1">
              <WeeklyCalendar />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
