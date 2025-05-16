import { format, isToday, isYesterday, isSameMonth } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { trpcClient } from "../../lib/trpc-client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { FoodLogList } from "./food-log-list";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Loader2 } from "lucide-react";
import AnalyticsPage from "../analytics";

interface FoodLog {
  id: string;
  name: string;
  description: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  timestamp: string; // ISO string
  userId: string;
}

interface DailyTotal {
  day: string;
  formattedDay: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  logCount: number;
}

export function FoodLogsWithTabs() {
  const today = new Date();

  // Query for fetching food logs (this will be filtered by date in the UI)
  const {
    data: foodLogs = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["foodLogs"],
    queryFn: () => trpcClient.food.getFoodLogs.query(),
  });

  // Separate logs by date
  const todayLogs = foodLogs.filter((log) => isToday(new Date(log.timestamp)));

  const yesterdayLogs = foodLogs.filter((log) =>
    isYesterday(new Date(log.timestamp))
  );

  const monthLogs = foodLogs.filter((log) =>
    isSameMonth(new Date(log.timestamp), today)
  );

  // Group logs by day for the month view
  const logsByDay = monthLogs.reduce<Record<string, FoodLog[]>>((acc, log) => {
    const day = format(new Date(log.timestamp), "yyyy-MM-dd");
    if (!acc[day]) {
      acc[day] = [];
    }
    acc[day].push(log);
    return acc;
  }, {});

  // Calculate daily totals for month view
  const dailyTotals: DailyTotal[] = Object.entries(logsByDay)
    .map(([day, logs]) => {
      const totalCalories = logs.reduce(
        (sum, log) => sum + (log.calories || 0),
        0
      );
      const totalProtein = logs.reduce(
        (sum, log) => sum + (log.protein || 0),
        0
      );
      const totalCarbs = logs.reduce((sum, log) => sum + (log.carbs || 0), 0);
      const totalFat = logs.reduce((sum, log) => sum + (log.fat || 0), 0);

      return {
        day,
        formattedDay: format(new Date(day), "MMM d"),
        totalCalories,
        totalProtein,
        totalCarbs,
        totalFat,
        logCount: logs.length,
      };
    })
    .sort((a, b) => new Date(b.day).getTime() - new Date(a.day).getTime());

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-destructive">
        Error loading food logs. Please try again.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Tabs defaultValue="today" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="yesterday">Yesterday</TabsTrigger>
          <TabsTrigger value="month">Month</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="mt-4">
          {todayLogs.length > 0 ? (
            <FoodLogList foodLogs={todayLogs} />
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No food logs for today. Add one using the button above.
            </div>
          )}
        </TabsContent>

        <TabsContent value="yesterday" className="mt-4">
          {yesterdayLogs.length > 0 ? (
            <FoodLogList foodLogs={yesterdayLogs} />
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No food logs for yesterday.
            </div>
          )}
        </TabsContent>

        <TabsContent value="month" className="mt-4">
          <h2 className="text-xl font-semibold mb-4">
            {format(today, "MMMM yyyy")} Summary
          </h2>

          {dailyTotals.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {dailyTotals.map((daily) => (
                <Card key={daily.day}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex justify-between items-start">
                      <span>{daily.formattedDay}</span>
                      <span className="text-xl font-bold">
                        {daily.totalCalories?.toFixed(1) || 0} kcal
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <div className="text-center">
                        <p className="text-lg font-medium">{daily.logCount}</p>
                        <p className="text-xs text-muted-foreground">
                          Food Items
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-medium">
                          {daily.totalCalories?.toFixed(1) || 0}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Calories
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <p className="text-sm font-medium">
                          {daily.totalProtein?.toFixed(1) || 0}g
                        </p>
                        <p className="text-xs text-muted-foreground">Protein</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {daily.totalCarbs?.toFixed(1) || 0}g
                        </p>
                        <p className="text-xs text-muted-foreground">Carbs</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {daily.totalFat?.toFixed(1) || 0}g
                        </p>
                        <p className="text-xs text-muted-foreground">Fat</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No food logs for this month.
            </div>
          )}
        </TabsContent>
        <TabsContent value="analytics" className="mt-4">
          <AnalyticsPage />
        </TabsContent>
      </Tabs>
    </div>
  );
}
