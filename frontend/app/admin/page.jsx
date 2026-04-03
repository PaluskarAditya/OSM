"use client";
import { useState } from "react";
import { useDashboardData } from "../hooks/dashboard/useDashboardData";
import { useDashboardStats } from "../hooks/dashboard/useDashboardStats";
import { StatsCards } from "./components/StatsCards";
import { EvaluationProgress } from "./components/EvaluationProgress";
import { EvaluationDistributionChart } from "./components/EvaluationDistributionChart";
import { PendingEvaluationsList } from "./components/PendingEvaluationsList";
import { AcademicCalendar } from "./components/AcademicCalendar";
import { DashboardHeader } from "./components/DashboardHeader";
import { DashboardSkeleton } from './components/DashboardSkeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const DEFAULT_EVENTS = [
  { id: 1, title: "Mathematics Final Exam", from: "2025-06-12T09:00", to: "2025-06-12T10:00", isExam: true, description: "Calculus II - All sections" },
  { id: 2, title: "Physics Midterm", from: "2025-06-13T11:30", to: "2025-06-13T12:30", isExam: true, description: "Quantum Mechanics - Hall A" },
  { id: 3, title: "Evaluation Committee", from: "2025-06-14T14:00", to: "2025-06-14T15:00", isExam: false, description: "Quarterly review" },
];

export default function AdminDashboard() {
  const { institute, qps, subjects, sheets, evaluations, users, loading } = useDashboardData();
  const stats = useDashboardStats(30000);
  const [events, setEvents] = useState(DEFAULT_EVENTS);

  if (loading) return <DashboardSkeleton />;

  // Fall back to local computation if stats endpoint not ready yet
  const completionPercent = stats?.completionPercent
    ?? (sheets.length ? Math.round((sheets.filter(s => s.status === "Completed").length / sheets.length) * 100) : 0);

  const calendarProps = {
    events,
    onAddEvent: (e) => setEvents(prev => [...prev, e]),
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">

        <DashboardHeader
          institute={institute}
          completionPercent={completionPercent}
          activeExaminers={stats?.activeExaminers ?? "—"}
          liveExams={stats?.liveExams ?? "—"}
        />

        <StatsCards
          exams={loading ? null : qps.length}
          subjects={loading ? null : subjects.length}
          evaluated={loading ? null : sheets.filter(s => s.status === "Completed").length}
          uploaded={loading ? null : sheets.length}
        />

        {/* Mobile tabs */}
        <div className="lg:hidden">
          <Tabs defaultValue="progress">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="progress">Progress</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="calendar">Calendar</TabsTrigger>
            </TabsList>
            <TabsContent value="progress">
              <EvaluationProgress evaluations={evaluations} users={users} />
              <EvaluationDistributionChart data={stats?.subjectDistribution} sheets={sheets} />
            </TabsContent>
            <TabsContent value="pending">
              <PendingEvaluationsList data={stats?.pendingByExaminer} />
            </TabsContent>
            <TabsContent value="calendar">
              <AcademicCalendar {...calendarProps} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Desktop grid */}
        <div className="hidden lg:grid xl:grid-cols-3 gap-6 md:gap-8">
          <div className="xl:col-span-2 space-y-6 md:space-y-8">
            <EvaluationProgress evaluations={evaluations} users={users} />
            <div className="grid grid-cols-2 gap-6 md:gap-8">
              <PendingEvaluationsList data={stats?.pendingByExaminer} />
              <EvaluationDistributionChart data={stats?.subjectDistribution} sheets={sheets} />
            </div>
          </div>
          <div className="xl:col-span-1">
            <AcademicCalendar {...calendarProps} />
          </div>
        </div>

      </div>
    </div>
  );
}