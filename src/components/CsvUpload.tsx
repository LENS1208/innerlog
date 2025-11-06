import React, { useState } from 'react';
import { parseCsvText } from '../lib/csv';
import { insertTrades, tradeToDb } from '../lib/db.service';
import { parseHtmlStatement, convertHtmlTradesToCsvFormat } from '../lib/html-parser';

type CsvUploadProps = {
  useDatabase: boolean;
  onToggleDatabase: (value: boolean) => void;
  loading: boolean;
  dataCount: number;
};

export default function CsvUpload({ useDatabase, onToggleDatabase, loading, dataCount }: CsvUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage('');

    try {
      const text = await file.text();
      const fileName = file.name.toLowerCase();
      let trades;

      if (fileName.endsWith('.html') || fileName.endsWith('.htm')) {
        const htmlTrades = parseHtmlStatement(text);
        if (htmlTrades.length === 0) {
          setMessage('HTML形式から有効な取引データが見つかりませんでした');
          setUploading(false);
          return;
        }
        const csvText = convertHtmlTradesToCsvFormat(htmlTrades);
        trades = parseCsvText(csvText);
        setMessage(`HTML形式から${trades.length}件の取引データを読み込みました`);
      } else {
        trades = parseCsvText(text);
        if (trades.length === 0) {
          setMessage('有効な取引データが見つかりませんでした');
          setUploading(false);
          return;
        }
        setMessage(`${trades.length}件の取引データを読み込みました`);
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
        データ操作
      </h3>
      <p style={{ margin: '0 0 var(--space-3) 0', fontSize: 13, color: 'var(--muted)' }}>
        取引データのCSVまたはHTML形式のファイルをアップロードしてデータベースに保存します
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        <label style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          cursor: 'pointer',
          padding: '8px 12px',
          background: 'var(--muted-bg)',
          borderRadius: 8,
          border: '1px solid var(--line)',
          width: 'fit-content',
        }}>
          <input
            type="checkbox"
            checked={useDatabase}
            onChange={(e) => onToggleDatabase(e.target.checked)}
            style={{ width: 18, height: 18, cursor: 'pointer' }}
          />
          <span style={{ fontSize: 14, fontWeight: 500 }}>データベースから読み込む</span>
          <span style={{ fontSize: 13, color: 'var(--muted)', marginLeft: 8 }}>
            {loading ? '読み込み中...' : `${dataCount}件`}
          </span>
        </label>

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
          width: 'fit-content',
        }}>
          {uploading ? 'アップロード中...' : 'CSV/HTMLファイルを選択'}
          <input
            type="file"
            accept=".csv,.html,.htm"
            onChange={handleFileSelect}
            disabled={uploading}
            style={{ display: 'none' }}
          />
        </label>
      </div>

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
