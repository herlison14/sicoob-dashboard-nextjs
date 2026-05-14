'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export interface Cooperado {
  Empresa?: string;
  CNPJ?: string;
  Familia?: string; // C1, C2, C3
  Saldo_Devedor?: number;
  Capital_Integralizado?: number;
  Pct_Capital?: number;
  Gap_Pct?: number;
  Necessidade_Capital?: number;
  Status?: string; // Blindada, Mediana, Desenquadrada
  CRL_Anterior?: number | string;
  CRL_Atual?: number | string;
  Tendencia?: string; // Piora, Estavel, Melhora, Sem dado
  [key: string]: unknown;
}

export interface HistoricoItem {
  Mes_Ano?: string;
  Capital_Integralizado?: number;
  [key: string]: unknown;
}

export interface DashboardMeta {
  cooperados?: number;
  historico?: number;
  parametros?: number;
  principalSheet?: string;
  columnMap?: Record<string, string>;
  allSheets?: Array<{ name: string; rows: number; headers: string[]; score?: number }>;
}

export interface DashboardData {
  coop: Cooperado[];
  hist: HistoricoItem[];
  params: Record<string, unknown>;
  meta?: DashboardMeta;
}

interface DataContextType {
  data: DashboardData | null;
  setData: (data: DashboardData | null) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
  clearData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const STORAGE_KEY = 'sicoob_dashboard_data';

export function DataProvider({ children }: { children: ReactNode }) {
  const [data, setDataState] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // Hidratar do sessionStorage no primeiro render
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        setDataState(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Erro ao carregar dados do sessionStorage:', e);
    }
    setHydrated(true);
  }, []);

  const setData = (newData: DashboardData | null) => {
    setDataState(newData);
    try {
      if (newData) {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
      } else {
        sessionStorage.removeItem(STORAGE_KEY);
      }
    } catch (e) {
      console.error('Erro ao salvar dados:', e);
    }
  };

  const clearData = () => {
    setData(null);
  };

  const value: DataContextType = {
    data: hydrated ? data : null,
    setData,
    isLoading,
    setIsLoading,
    error,
    setError,
    clearData,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within DataProvider');
  }
  return context;
}
