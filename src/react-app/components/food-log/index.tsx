import { FoodLogResponsiveDialog } from "./food-log-responsive-dialog";
import { DailySummary } from "./daily-summary";
import { FoodLogsWithTabs } from "./food-logs-with-tabs";

export function CalorieTracker() {
  return (
    <div className="container mx-auto py-8 space-y-8 px-4">
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Today's Summary</h2>
        <DailySummary />
        <div className="mt-4">
          <FoodLogResponsiveDialog />
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Food Logs</h2>
        <FoodLogsWithTabs />
      </section>
    </div>
  );
}
