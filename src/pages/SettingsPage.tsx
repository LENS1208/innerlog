import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import '../styles/journal-notebook.css';

interface UserSettings {
  theme: string;
  timezone: string;
  time_format: string;
  date_format: string;
  currency: string;
  csv_format_preset: string;
  csv_column_mapping: Record<string, string>;
  ai_evaluation_frequency: string;
  ai_proposal_detail_level: string;
  ai_evaluation_enabled: boolean;
  ai_proposal_enabled: boolean;
  ai_advice_enabled: boolean;
}

interface ImportHistory {
  id: string;
  filename: string;
  rows: number;
  timestamp: number;
  format: string;
}

const STORAGE_KEY = 'csv_import_history';

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [traderName, setTraderName] = useState('');
  const [email, setEmail] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');

  const [settings, setSettings] = useState<UserSettings>({
    theme: 'light',
    timezone: 'Asia/Tokyo',
    time_format: '24h',
    date_format: 'yyyy-MM-dd',
    currency: 'JPY',
    csv_format_preset: 'MT4',
    csv_column_mapping: {},
    ai_evaluation_frequency: 'daily',
    ai_proposal_detail_level: 'standard',
    ai_evaluation_enabled: true,
    ai_proposal_enabled: true,
    ai_advice_enabled: true,
  });

  const [importHistory, setImportHistory] = useState<ImportHistory[]>([]);

  useEffect(() => {
    loadUserAndSettings();
    loadImportHistory();
  }, []);

  const loadUserAndSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        setEmail(user.email || '');
        setTraderName(user.user_metadata?.trader_name || '');
        setAvatarPreview(user.user_metadata?.avatar_url || '');

        const { data, error } = await supabase
          .from('user_settings')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setSettings({
            theme: data.theme || 'light',
            timezone: data.timezone || 'Asia/Tokyo',
            time_format: data.time_format || '24h',
            date_format: data.date_format || 'yyyy-MM-dd',
            currency: data.currency || 'JPY',
            csv_format_preset: data.csv_format_preset || 'MT4',
            csv_column_mapping: data.csv_column_mapping || {},
            ai_evaluation_frequency: data.ai_evaluation_frequency || 'daily',
            ai_proposal_detail_level: data.ai_proposal_detail_level || 'standard',
            ai_evaluation_enabled: data.ai_evaluation_enabled ?? true,
            ai_proposal_enabled: data.ai_proposal_enabled ?? true,
            ai_advice_enabled: data.ai_advice_enabled ?? true,
          });
        }
      }
    } catch (err) {
      console.error('設定の読み込みエラー:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadImportHistory = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setImportHistory(JSON.parse(stored));
      }
    } catch (err) {
      console.error('インポート履歴の読み込みエラー:', err);
    }
  };

  const saveImportHistory = (history: ImportHistory[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
      setImportHistory(history);
    } catch (err) {
      console.error('インポート履歴の保存エラー:', err);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('画像ファイルを選択してください');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('ファイルサイズは2MB以下にしてください');
      return;
    }

    setAvatarFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadAvatar = async () => {
    if (!user || !avatarFile) return;

    setUploading(true);
    try {
      const fileExt = avatarFile.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('user-avatars')
        .upload(filePath, avatarFile, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('user-avatars')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl }
      });

      if (updateError) throw updateError;

      setAvatarPreview(publicUrl);
      setAvatarFile(null);
      alert('アイコン画像をアップロードしました');
    } catch (err) {
      console.error('アップロードエラー:', err);
      alert('アップロードに失敗しました');
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { trader_name: traderName }
      });

      if (error) throw error;
      alert('プロフィールを保存しました');
    } catch (err) {
      console.error('プロフィール保存エラー:', err);
      alert('保存に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!user) return;

    if (newPassword !== confirmPassword) {
      setPasswordMessage('新しいパスワードが一致しません');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordMessage('パスワードは6文字以上で入力してください');
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      setPasswordMessage('パスワードを変更しました');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error('パスワード変更エラー:', err);
      setPasswordMessage('変更に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          theme: settings.theme,
          timezone: settings.timezone,
          time_format: settings.time_format,
          date_format: settings.date_format,
          currency: settings.currency,
          csv_format_preset: settings.csv_format_preset,
          csv_column_mapping: settings.csv_column_mapping,
          ai_evaluation_frequency: settings.ai_evaluation_frequency,
          ai_proposal_detail_level: settings.ai_proposal_detail_level,
          ai_evaluation_enabled: settings.ai_evaluation_enabled,
          ai_proposal_enabled: settings.ai_proposal_enabled,
          ai_advice_enabled: settings.ai_advice_enabled,
        });

      if (error) throw error;
      alert('設定を保存しました');
    } catch (err) {
      console.error('設定保存エラー:', err);
      alert('保存に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  const handleClearHistory = () => {
    if (confirm('インポート履歴をすべて削除しますか？')) {
      saveImportHistory([]);
    }
  };

  const handleCalculateSummary = async () => {
    if (!user) return;

    setSaving(true);
    try {
      console.log('📊 Calculating account summary from existing trades...');

      const { data: trades, error: tradesError } = await supabase
        .from('trades')
        .select('swap, commission, profit')
        .eq('user_id', user.id);

      if (tradesError) throw tradesError;

      if (!trades || trades.length === 0) {
        alert('取引データが見つかりません');
        return;
      }

      let totalSwap = 0;
      let totalCommission = 0;
      let totalProfit = 0;

      trades.forEach((trade: any) => {
        totalSwap += trade.swap || 0;
        totalCommission += trade.commission || 0;
        totalProfit += trade.profit || 0;
      });

      const closedPL = totalCommission + totalSwap + totalProfit;

      const { error: upsertError } = await supabase
        .from('account_summary')
        .upsert({
          user_id: user.id,
          dataset: 'default',
          total_deposits: 0,
          total_withdrawals: 0,
          xm_points_earned: 0,
          xm_points_used: 0,
          total_swap: totalSwap,
          total_commission: totalCommission,
          total_profit: totalProfit,
          closed_pl: closedPL,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id,dataset' });

      if (upsertError) throw upsertError;

      alert(`サマリーを計算しました\n${trades.length}件の取引から計算`);
      window.location.reload();
    } catch (err) {
      console.error('サマリー計算エラー:', err);
      alert('計算に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAllTrades = async () => {
    if (!confirm('現在アップロード中の取引履歴をすべて削除しますか？\nこの操作は元に戻せません。')) {
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('trades')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (error) throw error;

      alert('取引履歴を削除しました');
      window.dispatchEvent(new CustomEvent('fx:tradesUpdated'));
    } catch (err) {
      console.error('取引履歴削除エラー:', err);
      alert('削除に失敗しました');
    } finally {
      setSaving(false);
    }
  };


  if (loading) {
    return (
      <div style={{ padding: 16 }}>
        <div>読み込み中...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ padding: 16 }}>
        <div className="panel" style={{ padding: 24, textAlign: 'center' }}>
          <div style={{ fontSize: 16, marginBottom: 12 }}>ログインが必要です</div>
          <div style={{ color: 'var(--muted)' }}>
            設定を変更するにはログインしてください
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', padding: 16 }}>
      <div style={{ display: 'grid', gap: 16, maxWidth: 900, margin: '0 auto' }}>

        <section className="panel">
          <div
            style={{
              padding: '14px 16px',
              borderBottom: '1px solid var(--line)',
            }}
          >
            <div style={{ fontSize: 18, fontWeight: 700 }}>アカウント・セキュリティ</div>
          </div>

          <div style={{ padding: 16, display: 'grid', gap: 24 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>プロフィール情報</div>
              <div style={{ display: 'grid', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, marginBottom: 8, color: 'var(--muted)' }}>
                    アイコン画像
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div
                      style={{
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        border: '2px solid var(--line)',
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'var(--bg-secondary)',
                      }}
                    >
                      {avatarPreview ? (
                        <img
                          src={avatarPreview}
                          alt="Avatar preview"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="8" r="4"></circle>
                          <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"></path>
                        </svg>
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/gif,image/webp"
                        onChange={handleAvatarChange}
                        style={{ display: 'none' }}
                        id="avatar-upload"
                      />
                      <label
                        htmlFor="avatar-upload"
                        style={{
                          display: 'inline-block',
                          padding: '8px 16px',
                          backgroundColor: 'var(--surface)',
                          border: '1px solid var(--line)',
                          borderRadius: 4,
                          fontSize: 14,
                          cursor: 'pointer',
                          marginBottom: 8,
                        }}
                      >
                        画像を選択
                      </label>
                      {avatarFile && (
                        <button
                          onClick={handleUploadAvatar}
                          disabled={uploading}
                          style={{
                            display: 'block',
                            padding: '8px 16px',
                            backgroundColor: 'var(--accent)',
                            color: 'white',
                            border: 'none',
                            borderRadius: 4,
                            fontSize: 14,
                            cursor: 'pointer',
                          }}
                        >
                          {uploading ? 'アップロード中...' : 'アップロード'}
                        </button>
                      )}
                      <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 8 }}>
                        JPEG、PNG、GIF、WebP形式、2MB以下
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, marginBottom: 4, color: 'var(--muted)' }}>
                    トレーダー名
                  </label>
                  <input
                    type="text"
                    value={traderName}
                    onChange={(e) => setTraderName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid var(--line)',
                      borderRadius: 4,
                      fontSize: 14,
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, marginBottom: 4, color: 'var(--muted)' }}>
                    メールアドレス
                  </label>
                  <input
                    type="email"
                    value={email}
                    disabled
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid var(--line)',
                      borderRadius: 4,
                      fontSize: 14,
                      backgroundColor: 'var(--bg-secondary)',
                      color: 'var(--muted)',
                    }}
                  />
                </div>
                <div>
                  <button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: 'var(--accent)',
                      color: 'white',
                      border: 'none',
                      borderRadius: 4,
                      fontSize: 14,
                      cursor: 'pointer',
                    }}
                  >
                    {saving ? '保存中...' : 'プロフィールを保存'}
                  </button>
                </div>
              </div>
            </div>

            <div>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>パスワード変更</div>
              <div style={{ display: 'grid', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, marginBottom: 4, color: 'var(--muted)' }}>
                    新しいパスワード
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid var(--line)',
                      borderRadius: 4,
                      fontSize: 14,
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, marginBottom: 4, color: 'var(--muted)' }}>
                    新しいパスワード（確認）
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid var(--line)',
                      borderRadius: 4,
                      fontSize: 14,
                    }}
                  />
                </div>
                {passwordMessage && (
                  <div style={{ fontSize: 13, color: passwordMessage.includes('成功') ? 'var(--success)' : 'var(--error)' }}>
                    {passwordMessage}
                  </div>
                )}
                <div>
                  <button
                    onClick={handleChangePassword}
                    disabled={saving || !newPassword || !confirmPassword}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: 'var(--accent)',
                      color: 'white',
                      border: 'none',
                      borderRadius: 4,
                      fontSize: 14,
                      cursor: 'pointer',
                      opacity: (!newPassword || !confirmPassword) ? 0.5 : 1,
                    }}
                  >
                    {saving ? '変更中...' : 'パスワードを変更'}
                  </button>
                </div>
              </div>
            </div>

          </div>
        </section>

        <section className="panel">
          <div
            style={{
              padding: '14px 16px',
              borderBottom: '1px solid var(--line)',
            }}
          >
            <div style={{ fontSize: 18, fontWeight: 700 }}>データソース設定</div>
          </div>

          <div style={{ padding: 16, display: 'grid', gap: 24 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>CSVインポート設定</div>
              <div style={{ display: 'grid', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, marginBottom: 4, color: 'var(--muted)' }}>
                    ファイル形式プリセット
                  </label>
                  <select
                    value={settings.csv_format_preset}
                    onChange={(e) => setSettings({ ...settings, csv_format_preset: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid var(--line)',
                      borderRadius: 4,
                      fontSize: 14,
                    }}
                  >
                    <option value="XM">XM</option>
                    <option value="MT4">MT4</option>
                    <option value="MT5">MT5</option>
                    <option value="custom">カスタム</option>
                  </select>
                </div>
                <div style={{ fontSize: 12, color: 'var(--muted)', padding: 12, backgroundColor: 'var(--bg-secondary)', borderRadius: 4 }}>
                  選択した形式に応じて、CSVのカラムが自動的にマッピングされます
                </div>
              </div>
            </div>

            <div>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>インポート履歴</div>
              {importHistory.length === 0 ? (
                <div style={{ padding: 16, textAlign: 'center', color: 'var(--muted)' }}>
                  履歴がありません
                </div>
              ) : (
                <>
                  <div style={{ border: '1px solid var(--line)', borderRadius: 4, overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ backgroundColor: 'var(--bg-secondary)' }}>
                          <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: 13, fontWeight: 600 }}>ファイル名</th>
                          <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: 13, fontWeight: 600 }}>形式</th>
                          <th style={{ padding: '8px 12px', textAlign: 'right', fontSize: 13, fontWeight: 600 }}>行数</th>
                          <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: 13, fontWeight: 600 }}>日時</th>
                        </tr>
                      </thead>
                      <tbody>
                        {importHistory.slice(0, 10).map((item) => (
                          <tr key={item.id} style={{ borderTop: '1px solid var(--line)' }}>
                            <td style={{ padding: '8px 12px', fontSize: 13 }}>{item.filename}</td>
                            <td style={{ padding: '8px 12px', fontSize: 13 }}>{item.format}</td>
                            <td style={{ padding: '8px 12px', fontSize: 13, textAlign: 'right' }}>{item.rows}</td>
                            <td style={{ padding: '8px 12px', fontSize: 13 }}>
                              {new Date(item.timestamp).toLocaleString('ja-JP')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                    <button
                      onClick={handleClearHistory}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: 'transparent',
                        color: 'var(--error)',
                        border: '1px solid var(--error)',
                        borderRadius: 4,
                        fontSize: 13,
                        cursor: 'pointer',
                      }}
                    >
                      履歴をクリア
                    </button>
                  </div>
                </>
              )}
            </div>

            <div>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>取引データ管理</div>

              <div style={{ marginBottom: 16 }}>
                <div style={{ padding: 16, backgroundColor: '#eff6ff', borderRadius: 4, marginBottom: 12, border: '1px solid #bfdbfe' }}>
                  <div style={{ fontSize: 13, color: '#1e40af', marginBottom: 0 }}>
                    既存の取引データからサマリー情報を再計算します。サマリーが表示されない場合にご利用ください。
                  </div>
                </div>
                <button
                  onClick={handleCalculateSummary}
                  disabled={saving}
                  style={{
                    padding: '10px 16px',
                    backgroundColor: '#3b82f6',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 4,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: saving ? 'default' : 'pointer',
                    opacity: saving ? 0.5 : 1,
                    display: 'inline-block',
                  }}
                >
                  {saving ? '計算中...' : '🧮 サマリーを再計算'}
                </button>
              </div>

              <div style={{ padding: 16, backgroundColor: '#fef2f2', borderRadius: 4, marginBottom: 12, border: '1px solid #fecaca' }}>
                <div style={{ fontSize: 13, color: '#991b1b', marginBottom: 0 }}>
                  データベースに保存されている取引履歴をすべて削除します。この操作は元に戻せません。
                </div>
              </div>
              <button
                onClick={handleDeleteAllTrades}
                disabled={saving}
                style={{
                  padding: '10px 16px',
                  backgroundColor: '#dc2626',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 4,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: saving ? 'default' : 'pointer',
                  opacity: saving ? 0.5 : 1,
                  display: 'inline-block',
                }}
              >
                {saving ? '削除中...' : '現在アップロード中の取引履歴を削除'}
              </button>
            </div>
          </div>
        </section>

        <section className="panel">
          <div
            style={{
              padding: '14px 16px',
              borderBottom: '1px solid var(--line)',
            }}
          >
            <div style={{ fontSize: 18, fontWeight: 700 }}>表示・言語設定</div>
          </div>

          <div style={{ padding: 16, display: 'grid', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, marginBottom: 4, color: 'var(--muted)' }}>
                  カラーテーマ
                </label>
                <select
                  value={settings.theme}
                  onChange={(e) => setSettings({ ...settings, theme: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid var(--line)',
                    borderRadius: 4,
                    fontSize: 14,
                  }}
                >
                  <option value="light">ライトモード</option>
                  <option value="dark">ダークモード</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, marginBottom: 4, color: 'var(--muted)' }}>
                  タイムゾーン
                </label>
                <select
                  value={settings.timezone}
                  onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid var(--line)',
                    borderRadius: 4,
                    fontSize: 14,
                  }}
                >
                  <option value="UTC">UTC</option>
                  <option value="Asia/Tokyo">JST (Asia/Tokyo)</option>
                  <option value="America/New_York">EST (America/New_York)</option>
                  <option value="Europe/London">GMT (Europe/London)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, marginBottom: 4, color: 'var(--muted)' }}>
                  日時フォーマット
                </label>
                <select
                  value={settings.time_format}
                  onChange={(e) => setSettings({ ...settings, time_format: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid var(--line)',
                    borderRadius: 4,
                    fontSize: 14,
                  }}
                >
                  <option value="24h">24時間制</option>
                  <option value="12h">12時間制</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, marginBottom: 4, color: 'var(--muted)' }}>
                  通貨表示
                </label>
                <select
                  value={settings.currency}
                  onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid var(--line)',
                    borderRadius: 4,
                    fontSize: 14,
                  }}
                >
                  <option value="JPY">円 (JPY)</option>
                  <option value="USD">ドル (USD)</option>
                  <option value="EUR">ユーロ (EUR)</option>
                  <option value="GBP">ポンド (GBP)</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        <section className="panel">
          <div
            style={{
              padding: '14px 16px',
              borderBottom: '1px solid var(--line)',
            }}
          >
            <div style={{ fontSize: 18, fontWeight: 700 }}>AI機能設定</div>
          </div>

          <div style={{ padding: 16, display: 'grid', gap: 24 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, marginBottom: 4, color: 'var(--muted)' }}>
                  AI評価の頻度
                </label>
                <select
                  value={settings.ai_evaluation_frequency}
                  onChange={(e) => setSettings({ ...settings, ai_evaluation_frequency: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid var(--line)',
                    borderRadius: 4,
                    fontSize: 14,
                  }}
                >
                  <option value="realtime">リアルタイム</option>
                  <option value="daily">日次</option>
                  <option value="weekly">週次</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, marginBottom: 4, color: 'var(--muted)' }}>
                  AI提案の詳細度
                </label>
                <select
                  value={settings.ai_proposal_detail_level}
                  onChange={(e) => setSettings({ ...settings, ai_proposal_detail_level: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid var(--line)',
                    borderRadius: 4,
                    fontSize: 14,
                  }}
                >
                  <option value="concise">簡潔</option>
                  <option value="standard">標準</option>
                  <option value="detailed">詳細</option>
                </select>
              </div>
            </div>

            <div>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>AI機能のON/OFF</div>
              <div style={{ display: 'grid', gap: 12 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={settings.ai_evaluation_enabled}
                    onChange={(e) => setSettings({ ...settings, ai_evaluation_enabled: e.target.checked })}
                    style={{ width: 18, height: 18 }}
                  />
                  <span style={{ fontSize: 14 }}>AI評価を有効化</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={settings.ai_proposal_enabled}
                    onChange={(e) => setSettings({ ...settings, ai_proposal_enabled: e.target.checked })}
                    style={{ width: 18, height: 18 }}
                  />
                  <span style={{ fontSize: 14 }}>AI提案を有効化</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={settings.ai_advice_enabled}
                    onChange={(e) => setSettings({ ...settings, ai_advice_enabled: e.target.checked })}
                    style={{ width: 18, height: 18 }}
                  />
                  <span style={{ fontSize: 14 }}>AIアドバイスを有効化</span>
                </label>
              </div>
            </div>
          </div>
        </section>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, padding: '16px 0' }}>
          <button
            onClick={handleSaveSettings}
            disabled={saving}
            style={{
              padding: '12px 32px',
              backgroundColor: 'var(--accent)',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              fontSize: 15,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {saving ? '保存中...' : 'すべての設定を保存'}
          </button>
        </div>
      </div>
    </div>
  );
}
