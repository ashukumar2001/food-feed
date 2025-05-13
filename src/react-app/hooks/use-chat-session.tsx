import { useLocation } from "@tanstack/react-router";
import { useMemo } from "react";
export const useChatSession = () => {
  const pathname = useLocation().pathname;
  const chatId = useMemo(() => {
    if (pathname.startsWith("/c/")) return pathname.split("/c/")[1];
  }, [pathname]);

  return { chatId };
};
