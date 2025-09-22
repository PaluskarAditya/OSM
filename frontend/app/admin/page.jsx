"use client";

import * as React from "react";
import { useState } from "react";
import { formatDateRange } from "little-date";
import { TrendingUp } from "lucide-react";
import { Label, Pie, PieChart } from "recharts";
import { PlusIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Input } from "@/components/ui/input";
import { useMemo } from "react";

export const description = "Evaluation Percentage";

const chartData = [
  { browser: "chrome", visitors: 275, fill: "var(--color-chrome)" },
  { browser: "safari", visitors: 200, fill: "var(--color-safari)" },
  { browser: "firefox", visitors: 287, fill: "var(--color-firefox)" },
  { browser: "edge", visitors: 173, fill: "var(--color-edge)" },
  { browser: "other", visitors: 190, fill: "var(--color-other)" },
];

const chartConfig = {
  visitors: {
    label: "Visitors",
  },
  chrome: {
    label: "Chrome",
    color: "var(--chart-1)",
  },
  safari: {
    label: "Safari",
    color: "var(--chart-2)",
  },
  firefox: {
    label: "Firefox",
    color: "var(--chart-3)",
  },
  edge: {
    label: "Edge",
    color: "var(--chart-4)",
  },
  other: {
    label: "Other",
    color: "var(--chart-5)",
  },
};

const initialEvents = [
  {
    title: "Team Sync Meeting",
    from: "2025-06-12T09:00:00",
    to: "2025-06-12T10:00:00",
  },
  {
    title: "Design Review",
    from: "2025-06-12T11:30:00",
    to: "2025-06-12T12:30:00",
  },
  {
    title: "Client Presentation",
    from: "2025-06-12T14:00:00",
    to: "2025-06-12T15:00:00",
  },
  {
    title: "Project Kickoff",
    from: "2025-06-13T10:00:00",
    to: "2025-06-13T11:00:00",
  },
];

function ChartPieDonutText() {
  const totalVisitors = useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.visitors, 0);
  }, []);
  return (
    <Card className="flex flex-col w-1/2 bg-muted/50">
      <CardHeader className="items-center pb-0">
        <CardTitle>Evaulations</CardTitle>
        <CardDescription>January - June 2024</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="visitors"
              nameKey="browser"
              innerRadius={60}
              strokeWidth={5}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {totalVisitors.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Evaluation Count
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

function Calendar31({ events, onAddEvent }) {
  const [date, setDate] = useState(new Date(2025, 5, 12));
  const [isAddEventDialogOpen, setIsAddEventDialogOpen] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventFrom, setNewEventFrom] = useState("");
  const [newEventTo, setNewEventTo] = useState("");

  // Filter events for the selected date
  const filteredEvents = events.filter((event) => {
    const eventDate = new Date(event.from).toDateString();
    return eventDate === date.toDateString();
  });

  const handleAddEvent = () => {
    if (!newEventTitle || !newEventFrom || !newEventTo) {
      alert("Please fill in all fields");
      return;
    }

    const fromDateTime = new Date(
      `${date.toISOString().split("T")[0]}T${newEventFrom}:00`
    );
    const toDateTime = new Date(
      `${date.toISOString().split("T")[0]}T${newEventTo}:00`
    );

    if (toDateTime <= fromDateTime) {
      alert("End time must be after start time");
      return;
    }

    onAddEvent({
      title: newEventTitle,
      from: fromDateTime.toISOString(),
      to: toDateTime.toISOString(),
    });

    setNewEventTitle("");
    setNewEventFrom("");
    setNewEventTo("");
    setIsAddEventDialogOpen(false);
  };

  return (
    <>
      <Card className="py-4">
        <CardContent className="px-4">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="bg-transparent p-0"
            required
          />
        </CardContent>
        <CardFooter className="flex flex-col items-start gap-3 border-t px-4 !pt-4">
          <div className="flex w-full items-center justify-between px-1">
            <div className="text-sm font-medium">
              {date?.toLocaleDateString("en-US", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="size-6"
              title="Add Event"
              onClick={() => setIsAddEventDialogOpen(true)}
            >
              <PlusIcon />
              <span className="sr-only">Add Event</span>
            </Button>
          </div>
          <div className="flex w-full flex-col gap-2">
            {filteredEvents.length > 0 ? (
              filteredEvents.map((event) => (
                <div
                  key={event.title}
                  className="bg-muted after:bg-primary/70 relative rounded-md p-2 pl-6 text-sm after:absolute after:inset-y-2 after:left-2 after:w-1 after:rounded-full"
                >
                  <div className="font-medium">{event.title}</div>
                  <div className="text-muted-foreground text-xs">
                    {formatDateRange(new Date(event.from), new Date(event.to))}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-muted-foreground">
                No events for this date
              </div>
            )}
          </div>
        </CardFooter>
      </Card>
      <Dialog
        open={isAddEventDialogOpen}
        onOpenChange={setIsAddEventDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Event</DialogTitle>
            <DialogDescription>
              Create a new event for{" "}
              {date?.toLocaleDateString("en-US", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="event-title">Event Title</Label>
              <Input
                id="event-title"
                value={newEventTitle}
                onChange={(e) => setNewEventTitle(e.target.value)}
                placeholder="Enter event title"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="event-from">Start Time</Label>
              <Input
                id="event-from"
                type="time"
                value={newEventFrom}
                onChange={(e) => setNewEventFrom(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="event-to">End Time</Label>
              <Input
                id="event-to"
                type="time"
                value={newEventTo}
                onChange={(e) => setNewEventTo(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddEventDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleAddEvent}>Add Event</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function Page() {
  const [events, setEvents] = useState(initialEvents);

  const handleAddEvent = (newEvent) => {
    setEvents((prev) => [...prev, newEvent]);
  };

  return (
    <div className="flex w-full bg-white">
      <div className="flex w-full items-start p-6 gap-6">
        <div className="flex flex-col gap-6 w-full h-full">
          <div className="bg-muted/50 shadow border rounded-lg flex-1 h-full flex flex-col justify-start items-start p-6">
            <SidebarTrigger className="self-start mb-5" />
            <h1 className="text-sm font-medium">Welcome to XYZ College</h1>
            <p className="text-sm text-gray-500">
              Your evaluators have completed 95% of paper checking
            </p>
          </div>
          <div className="flex w-full h-full gap-6">
            <div className="bg-muted/50 shadow border rounded-lg flex-1 h-1/2 flex flex-col justify-start items-start p-6">
              <h1 className="text-sm font-medium">Welcome to XYZ College</h1>
              <p className="text-sm text-gray-500">
                Your evaluators have completed 95% of paper checking
              </p>
            </div>
            <ChartPieDonutText />
          </div>
        </div>
        <Calendar31 events={events} onAddEvent={handleAddEvent} />
      </div>
    </div>
  );
}
