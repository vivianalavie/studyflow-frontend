"use client"

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { WeeklyCalendar } from "@/components/weekly-calendar"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { useState, useEffect, useRef } from "react"
import { CheckCircle, Circle, PlayCircle, Plus, Check, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { getAssignments, generateScheduleForAssignment } from "@/app/api/assignments"
import { Assignment } from "@/types/assignment"
import { Course, getCourses } from "@/app/api/courses"
import { useAuth } from "@clerk/nextjs"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { createTodo, getTodos, updateTodo, deleteTodo, ToDo } from "@/app/api/todos"
import { Button } from "@/components/ui/button"

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
  const { isLoaded, isSignedIn } = useAuth();
  // ToDos State mit Backend-Typ
  const [todos, setTodos] = useState<ToDo[]>([]);

  // Assignments für Algorithm-Bereich
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [algoDialogOpen, setAlgoDialogOpen] = useState(false);
  const [algoSuccess, setAlgoSuccess] = useState(false);
  const algoTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [calendarKey, setCalendarKey] = useState(0);
  const [showAddTodo, setShowAddTodo] = useState(false);
  const [newTodoText, setNewTodoText] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [deleteCountdown, setDeleteCountdown] = useState<string | null>(null);
  const [deleteTimer, setDeleteTimer] = useState<NodeJS.Timeout | null>(null);
  const [deleteSeconds, setDeleteSeconds] = useState<number>(3);
  const isDeletingRef = useRef<boolean>(false);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    async function fetchData() {
      try {
        const [assignmentsRaw, coursesRaw, todosRaw] = await Promise.all([
          getAssignments(),
          getCourses(),
          getTodos()
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
        setTodos(todosRaw)
      } catch {
        setAssignments([])
        setTodos([])
      }
    }
    fetchData()
  }, [isLoaded, isSignedIn])

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

  async function handleAddTodo() {
    if (!newTodoText.trim()) return;
    setIsAdding(true);
    try {
      const created = await createTodo(newTodoText);
      if (!created) throw new Error("Error creating");
      // Nach dem Anlegen ToDos neu laden
      const todosRaw = await getTodos();
      setTodos(todosRaw);
      setNewTodoText("");
      setShowAddTodo(false);
      toast.success("Todo created successfully");
    } catch (e) {
      toast.error("Error creating todo");
    } finally {
      setIsAdding(false);
    }
  }

  async function handleUpdateTodo(id: string) {
    if (!editingText.trim()) return;
    setIsAdding(true);
    try {
      const success = await updateTodo(id, editingText);
      if (!success) throw new Error("Error updating");
      const todosRaw = await getTodos();
      setTodos(todosRaw);
      setEditingId(null);
      setEditingText("");
      toast.success("Todo updated successfully");
    } catch (e) {
      toast.error("Error updating todo");
    } finally {
      setIsAdding(false);
    }
  }

  async function handleDeleteTodo(id: string) {
    if (deleteCountdown === id) {
      // Zweiter Klick - Abbruch
      if (deleteTimer) clearTimeout(deleteTimer);
      setDeleteCountdown(null);
      setDeleteTimer(null);
      setDeleteSeconds(3);
      isDeletingRef.current = false;
      return;
    }

    // Erster Klick - Countdown starten
    setDeleteCountdown(id);
    setDeleteSeconds(3);
    isDeletingRef.current = false;
    
    const timer = setInterval(() => {
      setDeleteSeconds(prev => {
        if (prev <= 1) {
          // Countdown abgelaufen - ToDo löschen
          clearInterval(timer);
          if (!isDeletingRef.current) {
            isDeletingRef.current = true;
            handleDeleteTodoFinal(id);
          }
          return prev;
        }
        return prev - 1;
      });
    }, 1000);
    
    setDeleteTimer(timer);
  }

  async function handleDeleteTodoFinal(id: string) {
    try {
      const success = await deleteTodo(id);
      if (!success) throw new Error("Error deleting");
      const todosRaw = await getTodos();
      setTodos(todosRaw);
      toast.success("Todo deleted successfully");
    } catch (e) {
      toast.error("Error deleting todo");
    } finally {
      setDeleteCountdown(null);
      setDeleteTimer(null);
      setDeleteSeconds(3);
      isDeletingRef.current = false;
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
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold">To-Dos</h2>
                  <Button
                    onClick={() => setShowAddTodo(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>
                <div className="space-y-3">
                  {showAddTodo && (
                    <Card className="shadow-sm border border-gray-200">
                      <CardContent className="flex items-center justify-between py-1 px-2 min-h-0 h-8 gap-2">
                        <Input
                          value={newTodoText}
                          onChange={e => setNewTodoText(e.target.value)}
                          placeholder="New todo..."
                          className="flex-1"
                          onKeyDown={e => { if (e.key === 'Enter') handleAddTodo(); }}
                          disabled={isAdding}
                          autoFocus
                        />
                        <button
                          className="ml-2 text-green-600 hover:text-green-800 disabled:opacity-50"
                          aria-label="Speichern"
                          onClick={handleAddTodo}
                          disabled={isAdding || !newTodoText.trim()}
                        >
                          <Check className="w-5 h-5" />
                        </button>
                      </CardContent>
                    </Card>
                  )}
                  {todos.map(todo => (
                    <Card key={todo.id} className="shadow-sm border border-gray-200">
                      <CardContent className="flex items-center justify-between py-1 px-2 min-h-0 h-8 gap-2">
                        {editingId === todo.id ? (
                          <>
                            <Input
                              value={editingText}
                              onChange={e => setEditingText(e.target.value)}
                              className="flex-1"
                              onKeyDown={e => { if (e.key === 'Enter') handleUpdateTodo(todo.id); }}
                              autoFocus
                              disabled={isAdding}
                            />
                            <button
                              className="ml-2 text-green-600 hover:text-green-800 disabled:opacity-50"
                              aria-label="Speichern"
                              onClick={() => handleUpdateTodo(todo.id)}
                              disabled={isAdding || !editingText.trim()}
                            >
                              <Check className="w-5 h-5" />
                            </button>
                          </>
                        ) : (
                          <span
                            className="flex-1 cursor-pointer"
                            onClick={() => { setEditingId(todo.id); setEditingText(todo.text); }}
                          >
                            {todo.text}
                          </span>
                        )}
                        {editingId !== todo.id && (
                          <button
                            className={`ml-4 p-1 rounded-full transition ${
                              deleteCountdown === todo.id 
                                ? 'bg-red-500 text-white' 
                                : 'text-muted-foreground hover:text-red-500 hover:bg-red-50'
                            }`}
                            aria-label="Löschen"
                            onClick={() => handleDeleteTodo(todo.id)}
                          >
                            {deleteCountdown === todo.id ? (
                              <span className="text-xs font-bold">{deleteSeconds}s</span>
                            ) : (
                              <Trash2 className="w-8 h-8" />
                            )}
                          </button>
                        )}
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
                    <Card key={assignment.id} className="shadow-sm border">
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
                        <button
                          className="ml-4 text-muted-foreground hover:text-primary transition"
                          aria-label="Algorithmus starten"
                          onClick={async () => {
                            setAlgoDialogOpen(true);
                            setAlgoSuccess(false);
                            if (algoTimeoutRef.current) clearTimeout(algoTimeoutRef.current);
                            try {
                              await generateScheduleForAssignment(assignment.id)
                              setAlgoSuccess(true);
                              setCalendarKey((k) => k + 1);
                              algoTimeoutRef.current = setTimeout(() => setAlgoDialogOpen(false), 3000);
                              toast.success("Algorithm successfully applied!");
                            } catch (e) {
                              setAlgoDialogOpen(false);
                              toast.error("Algorithm failed. Please try again.");
                            }
                          }}
                        >
                          <PlayCircle className="w-8 h-8 rounded-full transition" strokeWidth={1.5} />
                        </button>
                      </CardContent>
                    </Card>
                  ))}
                  {assignments.length === 0 && <div className="text-muted-foreground text-sm">Keine Assignments gefunden.</div>}
                </div>
              </div>
            </div>
            <div className="w-1/2 h-full flex flex-col flex-1">
              <WeeklyCalendar key={calendarKey} courses={courses} />
            </div>
          </div>
        </div>
      </SidebarInset>
      <Dialog open={algoDialogOpen} onOpenChange={setAlgoDialogOpen}>
        <DialogContent className="flex flex-col items-center gap-4 max-w-xs animate-fade-in">
          {algoSuccess ? (
            <>
              <Loader2 className="w-10 h-10 text-green-500 animate-pulse" />
              <span className="text-lg font-medium text-green-600">Algorithm successfully applied!</span>
            </>
          ) : (
            <>
              <Loader2 className="animate-spin w-10 h-10 text-primary" />
              <span className="text-lg font-medium">Algorithm is running...</span>
            </>
          )}
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  )
}
