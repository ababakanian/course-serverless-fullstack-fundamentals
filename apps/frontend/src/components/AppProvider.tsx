"use client";
import { IAuthUser } from "@/lib";
import React, { useContext, createContext, useState } from "react";
import { useToast } from "./ui/use-toast";

type IAppContext = {
  user: IAuthUser | null | undefined;
  setUser: (user: IAuthUser | null) => void;
  setError: (msg: string) => void;
  resetError: () => void;
};

const AppContext = createContext<IAppContext>({
  user: null,
  setUser: (user) => {},
  setError: (msg) => {},
  resetError: () => {},
});

function useInitialApp(): IAppContext {
  const [user, setUser] = useState<IAuthUser | null | undefined>(undefined);
  const { toast, dismiss } = useToast();

  return {
    user,
    setUser,
    setError: (msg) => {
      // console.error(msg);
      toast({
        variant: "destructive",
        title: "Error",
        description: msg,
      });
    },
    resetError: () => {
      // console.error("clear error");
      dismiss();
    },
  };
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const initialValue = useInitialApp();
  return (
    <AppContext.Provider value={initialValue}>{children}</AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
