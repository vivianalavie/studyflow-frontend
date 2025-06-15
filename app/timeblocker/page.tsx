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
import { Plus, Edit, Trash2 } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { useState, useEffect } from "react"
import type { Timeblocker, Occurrence } from "@/types/timeblocker"
import { getTimeblockers } from "@/app/api/timeblocker"

const occurrenceOptions = [
  { value: "ONCE", label: "Einmalig" },
  { value: "DAILY", label: "Täglich" },
  { value: "WEEKLY", label: "Wöchentlich" },
  { value: "MONTHLY", label: "Monatlich" },
]

export default function TimeblockerPage() {
  const [timeblockers, setTimeblockers] = useState<Timeblocker[]>([])
  const [isAdding, setIsAdding] = useState(false)
  const [newTimeblocker, setNewTimeblocker] = useState<Omit<Timeblocker, "id" | "user_id">>({
    name: "",
    description: "",
    start_date: "",
    end_date: "",
    occurrence: "ONCE"
  })

  useEffect(() => {
    async function fetchTimeblockers() {
      try {
        const data = await getTimeblockers()
        setTimeblockers(data)
      } catch (e) {
        // Fehlerbehandlung optional
      }
    }
    fetchTimeblockers()
  }, [])

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
              {/* Kalender für zwei Tage */}
              <WeeklyCalendar />
            </div>
            <div className="w-1/2 h-full flex flex-col flex-1">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Meine Timeblocker</h2>
                <Dialog open={isAdding} onOpenChange={setIsAdding}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Hinzufügen
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Neuen Timeblocker anlegen</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-6 py-4">
                      <div className="col-span-2">
                        <Label htmlFor="tb-name">Name</Label>
                        <Input id="tb-name" value={newTimeblocker.name} onChange={e => setNewTimeblocker({ ...newTimeblocker, name: e.target.value })} className="mt-2" />
                      </div>
                      <div className="col-span-2">
                        <Label htmlFor="tb-description">Beschreibung</Label>
                        <Textarea id="tb-description" value={newTimeblocker.description} onChange={e => setNewTimeblocker({ ...newTimeblocker, description: e.target.value })} className="mt-2 min-h-[80px]" />
                      </div>
                      <div>
                        <Label htmlFor="tb-start">Start</Label>
                        <Input id="tb-start" type="datetime-local" value={newTimeblocker.start_date} onChange={e => setNewTimeblocker({ ...newTimeblocker, start_date: e.target.value })} className="mt-2" />
                      </div>
                      <div>
                        <Label htmlFor="tb-end">Ende</Label>
                        <Input id="tb-end" type="datetime-local" value={newTimeblocker.end_date} onChange={e => setNewTimeblocker({ ...newTimeblocker, end_date: e.target.value })} className="mt-2" />
                      </div>
                      <div>
                        <Label htmlFor="tb-occurrence">Wiederholung</Label>
                        <Select value={newTimeblocker.occurrence} onValueChange={val => setNewTimeblocker({ ...newTimeblocker, occurrence: val as Occurrence })}>
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
                      <Button variant="outline" onClick={() => setIsAdding(false)}>Abbrechen</Button>
                      <Button onClick={() => {/* TODO: Speichern */}}>Speichern</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="space-y-4">
                {timeblockers.length === 0 && <div className="text-muted-foreground">Noch keine Timeblocker angelegt.</div>}
                {timeblockers.map(tb => (
                  <Card key={tb.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{tb.name}</CardTitle>
                          <div className="text-sm text-muted-foreground">{tb.description}</div>
                        </div>
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost"><Edit className="h-4 w-4" /></Button>
                          <Button size="sm" variant="ghost"><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div>
                          {new Date(tb.start_date).toLocaleString()} – {new Date(tb.end_date).toLocaleString()}
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
    </SidebarProvider>
  )
} 