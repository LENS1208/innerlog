const MEMO_KEY = "trade_memos_v1";
const USE_DATABASE_KEY = "use_database_mode";

export type MemoMap = Record<string, string>;

export const loadMemoMap = (): MemoMap => {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem(MEMO_KEY) || "{}"); }
  catch { return {}; }
};

export const saveMemoMap = (m: MemoMap) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(MEMO_KEY, JSON.stringify(m));
};

export const loadUseDatabaseMode = (): boolean => {
  if (typeof window === "undefined") return false;
  try {
    const value = localStorage.getItem(USE_DATABASE_KEY);
    return value === "true";
  } catch {
    return false;
  }
};

export const saveUseDatabaseMode = (value: boolean) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(USE_DATABASE_KEY, value ? "true" : "false");
};
