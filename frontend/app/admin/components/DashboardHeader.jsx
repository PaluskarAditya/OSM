import { TrendingUp, Download, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function DashboardHeader({ institute, completionPercent, activeExaminers, liveExams }) {
    const bannerStats = [
        { value: `${completionPercent}%`, label: "Evaluation Completed" },
        { value: activeExaminers, label: "Active Examiners" },
        { value: liveExams, label: "Live Exams" },
        { value: "12h", label: "Avg. Processing Time" },
    ];

    return (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 md:p-8 shadow-lg">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <SidebarTrigger className="cursor-pointer h-10 w-10 bg-white/20 hover:bg-white/30 text-white rounded-xl transition-colors" />
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-white">
                                {institute?.name || "Academic Portal"}
                            </h1>
                            <p className="text-blue-100 text-sm md:text-base">
                                Welcome to your evaluation management dashboard
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                            <div className="flex items-center gap-2">
                                <div className="h-3 w-3 bg-emerald-400 rounded-full animate-pulse" />
                                <span className="text-white text-sm font-medium">
                                    System Status: <span className="font-bold">Active</span>
                                </span>
                            </div>
                        </div>
                        <Badge className="bg-white text-blue-600 hover:bg-white/90 gap-2 py-1.5 px-3">
                            <TrendingUp className="h-3.5 w-3.5" />
                            Excellent Progress
                        </Badge>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20">
                        <Download className="h-4 w-4 mr-2" />
                        Export Report
                    </Button>
                    <Button className="bg-white text-blue-600 hover:bg-white/90">
                        <Plus className="h-4 w-4 mr-2" />
                        Quick Action
                    </Button>
                </div>
            </div>

            <div className="mt-6 pt-6 border-t border-white/20">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {bannerStats.map(({ value, label }) => (
                        <div key={label} className="text-center">
                            <div className="text-2xl font-bold text-white">{value}</div>
                            <div className="text-sm text-blue-100">{label}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}