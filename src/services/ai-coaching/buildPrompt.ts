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
- 実例：勝ち×2／負け×2／ロット過大または逆張り×1以上で、合計5〜6のトレード例を必ず含める
- 実例は「日付・通貨ペア・方向・サイズ・価格→価格・損益（円）」まで具体化
- 強み→具体例→改善の一言 の順
- 口調：優しいコーチ（です・ます調）、「コメント」語は使わない
- 8セクション固定順＋最後に次のステップ提案（1〜2行）

**重要：必ず以下のJSON構造で出力してください。markdown、sheet、metaの3つのトップレベルキーが必須です。**

{
  "markdown": "# FXトレードコーチングシート\\n\\n## 1️⃣ 現状サマリー\\n\\n...(全セクションのMarkdown)",
  "sheet": {
    "summaryComment": "導入コメント",
    "summary": ["サマリー段落1", "サマリー段落2", "サマリー段落3"],
    "examples": [
      {
        "date": "2025-10-03",
        "symbol": "USDJPY",
        "side": "SELL",
        "lots": 0.5,
        "entry": 149.20,
        "exit": 148.50,
        "pnlJPY": 35000,
        "note": "順張り成功例"
      }
    ],
    "strengthsWeaknessesComment": "強みと課題の導入コメント",
    "strengthsWeaknesses": [
      {
        "item": "項目名",
        "strength": "強みの説明",
        "improvement": "改善案",
        "coachNote": "コーチからの一言"
      }
    ],
    "rulesComment": "ルールの導入コメント",
    "rules": [
      {
        "ruleId": "rule1",
        "title": "ルールタイトル",
        "content": "ルール内容",
        "coachNote": "コーチノート"
      }
    ],
    "playbookComment": "プレイブックの導入コメント",
    "playbook": {
      "trendFollowing": {
        "conditions": ["条件1", "条件2"],
        "entry": ["エントリー条件1"],
        "sl": "損切りルール",
        "tp": "利確ルール",
        "example": {
          "date": "2025-10-03",
          "symbol": "USDJPY",
          "side": "SELL",
          "lots": 0.5,
          "entry": 149.20,
          "exit": 148.50,
          "pnlJPY": 35000,
          "note": "順張り好例"
        },
        "coachNote": "順張りについてのアドバイス"
      },
      "meanReversion": {
        "conditions": ["条件1"],
        "lotPolicy": "ロット管理",
        "timeStop": "時間制限",
        "example": {
          "date": "2025-10-05",
          "symbol": "GOLD",
          "side": "BUY",
          "lots": 0.01,
          "entry": 2650.0,
          "exit": 2655.0,
          "pnlJPY": 500,
          "note": "逆張り研究"
        },
        "coachNote": "逆張りについてのアドバイス"
      }
    },
    "diaryGuide": {
      "comment": "日記ガイドの導入コメント",
      "rows": [
        {
          "item": "🎯 記録項目",
          "content": "記録内容",
          "coachNote": "アドバイス"
        }
      ]
    },
    "kpisComment": "KPIの導入コメント",
    "kpis": [
      {
        "metric": "指標名",
        "target": "目標値",
        "coachNote": "説明"
      }
    ],
    "fourWeekPlanComment": "4週間プランの導入コメント",
    "fourWeekPlan": [
      {
        "week": "Week 1",
        "theme": "テーマ",
        "content": "内容",
        "coachNote": "アドバイス"
      }
    ],
    "coachingMessage": ["メッセージ段落1", "メッセージ段落2", "メッセージ段落3"],
    "nextSteps": ["次のステップ1", "次のステップ2"]
  },
  "meta": {
    "generatedAt": "2025-11-13T10:30:00+09:00"
  }
}

**絶対に守ること：**
1. JSONの最上位には必ず "markdown", "sheet", "meta" の3つのキーを含める
2. sheetオブジェクト内のすべてのフィールド（summaryComment, summary, examples等）を含める
3. markdownのみ、またはsheetのみの出力は不可

ここからデータ（JSON）：
<<TRADES_JSON>>

**繰り返し：上記のJSON構造（markdown + sheet + meta）で出力してください。**
`.trim();

  const jsonStr = JSON.stringify(input.tradesJson).slice(0, 200_000);
  return userTemplate.replaceAll('<<TRADES_JSON>>', jsonStr);
}
