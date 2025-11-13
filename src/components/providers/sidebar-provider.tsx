"use client";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

type SidebarContextType = {
  expanded: boolean;
  setExpanded: (value: boolean) => void;
  toggle: () => void;
};

const SidebarContext = createContext<SidebarContextType | null>(null);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [expanded, setExpanded] = useState(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const stored = typeof window !== "undefined" ? window.localStorage.getItem("sidebar:expanded") : null;
      if (stored !== null) {
        setExpanded(stored === "true");
      }
    } catch {/* ignore */}
  }, []);

  // Persist changes
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        window.localStorage.setItem("sidebar:expanded", String(expanded));
      }
    } catch {/* ignore */}
  }, [expanded]);

  const toggle = useCallback(() => setExpanded((v) => !v), []);

  return (
    <SidebarContext.Provider value={{ expanded, setExpanded, toggle }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error("useSidebar must be used within SidebarProvider");
  return ctx;
}