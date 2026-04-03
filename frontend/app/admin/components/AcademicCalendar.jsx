"use client";
import { useState } from "react";
import { formatDateRange } from "little-date";
import { Plus, CalendarDays, Calendar as CalendarIcon, FileCheck, Users, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

export function AcademicCalendar({ events, onAddEvent }) {
    const [date, setDate] = useState(new Date());
    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState("");
    const [desc, setDesc] = useState("");
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");

    const dayEvents = events.filter(
        e => new Date(e.from).toDateString() === date.toDateString()
    );

    const handleAdd = () => {
        if (!title || !from || !to) return;
        const base = date.toISOString().split("T")[0];
        const start = new Date(`${base}T${from}`);
        const end = new Date(`${base}T${to}`);
        if (end <= start) return alert("End time must be after start");
        onAddEvent({ id: Date.now(), title, from: start.toISOString(), to: end.toISOString(), isExam: title.toLowerCase().includes("exam"), description: desc });
        setOpen(false);
        setTitle(""); setDesc(""); setFrom(""); setTo("");
    };

    return (
        <>
            <Card className="h-full border border-gray-200 hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                            <CardTitle className="text-lg font-semibold text-gray-900">Academic Calendar</CardTitle>
                            <CardDescription className="text-gray-500">Upcoming exams & events</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" className="h-9" onClick={() => setDate(new Date())}>
                                <CalendarDays className="h-4 w-4 mr-2" />Today
                            </Button>
                            <Button size="sm" onClick={() => setOpen(true)} className="h-9">
                                <Plus className="h-4 w-4 mr-2" />Add Event
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="bg-gray-50 rounded-xl p-4">
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            className="w-full"
                            classNames={{
                                day: "h-9 w-9 rounded-lg hover:bg-gray-100",
                                day_selected: "bg-blue-600 text-white hover:bg-blue-700",
                                day_today: "bg-gray-100 font-semibold",
                            }}
                        />
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-gray-900">
                                {date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                            </h3>
                            <Badge variant="outline" className="text-xs">
                                {dayEvents.length} {dayEvents.length === 1 ? "event" : "events"}
                            </Badge>
                        </div>
                        <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                            {dayEvents.length > 0 ? dayEvents.map(e => (
                                <div key={e.id} className={`p-4 rounded-lg border transition-all hover:shadow-sm ${e.isExam ? "border-red-200 bg-red-50/50 hover:bg-red-50" : "border-blue-200 bg-blue-50/50 hover:bg-blue-50"}`}>
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <div className={`p-1.5 rounded-md ${e.isExam ? "bg-red-100" : "bg-blue-100"}`}>
                                                    {e.isExam
                                                        ? <FileCheck className="h-4 w-4 text-red-600" />
                                                        : <Users className="h-4 w-4 text-blue-600" />}
                                                </div>
                                                <span className="font-semibold text-gray-900">{e.title}</span>
                                                <Badge variant={e.isExam ? "destructive" : "secondary"} className="text-xs">
                                                    {e.isExam ? "Exam" : "Event"}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-gray-600 mt-2 ml-9">
                                                {formatDateRange(new Date(e.from), new Date(e.to))}
                                            </p>
                                            {e.description && <p className="text-sm text-gray-500 mt-2 ml-9">{e.description}</p>}
                                        </div>
                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50/50">
                                    <CalendarIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-500 font-medium">No events scheduled</p>
                                    <p className="text-sm text-gray-400 mt-1">Add an event to get started</p>
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-gray-900">Add New Event</DialogTitle>
                        <DialogDescription>
                            Schedule for {date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label htmlFor="title">Title *</Label>
                            <Input id="title" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., Math Final Exam" className="bg-gray-50" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="desc">Description</Label>
                            <Input id="desc" value={desc} onChange={e => setDesc(e.target.value)} placeholder="Optional details" className="bg-gray-50" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="from">Start Time *</Label>
                                <Input id="from" type="time" value={from} onChange={e => setFrom(e.target.value)} className="bg-gray-50" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="to">End Time *</Label>
                                <Input id="to" type="time" value={to} onChange={e => setTo(e.target.value)} className="bg-gray-50" />
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                        <Button onClick={handleAdd} className="bg-blue-600 hover:bg-blue-700">
                            <Plus className="h-4 w-4 mr-2" />Add Event
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}