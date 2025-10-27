import React from 'react';
import type { LinkedNoteRow } from './types';

type LinkedNotesTableProps = {
  notes: LinkedNoteRow[];
  onOpenNote?: (title: string) => void;
};

export default function LinkedNotesTable({ notes, onOpenNote }: LinkedNotesTableProps) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          <th style={{ textAlign: 'left', padding: '6px' }}>タイトル</th>
          <th style={{ textAlign: 'left', padding: '6px' }}>種類</th>
          <th style={{ textAlign: 'left', padding: '6px' }}>更新</th>
          <th style={{ textAlign: 'right', padding: '6px' }}>操作</th>
        </tr>
      </thead>
      <tbody>
        {notes.map((note, idx) => (
          <tr key={idx}>
            <td style={{ padding: '6px' }}>{note.title}</td>
            <td style={{ padding: '6px' }}>{note.kind}</td>
            <td style={{ padding: '6px' }}>{note.updated}</td>
            <td style={{ textAlign: 'right', padding: '6px' }}>
              <button className="btn" onClick={() => onOpenNote?.(note.title)}>
                表示
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
