import React from "react";
import { debounce } from './debounce';
import { parseFiltersFromUrl, syncFiltersToUrl, abortPreviousRequest } from './urlSync';
import { showToast } from './toast';
import { loadUseDatabaseMode, saveUseDatabaseMode } from './storage';

type DS = "A"|"B"|"C";
export type Filters = {
  symbol?:string; session?:string; weekday?:string;
  side?:string; pnl?:string; from?:string; to?:string;
};

type Ctx = {
  dataset: DS;
  filters: Filters;
  uiFilters: Filters;
  useDatabase: boolean;
  loading: boolean;
  isInitialized: boolean;
  setDataset: (d:DS)=>void;
  setUiFilters: (p:Partial<Filters>)=>void;
  resetFilters: ()=>void;
  setUseDatabase: (value: boolean)=>void;
};

const C = React.createContext<Ctx | null>(null);
export const useDataset = () => {
  const v = React.useContext(C);
  if(!v) throw new Error("DatasetProvider missing");
  return v;
};

export function DatasetProvider({children}:{children:React.ReactNode}) {
  const [dataset, setDataset] = React.useState<DS>("A");
  const [filters, setFilters] = React.useState<Filters>({});
  const [uiFilters, setUiFiltersState] = React.useState<Filters>(() => parseFiltersFromUrl());
  const [useDatabase, setUseDatabaseState] = React.useState<boolean>(() => loadUseDatabaseMode());
  const [loading, setLoading] = React.useState<boolean>(false);
  const [hasCheckedDatabase, setHasCheckedDatabase] = React.useState<boolean>(false);
  const previousFiltersRef = React.useRef<Filters>({});

  const setUseDatabase = React.useCallback((value: boolean) => {
    setUseDatabaseState(value);
    saveUseDatabaseMode(value);
  }, []);

  const debouncedApplyFilters = React.useMemo(
    () => debounce(async (newFilters: Filters) => {
      const controller = abortPreviousRequest();
      previousFiltersRef.current = filters;

      setLoading(true);

      try {
        if (controller.signal.aborted) return;

        setFilters(newFilters);
        syncFiltersToUrl(newFilters);
      } catch (error) {
        console.error('Filter application failed:', error);
        setFilters(previousFiltersRef.current);
        showToast('フィルター適用に失敗しました', 'error');
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }, 200),
    [filters]
  );

  const setUiFilters = React.useCallback((p: Partial<Filters>) => {
    setUiFiltersState(prev => {
      const newFilters = { ...prev, ...p };
      debouncedApplyFilters(newFilters);
      return newFilters;
    });
  }, [debouncedApplyFilters]);

  const resetFilters = React.useCallback(() => {
    setUiFiltersState({});
    setFilters({});
    syncFiltersToUrl({});
  }, []);

  React.useEffect(() => {
    const handlePopState = () => {
      const urlFilters = parseFiltersFromUrl();
      setUiFiltersState(urlFilters);
      setFilters(urlFilters);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  React.useEffect(() => {
    if (hasCheckedDatabase) return;

    const checkDatabaseForData = async () => {
      try {
        const { getTradesCount } = await import('./db.service');
        const count = await getTradesCount();

        console.log('🔍 Checking database for existing data:', count, 'trades');

        if (count > 0) {
          console.log('✅ Found', count, 'trades in database, forcing database mode');
          if (!useDatabase) {
            console.log('⚠️ useDatabase was false, overriding to true');
          }
          setUseDatabaseState(true);
          saveUseDatabaseMode(true);
        } else {
          console.log('ℹ️ No trades in database, using demo data mode');
        }

        setHasCheckedDatabase(true);
      } catch (error) {
        console.error('Error checking database:', error);
        setHasCheckedDatabase(true);
      }
    };

    checkDatabaseForData();
  }, [hasCheckedDatabase, useDatabase]);

  const v: Ctx = {
    dataset,
    filters,
    uiFilters,
    useDatabase,
    loading,
    isInitialized: hasCheckedDatabase,
    setDataset,
    setUiFilters,
    resetFilters,
    setUseDatabase
  };

  return <C.Provider value={v}>{children}</C.Provider>;
}
