import { SYSTEM_TXT, buildPrompt, type PromptInput } from './buildPrompt';
import type { AIResponse } from './types';

interface CallHints {
  dateRange?: string;
  focus?: string;
}

export async function callAutoReviewAI(
  tradesJson: any,
  hints?: CallHints,
  apiKey?: string
): Promise<AIResponse> {
  const userPrompt = buildPrompt({
    tradesJson,
    dateRangeHint: hints?.dateRange,
    focusHint: hints?.focus,
  });

  try {
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-coaching`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        systemPrompt: SYSTEM_TXT,
        userPrompt,
        apiKey,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.status}`);
    }

    const result: AIResponse = await response.json();
    return result;
  } catch (error) {
    console.error('AI呼び出しエラー:', error);

    return {
      markdown: '# エラー\n\nAIコーチングの生成中にエラーが発生しました。',
      sheet: {
        summary: ['データの分析中にエラーが発生しました。'],
        examples: [],
        strengthsWeaknesses: [],
        rules: [],
        playbook: {
          trendFollowing: {
            conditions: [],
            entry: [],
            sl: '',
            tp: '',
            coachNote: '',
          },
          meanReversion: {
            conditions: [],
            lotPolicy: '',
            coachNote: '',
          },
        },
        diaryGuide: { rows: [] },
        kpis: [],
        fourWeekPlan: [],
        coachingMessage: ['エラーが発生しました。後ほど再度お試しください。'],
        nextSteps: [],
      },
      meta: {
        generatedAt: new Date().toISOString(),
      },
    };
  }
}

export function generateMockCoachingSheet(): AIResponse {
  return {
    markdown: '# AIコーチングシート（サンプル）',
    sheet: {
      summary: [
        '取引回数: 45回、勝率: 62.2%、PF: 1.45',
        'USDJPYメイン、EURUSD補助的に使用',
        '順張りが得意、逆張りは改善の余地あり',
      ],
      examples: [
        {
          date: '2024-01-15',
          symbol: 'USDJPY',
          side: 'BUY',
          lots: 0.1,
          entry: 148.50,
          exit: 149.20,
          pnlJPY: 7000,
          note: '順張り成功例',
        },
        {
          date: '2024-01-18',
          symbol: 'EURUSD',
          side: 'SELL',
          lots: 0.1,
          entry: 1.0950,
          exit: 1.0920,
          pnlJPY: 4500,
          note: 'トレンドに沿った取引',
        },
      ],
      strengthsWeaknesses: [
        {
          item: 'トレンド認識',
          strength: '順張りで高い勝率を維持',
          improvement: '逆張り時の判断基準を明確化',
          coachNote: '現在の強みを活かしつつ、苦手分野を改善しましょう',
        },
      ],
      rules: [
        {
          ruleId: 'rule1',
          title: 'ロット管理の徹底',
          content: '1回のリスクは資金の1.5%以内',
          coachNote: '資金管理は長期的な成功の鍵です',
        },
      ],
      playbook: {
        trendFollowing: {
          conditions: ['明確なトレンド', '重要サポート/レジスタンスのブレイク'],
          entry: ['ブレイク後の押し目/戻り'],
          sl: 'エントリーの逆側20pips',
          tp: 'リスクの2倍',
          coachNote: '順張りはあなたの強みです',
        },
        meanReversion: {
          conditions: ['レンジ相場', 'オーバーシュート'],
          lotPolicy: '通常の50%以下',
          timeStop: '4時間以内',
          coachNote: '逆張りは慎重に、小ロットで',
        },
      },
      diaryGuide: {
        rows: [
          {
            item: 'トレード前',
            content: '相場環境、エントリー根拠',
            coachNote: '事前準備が成功率を高めます',
          },
        ],
      },
      kpis: [
        {
          metric: '勝率',
          target: '65%以上',
          coachNote: '現在62%、改善可能です',
        },
      ],
      fourWeekPlan: [
        {
          week: 'Week 1',
          theme: '守る（ルール遵守）',
          content: 'ロット管理とエントリールールの徹底',
          coachNote: '基本に忠実に',
        },
      ],
      coachingMessage: [
        'これまでの取引データを分析したところ、順張りでの安定した成果が確認できました。',
        '今後は逆張りの制御とロット管理の改善に注力することで、さらなる成長が期待できます。',
      ],
      nextSteps: ['ルール5項目を印刷して目の前に貼る', '1週間後に進捗を確認'],
    },
    meta: {
      model: 'mock',
      generatedAt: new Date().toISOString(),
    },
  };
}
