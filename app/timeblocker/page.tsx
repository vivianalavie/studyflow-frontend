'use client'

import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { WeeklyCalendar } from "@/components/weekly-calendar"
import { Plus, Edit, Trash2, RotateCcw } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { useState, useEffect } from "react"
import type { Timeblocker, Occurrence } from "@/types/timeblocker"
import { getTimeblockers, createTimeblocker, updateTimeblocker, deleteTimeblocker } from "@/app/api/timeblocker"
import { toast } from "sonner"
import { useAuth } from "@clerk/nextjs"

const occurrenceOptions = [
  { value: "ONCE", label: "Once" },
  { value: "DAILY", label: "Daily" },
  { value: "WEEKLY", label: "Weekly" },
  { value: "MONTHLY", label: "Monthly" },
]

// Helper function for LocalDateTime string (no timezone, no seconds needed)
function toLocalDateTimeString(input: string | undefined): string {
  if (!input) return "";
  // Remove timezone information and seconds
  return input.split('.')[0].replace('Z', '');
}

export default function TimeblockerPage() {
  const [timeblockers, setTimeblockers] = useState<Timeblocker[]>([])
  const [isAdding, setIsAdding] = useState(false)
  const [newTimeblocker, setNewTimeblocker] = useState<Omit<Timeblocker, 'id' | 'userId'>>({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    occurrence: "ONCE"
  })
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [timeblockerToDelete, setTimeblockerToDelete] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editTimeblockerId, setEditTimeblockerId] = useState<string | null>(null)
  const [editTimeblocker, setEditTimeblocker] = useState<Omit<Timeblocker, 'id' | 'userId'> | null>(null)
  const { isLoaded, isSignedIn } = useAuth();
  const [dateError, setDateError] = useState<string | null>(null)
  const [calendarKey, setCalendarKey] = useState(0)
  const [scrollToEventRequest, setScrollToEventRequest] = useState<{ name: string, startTime: string } | null>(null);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    async function fetchTimeblockers() {
      try {
        const data = await getTimeblockers();
        setTimeblockers(data);
      } catch (e) {
        // Error handling optional
      }
    }
    fetchTimeblockers();
  }, [isLoaded, isSignedIn]);

  // Validation for start and end date
  useEffect(() => {
    if (newTimeblocker.startDate && newTimeblocker.endDate) {
      const start = new Date(newTimeblocker.startDate)
      const end = new Date(newTimeblocker.endDate)
      if (end < start) {
        setDateError('End date cannot be before start date.')
      } else {
        setDateError(null)
      }
    } else {
      setDateError(null)
    }
  }, [newTimeblocker.startDate, newTimeblocker.endDate])

  // Validation for required fields and date
  const isSaveDisabled =
    !newTimeblocker.name ||
    !newTimeblocker.startDate ||
    !newTimeblocker.endDate ||
    !!dateError;

  async function handleAddTimeblocker() {
    try {
      await createTimeblocker({
        ...newTimeblocker,
        startDate: toLocalDateTimeString(newTimeblocker.startDate),
        endDate: toLocalDateTimeString(newTimeblocker.endDate),
      });
      toast.success("Timeblocker created successfully");
      setIsAdding(false);
      setNewTimeblocker({ name: "", description: "", startDate: "", endDate: "", occurrence: "ONCE" });
      const data = await getTimeblockers();
      setTimeblockers(data);
    } catch (e) {
      toast.error("Error creating timeblocker");
    }
  }

  async function handleDeleteTimeblocker() {
    if (!timeblockerToDelete) return
    try {
      await deleteTimeblocker(timeblockerToDelete)
      toast.success("Timeblocker deleted successfully")
      setDeleteDialogOpen(false)
      setTimeblockerToDelete(null)
      const data = await getTimeblockers()
      setTimeblockers(data)
    } catch (e) {
      toast.error("Error deleting timeblocker")
    }
  }

  function openEditDialog(tb: Timeblocker) {
    setEditTimeblockerId(tb.id)
    setEditTimeblocker({
      name: tb.name,
      description: tb.description,
      startDate: tb.startDate || "",
      endDate: tb.endDate || "",
      occurrence: tb.occurrence
    })
    setIsEditing(true)
  }

  async function handleUpdateTimeblocker() {
    if (!editTimeblockerId || !editTimeblocker) return;
    try {
      await updateTimeblocker(editTimeblockerId, {
        ...editTimeblocker,
        startDate: toLocalDateTimeString(editTimeblocker.startDate),
        endDate: toLocalDateTimeString(editTimeblocker.endDate),
      });
      toast.success("Timeblocker updated successfully");
      setIsEditing(false);
      setEditTimeblockerId(null);
      setEditTimeblocker(null);
      const data = await getTimeblockers();
      setTimeblockers(data);
    } catch (e) {
      toast.error("Error updating timeblocker");
    }
  }

  async function refreshTimeblockersAndCalendar() {
    // Reload timeblockers
    try {
      const data = await getTimeblockers();
      setTimeblockers(data);
    } catch (e) {}
    // Re-render calendar (by changing the key)
    setCalendarKey(prev => prev + 1)
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
                <BreadcrumbPage>Personal Timeblocker</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 h-full">
          <div className="flex flex-row gap-4 h-full flex-1">
            <div className="w-1/2 h-full flex flex-col flex-1">
              {/* Calendar for two days */}
              <WeeklyCalendar key={calendarKey} scrollToEventRequest={scrollToEventRequest ?? undefined} />
            </div>
            <div className="w-1/2 h-full flex flex-col flex-1">
              <div className="flex justify-between items-center mb-4">
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={refreshTimeblockersAndCalendar} title="Refresh">
                    <RotateCcw className="h-5 w-5" />
                  </Button>
                </div>
                <h2 className="text-2xl font-bold">My Timeblockers</h2>
                <Dialog open={isAdding} onOpenChange={setIsAdding}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Add Timeblocker</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-6 py-4">
                      <div className="col-span-2">
                        <Label htmlFor="tb-name">Name</Label>
                        <Input id="tb-name" value={newTimeblocker.name} onChange={e => setNewTimeblocker(prev => ({ ...prev, name: e.target.value }))} className="mt-2" />
                      </div>
                      <div className="col-span-2">
                        <Label htmlFor="tb-description">Description</Label>
                        <Textarea id="tb-description" value={newTimeblocker.description} onChange={e => setNewTimeblocker(prev => ({ ...prev, description: e.target.value }))} className="mt-2 min-h-[80px]" />
                      </div>
                      <div>
                        <Label htmlFor="tb-start">Start</Label>
                        <Input id="tb-start" type="datetime-local" value={newTimeblocker.startDate} onChange={e => setNewTimeblocker(prev => ({ ...prev, startDate: e.target.value }))} className="mt-2" />
                      </div>
                      <div>
                        <Label htmlFor="tb-end">End</Label>
                        <Input id="tb-end" type="datetime-local" value={newTimeblocker.endDate} onChange={e => setNewTimeblocker(prev => ({ ...prev, endDate: e.target.value }))} className="mt-2" />
                      </div>
                      <div>
                        <Label htmlFor="tb-occurrence">Occurrence</Label>
                        <Select value={newTimeblocker.occurrence} onValueChange={val => setNewTimeblocker(prev => ({ ...prev, occurrence: val as Occurrence }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {occurrenceOptions.map(opt => (
                              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-6">
                      <Button variant="outline" onClick={() => setIsAdding(false)}>Cancel</Button>
                      <Button onClick={handleAddTimeblocker}>Add</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="space-y-4">
                {timeblockers.length === 0 && <div className="text-muted-foreground">No timeblockers yet.</div>}
                {timeblockers.map(tb => (
                  <Card key={tb.id} onClick={() => {
                    setScrollToEventRequest({ name: tb.name, startTime: tb.startDate });
                  }} style={{ cursor: 'pointer' }}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{tb.name}</CardTitle>
                          <div className="text-sm text-muted-foreground">{tb.description}</div>
                        </div>
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" onClick={() => openEditDialog(tb)}><Edit className="h-4 w-4" /></Button>
                          <Button size="sm" variant="ghost" onClick={() => { setTimeblockerToDelete(tb.id); setDeleteDialogOpen(true); }}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div>
                          {tb.startDate ? new Date(tb.startDate).toLocaleString('de-DE', { 
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : "-"} – {tb.endDate ? new Date(tb.endDate).toLocaleString('de-DE', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : "-"}
                        </div>
                        <div>
                          {occurrenceOptions.find(o => o.value === tb.occurrence)?.label}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Timeblocker</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center mb-4">
            <span className="text-red-600 font-bold text-lg mb-2">Warning</span>
            <span className="text-center text-base text-black leading-relaxed">
              If you delete this timeblocker, it will be permanently removed!
            </span>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleDeleteTimeblocker} className="bg-red-600 hover:bg-red-700 text-white" >
              Delete timeblocker
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Timeblocker</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-6 py-4">
            <div className="col-span-2">
              <Label htmlFor="edit-tb-name">Name</Label>
              <Input id="edit-tb-name" value={editTimeblocker?.name || ""} onChange={e => setEditTimeblocker(editTimeblocker ? { ...editTimeblocker, name: e.target.value } : null)} className="mt-2" />
            </div>
            <div className="col-span-2">
              <Label htmlFor="edit-tb-description">Description</Label>
              <Textarea id="edit-tb-description" value={editTimeblocker?.description || ""} onChange={e => setEditTimeblocker(editTimeblocker ? { ...editTimeblocker, description: e.target.value } : null)} className="mt-2 min-h-[80px]" />
            </div>
            <div>
              <Label htmlFor="edit-tb-start">Start</Label>
              <Input id="edit-tb-start" type="datetime-local" value={(editTimeblocker?.startDate ?? "") + ""} onChange={e => setEditTimeblocker(editTimeblocker ? { ...editTimeblocker, startDate: e.target.value ?? "" } : null)} className="mt-2" />
            </div>
            <div>
              <Label htmlFor="edit-tb-end">End</Label>
              <Input id="edit-tb-end" type="datetime-local" value={(editTimeblocker?.endDate ?? "") + ""} onChange={e => setEditTimeblocker(editTimeblocker ? { ...editTimeblocker, endDate: e.target.value ?? "" } : null)} className="mt-2" />
            </div>
            <div>
              <Label htmlFor="edit-tb-occurrence">Occurrence</Label>
              <Select value={editTimeblocker?.occurrence || "ONCE"} onValueChange={val => setEditTimeblocker(editTimeblocker ? { ...editTimeblocker, occurrence: val as Occurrence } : null)}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {occurrenceOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
            <Button onClick={handleUpdateTimeblocker}>Update</Button>
          </div>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  )
} 