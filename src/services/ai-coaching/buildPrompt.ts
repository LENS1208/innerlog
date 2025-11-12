import systemPrompt from './SYSTEM_PROMPT.txt?raw';

export const SYSTEM_TXT = systemPrompt;

export interface PromptInput {
  tradesJson: any;
  dateRangeHint?: string;
  focusHint?: string;
}

export function buildPrompt(input: PromptInput): string {
  const userTemplate = `
目的：
アップロードしたMT4/MT5の履歴（HTML/CSV）を分析し、
「実例を中心」にした1ページのAIコーチングシートを作成してください。

入力：
- 取引履歴ファイル（JSON要約）：<<TRADES_JSON>>
- 期間メモ：${input.dateRangeHint ?? '（指定なし）'}
- 重点観点：${input.focusHint ?? 'ロット管理と逆張り制御'}

出力要件：
- 実例：勝ち×2／負け×2／ロット過大または逆張り×1以上
- 実例は「日付・通貨ペア・方向・サイズ・価格→価格・損益（円）」まで具体化
- 強み→具体例→改善の一言 の順
- 口調：優しいコーチ（です・ます調）、「コメント」語は使わない
- 8セクション固定順＋最後に次のステップ提案（1〜2行）

出力フォーマット：
必ずJSON形式で以下の構造で返してください：

{
  "markdown": "Markdown形式の全文",
  "sheet": {
    "summary": ["サマリー項目1", "サマリー項目2", ...],
    "examples": [
      {
        "date": "2024-01-15",
        "symbol": "USDJPY",
        "side": "BUY",
        "lots": 0.1,
        "entry": 148.50,
        "exit": 149.20,
        "pnlJPY": 7000,
        "note": "順張り成功例"
      }
    ],
    "strengthsWeaknesses": [
      {
        "item": "項目名",
        "strength": "強みの説明",
        "improvement": "改善案",
        "coachNote": "コーチからの一言"
      }
    ],
    "rules": [
      {
        "ruleId": "rule1",
        "title": "ルールタイトル",
        "content": "ルール内容",
        "coachNote": "コーチノート"
      }
    ],
    "playbook": {
      "trendFollowing": {
        "conditions": ["条件1", "条件2"],
        "entry": ["エントリー条件1"],
        "sl": "損切りルール",
        "tp": "利確ルール",
        "coachNote": "順張りについてのアドバイス"
      },
      "meanReversion": {
        "conditions": ["条件1"],
        "lotPolicy": "ロット管理",
        "timeStop": "時間制限",
        "coachNote": "逆張りについてのアドバイス"
      }
    },
    "diaryGuide": {
      "rows": [
        {
          "item": "記録項目",
          "content": "記録内容",
          "coachNote": "アドバイス"
        }
      ]
    },
    "kpis": [
      {
        "metric": "指標名",
        "target": "目標値",
        "coachNote": "説明"
      }
    ],
    "fourWeekPlan": [
      {
        "week": "Week 1",
        "theme": "テーマ",
        "content": "内容",
        "coachNote": "アドバイス"
      }
    ],
    "coachingMessage": ["メッセージ段落1", "メッセージ段落2"],
    "nextSteps": ["次のステップ1", "次のステップ2"]
  }
}

ここからデータ（JSON）：
<<TRADES_JSON>>
`.trim();

  const jsonStr = JSON.stringify(input.tradesJson).slice(0, 200_000);
  return userTemplate.replaceAll('<<TRADES_JSON>>', jsonStr);
}
