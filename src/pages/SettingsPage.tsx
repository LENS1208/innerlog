import React from 'react';
import { useSettings } from '../lib/settings.context';

export default function SettingsPage() {
  const { settings, loading } = useSettings();

  if (loading) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <div style={{ color: 'var(--muted)' }}>読み込み中...</div>
      </div>
    );
  }

  const labelStyle: React.CSSProperties = {
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--text)',
    marginBottom: 6,
  };

  const valueStyle: React.CSSProperties = {
    fontSize: 14,
    padding: '8px 12px',
    border: '1px solid var(--line)',
    borderRadius: 4,
    backgroundColor: 'var(--bg-secondary)',
    color: 'var(--text)',
  };

  const sectionStyle: React.CSSProperties = {
    marginBottom: 24,
  };

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gap: 16,
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  };

  return (
    <div style={{ width: '100%', padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>設定</h1>
        <p style={{ fontSize: 14, color: 'var(--muted)' }}>
          現在の設定を確認できます（編集機能は今後実装予定）
        </p>
      </div>

      <div className="panel" style={{ marginBottom: 16 }}>
        <div
          style={{
            padding: '14px 16px',
            borderBottom: '1px solid var(--line)',
          }}
        >
          <div style={{ fontSize: 16, fontWeight: 700 }}>データソース</div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>
            データの読み込み元とデフォルト設定
          </div>
        </div>
        <div style={{ padding: 20 }}>
          <div style={gridStyle}>
            <div>
              <div style={labelStyle}>データ接続モード</div>
              <div style={valueStyle}>
                {settings.data_source === 'demo' ? 'デモデータ' : 'データベース'}
              </div>
            </div>
            <div>
              <div style={labelStyle}>デフォルトデータセット</div>
              <div style={valueStyle}>{settings.default_dataset}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="panel" style={{ marginBottom: 16 }}>
        <div
          style={{
            padding: '14px 16px',
            borderBottom: '1px solid var(--line)',
          }}
        >
          <div style={{ fontSize: 16, fontWeight: 700 }}>表示設定</div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>
            言語、タイムゾーン、フォーマットの設定
          </div>
        </div>
        <div style={{ padding: 20 }}>
          <div style={gridStyle}>
            <div>
              <div style={labelStyle}>言語</div>
              <div style={valueStyle}>
                {settings.language === 'ja' ? '日本語' : 'English'}
              </div>
            </div>
            <div>
              <div style={labelStyle}>タイムゾーン</div>
              <div style={valueStyle}>{settings.timezone}</div>
            </div>
            <div>
              <div style={labelStyle}>時刻フォーマット</div>
              <div style={valueStyle}>
                {settings.time_format === '24h' ? '24時間制' : '12時間制'}
              </div>
            </div>
            <div>
              <div style={labelStyle}>通貨</div>
              <div style={valueStyle}>{settings.currency}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="panel" style={{ marginBottom: 16 }}>
        <div
          style={{
            padding: '14px 16px',
            borderBottom: '1px solid var(--line)',
          }}
        >
          <div style={{ fontSize: 16, fontWeight: 700 }}>トレード計算設定</div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>
            初期資金、ロットサイズ、リスク計算の基準
          </div>
        </div>
        <div style={{ padding: 20 }}>
          <div style={gridStyle}>
            <div>
              <div style={labelStyle}>初期資金</div>
              <div style={valueStyle}>
                {settings.initial_capital.toLocaleString()} {settings.currency}
              </div>
            </div>
            <div>
              <div style={labelStyle}>DD計算基準</div>
              <div style={valueStyle}>
                {settings.dd_basis === 'capital' ? '初期資金%' : 'ロット基準(1R)%'}
              </div>
            </div>
            <div>
              <div style={labelStyle}>標準ロットサイズ</div>
              <div style={valueStyle}>{settings.lot_size.toLocaleString()} 通貨</div>
            </div>
            <div>
              <div style={labelStyle}>デフォルトスプレッド</div>
              <div style={valueStyle}>{settings.default_spread} pips</div>
            </div>
          </div>
        </div>
      </div>

      <div className="panel" style={{ marginBottom: 16 }}>
        <div
          style={{
            padding: '14px 16px',
            borderBottom: '1px solid var(--line)',
          }}
        >
          <div style={{ fontSize: 16, fontWeight: 700 }}>評価基準</div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>
            目標値とアラート閾値の設定
          </div>
        </div>
        <div style={{ padding: 20 }}>
          <div style={gridStyle}>
            <div>
              <div style={labelStyle}>目標PF</div>
              <div style={valueStyle}>{settings.target_pf}</div>
            </div>
            <div>
              <div style={labelStyle}>目標勝率</div>
              <div style={valueStyle}>{(settings.target_winrate * 100).toFixed(0)}%</div>
            </div>
            <div>
              <div style={labelStyle}>目標DD%</div>
              <div style={valueStyle}>{settings.target_dd_pct}%</div>
            </div>
            <div>
              <div style={labelStyle}>最大連敗アラート</div>
              <div style={valueStyle}>{settings.max_consecutive_losses}回</div>
            </div>
          </div>
        </div>
      </div>

      <div className="panel">
        <div
          style={{
            padding: '14px 16px',
            borderBottom: '1px solid var(--line)',
          }}
        >
          <div style={{ fontSize: 16, fontWeight: 700 }}>通知設定</div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>
            アラートと通知の設定
          </div>
        </div>
        <div style={{ padding: 20 }}>
          <div style={gridStyle}>
            <div>
              <div style={labelStyle}>通知機能</div>
              <div style={valueStyle}>
                {settings.enable_notifications ? '有効' : '無効'}
              </div>
            </div>
            <div>
              <div style={labelStyle}>DDアラート閾値</div>
              <div style={valueStyle}>{settings.dd_alert_threshold}%</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 24, padding: 16, backgroundColor: 'var(--bg-secondary)', borderRadius: 8 }}>
        <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6 }}>
          <strong>お知らせ:</strong> 設定の編集機能は今後のアップデートで実装予定です。
          現在は設定値の確認のみ可能です。
        </div>
      </div>
    </div>
  );
}
