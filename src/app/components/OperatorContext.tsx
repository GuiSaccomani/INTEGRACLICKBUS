import React, { createContext, useContext, useState, useEffect } from "react";

export type OperatorData = {
  id: string;
  name: string;
  primaryColor: string;
  primaryDarkColor: string;
  logoUrl?: string; // Optional URL for custom image logos
};

// Default operator acts as a fallback or development mock
const DEFAULT_OPERATOR: OperatorData = {
  id: "clickbus",
  name: "ClickBus",
  primaryColor: "#7B2CBF",
  primaryDarkColor: "#5B1A9F",
};

interface OperatorContextType {
  operator: OperatorData;
  setOperator: (op: OperatorData) => void;
  isLoading: boolean;
}

const OperatorContext = createContext<OperatorContextType | undefined>(undefined);

export function OperatorProvider({ children }: { children: React.ReactNode }) {
  const [operator, setOperator] = useState<OperatorData>(DEFAULT_OPERATOR);
  const [isLoading, setIsLoading] = useState(true);

  // Simulating an API call to fetch operator tokens on mount
  useEffect(() => {
    // In production, this would fetch from an API based on domain, user token, or app config.
    const fetchOperatorConfig = async () => {
      setIsLoading(true);
      try {
        // Mocking network delay
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Example logic: if we were Águia Branca, we could set:
        // setOperator({ id: "aguiabranca", name: "Águia Branca", primaryColor: "#059669", primaryDarkColor: "#047857" });
        
        setOperator(DEFAULT_OPERATOR);
      } catch (err) {
        console.error("Failed to fetch operator config, using default.", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOperatorConfig();
  }, []);

  return (
    <OperatorContext.Provider value={{ operator, setOperator, isLoading }}>
      {children}
    </OperatorContext.Provider>
  );
}

export function useOperator() {
  const ctx = useContext(OperatorContext);
  if (!ctx) throw new Error("useOperator must be used within OperatorProvider");
  return ctx;
}
