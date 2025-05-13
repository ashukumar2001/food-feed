import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { trpcClient } from "../../lib/trpc-client";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Loader2, Trash2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import { EditFoodLogResponsiveDialog } from "./edit-food-log-responsive-dialog";

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

interface FoodLogListProps {
  foodLogs?: FoodLog[];
}

export function FoodLogList({ foodLogs }: FoodLogListProps) {
  const queryClient = useQueryClient();

  // Query for fetching food logs (only used when foodLogs prop is not provided)
  const {
    data: fetchedFoodLogs,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["foodLogs"],
    queryFn: () => trpcClient.food.getFoodLogs.query(),
    enabled: !foodLogs, // Only fetch if no foodLogs prop
  });

  // Use provided foodLogs or fetched logs
  const logs = foodLogs || fetchedFoodLogs || [];
  const loadingLogs = !foodLogs && isLoading;
  const errorLoadingLogs = !foodLogs && error;

  // Mutation for deleting a food log
  const deleteFoodLog = useMutation({
    mutationFn: (id: string) => {
      return trpcClient.food.deleteFoodLog.mutate({ id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["foodLogs"] });
      queryClient.invalidateQueries({ queryKey: ["dailySummary"] });
    },
  });

  // Handle delete button click
  const handleDeleteClick = (id: string) => {
    if (confirm("Are you sure you want to delete this food log?")) {
      deleteFoodLog.mutate(id);
    }
  };

  // Format time from ISO string
  const formatLogTime = (timestamp: string) => {
    return format(parseISO(timestamp), "h:mm a");
  };

  if (loadingLogs) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (errorLoadingLogs) {
    return (
      <div className="p-4 text-destructive">
        Error loading food logs. Please try again.
      </div>
    );
  }

  if (!logs || logs.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No food logs yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        {logs.map((log: FoodLog) => (
          <Card key={log.id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex justify-between items-start">
                <span>{log.name}</span>
                <span className="text-xl font-bold">{log.calories} kcal</span>
              </CardTitle>
              <div className="text-sm text-muted-foreground flex items-center justify-between">
                <span>{formatLogTime(log.timestamp)}</span>
                <span className="ml-2">
                  {format(parseISO(log.timestamp), "MMM d")}
                </span>
              </div>
            </CardHeader>

            <CardContent className="pb-2">
              <p className="text-sm">{log.description}</p>
              <div className="flex gap-3 mt-2 text-sm text-muted-foreground">
                <div>Protein: {log.protein || 0}g</div>
                <div>Carbs: {log.carbs || 0}g</div>
                <div>Fat: {log.fat || 0}g</div>
              </div>
            </CardContent>

            <CardFooter className="flex justify-end gap-2 pt-0">
              <EditFoodLogResponsiveDialog log={log} />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteClick(log.id)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
