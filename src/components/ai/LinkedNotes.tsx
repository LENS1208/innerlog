import React from 'react';
import Card from '../common/Card';
import SectionTag from '../common/SectionTag';
import { HelpIcon } from '../common/HelpIcon';

type LinkedNotesProps = {
  notes: {
    memo: string[];
  };
};

export default function LinkedNotes({ notes }: LinkedNotesProps) {
  return (
    <Card>
      <SectionTag>メモ（なぜそう考えるか）</SectionTag>
      <h4 style={{ display: 'flex', alignItems: 'center' }}>
        メモ？
        <HelpIcon text="なぜそう考えるか、根拠の要点をメモとして記録します。" />
      </h4>
      <ul style={{ margin: '0 0 0 18px', padding: 0, lineHeight: 1.6 }}>
        {notes.memo.map((item, idx) => (
          <li key={idx}>{item}</li>
        ))}
      </ul>
    </Card>
  );
}
