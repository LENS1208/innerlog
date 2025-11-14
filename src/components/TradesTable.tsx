import React from "react";
import cfg from "../../config/tables/tradeList.config.json";
import { fmt } from "../lib/formatters";

type Row = Record<string, any>;
type SortConfig = { key: string; direction: 'asc' | 'desc' } | null;

const SORTABLE_COLUMNS = ['datetime', 'symbol', 'side', 'pnl_jpy', 'pips', 'size'];

interface TradesTableProps {
  rows: Row[];
  sortConfig: SortConfig;
  onSort: (columnId: string) => void;
}

export default function TradesTable({ rows, sortConfig, onSort }: TradesTableProps) {
  return (
    <div style={{
      border:"1px solid var(--line)",
      borderRadius:12,
      background:"var(--surface)",
      overflow:"auto"
    }}>
      <table style={{width:"100%",borderCollapse:"separate",borderSpacing:0}}>
        <thead>
          <tr>
            {cfg.columns.map(c=>{
              const isSortable = SORTABLE_COLUMNS.includes(c.id);
              const isActive = sortConfig?.key === c.id;
              return (
                <th
                  key={c.id}
                  onClick={() => onSort(c.id)}
                  style={{
                    position:"sticky",
                    top:0,
                    background:"var(--surface)",
                    borderBottom:"1px solid var(--line)",
                    textAlign:"left",
                    padding:8,
                    fontSize:13,
                    fontWeight:"bold",
                    color: isActive ? "var(--ink)" : "var(--muted)",
                    cursor: isSortable ? "pointer" : "default",
                    userSelect: "none"
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    {c.label}
                    {isSortable && isActive && (
                      <span style={{ fontSize: 10 }}>
                        {sortConfig?.direction === 'asc' ? '▲' : '▼'}
                      </span>
                    )}
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i)=>(
            <tr
              key={i}
              className="trade-row"
              onClick={() => {
                console.log('Trade row clicked:', r);
                console.log('Ticket:', r.ticket);
                location.hash = `/notebook/${r.ticket || i}`;
              }}
              style={{cursor:"pointer"}}
            >
              {cfg.columns.map(c=>{
                const val = r[c.id];
                const out = (fmt as any)[c.format]?.(val) ?? val;
                const text = out?.text ?? out;
                const cls  = out?.cls ?? "";
                return <td key={c.id} className={cls} style={{padding:10,height:"var(--row-h)",background:"var(--surface)",borderBottom:"1px solid var(--line)"}}>{text}</td>;
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
