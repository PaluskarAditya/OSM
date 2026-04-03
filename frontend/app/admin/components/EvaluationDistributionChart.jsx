import { useMemo } from "react";
import { Pie, PieChart, ResponsiveContainer, Cell } from "recharts";
import { MoreVertical, PieChartIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const COLORS = ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#ef4444"];

export function EvaluationDistributionChart({ data, isLoading }) {
    const chartData = useMemo(() =>
        (data ?? []).map((d, i) => ({ ...d, color: COLORS[i % COLORS.length] })),
        [data]
    );

    const total = useMemo(() => chartData.reduce((a, c) => a + c.value, 0), [chartData]);

    const chartConfig = {
        value: { label: "Evaluations" },
        ...Object.fromEntries(chartData.map(d => [d.name, { label: d.name, color: d.color }])),
    };

    return (
        <Card className="border border-gray-200 hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-lg font-semibold text-gray-900">Evaluation Distribution</CardTitle>
                        <CardDescription className="text-gray-500">By subject area</CardDescription>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem>View details</DropdownMenuItem>
                            <DropdownMenuItem>Export data</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>Refresh</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardHeader>
            <CardContent className="flex flex-col items-center p-4 md:p-6">
                {isLoading ? (
                    <div className="w-full space-y-4">
                        <Skeleton className="h-56 w-56 rounded-full mx-auto" />
                        <div className="grid grid-cols-3 gap-3 mt-4">
                            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 rounded-lg" />)}
                        </div>
                    </div>
                ) : !chartData.length ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="p-4 bg-gray-50 rounded-full mb-4">
                            <PieChartIcon className="h-8 w-8 text-gray-300" />
                        </div>
                        <p className="font-medium text-gray-500">No evaluation data yet</p>
                        <p className="text-sm text-gray-400 mt-1">Data will appear once evaluations are completed</p>
                    </div>
                ) : (
                    <>
                        <div className="w-full max-w-xs">
                            <ChartContainer config={chartConfig} className="h-56">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <ChartTooltip content={<ChartTooltipContent hideLabel className="bg-white shadow-lg border rounded-lg" />} />
                                        <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={65} outerRadius={90} paddingAngle={2} strokeWidth={2} stroke="white">
                                            {chartData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                            </ChartContainer>
                        </div>
                        <div className="mt-6 w-full">
                            <div className="text-center mb-4">
                                <div className="text-4xl font-bold text-gray-900">{total}</div>
                                <div className="text-sm text-gray-500">Total evaluations</div>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                                {chartData.map(item => (
                                    <div key={item.name} className="text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                                            <span className="text-sm font-medium text-gray-700">{item.name}</span>
                                        </div>
                                        <div className="text-lg font-semibold mt-1">{item.value}</div>
                                        <div className="text-xs text-gray-500">{Math.round((item.value / total) * 100)}%</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
}