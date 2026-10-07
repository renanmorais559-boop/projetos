import {businessTypes} from './ventures.js';
const sum=rows=>rows.reduce((t,r)=>{for(const k of ['revenue','expenses','goodsCost','profit','sold','demand','payment'])t[k]+=r[k]??0;return t;},{revenue:0,expenses:0,goodsCost:0,profit:0,sold:0,demand:0,payment:0});
export function financialReport(s){
  const current=s.history.slice(-7),previous=s.history.slice(-14,-7),totals=sum(current);
  const businesses=[{id:'cafe',name:'Rede Café Aurora'},...s.ventures.map(v=>({id:v.id,name:businessTypes[v.id].name}))].map(b=>{
    const rows=current.flatMap(r=>b.id==='cafe'?[r.cafe]:r.ventures.filter(v=>v.id===b.id));
    return {...b,...sum(rows),days:rows.length};
  });
  return {...totals,days:current.length,first:current[0]?.day,last:current.at(-1)?.day,
    previousDays:previous.length,previousProfit:sum(previous).profit,
    margin:totals.revenue?totals.profit/totals.revenue*100:null,
    service:totals.demand?totals.sold/totals.demand*100:null,businesses};
}
export function exportLedger(s){
  const lines=[['Dia','Evento','Negócio','Vendas','Demanda','Receita','Custo dos produtos','Custos diários','Lucro operacional','Parcela empresarial']];
  for(const r of s.history){
    lines.push([r.day,r.event,'Empresa consolidada',r.sold,r.demand,r.revenue,r.goodsCost,r.expenses,r.profit,r.payment]);
    for(const v of [{name:'Rede Café Aurora',...r.cafe},...r.ventures.map(v=>({name:businessTypes[v.id].name,...v}))])
      lines.push([r.day,r.event,v.name,v.sold,v.demand,v.revenue,v.goodsCost,v.expenses,v.profit,'']);
  }
  const cell=v=>'"'+(typeof v==='string'&&/^[=+\-@\t\r]/.test(v)?"'"+v:String(v)).replaceAll('"','""')+'"';
  return '\uFEFF'+lines.map(row=>row.map(cell).join(';')).join('\r\n');
}
