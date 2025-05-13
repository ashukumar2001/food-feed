import * as React from "react";
import {
  RiGithubFill,
  // RiGoogleFill,
} from "@remixicon/react";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { authClient } from "@/lib/auth-client";

export function GetStartedButton() {
  const [open, setOpen] = React.useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">Get Started</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-center">
              Sign in to FoodFeed
            </DialogTitle>
          </DialogHeader>
          <SignInForm className="flex-col gap-3" />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline">Get Started</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle className="text-center">Sign in to FoodFeed</DrawerTitle>
        </DrawerHeader>
        <SignInForm className="px-4 flex-col gap-3" />
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

function SignInForm({ className }: React.ComponentProps<"form">) {
  return (
    <div className={cn("flex", className)}>
      {/* <Button variant="outline">
        <RiGoogleFill
          className="me-3 text-[#DB4437] dark:text-white/60"
          size={16}
          aria-hidden="true"
        />
        Login with Google
      </Button>
      <Button variant="outline">
        <RiTwitterXFill
          className="me-3 text-[#14171a] dark:text-white/60"
          size={16}
          aria-hidden="true"
        />
        Login with X
      </Button>
      <Button variant="outline">
        <RiFacebookFill
          className="me-3 text-[#1877f2] dark:text-white/60"
          size={16}
          aria-hidden="true"
        />
        Login with Facebook
      </Button> */}
      <Button
        variant="outline"
        onClick={() =>
          authClient.signIn.social({
            provider: "github",
          })
        }
      >
        <RiGithubFill
          className="me-3 text-[#333333] dark:text-white/60"
          size={16}
          aria-hidden="true"
        />
        Login with GitHub
      </Button>
    </div>
  );
}
