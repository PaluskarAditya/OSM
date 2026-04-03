import { useState } from "react";
import { UserCheck, RefreshCw, ClipboardList } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

function getColor(pct) {
    if (pct === 100) return "bg-emerald-500";
    if (pct >= 75) return "bg-blue-500";
    if (pct >= 50) return "bg-amber-500";
    return "bg-red-500";
}

function getLabel(pct) {
    if (pct === 100) return "Completed";
    if (pct >= 75) return "Almost Done";
    if (pct >= 50) return "In Progress";
    return "Needs Attention";
}

export function EvaluationProgress({ evaluations, users, isLoading, onReload }) {
    const [filter, setFilter] = useState("all");

    const getName = (id) => {
        const u = users?.find(u => u._id === id);
        return u ? `${u.FirstName} ${u.LastName}` : "Unknown";
    };

    const items = (evaluations ?? [])
        .map(e => {
            const total = e.sheets?.length ?? 0;
            const checked = e.progress?.checked ?? 0;
            const percent = total ? Math.round((checked / total) * 100) : 0;
            return { id: e._id, name: e.name, examiners: (e.examiners ?? []).map(getName), percent, total, checked };
        })
        .filter(e => {
            if (filter === "active") return e.percent < 100;
            if (filter === "completed") return e.percent === 100;
            return true;
        });

    return (
        <Card className="border border-gray-200 hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-lg font-semibold text-gray-900">Evaluation Progress</CardTitle>
                        <CardDescription className="text-gray-500">Real-time tracking by task</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        <Select value={filter} onValueChange={setFilter}>
                            <SelectTrigger className="h-8 w-32">
                                <SelectValue placeholder="Filter" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={onReload}>
                            <RefreshCw className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {isLoading ? (
                    [...Array(3)].map((_, i) => (
                        <div key={i} className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-40" />
                                    <Skeleton className="h-3 w-28" />
                                </div>
                                <Skeleton className="h-8 w-16" />
                            </div>
                            <Skeleton className="h-2 w-full rounded-full" />
                            {i < 2 && <Separator />}
                        </div>
                    ))
                ) : !items.length ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="p-4 bg-gray-50 rounded-full mb-4">
                            <ClipboardList className="h-8 w-8 text-gray-300" />
                        </div>
                        <p className="font-medium text-gray-500">
                            {filter === "all" ? "No evaluations found" : `No ${filter} evaluations`}
                        </p>
                        <p className="text-sm text-gray-400 mt-1">
                            {filter === "all"
                                ? "Evaluations will appear here once created"
                                : "Try changing the filter above"}
                        </p>
                    </div>
                ) : (
                    items.map((item, i) => (
                        <div key={item.id} className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-semibold text-gray-900 truncate">{item.name}</h4>
                                        <Badge variant="outline" className="text-xs">
                                            {item.examiners.length} {item.examiners.length === 1 ? "examiner" : "examiners"}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-gray-500 truncate">{item.examiners.join(", ") || "No examiners assigned"}</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-xl font-bold text-gray-900">{item.percent}%</div>
                                    <div className="text-xs text-gray-500">{item.checked}/{item.total} sheets</div>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Progress</span>
                                    <span className="font-medium text-gray-900">{getLabel(item.percent)}</span>
                                </div>
                                <Progress value={item.percent} className="h-2" indicatorClassName={getColor(item.percent)} />
                            </div>
                            {item.percent < 100 && (
                                <Button variant="outline" size="sm" className="w-full text-sm">
                                    <UserCheck className="h-3.5 w-3.5 mr-2" />Assign More Staff
                                </Button>
                            )}
                            {i < items.length - 1 && <Separator />}
                        </div>
                    ))
                )}
            </CardContent>
        </Card>
    );
}