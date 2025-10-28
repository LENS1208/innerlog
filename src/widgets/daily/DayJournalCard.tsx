import React, { useState, useEffect } from "react";
import type { JournalPayload } from "./types";
import { getDailyNote, saveDailyNote } from "../../lib/db.service";

type DayJournalCardProps = {
  dateKey: string;
  onSave?: (payload: JournalPayload) => void;
};

export function DayJournalCard({ dateKey, onSave }: DayJournalCardProps) {
  const [good, setGood] = useState("");
  const [improve, setImprove] = useState("");
  const [nextPromise, setNextPromise] = useState("");
  const [free, setFree] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('DayJournalCard dateKey:', dateKey);
    (async () => {
      try {
        setLoading(true);
        const note = await getDailyNote(dateKey);
        console.log('Loaded daily note:', note);
        if (note) {
          setGood(note.good || "");
          setImprove(note.improve || "");
          setNextPromise(note.next_promise || "");
          setFree(note.free || "");
        }
      } catch (err) {
        console.error('Failed to load daily note:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [dateKey]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveDailyNote({
        date_key: dateKey,
        title: `${dateKey}の日次ノート`,
        good,
        improve,
        next_promise: nextPromise,
        free,
      });
      if (onSave) {
        onSave({ good, improve, nextPromise, free });
      }
      alert('保存しました');
    } catch (err) {
      console.error('Failed to save daily note:', err);
      alert('保存に失敗しました: ' + (err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="panel-card">
      <div className="panel-header">
        <h2 className="panel-title">当日の推移</h2>
        <button className="save-btn" onClick={handleSave} disabled={saving}>
          {saving ? '保存中...' : '保存'}
        </button>
      </div>

      <div className="sparkline-container">
        <svg className="sparkline" viewBox="0 0 300 60" preserveAspectRatio="none">
          <polyline
            points="0,40 30,35 60,38 90,25 120,30 150,20 180,28 210,15 240,22 270,18 300,12"
            fill="none"
            stroke="rgba(14,165,233,0.8)"
            strokeWidth="2"
          />
        </svg>
      </div>

      <div className="journal-inputs">
        <label>
          <div className="input-label">うまくいった点</div>
          <textarea
            className="journal-textarea"
            value={good}
            onChange={(e) => setGood(e.target.value)}
            placeholder="例）エントリー前にしっかり水平線を引いて待てた。損切りラインも事前に決めていたので迷わず実行できた。"
            disabled={loading}
          />
        </label>

        <label>
          <div className="input-label">改善点</div>
          <textarea
            className="journal-textarea"
            value={improve}
            onChange={(e) => setImprove(e.target.value)}
            placeholder="例）利確が早すぎた。もう少し引っ張れば目標価格に到達していた。感情で決済してしまった。"
          />
        </label>

        <label>
          <div className="input-label">次回の約束</div>
          <textarea
            className="journal-textarea"
            value={nextPromise}
            onChange={(e) => setNextPromise(e.target.value)}
            placeholder="例）利確ポイントを2段階に分けて、半分は早めに、残りは目標価格まで引っ張る。チャートに目標価格のラインを引いておく。"
          />
        </label>

        <label>
          <div className="input-label">自由メモ</div>
          <textarea
            className="journal-textarea"
            value={free}
            onChange={(e) => setFree(e.target.value)}
            placeholder="例）今日は集中力が高かった。朝のニュースで日銀の発言があったので、円高に動くと予想。次回も経済指標の前後は注意深く観察する。"
          />
        </label>
      </div>
    </div>
  );
}
