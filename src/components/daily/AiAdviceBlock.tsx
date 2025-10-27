import React from 'react';
import type { AiAdvice } from './types';

type AiAdviceBlockProps = {
  advice: AiAdvice;
  onGenerate?: () => void;
  onRegenerate?: () => void;
  onPin?: () => void;
};

export default function AiAdviceBlock({
  advice,
  onGenerate,
  onRegenerate,
  onPin,
}: AiAdviceBlockProps) {
  return (
    <>
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <div className="row" style={{ gap: '8px' }}>
          <div style={{ fontWeight: 700 }}>AIアドバイス</div>
          {advice.lastUpdated && (
            <small className="sub">最終更新：{advice.lastUpdated}</small>
          )}
        </div>
        <div className="row">
          <button className="btn" onClick={onGenerate}>
            アドバイスを生成
          </button>
          <button className="btn" onClick={onRegenerate}>
            再生成
          </button>
          <button className="btn" onClick={onPin}>
            固定
          </button>
        </div>
      </div>
      <ul style={{ margin: '0 0 0 18px', padding: 0, lineHeight: 1.6 }}>
        {advice.items.map((item, idx) => (
          <li key={idx}>{item}</li>
        ))}
      </ul>
    </>
  );
}
