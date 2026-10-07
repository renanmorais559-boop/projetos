import {marketCalendar} from './calendar.js';
import {businessTypes,businessCapacity,projectBusiness} from './ventures.js';
export function storeHealth(s,id){
 const v=s.ventures.find(v=>v.id===id);if(!v)return null;
 const type=businessTypes[id],factor=marketCalendar(s.day,s.sandbox).factors[id];
 const projection=projectBusiness(v,{factor:1},factor,s.day,s.sandbox);
 const alternative=projectBusiness({...v,staff:!v.staff},{factor:1},factor,s.day,s.sandbox);
 const recent=s.history.slice(-7).flatMap(r=>r.ventures.filter(report=>report.id===id));
 const totals=recent.reduce((t,r)=>({profit:t.profit+r.profit,sold:t.sold+r.sold,lost:t.lost+r.lost}),{profit:0,sold:0,lost:0});
 return {projection,days:recent.length,...totals,
  stockGap:v.paused?0:Math.max(0,Math.min(projection.demand,businessCapacity(v))-v.stock),
  capacityGap:v.paused?0:Math.max(0,projection.demand-businessCapacity(v)),
  alternativeStaff:!v.staff,staffSalesDelta:alternative.sold-projection.sold,staffProfitDelta:alternative.profit-projection.profit,
  unitMargin:v.price-type.cost};
}
