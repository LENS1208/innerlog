# ボタンスタイリングガイド

## 概要
このプロジェクトでは、ダークモード対応のボタンスタイルを一元管理するために、CSSカスタムプロパティを使用しています。

## CSSカスタムプロパティ

### ボタン背景色
- `--button-bg`: 通常のボタン背景色（非アクティブ状態）
  - ライトモード: `#ffffff` (白)
  - ダークモード: `#252d3d` (グレー)

- `--button-bg-secondary`: セカンダリボタン背景色
  - ライトモード: `#f1f5f9`
  - ダークモード: `#2a3142`

- `--button-bg-hover`: ホバー時の背景色
  - ライトモード: `#f8fafc`
  - ダークモード: `#2d3748`

## 使用ルール

### ✅ 正しい使い方
```tsx
// ナビゲーションボタン
<button
  style={{
    background: 'var(--button-bg)',
    border: '1px solid var(--line)',
    borderRadius: 8,
    padding: '8px 12px',
    cursor: 'pointer',
  }}
>
  ボタン
</button>

// ページネーションボタン
<button
  style={{
    background: isActive ? 'var(--accent)' : 'var(--button-bg)',
    color: isActive ? 'white' : 'var(--ink)',
  }}
>
  {pageNum}
</button>
```

### ❌ 避けるべき使い方
```tsx
// 直接 white や var(--surface) を使わない
<button style={{ background: 'white' }}>NG</button>
<button style={{ background: 'var(--surface)' }}>NG</button>

// チップ用のカスタムプロパティをボタンに使わない
<button style={{ background: 'var(--chip)' }}>NG</button>
```

## 注意事項

1. **var(--surface) はカードやパネルの背景に使用**
   - ボタンには使用しないでください

2. **var(--chip) はタグやチップの背景に使用**
   - ボタンには使用しないでください

3. **新しいボタンを作成する際は必ず var(--button-bg) を使用**
   - これにより、ダークモード切り替え時に自動的に適切な色が適用されます

## トークン定義場所
`src/lib/tokens.css`

## 既知の適用箇所
- カレンダーページ: 月送りボタン、今月ボタン
- 取引一覧ページ: ページネーションボタン
- 自由メモパネル: 3点メニューボタン
- AppShell: フィルタートグルボタン
