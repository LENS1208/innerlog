import React from 'react';
import type { TextareaGroupValue } from './types';

type TextareaGroupProps = {
  values: TextareaGroupValue;
  onChange?: (values: TextareaGroupValue) => void;
};

export default function TextareaGroup({ values, onChange }: TextareaGroupProps) {
  const handleChange = (field: keyof TextareaGroupValue, value: string) => {
    onChange?.({ ...values, [field]: value });
  };

  const labelStyle = {
    display: 'block',
    fontSize: 12,
    color: 'var(--muted)',
    marginBottom: 6,
  };

  const textareaStyle = {
    width: '100%',
    minHeight: 80,
    padding: 10,
    border: '1px solid var(--line)',
    borderRadius: 8,
    fontSize: 13,
    fontFamily: 'inherit',
    resize: 'vertical' as const,
    position: 'relative' as const,
    zIndex: 1000,
    pointerEvents: 'auto' as const,
    userSelect: 'text' as const,
    WebkitUserSelect: 'text' as const,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
      <div>
        <label style={labelStyle}>うまくいった点</label>
        <textarea
          style={textareaStyle}
          value={values.good}
          onChange={(e) => handleChange('good', e.target.value)}
          placeholder="例）エントリー前にしっかり水平線を引いて待てた。損切りラインに事前に決めていたので迷わずにした。"
        />
      </div>

      <div>
        <label style={labelStyle}>改善点</label>
        <textarea
          style={textareaStyle}
          value={values.improve}
          onChange={(e) => handleChange('improve', e.target.value)}
          placeholder="例）利確が早い傾向がある。もう少し引き寄せるべきだった。感情で決めてしまった。"
        />
      </div>

      <div>
        <label style={labelStyle}>次回の約束</label>
        <textarea
          style={textareaStyle}
          value={values.nextPromise}
          onChange={(e) => handleChange('nextPromise', e.target.value)}
          placeholder="例）利確ポイントを2段階にわけて、半分だけ早めに取るようにする。チャートに目標地点を引いておく。"
        />
      </div>

      <div>
        <label style={labelStyle}>自由メモ</label>
        <textarea
          style={textareaStyle}
          value={values.free}
          onChange={(e) => handleChange('free', e.target.value)}
          placeholder="例）今日は集中力があった。前のニュースで目線が上がったのでロングに絞った。"
        />
      </div>
    </div>
  );
}
