"use client"

import { useState, useEffect } from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Clock, User, Calendar, Save, Loader2, BookOpen, Sun, Moon, CloudSun, CloudMoon } from "lucide-react"
import { toast } from "sonner"
import { getUserPreferences, updateUserPreferences, UserPreferences } from "@/app/api/preferences"
import { useAuth } from "@clerk/nextjs"

const weekdays = [
  { value: "monday", label: "Monday" },
  { value: "tuesday", label: "Tuesday" },
  { value: "wednesday", label: "Wednesday" },
  { value: "thursday", label: "Thursday" },
  { value: "friday", label: "Friday" },
  { value: "saturday", label: "Saturday" },
  { value: "sunday", label: "Sunday" },
]

const generateTimeOptions = () => {
  const options = []
  for (let i = 0.5; i <= 6; i += 0.5) {
    options.push({
      value: i.toString(),
      label: i === 1 ? "1 hour" : `${i} hours`
    })
  }
  return options
}

const studyDurationOptions = generateTimeOptions();

const studyPreferenceOptions = [
  { value: "MORNING", label: "Morning", icon: Sun },
  { value: "AFTERNOON", label: "Afternoon", icon: CloudSun },
  { value: "EVENING", label: "Evening", icon: CloudMoon },
  { value: "NIGHT", label: "Night", icon: Moon },
];

export default function SettingsPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<Partial<UserPreferences>>({})
  const [studyPreferences, setStudyPreferences] = useState([
    { preferenceType: "", priority: 1 },
    { preferenceType: "", priority: 2 },
  ]);
  const [loadingStudyPrefs, setLoadingStudyPrefs] = useState(true);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    loadPreferences()
    const fetchStudyPrefs = async () => {
      setLoadingStudyPrefs(true);
      try {
        const token = await window.Clerk?.session?.getToken();
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
        const res = await fetch(`${API_BASE_URL}/api/user-study-preferences/my`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const prefs = await res.json();
          if (prefs.length === 2) {
            setStudyPreferences([
              { preferenceType: prefs[0].preferenceType, priority: 1 },
              { preferenceType: prefs[1].preferenceType, priority: 2 },
            ]);
          }
        }
      } catch (e) {
        toast.error("Failed to load study preferences");
      } finally {
        setLoadingStudyPrefs(false);
      }
    };
    fetchStudyPrefs();
  }, [isLoaded, isSignedIn])

  const loadPreferences = async () => {
    try {
      setLoading(true)
      const prefs = await getUserPreferences()
      if (prefs) {
        setPreferences(prefs)
        setFormData(prefs)
      }
    } catch (error) {
      toast.error("Failed to load preferences")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!formData.username || !formData.maxStudyDuration || !formData.startLearningTime || !formData.endLearningTime) {
      toast.error("Please fill out all required fields")
      return
    }
    if (!studyPreferences[0].preferenceType || !studyPreferences[1].preferenceType) {
      toast.error("Please select both study preferences.");
      return;
    }
    if (studyPreferences[0].preferenceType === studyPreferences[1].preferenceType) {
      toast.error("Please choose two preferences that differ!");
      return;
    }
    try {
      setSaving(true)
      const success = await updateUserPreferences(formData as UserPreferences)
      // Study Preferences speichern
      const token = await window.Clerk?.session?.getToken();
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      const res = await fetch(`${API_BASE_URL}/api/user-study-preferences/udpate`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify([
          { preferenceType: studyPreferences[0].preferenceType, priority: 1 },
          { preferenceType: studyPreferences[1].preferenceType, priority: 2 },
        ]),
      });
      if (success && res.ok) {
        toast.success("Preferences saved successfully")
        await loadPreferences() // Reload to get updated data
      } else {
        toast.error("Failed to save preferences")
      }
    } catch (error) {
      toast.error("Failed to save preferences")
    } finally {
      setSaving(false)
    }
  }

  const handleWeekdayToggle = (weekday: string) => {
    const currentBlackoutDays = formData.blackoutWeekdays || []
    const newBlackoutDays = currentBlackoutDays.includes(weekday)
      ? currentBlackoutDays.filter(day => day !== weekday)
      : [...currentBlackoutDays, weekday]
    
    setFormData(prev => ({
      ...prev,
      blackoutWeekdays: newBlackoutDays
    }))
  }

  const handleStudyPrefChange = (priority: 1 | 2, value: string) => {
    setStudyPreferences(prev => {
      const other = prev[priority === 1 ? 1 : 0].preferenceType;
      if (other === value) {
        toast.error("Please choose two preferences that differ!");
        return prev;
      }
      return prev.map((p, i) => i === priority - 1 ? { ...p, preferenceType: value } : p);
    });
  };

  const handleSaveStudyPrefs = async () => {
    if (!studyPreferences[0].preferenceType || !studyPreferences[1].preferenceType) {
      toast.error("Please select both study preferences.");
      return;
    }
    try {
      setLoadingStudyPrefs(true);
      const token = await window.Clerk?.session?.getToken();
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      const res = await fetch(`${API_BASE_URL}/api/user-study-preferences/udpate`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify([
          { preferenceType: studyPreferences[0].preferenceType, priority: 1 },
          { preferenceType: studyPreferences[1].preferenceType, priority: 2 },
        ]),
      });
      if (res.ok) {
        toast.success("Study preferences saved successfully");
      } else {
        toast.error("Failed to save study preferences");
      }
    } catch (e) {
      toast.error("Failed to save study preferences");
    } finally {
      setLoadingStudyPrefs(false);
    }
  };

  if (loading) {
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
                  <BreadcrumbPage>Settings</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </header>
          <div className="flex flex-1 items-center justify-center">
            <div className="flex items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Loading preferences...</span>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
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
                <BreadcrumbPage>Settings</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        
        <div className="flex flex-1 flex-col gap-6 p-6">
          <div className="max-w-4xl mx-auto w-full">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Study Preferences</h1>
              <p className="text-muted-foreground">
                Adjust your study habits and schedule to your needs.
              </p>
            </div>

            <div className="space-y-6">
              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Personal Information
                  </CardTitle>
                  <CardDescription>
                    Your username is used for personalization.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="username" className="mb-2 block">Username</Label>
                      <Input
                        id="username"
                        className="mt-2"
                        value={formData.username || ""}
                        onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                        placeholder="Your name"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Study Times */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Study Times
                  </CardTitle>
                  <CardDescription>
                    Define your preferred study times and maximum session duration.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="maxStudyDuration" className="mb-2 block">Maximum study session duration</Label>
                      <Select
                        value={formData.maxStudyDuration ? (formData.maxStudyDuration / 60).toString() : ""}
                        onValueChange={(value) => setFormData(prev => ({ 
                          ...prev, 
                          maxStudyDuration: Math.round(parseFloat(value) * 60) // in Minuten speichern
                        }))}
                      >
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Select a duration" />
                        </SelectTrigger>
                        <SelectContent>
                          {studyDurationOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="startLearningTime" className="mb-2 block">Earliest study time</Label>
                        <Input
                          id="startLearningTime"
                          type="time"
                          className="mt-2"
                          value={formData.startLearningTime || ""}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            startLearningTime: e.target.value 
                          }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="endLearningTime" className="mb-2 block">Latest study time</Label>
                        <Input
                          id="endLearningTime"
                          type="time"
                          className="mt-2"
                          value={formData.endLearningTime || ""}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            endLearningTime: e.target.value 
                          }))}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Blackout Days */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Blackout Days
                  </CardTitle>
                  <CardDescription>
                    Select the days you do not want to study.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {weekdays.map((weekday) => (
                      <div key={weekday.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={weekday.value}
                          checked={formData.blackoutWeekdays?.includes(weekday.value) || false}
                          onCheckedChange={() => handleWeekdayToggle(weekday.value)}
                        />
                        <Label htmlFor={weekday.value} className="text-sm font-normal">
                          {weekday.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Study Preferences */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Study Preferences
                  </CardTitle>
                  <CardDescription>
                    Select your two preferred study times.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label>Preference 1</Label>
                      <Select
                        value={studyPreferences[0].preferenceType}
                        onValueChange={v => handleStudyPrefChange(1, v)}
                      >
                        <SelectTrigger className="w-full mt-2">
                          <SelectValue placeholder="Select your first preference" />
                        </SelectTrigger>
                        <SelectContent>
                          {studyPreferenceOptions.map(opt => (
                            <SelectItem key={opt.value} value={opt.value}>
                              <span className="flex items-center gap-2">
                                <opt.icon className="h-4 w-4" />
                                {opt.label}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Preference 2</Label>
                      <Select
                        value={studyPreferences[1].preferenceType}
                        onValueChange={v => handleStudyPrefChange(2, v)}
                      >
                        <SelectTrigger className="w-full mt-2">
                          <SelectValue placeholder="Select your second preference" />
                        </SelectTrigger>
                        <SelectContent>
                          {studyPreferenceOptions.map(opt => (
                            <SelectItem key={opt.value} value={opt.value}>
                              <span className="flex items-center gap-2">
                                <opt.icon className="h-4 w-4" />
                                {opt.label}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Save Button */}
              <div className="flex justify-end">
                <Button 
                  onClick={handleSave} 
                  disabled={saving}
                  className="min-w-[120px]"
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
