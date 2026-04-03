import { AlertCircle, Clock, CheckCircle2, ChevronRight, Filter, Download, InboxIcon } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const PRIORITY_CONFIG = {
    high: { color: "bg-red-100 text-red-700 border-red-200", icon: AlertCircle, label: "High Priority" },
    medium: { color: "bg-yellow-100 text-yellow-700 border-yellow-200", icon: Clock, label: "Medium Priority" },
    low: { color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: CheckCircle2, label: "Low Priority" },
};

function getPriority(pending) {
    if (pending >= 15) return "high";
    if (pending >= 8) return "medium";
    return "low";
}

export function PendingEvaluationsList({ data, isLoading }) {
    return (
        <Card className="border border-gray-200 hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-lg font-semibold text-gray-900">Pending Evaluations</CardTitle>
                        <CardDescription className="text-gray-500">Examiners with evaluation backlog</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="h-8">
                            <Filter className="h-3.5 w-3.5 mr-2" />Filter
                        </Button>
                        <Button variant="outline" size="sm" className="h-8">
                            <Download className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {isLoading ? (
                    [...Array(3)].map((_, i) => (
                        <div key={i} className="flex items-center justify-between p-4 rounded-lg border border-gray-100">
                            <div className="flex items-center gap-3">
                                <Skeleton className="h-10 w-10 rounded-full" />
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-28" />
                                    <Skeleton className="h-3 w-20" />
                                </div>
                            </div>
                            <Skeleton className="h-10 w-24" />
                        </div>
                    ))
                ) : !data?.length ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="p-4 bg-gray-50 rounded-full mb-4">
                            <InboxIcon className="h-8 w-8 text-gray-300" />
                        </div>
                        <p className="font-medium text-gray-500">No pending evaluations</p>
                        <p className="text-sm text-gray-400 mt-1">All examiners are up to date</p>
                    </div>
                ) : (
                    data.map((item) => {
                        const priority = getPriority(item.pending);
                        const cfg = PRIORITY_CONFIG[priority];
                        const PriorityIcon = cfg.icon;
                        return (
                            <div key={item.name} className="group flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-10 w-10 border border-gray-200">
                                        <AvatarFallback className="bg-gray-100 text-gray-700">{item.avatar}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{item.name}</p>
                                        <p className="text-sm text-gray-500">{item.dept}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <Badge className={cfg.color}>
                                            <PriorityIcon className="h-3 w-3 mr-1" />{cfg.label}
                                        </Badge>
                                        <div className="mt-2">
                                            <p className="text-2xl font-bold text-gray-900">{item.pending}</p>
                                            <p className="text-xs text-gray-500">pending sheets</p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        );
                    })
                )}
            </CardContent>
            {data?.length > 0 && (
                <CardFooter className="border-t border-gray-200 bg-gray-50/50">
                    <Button variant="ghost" size="sm" className="w-full text-gray-600 hover:text-gray-900">
                        View all examiners <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                </CardFooter>
            )}
        </Card>
    );
}