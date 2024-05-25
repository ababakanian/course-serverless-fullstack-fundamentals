"use client";
import { IAuthUser } from "@/lib";
import React, { useContext, createContext, useState } from "react";
import { useToast } from "./ui/use-toast";
import { ITranslateResult } from "@sff/shared-types";

type IAppContext = {
  user: IAuthUser | null | undefined;
  setUser: (user: IAuthUser | null) => void;
  setError: (msg: string) => void;
  resetError: () => void;
  selectedTranslation: ITranslateResult | null;
  setSelectedTranslation: (item: ITranslateResult) => void;
};

const AppContext = createContext<IAppContext>({
  user: null,
  setUser: (user) => {},
  setError: (msg) => {},
  resetError: () => {},
  selectedTranslation: null,
  setSelectedTranslation: (item: ITranslateResult) => {},
});

function useInitialApp(): IAppContext {
  const [selectedTranslation, setSelectedTranslation] =
    useState<ITranslateResult | null>(null);
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
    selectedTranslation,
    setSelectedTranslation,
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
