import React from "react";

type DS = "A"|"B"|"C";
export type Filters = {
  symbol?:string; session?:string; weekday?:string;
  side?:string; pnl?:string; from?:string; to?:string;
};

type Ctx = {
  dataset: DS;
  filters: Filters;
  uiFilters: Filters;
  setDataset: (d:DS)=>void;
  setUiFilters: (p:Partial<Filters>)=>void;
  applyFilters: ()=>void;
  resetFilters: ()=>void;
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
  const [uiFilters, setUiFiltersState] = React.useState<Filters>({});
  const setUiFilters = (p:Partial<Filters>)=> setUiFiltersState(prev=>({...prev,...p}));
  const applyFilters = ()=> setFilters(uiFilters);
  const resetFilters = ()=> { setUiFiltersState({}); setFilters({}); };
  const v:Ctx = {dataset, filters, uiFilters, setDataset, setUiFilters, applyFilters, resetFilters};
  return <C.Provider value={v}>{children}</C.Provider>;
}
