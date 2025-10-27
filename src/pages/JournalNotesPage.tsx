import React, { useState } from 'react';
import DailyNotePanel from '../components/daily/DailyNotePanel';
import type { DailyNotePanelProps } from '../components/daily/DailyNotePanel';
import '../styles/journal-notebook.css';

type NoteItem = {
  title: string;
  updated: string;
  date: string;
};

const demoNotes: NoteItem[] = [
  {
    title: '2025/10/09（木）｜日次ノート',
    updated: '2025-10-11T18:02:00+09:00',
    date: '2025-10-09',
  },
  {
    title: '2025/10/10（金）｜取引ノート｜USD/JPY',
    updated: '2025-10-10T10:31:00+09:00',
    date: '2025-10-10',
  },
  {
    title: '2025/10/03（金）｜自由メモ',
    updated: '2025-10-03T09:00:00+09:00',
    date: '2025-10-03',
  },
];

const demoDailyProps: DailyNotePanelProps = {
  dateJst: '2025/10/04',
  kpi: {
    winRate: 66.7,
    trades: 6,
    wins: 4,
    losses: 2,
    avgYenPerTrade: 1250,
    pf: 2.15,
    totalPips: 42.3,
  },
  trades: [
    { time: '08:12', symbol: 'USD/JPY', sideJp: '買い', pnlYen: 3200 },
    { time: '10:45', symbol: 'EUR/USD', sideJp: '売り', pnlYen: -1800 },
    { time: '13:30', symbol: 'GBP/JPY', sideJp: '買い', pnlYen: 2400 },
  ],
  linkedNotes: [
    { title: '2025-10-04（土）｜日次ノート', kind: '日次', updated: '2025/10/04 20:15' },
    { title: 'USD/JPY 買いポジション #00123', kind: '取引', updated: '2025/10/04 08:30' },
  ],
  advice: {
    items: [
      '本日の勝率は66.7%と良好です。引き続き慎重なエントリーを心がけましょう。',
      'EURUSDで2敗していますが、1勝1敗です。通貨ペアでこのパターンを再検証してみましょう。',
      '損切りが適切に機能しています。この調子でリスク管理を継続してください。',
      '午前中の取引が好調です。時間帯ごとの傾向を分析してみると良いでしょう。',
    ],
    lastUpdated: '2025/10/04 20:30',
  },
  values: { good: '', improve: '', nextPromise: '', free: '' },
};

export default function JournalNotesPage() {
  const [sortBy, setSortBy] = useState<'updated' | 'date'>('updated');
  const [notes, setNotes] = useState(demoNotes);

  const handleSort = (type: 'updated' | 'date') => {
    setSortBy(type);
    const sorted = [...notes].sort((a, b) => {
      const aVal = type === 'updated' ? a.updated : a.date;
      const bVal = type === 'updated' ? b.updated : b.date;
      return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
    });
    setNotes(sorted);
  };

  const handlePrevDay = () => console.log('前日へ');
  const handleNextDay = () => console.log('翌日へ');
  const handleOpenTradesList = () => console.log('取引一覧を開く');
  const handleOpenLinkedNote = (title: string) => console.log('ノートを開く:', title);
  const handleGenerateAdvice = () => console.log('アドバイスを生成');
  const handleRegenerateAdvice = () => console.log('再生成');
  const handlePinAdvice = () => console.log('固定');
  const handleChangeValues = (values: any) => console.log('値変更:', values);
  const handleSave = () => console.log('保存');

  return (
    <div className="shell">
      <aside className="pane">
        <div className="head">
          <h3>フォルダ / 種別</h3>
        </div>
        <div className="body list">
          <div className="note" style={{ cursor: 'default' }}>
            <div className="title">すべてのノート</div>
          </div>
          <div className="note" style={{ cursor: 'default' }}>
            <div className="title">日次ノート</div>
          </div>
          <div className="note" style={{ cursor: 'default' }}>
            <div className="title">取引ノート</div>
          </div>
          <div className="note" style={{ cursor: 'default' }}>
            <div className="title">自由メモ</div>
          </div>
        </div>
      </aside>

      <section className="pane">
        <div
          className="head"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
        >
          <h3>ノート一覧</h3>
          <div className="row">
            <span className="tag">並び替え</span>
            <div className="seg" role="group" aria-label="並び替え">
              <button
                aria-pressed={sortBy === 'updated'}
                onClick={() => handleSort('updated')}
              >
                更新順
              </button>
              <button aria-pressed={sortBy === 'date'} onClick={() => handleSort('date')}>
                日付順
              </button>
            </div>
          </div>
        </div>
        <div className="body list">
          {notes.map((note, idx) => (
            <div key={idx} className="note">
              <div className="title">{note.title}</div>
            </div>
          ))}
        </div>
      </section>

      <DailyNotePanel
        {...demoDailyProps}
        onPrevDay={handlePrevDay}
        onNextDay={handleNextDay}
        onOpenTradesList={handleOpenTradesList}
        onOpenLinkedNote={handleOpenLinkedNote}
        onGenerateAdvice={handleGenerateAdvice}
        onRegenerateAdvice={handleRegenerateAdvice}
        onPinAdvice={handlePinAdvice}
        onChangeValues={handleChangeValues}
        onSave={handleSave}
      />
    </div>
  );
}
