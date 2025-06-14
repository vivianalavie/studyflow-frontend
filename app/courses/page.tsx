"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@clerk/nextjs"
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
import { Course, getCourses } from "@/app/api/courses"
import { toast } from "sonner"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Assignment } from "@/types/assignment"
import { getAssignments } from "@/app/api/assignments"

const courseColors = [
  { value: "blue", label: "Blue", class: "bg-blue-500" },
  { value: "green", label: "Green", class: "bg-green-500" },
  { value: "red", label: "Red", class: "bg-red-500" },
  { value: "yellow", label: "Yellow", class: "bg-yellow-400" },
  { value: "purple", label: "Purple", class: "bg-purple-500" },
  { value: "pink", label: "Pink", class: "bg-pink-500" },
  { value: "indigo", label: "Indigo", class: "bg-indigo-500" },
  { value: "teal", label: "Teal", class: "bg-teal-500" },
]

// Mapping von Farbnamen zu Tailwind-Klassen
const colorClassMap: Record<string, string> = {
  blue: "bg-blue-500",
  green: "bg-green-500",
  red: "bg-red-500",
  yellow: "bg-yellow-400",
  purple: "bg-purple-500",
  pink: "bg-pink-500",
  indigo: "bg-indigo-500",
  teal: "bg-teal-500",
}

export default function CoursesPage() {
  const { isLoaded, isSignedIn } = useAuth()
  const [courses, setCourses] = useState<Course[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [isAddingCourse, setIsAddingCourse] = useState(false)
  const [isAddingAssignment, setIsAddingAssignment] = useState(false)
  const [newCourse, setNewCourse] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    professorName: "",
    totalPoints: 0,
    totalWorkloadHours: 0,
    totalSelfWorkHours: 0,
    color: "blue"
  })
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<string | null>(null);
  const [isEditingCourse, setIsEditingCourse] = useState(false);
  const [editCourseId, setEditCourseId] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      if (!isLoaded || !isSignedIn) return

      try {
        const fetchedCourses = await getCourses()
        setCourses(fetchedCourses)
      } catch (error) {
        console.error('Error fetching courses:', error)
        toast.error('Error fetching courses')
      }
    }
    fetchCourses()
  }, [isLoaded, isSignedIn])

  useEffect(() => {
    const fetchAssignments = async () => {
      if (!isLoaded || !isSignedIn) return

      try {
        const fetchedAssignments = await getAssignments()
        // Füge den Kursnamen zu jedem Assignment hinzu
        const assignmentsWithCourseNames = fetchedAssignments.map(assignment => ({
          ...assignment,
          courseName: courses.find(course => course.id === assignment.courseId)?.name || "Unknown Course"
        }))
        setAssignments(assignmentsWithCourseNames)
      } catch (error) {
        console.error('Error fetching assignments:', error)
        toast.error('Error fetching assignments')
      }
    }

    if (courses.length > 0) {
      fetchAssignments()
    }
  }, [isLoaded, isSignedIn, courses])

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "VERY_EASY":
        return "bg-green-100 text-green-800"
      case "EASY":
        return "bg-green-100 text-green-800"
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800"
      case "HARD":
        return "bg-orange-100 text-orange-800"
      case "VERY_HARD":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Hilfsfunktion zum Vergleichen der Datumswerte
  const isEndDateBeforeStartDate = newCourse.startDate && newCourse.endDate && new Date(newCourse.endDate) < new Date(newCourse.startDate)

  const handleAddCourse = async () => {
    try {
      const token = await window.Clerk?.session?.getToken()
      if (!token) {
        toast.error("Not logged in")
        return
      }

      const payload = {
        id: null,
        createdBy: null,
        name: newCourse.name,
        description: newCourse.description,
        startDate: newCourse.startDate ? newCourse.startDate : null,
        endDate: newCourse.endDate ? newCourse.endDate : null,
        professorName: newCourse.professorName,
        totalPoints: newCourse.totalPoints,
        totalWorkloadHours: newCourse.totalWorkloadHours,
        totalSelfWorkHours: newCourse.totalSelfWorkHours,
        color: newCourse.color
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/courses/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        throw new Error('Error creating course')
      }

      toast.success("Course created successfully")
      setIsAddingCourse(false)
      // Felder zurücksetzen
      setNewCourse({
        name: "",
        description: "",
        startDate: "",
        endDate: "",
        professorName: "",
        totalPoints: 0,
        totalWorkloadHours: 0,
        totalSelfWorkHours: 0,
        color: "blue"
      })
      // Aktualisiere die Kursliste
      const fetchedCourses = await getCourses()
      setCourses(fetchedCourses)
    } catch (error) {
      console.error('Error creating course:', error)
      toast.error("Error creating course")
    }
  }

  const handleDeleteCourse = async () => {
    if (!courseToDelete) return;
    try {
      const token = await window.Clerk?.session?.getToken();
      if (!token) {
        toast.error("Not logged in");
        return;
      }
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/courses/delete/${courseToDelete}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Error deleting course');
      }
      toast.success("Course deleted successfully");
      setDeleteDialogOpen(false);
      setCourseToDelete(null);
      // Aktualisiere die Kursliste
      const fetchedCourses = await getCourses();
      setCourses(fetchedCourses);
    } catch (error) {
      console.error('Error deleting course:', error);
      toast.error("Error deleting course");
    }
  };

  const openEditCourseDialog = (course: Course) => {
    setNewCourse({
      name: course.name || "",
      description: course.description || "",
      startDate: course.startDate || "",
      endDate: course.endDate || "",
      professorName: course.professorName || "",
      totalPoints: course.totalPoints || 0,
      totalWorkloadHours: course.totalWorkloadHours || 0,
      totalSelfWorkHours: course.totalSelfWorkHours || 0,
      color: course.color || "blue"
    });
    setEditCourseId(course.id);
    setIsEditingCourse(true);
  };

  const handleUpdateCourse = async () => {
    if (!editCourseId) return;
    try {
      const token = await window.Clerk?.session?.getToken();
      if (!token) {
        toast.error("Not logged in");
        return;
      }
      const payload = {
        id: editCourseId,
        createdBy: null, // Wird im Backend gesetzt
        name: newCourse.name,
        description: newCourse.description,
        startDate: newCourse.startDate ? newCourse.startDate : null,
        endDate: newCourse.endDate ? newCourse.endDate : null,
        professorName: newCourse.professorName,
        totalPoints: newCourse.totalPoints,
        totalWorkloadHours: newCourse.totalWorkloadHours,
        totalSelfWorkHours: newCourse.totalSelfWorkHours,
        color: newCourse.color
      };
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/courses/edit/${editCourseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        throw new Error('Error updating course');
      }
      toast.success("Course updated successfully");
      setIsEditingCourse(false);
      setEditCourseId(null);
      setNewCourse({
        name: "",
        description: "",
        startDate: "",
        endDate: "",
        professorName: "",
        totalPoints: 0,
        totalWorkloadHours: 0,
        totalSelfWorkHours: 0,
        color: "blue"
      });
      // Aktualisiere die Kursliste
      const fetchedCourses = await getCourses();
      setCourses(fetchedCourses);
    } catch (error) {
      console.error('Error updating course:', error);
      toast.error("Error updating course");
    }
  };

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
                  <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="text-2xl">Add New Course</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-6 py-4">
                      <div className="col-span-2">
                        <Label htmlFor="course-name" className="text-base">Course Name</Label>
                        <Input 
                          id="course-name" 
                          placeholder="Enter course name"
                          value={newCourse.name}
                          onChange={(e) => setNewCourse({...newCourse, name: e.target.value})}
                          className="mt-2 h-10 text-base"
                        />
                      </div>
                      <div className="col-span-2">
                        <Label htmlFor="course-description" className="text-base">Description</Label>
                        <Textarea 
                          id="course-description" 
                          placeholder="Course description"
                          value={newCourse.description}
                          onChange={(e) => setNewCourse({...newCourse, description: e.target.value})}
                          className="mt-2 min-h-[100px] text-base"
                        />
                      </div>
                      <div>
                        <Label htmlFor="professor-name" className="text-base">Professor Name</Label>
                        <Input 
                          id="professor-name" 
                          placeholder="Professor name"
                          value={newCourse.professorName}
                          onChange={(e) => setNewCourse({...newCourse, professorName: e.target.value})}
                          className="mt-2 h-10 text-base"
                        />
                      </div>
                      <div>
                        <Label htmlFor="total-points" className="text-base">Total Points</Label>
                        <Input 
                          id="total-points" 
                          type="number" 
                          placeholder="100"
                          value={newCourse.totalPoints}
                          onChange={(e) => setNewCourse({...newCourse, totalPoints: parseInt(e.target.value) || 0})}
                          className="mt-2 h-10 text-base"
                        />
                      </div>
                      <div>
                        <Label htmlFor="workload-hours" className="text-base">Workload Hours</Label>
                        <Input 
                          id="workload-hours" 
                          type="number" 
                          placeholder="40"
                          value={newCourse.totalWorkloadHours}
                          onChange={(e) => setNewCourse({...newCourse, totalWorkloadHours: parseInt(e.target.value) || 0})}
                          className="mt-2 h-10 text-base"
                        />
                      </div>
                      <div>
                        <Label htmlFor="self-work-hours" className="text-base">Self Work Hours</Label>
                        <Input 
                          id="self-work-hours" 
                          type="number" 
                          placeholder="20"
                          value={newCourse.totalSelfWorkHours}
                          onChange={(e) => setNewCourse({...newCourse, totalSelfWorkHours: parseInt(e.target.value) || 0})}
                          className="mt-2 h-10 text-base"
                        />
                      </div>
                      <div>
                        <Label htmlFor="start-date" className="text-base">Start Date</Label>
                        <Input 
                          id="start-date" 
                          type="date"
                          value={newCourse.startDate}
                          onChange={(e) => setNewCourse({...newCourse, startDate: e.target.value})}
                          className="mt-2 h-10 text-base"
                        />
                      </div>
                      <div>
                        <Label htmlFor="end-date" className="text-base">End Date</Label>
                        <Input 
                          id="end-date" 
                          type="date"
                          value={newCourse.endDate}
                          onChange={(e) => setNewCourse({...newCourse, endDate: e.target.value})}
                          className="mt-2 h-10 text-base"
                        />
                      </div>
                      {isEndDateBeforeStartDate && (
                        <div className="col-span-2 mt-2 flex justify-center">
                          <span className="text-red-500 text-sm text-center">End date cannot be before start date!</span>
                        </div>
                      )}
                      <div className="col-span-2">
                        <Label className="text-base mb-4 block">Course Color</Label>
                        <RadioGroup 
                          value={newCourse.color} 
                          onValueChange={(value) => setNewCourse({...newCourse, color: value})}
                          className="grid grid-cols-4 gap-4"
                        >
                          {courseColors.map((color) => (
                            <div key={color.value} className="flex items-center justify-center">
                              <RadioGroupItem value={color.value} id={color.value} className="peer sr-only" />
                              <Label
                                htmlFor={color.value}
                                className={`flex flex-col items-center justify-center w-28 h-28 rounded-xl border-4 bg-popover cursor-pointer transition-all
                                  ${newCourse.color === color.value ? 'border-primary' : 'border-muted'}`}
                              >
                                <div className={`w-8 h-8 rounded-full ${color.class} mb-3`} />
                                <span
                                  className={
                                    newCourse.color === color.value
                                      ? "text-black font-bold"
                                      : "text-gray-400 font-normal"
                                  }
                                >
                                  {color.label}
                                </span>
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-6">
                      <Button variant="outline" onClick={() => setIsAddingCourse(false)} className="h-10 px-6">
                        Cancel
                      </Button>
                      <Button onClick={handleAddCourse} className="h-10 px-6" disabled={!!isEndDateBeforeStartDate}>
                        Add Course
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {courses.map((course) => {
                  const color = course.color || "blue";
                  const colorClass = colorClassMap[color] || colorClassMap["blue"];
                  return (
                    <Card key={course.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${colorClass}`} />
                            <CardTitle className="text-lg">{course.name}</CardTitle>
                          </div>
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost" onClick={() => openEditCourseDialog(course)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => { setCourseToDelete(course.id); setDeleteDialogOpen(true); }}>
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
                            <span>{course.professorName}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Total Points:</span>
                            <span>{course.totalPoints}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Workload Hours:</span>
                            <span>{course.totalWorkloadHours}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Self Work Hours:</span>
                            <span>{course.totalSelfWorkHours}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Duration:</span>
                            <span>{new Date(course.startDate).toLocaleDateString()} - {new Date(course.endDate).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
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
                          <span>{assignment.totalAchievablePoints} pts</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Delete Course</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col items-center mb-4">
                <span className="text-red-600 font-bold text-lg mb-2">Warning</span>
                <span className="text-center text-base text-black leading-relaxed">
                  If you delete this course, it will be permanently removed<br />
                  and all associated assignments will also be deleted!
                </span>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleDeleteCourse} className="bg-red-600 hover:bg-red-700 text-white" >
                  Delete course
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={isEditingCourse} onOpenChange={setIsEditingCourse}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Course</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-6 py-4">
                <div className="col-span-2">
                  <Label htmlFor="course-name" className="text-base">Course Name</Label>
                  <Input
                    id="course-name"
                    placeholder="Enter course name"
                    value={newCourse.name}
                    onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
                    className="mt-2 h-10 text-base"
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="course-description" className="text-base">Description</Label>
                  <Textarea
                    id="course-description"
                    placeholder="Course description"
                    value={newCourse.description}
                    onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                    className="mt-2 min-h-[100px] text-base"
                  />
                </div>
                <div>
                  <Label htmlFor="professor-name" className="text-base">Professor Name</Label>
                  <Input
                    id="professor-name"
                    placeholder="Professor name"
                    value={newCourse.professorName}
                    onChange={(e) => setNewCourse({ ...newCourse, professorName: e.target.value })}
                    className="mt-2 h-10 text-base"
                  />
                </div>
                <div>
                  <Label htmlFor="total-points" className="text-base">Total Points</Label>
                  <Input
                    id="total-points"
                    type="number"
                    placeholder="100"
                    value={newCourse.totalPoints}
                    onChange={(e) => setNewCourse({ ...newCourse, totalPoints: parseInt(e.target.value) || 0 })}
                    className="mt-2 h-10 text-base"
                  />
                </div>
                <div>
                  <Label htmlFor="workload-hours" className="text-base">Workload Hours</Label>
                  <Input
                    id="workload-hours"
                    type="number"
                    placeholder="40"
                    value={newCourse.totalWorkloadHours}
                    onChange={(e) => setNewCourse({ ...newCourse, totalWorkloadHours: parseInt(e.target.value) || 0 })}
                    className="mt-2 h-10 text-base"
                  />
                </div>
                <div>
                  <Label htmlFor="self-work-hours" className="text-base">Self Work Hours</Label>
                  <Input
                    id="self-work-hours"
                    type="number"
                    placeholder="20"
                    value={newCourse.totalSelfWorkHours}
                    onChange={(e) => setNewCourse({ ...newCourse, totalSelfWorkHours: parseInt(e.target.value) || 0 })}
                    className="mt-2 h-10 text-base"
                  />
                </div>
                <div>
                  <Label htmlFor="start-date" className="text-base">Start Date</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={newCourse.startDate}
                    onChange={(e) => setNewCourse({ ...newCourse, startDate: e.target.value })}
                    className="mt-2 h-10 text-base"
                  />
                </div>
                <div>
                  <Label htmlFor="end-date" className="text-base">End Date</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={newCourse.endDate}
                    onChange={(e) => setNewCourse({ ...newCourse, endDate: e.target.value })}
                    className="mt-2 h-10 text-base"
                  />
                </div>
                {isEndDateBeforeStartDate && (
                  <div className="col-span-2 mt-2 flex justify-center">
                    <span className="text-red-500 text-sm text-center">End date cannot be before start date!</span>
                  </div>
                )}
                <div className="col-span-2">
                  <Label className="text-base mb-4 block">Course Color</Label>
                  <RadioGroup
                    value={newCourse.color}
                    onValueChange={(value) => setNewCourse({ ...newCourse, color: value })}
                    className="grid grid-cols-4 gap-4"
                  >
                    {courseColors.map((color) => (
                      <div key={color.value} className="flex items-center justify-center">
                        <RadioGroupItem value={color.value} id={color.value} className="peer sr-only" />
                        <Label
                          htmlFor={color.value}
                          className={`flex flex-col items-center justify-center w-28 h-28 rounded-xl border-4 bg-popover cursor-pointer transition-all
                            ${newCourse.color === color.value ? 'border-primary' : 'border-muted'}`}
                        >
                          <div className={`w-8 h-8 rounded-full ${color.class} mb-3`} />
                          <span
                            className={
                              newCourse.color === color.value
                                ? "text-black font-bold"
                                : "text-gray-400 font-normal"
                            }
                          >
                            {color.label}
                          </span>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={() => setIsEditingCourse(false)} className="h-10 px-6">
                  Cancel
                </Button>
                <Button onClick={handleUpdateCourse} className="h-10 px-6" disabled={!!isEndDateBeforeStartDate}>
                  Update Course
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
