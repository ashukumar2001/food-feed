import { useQuery } from "@tanstack/react-query";
import { trpcClient } from "@/lib/trpc-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Button } from "@/components/ui/button";
import { format, subDays, isAfter } from "date-fns";
import { useState } from "react";
import { BarChart, Bar, XAxis, CartesianGrid, LabelList } from "recharts";
import { formatNumber } from "@/lib/utils";

const METRICS = [
  { value: "calories", label: "Calories" },
  { value: "protein", label: "Protein" },
  { value: "carbs", label: "Carbs" },
  { value: "fat", label: "Fat" },
] as const;
type Metric = (typeof METRICS)[number]["value"];

// Define FoodLog type
export type FoodLog = {
  timestamp: string | Date;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
};

export function AnalyticsPage() {
  const [metric, setMetric] = useState<Metric>("calories");
  const [weekOffset, setWeekOffset] = useState(0); // 0 = current week
  const today = new Date();
  // Calculate the start and end of the selected week
  const startOfWeek = subDays(today, 6 - weekOffset * 7);
  const endOfWeek = subDays(today, weekOffset * 7);

  const {
    data: foodLogs = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["foodLogs"],
    queryFn: () => trpcClient.food.getFoodLogs.query(),
  });

  // Filter logs for the selected week
  const weekLogs = (foodLogs as FoodLog[]).filter((log) => {
    const logDate = new Date(log.timestamp);
    return (
      (isAfter(logDate, subDays(endOfWeek, 7)) ||
        format(logDate, "yyyy-MM-dd") === format(startOfWeek, "yyyy-MM-dd")) &&
      logDate <= endOfWeek &&
      logDate >= startOfWeek
    );
  });

  // Group logs by day for the selected week
  const logsByDay: Record<string, FoodLog[]> = {};
  for (let i = 0; i < 7; i++) {
    const day = format(subDays(endOfWeek, 6 - i), "yyyy-MM-dd");
    logsByDay[day] = [];
  }
  weekLogs.forEach((log) => {
    const day = format(new Date(log.timestamp), "yyyy-MM-dd");
    if (logsByDay[day]) logsByDay[day].push(log);
  });

  // Calculate daily totals
  const dailyTotals = Object.entries(logsByDay).map(([day, logs]) => {
    return {
      day: format(new Date(day), "EEE"),
      calories: logs.reduce(
        (sum, log) => sum + (formatNumber(log.calories) || 0),
        0
      ),
      protein: logs.reduce(
        (sum, log) => sum + (formatNumber(log.protein) || 0),
        0
      ),
      carbs: logs.reduce((sum, log) => sum + (formatNumber(log.carbs) || 0), 0),
      fat: logs.reduce((sum, log) => sum + (formatNumber(log.fat) || 0), 0),
    };
  });

  return (
    <>
      <h1 className="text-2xl font-semibold mb-4">Weekly Analytics</h1>
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between gap-4 flex-col items-start">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setWeekOffset((w) => w - 1)}
                aria-label="Previous Week"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="font-medium text-sm">
                {format(startOfWeek, "MMM d")} -{" "}
                {format(endOfWeek, "MMM d, yyyy")}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setWeekOffset((w) => w + 1)}
                aria-label="Next Week"
                disabled={weekOffset === 0}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
            {/* Metric badges */}
            <div className="flex gap-2">
              {METRICS.map((m) => (
                <Button
                  key={m.value}
                  variant={metric === m.value ? "default" : "outline"}
                  size="sm"
                  className={metric === m.value ? "font-bold" : ""}
                  onClick={() => setMetric(m.value)}
                >
                  {m.label}
                </Button>
              ))}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="text-destructive text-center py-8">
              Error loading data
            </div>
          ) : (
            <ChartContainer
              config={{
                [metric]: {
                  label: METRICS.find((m) => m.value === metric)?.label,
                },
              }}
              className="w-full h-72"
            >
              <BarChart
                accessibilityLayer
                data={dailyTotals}
                margin={{ top: 20 }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(value) => value.slice(0, 3)}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Bar dataKey={metric} fill="var(--chart-2)" radius={8}>
                  <LabelList
                    position="top"
                    offset={12}
                    className="fill-foreground"
                    fontSize={12}
                  />
                </Bar>
              </BarChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>
    </>
  );
}

export default AnalyticsPage;
