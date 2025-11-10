import React from "react";
import { debounce } from './debounce';
import { parseFiltersFromUrl, syncFiltersToUrl, abortPreviousRequest } from './urlSync';
import { showToast } from './toast';
import { supabase } from './supabase';

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
  const [useDatabase, setUseDatabase] = React.useState<boolean>(false);
  const [loading, setLoading] = React.useState<boolean>(false);
  const previousFiltersRef = React.useRef<Filters>({});

  React.useEffect(() => {
    const loadUserSettings = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('user_settings')
          .select('data_source, default_dataset')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Failed to load user settings:', error);
          return;
        }

        if (data) {
          if (data.data_source === 'database') {
            setUseDatabase(true);
          }
          if (data.default_dataset && ['A', 'B', 'C'].includes(data.default_dataset)) {
            setDataset(data.default_dataset as DS);
          }
        }
      } catch (error) {
        console.error('Error loading user settings:', error);
      }
    };

    loadUserSettings();
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

  const v: Ctx = {
    dataset,
    filters,
    uiFilters,
    useDatabase,
    loading,
    setDataset,
    setUiFilters,
    resetFilters,
    setUseDatabase
  };

  return <C.Provider value={v}>{children}</C.Provider>;
}
