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

**重要：書き方のスタイル**
- 各項目は2-3行で簡潔に。詳細な取引情報に引っ張られすぎない
- 強み：良い行動パターンを述べる + 具体例は「例：10/03のUSDJPY売りでは、戻り高値を明確に見極めて順張り成功」のように簡潔に
- 改善ポイント：「〜のに、〜」という対比で優しく指摘 + 例は最小限
- コーチコメント：励ましと実践的トレーニング提案（1-2行）
- 「〜が確認できます」ではなく「〜していますね」という対話的表現

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
        "strength": "相場の初動を読む力が非常に高く、押し目や戻りを素早く捉えています。例：10/03のUSDJPY売りでは、戻り高値を明確に見極めて順張り成功。",
        "improvement": "方向感は合っているのに、『ここで終わり』と判断するタイミングが少し早いです。",
        "coachNote": "トレンドが継続している間は、半分を残して伸ばす習慣をつけましょう。"
      },
      {
        "item": "リスク管理",
        "strength": "勝ちパターンでは自信をもってサイズを上げられています。",
        "improvement": "一方で、逆行時や感情的な場面でロットが膨らみやすいです。例：10/17の売り2lot -135,000円。",
        "coachNote": "『1回の最大ロット＝平均の1.5倍まで』と決めるだけで安定します。"
      },
      {
        "item": "損切り・利確",
        "strength": "決断が早く、迷いの少ないクリックができています。例：9/17のUSDJPY買いでは、上昇再開のブレイクで綺麗に利確。",
        "improvement": "エントリー回数が多くなると、条件の精度が下がる傾向があります。",
        "coachNote": "『3条件が揃ったときだけ入る』など、チェックリスト化がおすすめです。"
      },
      {
        "item": "感情コントロール",
        "strength": "負けても次の機会を探せる回復力があります。",
        "improvement": "『取り返したい』と感じた瞬間の再エントリーが多く見られます。",
        "coachNote": "連敗後は必ず"観察の1時間"を設けてください。相場を見ても手は出さない時間です。"
      },
      {
        "item": "一貫性・再現性",
        "strength": "履歴を保存し、振り返る意識を持っています。",
        "improvement": "チャート画像やR換算の記録がまだ少ないです。",
        "coachNote": "『どの位置でどう感じたか』をスクショにメモすると再現性が高まります。"
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
