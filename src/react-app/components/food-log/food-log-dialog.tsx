import { useState } from "react";
import { Button } from "../ui/button";
import { PlusCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { FoodLogForm } from "./food-log-form";

export function FoodLogDialog() {
  const [isOpen, setIsOpen] = useState(false);

  const handleSuccess = () => {
    setIsOpen(false); // Close dialog on successful submission
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">
          <PlusCircle className="mr-2 h-5 w-5" />
          Add Food Log
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Food Log</DialogTitle>
        </DialogHeader>
        <FoodLogForm onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
}
