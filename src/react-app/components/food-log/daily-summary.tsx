import { useQuery } from "@tanstack/react-query";
import { trpcClient } from "../../lib/trpc-client";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Loader2 } from "lucide-react";

export function DailySummary() {
  // Query for fetching daily summary
  const {
    data: summary,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["dailySummary"],
    queryFn: () =>
      trpcClient.food.getDailySummary.query({
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      }),
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Today's Summary</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-6">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Today's Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">Error loading summary</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Today's Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-primary">
              {summary?.totalCalories?.toFixed(1) || 0}&nbsp;kcal
            </p>
            <p className="text-sm text-muted-foreground">Total Calories</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold">{summary?.logCount || 0}</p>
            <p className="text-sm text-muted-foreground">Meals</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-lg font-medium">
              {summary?.totalProtein?.toFixed(1) || 0}&nbsp;g
            </p>
            <p className="text-xs text-muted-foreground">Protein</p>
          </div>
          <div>
            <p className="text-lg font-medium">
              {summary?.totalCarbs?.toFixed(1) || 0}&nbsp;g
            </p>
            <p className="text-xs text-muted-foreground">Carbs</p>
          </div>
          <div>
            <p className="text-lg font-medium">
              {summary?.totalFat?.toFixed(1) || 0}&nbsp;g
            </p>
            <p className="text-xs text-muted-foreground">Fat</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
