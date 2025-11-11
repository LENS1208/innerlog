import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { OpenAI } from "npm:openai@4.77.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface RequestBody {
  prompt: string;
  pair: string;
  timeframe: string;
  period: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY is not set");
    }

    const body: RequestBody = await req.json();
    const { prompt, pair, timeframe, period } = body;

    if (!prompt || !pair || !timeframe || !period) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const openai = new OpenAI({ apiKey });

    const systemPrompt = `あなたはプロのFXトレーダーです。ユーザーの入力から、構造化された相場予想を生成してください。

以下のJSON形式で回答してください：

{
  "hero": {
    "pair": "通貨ペア",
    "bias": "BUY" | "SELL" | "NEUTRAL",
    "confidence": 0-100の数値,
    "nowYen": 現在価格(数値),
    "buyEntry": "買いエントリー価格",
    "sellEntry": "売りエントリー価格"
  },
  "daily": {
    "stance": "本日のスタンス（例：戻り売り優先）",
    "session": "推奨セッション（例：東京・欧州前場）",
    "anchor": "アンカーポイント（例：147.00）",
    "riskNote": "リスク注意事項"
  },
  "scenario": {
    "strong": "強気シナリオ（価格推移）",
    "base": "ベースシナリオ（価格推移）",
    "weak": "弱気シナリオ（価格推移）"
  },
  "ideas": [
    {
      "id": "idea-1",
      "side": "買い" | "売り",
      "entry": "エントリー範囲",
      "slPips": 損切りpips(負の数値),
      "tpPips": 利確pips(正の数値),
      "expected": リスクリワード比(数値),
      "confidence": "◎" | "○" | "△"
    }
  ],
  "factors": {
    "technical": ["テクニカル要因1", "テクニカル要因2"],
    "fundamental": ["ファンダメンタル要因1", "ファンダメンタル要因2"],
    "sentiment": ["センチメント要因1", "センチメント要因2"]
  },
  "notes": {
    "memo": ["メモ1", "メモ2", "メモ3"]
  }
}

必ずJSON形式のみで回答し、他のテキストは含めないでください。`;

    const userPrompt = `通貨ペア: ${pair}\n分析足: ${timeframe}\n予想期間: ${period}\n\nユーザーの要望:\n${prompt}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from OpenAI");
    }

    const proposalData = JSON.parse(content);

    return new Response(JSON.stringify(proposalData), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error" 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
