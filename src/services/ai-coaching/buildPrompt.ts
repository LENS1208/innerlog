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

**重要：入力データの構造**
tradesJson.trades配列の各要素には以下のフィールドがあります：
- ticket: チケット番号
- closeDate: 決済日時（ISO 8601形式）
- symbol: 通貨ペア
- side: 売買方向（"BUY" または "SELL"）
- lots: ロット数
- openPrice: 建値
- closePrice: 決済値
- profit: 損益（円）
- pips: pips値

tradesJson.summaryには以下の統計情報があります：
- avgLotSize: 平均ロットサイズ
- maxLotSize: 最大ロットサイズ
- minLotSize: 最小ロットサイズ
- avgWin: 平均勝ちトレード損益
- avgLoss: 平均負けトレード損益

**出力時には、必ず実際のデータの値を使用してください。ダミーデータを生成しないでください。**

出力要件：
- **強みと課題**：必ず以下の5項目を使用（項目名を正確に）
  1. エントリータイミング
  2. リスク管理
  3. 損切り・利確
  4. 感情コントロール
  5. 一貫性・再現性
- 各項目で具体的なトレード例を必ず含める（日付、通貨ペア、損益、pips）
- 「〜が見られます」ではなく「10月15日のUSDJPY売り（+35,000円）では」のように具体的に
- 実例：勝ち×2／負け×2／ロット過大または逆張り×1以上で、合計5〜6のトレード例を必ず含める
- **ロット過大の判定基準（重要）**：
  * tradesJson.summary.avgLotSizeの2倍以上のロット数を使用している取引を「ロット過大」とする
  * 例：平均ロット0.5の場合、1.0以上の取引がロット過大
  * 例：平均ロット1.0の場合、2.0以上の取引がロット過大
  * 単に損失が大きいだけで、ロット数が平均的な取引は「ロット過大」ではない
  * まず各取引のlotsと平均ロットを比較し、2倍以上の取引だけを「ロット過大」と判定する
  * ロット過大の例が見つからない場合は、「逆張り」や「損切り遅延」などの別の改善点を選ぶ
- 実例は実際のtradesJson.trades配列から選び、以下のマッピングで出力：
  * date ← closeDate
  * symbol ← symbol
  * side ← side
  * lots ← lots
  * entry ← openPrice
  * exit ← closePrice
  * pnlJPY ← profit
  * pips ← pips
  * ticket ← ticket
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
        "date": "2025-10-03T12:30:00Z",
        "symbol": "USDJPY",
        "side": "SELL",
        "lots": 0.5,
        "entry": 149.20,
        "exit": 148.50,
        "pnlJPY": 35000,
        "pips": 70.0,
        "ticket": "123456",
        "note": "順張り成功例"
      }
    ],
    "strengthsWeaknessesComment": "強みと課題の導入コメント",
    "strengthsWeaknesses": [
      {
        "item": "エントリータイミング",
        "strength": "具体的なトレード例を含む強みの説明（日付、通貨ペア、損益、pipsを明記）",
        "improvement": "具体的なトレード例を含む改善案（日付、通貨ペア、損益、pipsを明記）",
        "coachNote": "励ましと実践的アドバイス"
      },
      {
        "item": "リスク管理",
        "strength": "具体的なトレード例を含む強みの説明",
        "improvement": "具体的なトレード例を含む改善案",
        "coachNote": "励ましと実践的アドバイス"
      },
      {
        "item": "損切り・利確",
        "strength": "具体的なトレード例を含む強みの説明",
        "improvement": "具体的なトレード例を含む改善案",
        "coachNote": "励ましと実践的アドバイス"
      },
      {
        "item": "感情コントロール",
        "strength": "具体的なトレード例を含む強みの説明",
        "improvement": "具体的なトレード例を含む改善案",
        "coachNote": "励ましと実践的アドバイス"
      },
      {
        "item": "一貫性・再現性",
        "strength": "具体的なトレード例を含む強みの説明",
        "improvement": "具体的なトレード例を含む改善案",
        "coachNote": "励ましと実践的アドバイス"
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
          "date": "2025-10-03T12:30:00Z",
          "symbol": "USDJPY",
          "side": "SELL",
          "lots": 0.5,
          "entry": 149.20,
          "exit": 148.50,
          "pnlJPY": 35000,
          "pips": 70.0,
          "ticket": "123456",
          "note": "順張り好例"
        },
        "coachNote": "順張りについてのアドバイス"
      },
      "meanReversion": {
        "conditions": ["条件1"],
        "lotPolicy": "ロット管理",
        "timeStop": "時間制限",
        "example": {
          "date": "2025-10-05T15:00:00Z",
          "symbol": "GOLD",
          "side": "BUY",
          "lots": 0.01,
          "entry": 2650.0,
          "exit": 2655.0,
          "pnlJPY": 500,
          "pips": 5.0,
          "ticket": "123457",
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
    "nextSteps": ["次のステップ1", "次のステップ2"],
    "evaluationScore": {
      "overall": 75,
      "riskManagement": 70,
      "entryTiming": 80,
      "exitStrategy": 65,
      "emotionalControl": 75,
      "consistency": 80,
      "explanation": "各項目の評価根拠を簡潔に説明"
    }
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
