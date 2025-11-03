import React from 'react';
import Card from '../common/Card';
import SectionTag from '../common/SectionTag';

type LinkedNotesProps = {
  notes: {
    memo: string[];
  };
};

export default function LinkedNotes({ notes }: LinkedNotesProps) {
  return (
    <Card>
      <SectionTag>メモ（なぜそう考えるか）</SectionTag>
      <h4>メモ（根拠の要点）</h4>
      <ul style={{ margin: '0 0 0 18px', padding: 0, lineHeight: 1.6 }}>
        {notes.memo.map((item, idx) => (
          <li key={idx}>{item}</li>
        ))}
      </ul>
    </Card>
  );
}
