import { createContext, useContext } from "react";

export interface ISidebarContext {
    isCollapsed: boolean;
    setIsCollapsed: (value : boolean) => void;
}

export const SidebarContext = createContext<ISidebarContext | null>(null);


export function useSidebarContext(): ISidebarContext {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("sidebar context dosent initializated propertly");
  }
  return context;
}