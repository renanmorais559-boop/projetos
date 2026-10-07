export const HISTORY_LIMIT=120;
export const emptyTotals=()=>({days:0,sold:0,demand:0,profit:0,profitable:0,perfect:0});
export function recordTotals(t,r){
  t.days++;t.sold+=r.sold;t.demand+=r.demand;t.profit+=r.profit;
  if(r.profit>0)t.profitable++;
  if(r.demand>0&&r.lost===0)t.perfect++;
}
export function totalsFor(history){const t=emptyTotals();for(const r of history)recordTotals(t,r);return t;}
