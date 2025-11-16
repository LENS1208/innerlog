import teacherIcon from '../assets/image copy copy copy copy copy copy copy copy copy copy copy copy copy copy copy copy copy copy copy.png';
import beginnerCoachIcon from '../assets/image copy copy copy copy copy copy copy copy copy copy copy copy copy copy copy copy copy copy.png';
import advancedCoachIcon from '../assets/image copy copy copy copy copy copy copy copy copy copy copy copy copy copy copy copy copy.png';

export interface CoachAvatarPreset {
  id: string;
  name: string;
  image: string;
  description: string;
  systemPromptModifier?: string;
}

export const COACH_AVATAR_PRESETS: CoachAvatarPreset[] = [
  {
    id: 'teacher',
    name: '先生',
    image: teacherIcon,
    description: '真面目で丁寧な指導スタイル',
  },
  {
    id: 'beginner-coach',
    name: '初心者サポーター',
    image: beginnerCoachIcon,
    description: '初心者に優しく励ます指導スタイル',
    systemPromptModifier: `
**コーチングスタイル：初心者サポーター**

あなたは初心者トレーダーに特化したコーチです。以下の点を重視してください：

- 専門用語を使う際は必ず簡単な説明を添える
- 小さな成功を見つけて積極的に褒める
- 失敗を責めず、「次はこうしてみましょう」と前向きに提案
- 一度に多くの改善点を指摘せず、優先順位をつけて1-2点に絞る
- 「できていること」を先に伝え、自信をつけてから改善点を伝える
- 基本ルール（損切り設定、ロット管理）の重要性を繰り返し強調
- 「焦らなくて大丈夫」「一歩ずつ進めば必ず上達します」という励まし
- 複雑な戦略よりも、シンプルで再現性の高い方法を提案
- トレード回数を抑え、確実な場面だけを狙うことを推奨

口調：優しく、温かく、安心感を与える（「〜ですね」「〜してみましょう」「大丈夫です」）
`,
  },
  {
    id: 'advanced-coach',
    name: '上級戦略家',
    image: advancedCoachIcon,
    description: '中上級者向けの高度な戦略提案スタイル',
    systemPromptModifier: `
**コーチングスタイル：上級戦略家**

あなたは中上級トレーダーに特化したコーチです。以下の点を重視してください：

- 基本的な説明は省略し、高度な分析に集中
- 複数のセットアップ間の相関関係や市場環境の変化を指摘
- リスクリワード比の最適化、ポジションサイジングの詳細な分析
- 統計データを深く掘り下げ、パターンの背景にある市場心理を考察
- エントリーとエグジットの精度向上に焦点を当てた具体的な改善案
- 複数通貨ペアの相関、時間帯別の市場特性など高度な分析
- 「次のレベル」を目指すための戦略的思考を促す質問を投げかける
- 資金管理の最適化、ドローダウン耐性の向上など上級テーマ
- トレードシステムの体系化、バックテスト手法の提案
- データドリブンで論理的、かつ実践的な提案

口調：プロフェッショナルで簡潔、データに基づいた分析的な語り（「〜が観察されます」「〜を検討すべきです」「〜の最適化が課題です」）
`,
  },
];

export const getCoachAvatarById = (id: string): string => {
  const preset = COACH_AVATAR_PRESETS.find(p => p.id === id);
  return preset?.image || COACH_AVATAR_PRESETS[0].image;
};

export const getCoachSystemPromptModifier = (id: string): string => {
  const preset = COACH_AVATAR_PRESETS.find(p => p.id === id);
  return preset?.systemPromptModifier || '';
};
