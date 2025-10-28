import React, { useState } from 'react';
import { parseCsvText } from '../lib/csv';
import { insertTrades, tradeToDb } from '../lib/db.service';

export default function CsvUpload() {
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage('');

    try {
      const text = await file.text();
      const trades = parseCsvText(text);

      if (trades.length === 0) {
        setMessage('有効な取引データが見つかりませんでした');
        setUploading(false);
        return;
      }

      const dbTrades = trades.map(tradeToDb);
      await insertTrades(dbTrades);

      setMessage(`${trades.length}件の取引データをアップロードしました`);
    } catch (error) {
      console.error('Upload error:', error);
      setMessage('アップロードに失敗しました: ' + (error as Error).message);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--line)',
      borderRadius: 12,
      padding: 'var(--space-3)',
    }}>
      <h3 style={{ margin: '0 0 var(--space-2) 0', fontSize: 16, fontWeight: 700 }}>
        CSVアップロード
      </h3>
      <p style={{ margin: '0 0 var(--space-3) 0', fontSize: 13, color: 'var(--muted)' }}>
        取引データのCSVファイルをアップロードしてデータベースに保存します
      </p>

      <label style={{
        display: 'inline-block',
        background: 'var(--accent)',
        color: '#fff',
        padding: '10px 20px',
        borderRadius: 8,
        cursor: uploading ? 'not-allowed' : 'pointer',
        fontSize: 14,
        fontWeight: 600,
        opacity: uploading ? 0.6 : 1,
      }}>
        {uploading ? 'アップロード中...' : 'CSVファイルを選択'}
        <input
          type="file"
          accept=".csv"
          onChange={handleFileSelect}
          disabled={uploading}
          style={{ display: 'none' }}
        />
      </label>

      {message && (
        <div style={{
          marginTop: 'var(--space-3)',
          padding: 'var(--space-2)',
          background: message.includes('失敗') ? '#fee' : '#efe',
          border: `1px solid ${message.includes('失敗') ? '#fcc' : '#cfc'}`,
          borderRadius: 8,
          fontSize: 13,
        }}>
          {message}
        </div>
      )}
    </div>
  );
}
