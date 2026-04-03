import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function DashboardSkeleton() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-4 md:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
                <Skeleton className="h-48 w-full rounded-2xl" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    {[...Array(4)].map((_, i) => (
                        <Card key={i} className="animate-pulse">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-3">
                                        <Skeleton className="h-4 w-28 rounded-full" />
                                        <Skeleton className="h-8 w-20 rounded-lg" />
                                    </div>
                                    <Skeleton className="h-12 w-12 rounded-xl" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <Skeleton className="h-80 w-full rounded-xl" />
                        <div className="grid grid-cols-2 gap-6">
                            <Skeleton className="h-80 rounded-xl" />
                            <Skeleton className="h-80 rounded-xl" />
                        </div>
                    </div>
                    <Skeleton className="h-full min-h-[400px] rounded-xl" />
                </div>
            </div>
        </div>
    );
}