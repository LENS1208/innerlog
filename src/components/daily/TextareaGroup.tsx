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

  return (
    <>
      <label className="tag" style={{ width: 'max-content' }}>
        うまくいった点
      </label>
      <textarea
        className="input"
        style={{ height: '72px' }}
        value={values.good}
        onChange={(e) => handleChange('good', e.target.value)}
      />

      <label className="tag" style={{ width: 'max-content' }}>
        改善点
      </label>
      <textarea
        className="input"
        style={{ height: '72px' }}
        value={values.improve}
        onChange={(e) => handleChange('improve', e.target.value)}
      />

      <label className="tag" style={{ width: 'max-content' }}>
        次回の約束
      </label>
      <textarea
        className="input"
        style={{ height: '72px' }}
        value={values.nextPromise}
        onChange={(e) => handleChange('nextPromise', e.target.value)}
      />

      <label className="tag" style={{ width: 'max-content' }}>
        自由メモ
      </label>
      <textarea
        className="input"
        style={{ height: '72px' }}
        value={values.free}
        onChange={(e) => handleChange('free', e.target.value)}
      />
    </>
  );
}
