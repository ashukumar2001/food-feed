import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { trpcClient } from "../../lib/trpc-client";
import { Loader2, Clock } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

// Form validation schema
const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().max(100, "Max 100 characters allowed"),
  calories: z.number().min(0, "Calories must be a positive number"),
  protein: z.number().min(0, "Protein must be a positive number"),
  carbs: z.number().min(0, "Carbs must be a positive number"),
  fat: z.number().min(0, "Fat must be a positive number"),
  time: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface FoodLogFormProps {
  onSuccess?: () => void;
  className?: string;
}

export function FoodLogForm({ onSuccess, className }: FoodLogFormProps) {
  const [isEstimating, setIsEstimating] = useState(false);
  const queryClient = useQueryClient();
  const currentTime = format(new Date(), "HH:mm");

  // Set up react-hook-form
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      time: currentTime,
    },
  });

  // Watch description field to enable estimation
  const description = watch("description");
  const name = watch("name");

  // Mutation for creating a food log
  const createFoodLog = useMutation({
    mutationFn: (values: FormValues) => {
      // Create timestamp based on the provided time or current time
      let timestamp = new Date();

      if (values.time) {
        const [hours, minutes] = values.time.split(":").map(Number);
        timestamp.setHours(hours, minutes, 0, 0);
      }

      // Include the timestamp in the request
      return trpcClient.food.createFoodLog.mutate({
        name: values.name,
        description: values.description,
        calories: values.calories,
        protein: values.protein,
        carbs: values.carbs,
        fat: values.fat,
        timestamp: timestamp.toISOString(),
      });
    },
    onSuccess: () => {
      reset();
      queryClient.invalidateQueries({ queryKey: ["foodLogs"] });
      queryClient.invalidateQueries({ queryKey: ["dailySummary"] });
      if (onSuccess) onSuccess();
    },
  });

  // Function to estimate calories based on description
  const estimateCalories = async () => {
    if (!description || description.length < 3) return;

    setIsEstimating(true);
    try {
      const result = await trpcClient.food.analyze.query({
        description,
        name,
      });

      // Set all macro values from AI result
      setValue("calories", result.calories);
      setValue("protein", result.protein);
      setValue("carbs", result.carbs);
      setValue("fat", result.fat);
    } catch (error) {
      console.error("Error estimating calories:", error);
    } finally {
      setIsEstimating(false);
    }
  };

  // Form submission handler
  const onSubmit = async (data: FormValues) => {
    try {
      await createFoodLog.mutateAsync(data);
    } catch (error) {
      console.error("Error creating food log:", error);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={cn("space-y-4", className)}
    >
      <div>
        <Input
          placeholder="Food name (e.g. Chicken Salad)"
          {...register("name")}
          className={errors.name ? "border-destructive" : ""}
        />
        {errors.name && (
          <p className="mt-1 text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div>
        <Textarea
          placeholder="Food description (e.g. Grilled chicken with lettuce, tomato, and olive oil dressing)"
          {...register("description")}
          className={cn(
            errors.description && "border-destructive",
            "resize-none"
          )}
        />
        {errors.description && (
          <p className="mt-1 text-sm text-destructive">
            {errors.description.message}
          </p>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1">
          <label htmlFor="time" className="block text-sm font-medium mb-1">
            Time (optional)
          </label>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="time"
              type="time"
              {...register("time")}
              className="pl-10"
            />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Leave blank to use current time
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="calories" className="block text-sm font-medium mb-1">
            Calories
          </label>
          <Input
            id="calories"
            type="number"
            step="any"
            placeholder="Calories"
            {...register("calories", { valueAsNumber: true })}
            className={errors.calories ? "border-destructive" : ""}
          />
          {errors.calories && (
            <p className="mt-1 text-sm text-destructive">
              {errors.calories.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="protein" className="block text-sm font-medium mb-1">
            Protein (g)
          </label>
          <Input
            id="protein"
            type="number"
            step="any"
            placeholder="Protein (g)"
            {...register("protein", { valueAsNumber: true })}
            className={errors.protein ? "border-destructive" : ""}
          />
          {errors.protein && (
            <p className="mt-1 text-sm text-destructive">
              {errors.protein.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="carbs" className="block text-sm font-medium mb-1">
            Carbs (g)
          </label>
          <Input
            id="carbs"
            type="number"
            step="any"
            placeholder="Carbs (g)"
            {...register("carbs", { valueAsNumber: true })}
            className={errors.carbs ? "border-destructive" : ""}
          />
          {errors.carbs && (
            <p className="mt-1 text-sm text-destructive">
              {errors.carbs.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="fat" className="block text-sm font-medium mb-1">
            Fat (g)
          </label>
          <Input
            id="fat"
            type="number"
            step="any"
            placeholder="Fat (g)"
            {...register("fat", { valueAsNumber: true })}
            className={errors.fat ? "border-destructive" : ""}
          />
          {errors.fat && (
            <p className="mt-1 text-sm text-destructive">
              {errors.fat.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={estimateCalories}
          disabled={!description || description.length < 3 || isEstimating}
          className="w-full"
        >
          {isEstimating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Estimating...
            </>
          ) : (
            "Estimate Macros with AI"
          )}
        </Button>

        <Button
          type="submit"
          disabled={isSubmitting || createFoodLog.isPending}
          className="w-full"
        >
          {createFoodLog.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Add Food Log"
          )}
        </Button>
      </div>
    </form>
  );
}
