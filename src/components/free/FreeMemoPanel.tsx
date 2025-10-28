import React, { useState } from 'react';

export type FreeMemoPanelProps = {
  noteId: string;
  title: string;
  dateKey: string;
  memoContent?: string;
  tags?: string[];
  onSave?: (content: string) => void;
};

export default function FreeMemoPanel({
  noteId,
  title,
  dateKey,
  memoContent = '',
  tags = [],
  onSave,
}: FreeMemoPanelProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const [content, setContent] = useState(memoContent);
  const [localTags, setLocalTags] = useState(tags);
  const [tagModalOpen, setTagModalOpen] = useState(false);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSave = () => {
    if (onSave) {
      onSave(content);
    }
    console.log('自由メモを保存:', { noteId, content, tags: localTags });
    alert('保存しました');
  };

  const handleDeleteNote = () => {
    if (confirm('この自由メモを削除しますか?')) {
      console.log('自由メモを削除:', noteId);
      alert('自由メモを削除しました');
    }
  };

  const handleToggleLink = () => {
    console.log('リンク状態を切り替え:', noteId);
    alert('リンク状態を切り替えました');
  };

  const removeTag = (t: string) => {
    setLocalTags((prev) => prev.filter((x) => x !== t));
  };

  const addTag = (t: string) => {
    if (!t.trim()) return;
    setLocalTags((prev) => (prev.includes(t) ? prev : [...prev, t.trim()]));
  };

  return (
    <section className="pane">
      <div className="head">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>自由メモ</h3>
          <div ref={menuRef} style={{ display: 'flex', gap: '8px', position: 'relative' }}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--line)',
                borderRadius: 8,
                padding: '8px 12px',
                cursor: 'pointer',
                fontSize: 18,
                fontWeight: 600,
                lineHeight: 1,
              }}
            >
              ⋮
            </button>
            {menuOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: 4,
                  background: 'var(--surface)',
                  border: '1px solid var(--line)',
                  borderRadius: 8,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  minWidth: 180,
                  zIndex: 100,
                }}
              >
                <button
                  onClick={() => {
                    handleToggleLink();
                    setMenuOpen(false);
                  }}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '10px 16px',
                    border: 'none',
                    background: 'transparent',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: 13,
                  }}
                >
                  リンクを管理
                </button>
                <button
                  onClick={() => {
                    handleDeleteNote();
                    setMenuOpen(false);
                  }}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '10px 16px',
                    border: 'none',
                    background: 'transparent',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: 13,
                    color: '#dc2626',
                  }}
                >
                  メモを削除
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 12, padding: 'var(--space-3)' }}>
          <div style={{ marginBottom: 'var(--space-2)' }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{title}</div>
            <div style={{ fontSize: 13, color: 'var(--muted)' }}>日付: {dateKey}</div>
          </div>

          <label>
            <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 8, color: 'var(--muted)' }}>メモ内容</div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="自由にメモを記入できます..."
              style={{
                width: '100%',
                minHeight: 200,
                padding: 12,
                borderRadius: 8,
                border: '1px solid var(--line)',
                fontSize: 14,
                fontFamily: 'inherit',
                resize: 'vertical',
              }}
            />
          </label>

          <div style={{ marginTop: 'var(--space-3)' }}>
            <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 8, color: 'var(--muted)' }}>タグ</div>
            <div className="chips-wrap">
              <div className="chips" style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                {localTags.map((t) => (
                  <span
                    key={t}
                    style={{
                      padding: '4px 10px',
                      background: 'var(--chip)',
                      borderRadius: 6,
                      fontSize: 12,
                      cursor: 'pointer',
                    }}
                    title="クリックで削除"
                    onClick={() => removeTag(t)}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
            <button
              onClick={() => setTagModalOpen(true)}
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--line)',
                borderRadius: 8,
                padding: '6px 12px',
                cursor: 'pointer',
                fontSize: 13,
              }}
            >
              ＋タグを追加
            </button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-3)' }}>
            <button
              onClick={handleSave}
              style={{
                background: 'var(--accent)',
                border: '1px solid var(--accent)',
                borderRadius: 8,
                padding: '10px 20px',
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 600,
                color: '#fff',
              }}
            >
              保存
            </button>
          </div>
        </div>

        {tagModalOpen && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
            }}
            onClick={() => setTagModalOpen(false)}
          >
            <div
              style={{
                background: 'var(--surface)',
                borderRadius: 12,
                padding: 'var(--space-4)',
                maxWidth: 400,
                width: '90%',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
                <h3 style={{ margin: 0 }}>タグを追加</h3>
                <button
                  onClick={() => setTagModalOpen(false)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    fontSize: 20,
                    cursor: 'pointer',
                  }}
                >
                  ✕
                </button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                {['重要', 'アイデア', '振り返り', '気づき', 'TODO', '改善', '成功', '失敗'].map((t) => (
                  <button
                    key={t}
                    onClick={() => {
                      addTag(t);
                      setTagModalOpen(false);
                    }}
                    style={{
                      padding: '10px',
                      background: 'var(--chip)',
                      border: '1px solid var(--line)',
                      borderRadius: 8,
                      cursor: 'pointer',
                      fontSize: 13,
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
