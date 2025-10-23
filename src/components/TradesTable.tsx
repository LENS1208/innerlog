import React from "react";
import cfg from "../../config/tables/tradeList.config.json";
import { fmt } from "../lib/formatters";

type Row = Record<string, any>;
export default function TradesTable({rows}:{rows:Row[]}){
  return (
    <div style={{height:"70vh",overflow:"auto",border:"1px solid var(--line)",borderRadius:12,background:"var(--surface)"}}>
      <table style={{width:"100%",borderCollapse:"separate",borderSpacing:0}}>
        <thead>
          <tr>
            {cfg.columns.map(c=>(
              <th key={c.id} style={{position:"sticky",top:0,background:"#f9fafb",borderBottom:"1px solid var(--line)",textAlign:"left",padding:8,fontSize:12,color:"var(--muted)"}}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i)=>(
            <tr
              key={i}
              className="trade-row"
              onClick={() => { location.hash = `/notebook/${i}`; }}
            >
              {cfg.columns.map(c=>{
                const val = r[c.id];
                const out = (fmt as any)[c.format]?.(val) ?? val;
                const text = out?.text ?? out;
                const cls  = out?.cls ?? "";
                return <td key={c.id} className={cls} style={{padding:10,height:"var(--row-h)"}}>{text}</td>;
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
