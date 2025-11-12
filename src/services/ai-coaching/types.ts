export type TradeExample = {
  date: string;
  symbol: string;
  side: "BUY" | "SELL";
  lots: number;
  entry: number;
  exit: number;
  pnlJPY: number;
  note?: string;
};

export type KPIRow = {
  metric: string;
  target: string;
  coachNote: string;
};

export type RuleRow = {
  ruleId: string;
  title: string;
  content: string;
  coachNote: string;
};

export type StrengthWeaknessRow = {
  item: string;
  strength: string;
  improvement: string;
  coachNote: string;
};

export type Playbook = {
  trendFollowing: {
    conditions: string[];
    entry: string[];
    sl: string;
    tp: string;
    example?: TradeExample;
    coachNote: string;
  };
  meanReversion: {
    conditions: string[];
    lotPolicy: string;
    timeStop?: string;
    example?: TradeExample;
    coachNote: string;
  };
};

export type FourWeekPlanRow = {
  week: string;
  theme: string;
  content: string;
  coachNote: string;
};

export type DiaryGuideRow = {
  item: string;
  content: string;
  coachNote: string;
};

export type CoachingSheet = {
  summary: string[];
  examples: TradeExample[];
  strengthsWeaknesses: StrengthWeaknessRow[];
  rules: RuleRow[];
  playbook: Playbook;
  diaryGuide: { rows: DiaryGuideRow[] };
  kpis: KPIRow[];
  fourWeekPlan: FourWeekPlanRow[];
  coachingMessage: string[];
  nextSteps: string[];
};

export type AIResponse = {
  markdown: string;
  sheet: CoachingSheet;
  meta?: { model?: string; generatedAt?: string };
};
