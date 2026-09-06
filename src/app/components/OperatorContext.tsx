import React, { createContext, useContext, useState } from "react";
import { resolveOperator, type OperatorData } from "../../services/operators";

export type { OperatorData };

interface OperatorContextType {
  operator: OperatorData;
  setOperator: (op: OperatorData) => void;
}

const OperatorContext = createContext<OperatorContextType | undefined>(undefined);

export function OperatorProvider({ children }: { children: React.ReactNode }) {
  // A operadora é resolvida de forma síncrona a partir da configuração do deploy
  // (variáveis de ambiente ou domínio de acesso). Não há requisição de rede.
  const [operator, setOperator] = useState<OperatorData>(resolveOperator);

  return (
    <OperatorContext.Provider value={{ operator, setOperator }}>
      {children}
    </OperatorContext.Provider>
  );
}

export function useOperator() {
  const ctx = useContext(OperatorContext);
  if (!ctx) throw new Error("useOperator must be used within OperatorProvider");
  return ctx;
}
