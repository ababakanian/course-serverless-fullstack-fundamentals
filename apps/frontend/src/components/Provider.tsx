"use client";

import React, { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppProvider } from "./AppProvider";

export function Provider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <AppProvider>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </AppProvider>
  );
}
