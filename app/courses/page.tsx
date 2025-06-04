"use client"

import { useState } from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb"
import { Plus, Calendar, Edit, Trash2 } from "lucide-react"

interface Course {
  id: string
  name: string
  description: string
  professor: string
  totalPoints: number
  color: string
}

interface Assignment {
  id: string
  title: string
  description: string
  courseId: string
  courseName: string
  deadline: string
  totalPoints: number
  difficulty: "easy" | "medium" | "hard"
}

const mockCourses: Course[] = [
  {
    id: "1",
    name: "Advanced Mathematics",
    description: "Calculus, Linear Algebra, and Differential Equations",
    professor: "Dr. Smith",
    totalPoints: 100,
    color: "bg-blue-500",
  },
  {
    id: "2",
    name: "Physics",
    description: "Quantum Mechanics and Thermodynamics",
    professor: "Dr. Johnson",
    totalPoints: 100,
    color: "bg-green-500",
  },
]

const mockAssignments: Assignment[] = [
  {
    id: "1",
    title: "Calculus Problem Set 3",
    description: "Integration and differentiation problems",
    courseId: "1",
    courseName: "Advanced Mathematics",
    deadline: "2024-06-15",
    totalPoints: 25,
    difficulty: "medium",
  },
  {
    id: "2",
    title: "Quantum Mechanics Lab Report",
    description: "Analysis of wave function experiments",
    courseId: "2",
    courseName: "Physics",
    deadline: "2024-06-20",
    totalPoints: 30,
    difficulty: "hard",
  },
]

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>(mockCourses)
  const [assignments, setAssignments] = useState<Assignment[]>(mockAssignments)
  const [isAddingCourse, setIsAddingCourse] = useState(false)
  const [isAddingAssignment, setIsAddingAssignment] = useState(false)

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "hard":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
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
                <BreadcrumbPage>Courses & Assignments</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">
          <Tabs defaultValue="courses" className="w-full">
            <TabsList>
              <TabsTrigger value="courses">Courses</TabsTrigger>
              <TabsTrigger value="assignments">Assignments</TabsTrigger>
            </TabsList>

            <TabsContent value="courses" className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">My Courses</h2>
                <Dialog open={isAddingCourse} onOpenChange={setIsAddingCourse}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Course
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Course</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="course-name">Course Name</Label>
                        <Input id="course-name" placeholder="Enter course name" />
                      </div>
                      <div>
                        <Label htmlFor="course-description">Description</Label>
                        <Textarea id="course-description" placeholder="Course description" />
                      </div>
                      <div>
                        <Label htmlFor="professor">Professor</Label>
                        <Input id="professor" placeholder="Professor name" />
                      </div>
                      <div>
                        <Label htmlFor="total-points">Total Points</Label>
                        <Input id="total-points" type="number" placeholder="100" />
                      </div>
                      <Button className="w-full">Add Course</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {courses.map((course) => (
                  <Card key={course.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${course.color}`} />
                          <CardTitle className="text-lg">{course.name}</CardTitle>
                        </div>
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <CardDescription>{course.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Professor:</span>
                          <span>{course.professor}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Total Points:</span>
                          <span>{course.totalPoints}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="assignments" className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Assignments</h2>
                <Dialog open={isAddingAssignment} onOpenChange={setIsAddingAssignment}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Assignment
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Assignment</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="assignment-title">Title</Label>
                        <Input id="assignment-title" placeholder="Assignment title" />
                      </div>
                      <div>
                        <Label htmlFor="assignment-description">Description</Label>
                        <Textarea id="assignment-description" placeholder="Assignment description" />
                      </div>
                      <div>
                        <Label htmlFor="assignment-course">Course</Label>
                        <select className="w-full p-2 border rounded">
                          <option value="">Select a course</option>
                          {courses.map((course) => (
                            <option key={course.id} value={course.id}>
                              {course.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="assignment-deadline">Deadline</Label>
                        <Input id="assignment-deadline" type="datetime-local" />
                      </div>
                      <div>
                        <Label htmlFor="assignment-points">Points</Label>
                        <Input id="assignment-points" type="number" placeholder="25" />
                      </div>
                      <Button className="w-full">Add Assignment</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="space-y-4">
                {assignments.map((assignment) => (
                  <Card key={assignment.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{assignment.title}</CardTitle>
                          <CardDescription>{assignment.description}</CardDescription>
                        </div>
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Badge variant="outline">{assignment.courseName}</Badge>
                          <Badge className={getDifficultyColor(assignment.difficulty)}>{assignment.difficulty}</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(assignment.deadline).toLocaleDateString()}
                          </div>
                          <span>{assignment.totalPoints} pts</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
