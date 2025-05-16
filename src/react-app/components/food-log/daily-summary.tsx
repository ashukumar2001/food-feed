import { useQuery } from "@tanstack/react-query";
import { trpcClient } from "../../lib/trpc-client";
import { Card, CardContent } from "../ui/card";
import { Loader2 } from "lucide-react";
import NumberFlow from "@number-flow/react";
import { formatNumber } from "@/lib/utils";

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
        <CardContent className="flex justify-center py-6">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <p className="text-destructive">Error loading summary</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Calories Box */}
        <div className="rounded-xl border bg-card shadow-sm flex flex-col items-center justify-center py-4">
          <p className="text-2xl font-bold text-primary">
            <NumberFlow value={formatNumber(summary?.totalCalories)} />
            &nbsp;kcal
          </p>
          <p className="text-sm text-muted-foreground">Total Calories</p>
        </div>
        {/* Protein Box */}
        <div className="rounded-xl border bg-card shadow-sm flex flex-col items-center justify-center py-4">
          <p className="text-2xl font-bold text-primary">
            <NumberFlow value={formatNumber(summary?.totalProtein)} />
            &nbsp;g
          </p>
          <p className="text-sm text-muted-foreground">Protein</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {/* Carbs Box */}
        <div className="rounded-xl border bg-card shadow-sm flex flex-col items-center justify-center py-3">
          <p className="text-xl font-medium text-primary">
            <NumberFlow value={formatNumber(summary?.totalCarbs)} />
            &nbsp;g
          </p>
          <p className="text-xs text-muted-foreground">Carbs</p>
        </div>
        {/* Fat Box */}
        <div className="rounded-xl border bg-card shadow-sm flex flex-col items-center justify-center py-3">
          <p className="text-xl font-medium text-primary">
            <NumberFlow value={formatNumber(summary?.totalFat)} />
            &nbsp;g
          </p>
          <p className="text-xs text-muted-foreground">Fat</p>
        </div>
        {/* Meals Box */}
        <div className="rounded-xl border bg-card shadow-sm flex flex-col items-center justify-center py-3">
          <p className="text-xl font-medium text-primary">
            <NumberFlow value={formatNumber(summary?.logCount)} />
          </p>
          <p className="text-xs text-muted-foreground">Meals</p>
        </div>
      </div>
    </div>
  );
}
