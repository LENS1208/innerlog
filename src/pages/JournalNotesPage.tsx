import React, { useState, useMemo } from 'react';
import DailyNotePanel from '../components/daily/DailyNotePanel';
import type { DailyNotePanelProps } from '../components/daily/DailyNotePanel';
import TradeDetailPanel from '../components/trade/TradeDetailPanel';
import type { TradeDetailPanelProps } from '../components/trade/TradeDetailPanel';
import FreeMemoPanel from '../components/free/FreeMemoPanel';
import type { FolderKind, NoteListItem } from './journal-notes.types';
import '../styles/journal-notebook.css';

type TradeData = {
  ticket: string;
  item: string;
  side: 'BUY' | 'SELL';
  size: number;
  openTime: Date;
  openPrice: number;
  closeTime: Date;
  closePrice: number;
  commission: number;
  swap: number;
  profit: number;
  pips: number;
  sl: number | null;
  tp: number | null;
};

const demoTradesData: Record<string, TradeData> = {
  'T100002': {
    ticket: 'T100002',
    item: 'EURUSD',
    side: 'SELL',
    size: 0.3,
    openTime: new Date('2025-10-12T13:20:00+09:00'),
    openPrice: 1.062,
    closeTime: new Date('2025-10-12T14:20:00+09:00'),
    closePrice: 1.064,
    commission: -150,
    swap: 0,
    profit: -1800,
    pips: -2.0,
    sl: 1.067,
    tp: null,
  },
  'T100003': {
    ticket: 'T100003',
    item: 'GBPJPY',
    side: 'BUY',
    size: 0.2,
    openTime: new Date('2025-10-11T08:15:00+09:00'),
    openPrice: 1.892,
    closeTime: new Date('2025-10-11T09:15:00+09:00'),
    closePrice: 1.904,
    commission: -100,
    swap: 0,
    profit: 2400,
    pips: 12.0,
    sl: 1.882,
    tp: null,
  },
};

const demoNotesData: NoteListItem[] = [
  {
    id: 'note-1',
    title: '2025/10/09（木）日次ノート',
    kind: '日次',
    updatedAt: '2025-10-11T18:02:00+09:00',
    dateKey: '2025-10-09',
    linked: true,
  },
  {
    id: 'note-3',
    title: '2025/10/03（金）｜自由メモ',
    kind: '自由',
    updatedAt: '2025-10-03T09:00:00+09:00',
    dateKey: '2025-10-03',
    linked: true,
    memoPreview: '今日は調子が良かった。エントリーポイントを見極められた。',
  },
  {
    id: 'T100002',
    title: '2025/10/12（土）｜取引ノート｜EUR/USD',
    kind: '取引',
    updatedAt: '2025-10-12T14:20:00+09:00',
    dateKey: '2025-10-12',
    linked: false,
    pnlYen: -1800,
  },
  {
    id: 'note-5',
    title: '2025/10/13（日）｜自由メモ｜週末振り返り',
    kind: '自由',
    updatedAt: '2025-10-13T20:00:00+09:00',
    dateKey: '2025-10-13',
    linked: false,
    memoPreview: '',
  },
  {
    id: 'T100003',
    title: '2025/10/11（金）｜取引ノート｜GBP/JPY',
    kind: '取引',
    updatedAt: '2025-10-11T09:15:00+09:00',
    dateKey: '2025-10-11',
    linked: false,
    pnlYen: 2400,
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

const formatPnl = (pnlYen: number): string => {
  const sign = pnlYen >= 0 ? '+' : '-';
  return `${sign}${Math.abs(pnlYen).toLocaleString('ja-JP')}円`;
};

export default function JournalNotesPage() {
  const [sortBy, setSortBy] = useState<'updated' | 'date'>('updated');
  const [selectedFolder, setSelectedFolder] = useState<FolderKind>('all');
  const [notes] = useState(demoNotesData);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'daily' | 'trade' | 'free' | null>(null);

  const filteredNotes = useMemo(() => {
    let filtered = notes;

    if (selectedFolder === 'daily') {
      filtered = notes.filter((n) => n.kind === '日次');
    } else if (selectedFolder === 'trade') {
      filtered = notes.filter((n) => n.kind === '取引');
    } else if (selectedFolder === 'free') {
      filtered = notes.filter((n) => n.kind === '自由');
    } else if (selectedFolder === 'unlinked') {
      filtered = notes.filter((n) => !n.linked);
    }

    const sorted = [...filtered].sort((a, b) => {
      const aVal = sortBy === 'updated' ? a.updatedAt : a.dateKey;
      const bVal = sortBy === 'updated' ? b.updatedAt : b.dateKey;
      return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
    });

    return sorted;
  }, [notes, selectedFolder, sortBy]);

  const handleSort = (type: 'updated' | 'date') => {
    setSortBy(type);
  };

  const handleSelectFolder = (folder: FolderKind) => {
    setSelectedFolder(folder);
  };

  const handleLink = (noteId: string) => {
    console.log('取引にリンク:', noteId);
  };

  const handleOpenNote = (noteId: string) => {
    const note = notes.find(n => n.id === noteId);
    if (!note) return;

    setSelectedNoteId(noteId);
    if (note.kind === '取引') {
      setViewMode('trade');
    } else if (note.kind === '日次') {
      setViewMode('daily');
    } else if (note.kind === '自由') {
      setViewMode('free');
    }
  };

  const handleClosePanel = () => {
    setSelectedNoteId(null);
    setViewMode(null);
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

  const unlinkedCount = notes.filter((n) => !n.linked).length;

  return (
    <div className="shell">
      <aside className="pane">
        <div className="head">
          <h3>フォルダ</h3>
        </div>
        <div className="body list">
          <div
            className="note"
            style={{
              cursor: 'pointer',
              background: selectedFolder === 'all' ? 'var(--chip)' : 'var(--surface)',
              padding: '4px 12px',
            }}
            onClick={() => handleSelectFolder('all')}
          >
            <div className="title">すべてのノート</div>
          </div>
          <div
            className="note"
            style={{
              cursor: 'pointer',
              background: selectedFolder === 'daily' ? 'var(--chip)' : 'var(--surface)',
              padding: '4px 12px',
            }}
            onClick={() => handleSelectFolder('daily')}
          >
            <div className="title">日次ノート</div>
          </div>
          <div
            className="note"
            style={{
              cursor: 'pointer',
              background: selectedFolder === 'trade' ? 'var(--chip)' : 'var(--surface)',
              padding: '4px 12px',
            }}
            onClick={() => handleSelectFolder('trade')}
          >
            <div className="title">取引ノート</div>
          </div>
          <div
            className="note"
            style={{
              cursor: 'pointer',
              background: selectedFolder === 'free' ? 'var(--chip)' : 'var(--surface)',
              padding: '4px 12px',
            }}
            onClick={() => handleSelectFolder('free')}
          >
            <div className="title">自由メモ</div>
          </div>
          <div
            className="note"
            style={{
              cursor: 'pointer',
              background: selectedFolder === 'unlinked' ? 'var(--chip)' : 'var(--surface)',
              padding: '4px 12px',
            }}
            onClick={() => handleSelectFolder('unlinked')}
          >
            <div className="title">未リンクノート</div>
          </div>
        </div>
      </aside>

      <section className="pane">
        <div
          className="head"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
        >
          <h3>ノート一覧</h3>
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
        <div className="body list">
          {filteredNotes.map((note) => {
            const titleParts = note.title.split('｜');
            const firstLine = titleParts.slice(0, -1).join('｜');
            const secondLine = titleParts[titleParts.length - 1];

            return (
              <div key={note.id} className="note" onClick={() => handleOpenNote(note.id)}>
                <div className="title">
                  {titleParts.length > 1 ? (
                    <>
                      {firstLine}｜
                      <br />
                      {secondLine}
                    </>
                  ) : (
                    note.title
                  )}
                </div>
                <div className="meta-line">
                  {note.kind === '取引' && note.pnlYen !== undefined ? (
                    <span>
                      <span style={{ color: 'var(--muted, #6b7280)' }}>損益　</span>
                      <span className={note.pnlYen >= 0 ? 'good' : 'bad'}>
                        {formatPnl(note.pnlYen)}
                      </span>
                    </span>
                  ) : note.kind === '自由' ? (
                    <span>メモ：{note.memoPreview || '—'}</span>
                  ) : (
                    <span>&nbsp;</span>
                  )}
                </div>
                {!note.linked && (
                  <div className="bottom-line">
                    <span className="badge-status">未リンク</span>
                    <button
                      className="link-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLink(note.id);
                      }}
                    >
                      取引にリンク…
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {viewMode === 'daily' && selectedNoteId && (
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
      )}

      {viewMode === 'trade' && selectedNoteId && demoTradesData[selectedNoteId] && (
        <TradeDetailPanel
          trade={demoTradesData[selectedNoteId]}
          kpi={{
            net: demoTradesData[selectedNoteId].profit,
            pips: demoTradesData[selectedNoteId].pips,
            hold: demoTradesData[selectedNoteId].closeTime.getTime() - demoTradesData[selectedNoteId].openTime.getTime(),
            gross: demoTradesData[selectedNoteId].profit - demoTradesData[selectedNoteId].commission,
            cost: demoTradesData[selectedNoteId].commission + demoTradesData[selectedNoteId].swap,
            rrr: demoTradesData[selectedNoteId].sl
              ? Math.abs(demoTradesData[selectedNoteId].pips) /
                Math.abs((demoTradesData[selectedNoteId].openPrice - demoTradesData[selectedNoteId].sl!) * (/JPY$/.test(demoTradesData[selectedNoteId].item) ? 100 : 10000))
              : null,
          }}
          noteId={selectedNoteId}
        />
      )}

      {viewMode === 'free' && selectedNoteId && (
        <FreeMemoPanel
          noteId={selectedNoteId}
          title={notes.find(n => n.id === selectedNoteId)?.title || ''}
          dateKey={notes.find(n => n.id === selectedNoteId)?.dateKey || ''}
          memoContent={notes.find(n => n.id === selectedNoteId)?.memoPreview || ''}
          tags={['重要', 'アイデア']}
          onSave={(content) => console.log('保存:', content)}
        />
      )}

      {!viewMode && (
        <section className="pane">
          <div className="head">
            <h3>ノートを選択してください</h3>
          </div>
          <div className="body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400, color: 'var(--muted)' }}>
            左のリストからノートを選択すると、詳細が表示されます
          </div>
        </section>
      )}
    </div>
  );
}
