import { BookOpen, Users, CheckCircle2, Upload } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const STATS_CONFIG = [
    { key: "exams", label: "Exams Created", icon: BookOpen, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100" },
    { key: "subjects", label: "Active Subjects", icon: Users, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
    { key: "evaluated", label: "Evaluated", icon: CheckCircle2, color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-100" },
    { key: "uploaded", label: "Uploaded", icon: Upload, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100" },
];

export function StatsCards({ exams, subjects, evaluated, uploaded, isLoading }) {
    const values = { exams, subjects, evaluated, uploaded };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {STATS_CONFIG.map(({ key, label, icon: Icon, color, bg, border }) => (
                <Card
                    key={key}
                    className={`group hover:shadow-lg transition-all duration-300 border ${border} hover:-translate-y-1 hover:border-gray-300`}
                >
                    <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-gray-600">{label}</p>
                                {isLoading ? (
                                    <Skeleton className="h-9 w-20 rounded-lg" />
                                ) : (
                                    <p className="text-3xl font-bold text-gray-900">
                                        {values[key] ?? "—"}
                                    </p>
                                )}
                            </div>
                            <div className={`p-3 rounded-xl ${bg} group-hover:scale-110 transition-transform duration-300`}>
                                <Icon className={`h-6 w-6 ${color}`} />
                            </div>
                        </div>
                        <div className="mt-4 pt-3 border-t border-gray-100">
                            <p className="text-xs text-gray-400">
                                {isLoading ? "Loading..." : values[key] === 0 ? "No data yet" : "Total count"}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}