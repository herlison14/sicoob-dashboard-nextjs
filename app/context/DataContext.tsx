'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface DashboardData {
  coop: any[];
  hist: any[];
  params: Record<string, any>;
}

interface DataContextType {
  data: DashboardData | null;
  setData: (data: DashboardData) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const value: DataContextType = {
    data,
    setData,
    isLoading,
    setIsLoading,
    error,
    setError,
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
