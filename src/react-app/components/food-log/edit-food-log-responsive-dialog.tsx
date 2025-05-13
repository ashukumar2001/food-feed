import * as React from "react";
import { Button } from "@/components/ui/button";
import { Pencil, Loader2, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { trpcClient } from "../../lib/trpc-client";
import { format, parseISO } from "date-fns";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

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

interface EditFoodLogResponsiveDialogProps {
  log: FoodLog;
  onComplete?: () => void;
}

export function EditFoodLogResponsiveDialog({
  log,
  onComplete,
}: EditFoodLogResponsiveDialogProps) {
  const [open, setOpen] = React.useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const queryClient = useQueryClient();

  const [newCalories, setNewCalories] = React.useState<number>(log.calories);
  const [newProtein, setNewProtein] = React.useState<number>(log.protein || 0);
  const [newCarbs, setNewCarbs] = React.useState<number>(log.carbs || 0);
  const [newFat, setNewFat] = React.useState<number>(log.fat || 0);
  const [newTime, setNewTime] = React.useState<string>("");

  // Set up initial values when the component mounts or log changes
  React.useEffect(() => {
    setNewCalories(log.calories);
    setNewProtein(log.protein || 0);
    setNewCarbs(log.carbs || 0);
    setNewFat(log.fat || 0);

    // Extract the time from the timestamp
    const date = parseISO(log.timestamp);
    setNewTime(format(date, "HH:mm"));
  }, [log]);

  // Mutation for updating a food log
  const updateFoodLog = useMutation({
    mutationFn: ({
      id,
      calories,
      protein,
      carbs,
      fat,
      time,
    }: {
      id: string;
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
      time?: string;
    }) => {
      // Create a new Date using the original timestamp
      const originalDate = parseISO(log.timestamp);

      // If time is provided, update the hours and minutes
      let newTimestamp = new Date(originalDate);
      if (time) {
        const [hours, minutes] = time.split(":").map(Number);
        newTimestamp.setHours(hours, minutes);
      }

      return trpcClient.food.updateFoodLog.mutate({
        id,
        calories,
        protein,
        carbs,
        fat,
        timestamp: newTimestamp.toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["foodLogs"] });
      queryClient.invalidateQueries({ queryKey: ["dailySummary"] });
      setOpen(false);
      if (onComplete) onComplete();
    },
  });

  // Handle update submission
  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFoodLog.mutate({
      id: log.id,
      calories: newCalories,
      protein: newProtein,
      carbs: newCarbs,
      fat: newFat,
      time: newTime,
    });
  };

  const FormContent = React.forwardRef<
    HTMLFormElement,
    React.ComponentPropsWithoutRef<"form">
  >(({ className, ...props }, ref) => (
    <form
      ref={ref}
      onSubmit={handleUpdateSubmit}
      className={className}
      {...props}
    >
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label
              htmlFor="editTime"
              className="block text-sm font-medium mb-1"
            >
              Time
            </label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="editTime"
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="calories" className="text-sm font-medium">
            Calories(kcal)
          </label>
          <Input
            id="calories"
            type="number"
            value={newCalories}
            onChange={(e) => setNewCalories(Number(e.target.value))}
            min={0}
            className="mt-1"
          />
        </div>

        <div>
          <label htmlFor="protein" className="text-sm font-medium">
            Protein (g)
          </label>
          <Input
            id="protein"
            type="number"
            value={newProtein}
            onChange={(e) => setNewProtein(Number(e.target.value))}
            min={0}
            className="mt-1"
          />
        </div>

        <div>
          <label htmlFor="carbs" className="text-sm font-medium">
            Carbs (g)
          </label>
          <Input
            id="carbs"
            type="number"
            value={newCarbs}
            onChange={(e) => setNewCarbs(Number(e.target.value))}
            min={0}
            className="mt-1"
          />
        </div>

        <div>
          <label htmlFor="fat" className="text-sm font-medium">
            Fat (g)
          </label>
          <Input
            id="fat"
            type="number"
            value={newFat}
            onChange={(e) => setNewFat(Number(e.target.value))}
            min={0}
            className="mt-1"
          />
        </div>
      </div>
    </form>
  ));
  FormContent.displayName = "FormContent";

  if (isDesktop) {
    return (
      <>
        <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
          <Pencil className="h-4 w-4 mr-1" />
          Edit
        </Button>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Nutrition Information</DialogTitle>
            </DialogHeader>

            <FormContent className="pt-4" />

            <div className="mt-6 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateSubmit}
                disabled={updateFoodLog.isPending}
              >
                {updateFoodLog.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
        <Pencil className="h-4 w-4 mr-1" />
        Edit
      </Button>

      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent>
          <DrawerHeader className="text-left">
            <DrawerTitle>Edit Nutrition Information</DrawerTitle>
          </DrawerHeader>

          <div className="px-4 pb-4 max-h-[75dvh] overflow-y-auto">
            <FormContent />
          </div>

          <DrawerFooter className="pt-2">
            <div className="grid w-full grid-cols-2 gap-2">
              <DrawerClose asChild>
                <Button variant="outline" className="w-full">
                  Cancel
                </Button>
              </DrawerClose>
              <Button
                onClick={handleUpdateSubmit}
                disabled={updateFoodLog.isPending}
                className="w-full"
              >
                {updateFoodLog.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}
