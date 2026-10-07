const money=n=>n.toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
export function profitChart(history){
  if(!history.length)return '<p class="empty-chart">Seu primeiro dia dará início ao gráfico.</p>';
  const width=900,height=260,left=75,right=20,top=25,bottom=35;
  const min=Math.min(0,...history.map(r=>r.profit)),max=Math.max(0,...history.map(r=>r.profit));
  const span=max-min||1,plotHeight=height-top-bottom,y=value=>top+(max-value)/span*plotHeight;
  const step=(width-left-right)/history.length,zero=y(0);
  const bars=history.map((r,i)=>{
    const barHeight=Math.abs(y(r.profit)-zero);
    return `<g><title>Dia ${r.day}: ${money(r.profit)}</title><rect x="${left+i*step+step*.15}" y="${Math.min(zero,y(r.profit))}" width="${step*.7}" height="${Math.max(barHeight,1)}" fill="${r.profit>=0?'#c6ed83':'#f0a59a'}"/><text x="${left+(i+.5)*step}" y="${height-12}" text-anchor="middle" fill="#bdcbbf" font-size="12">${r.day}</text></g>`;
  }).join('');
  return `<svg viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="profitChartTitle profitChartDesc"><title id="profitChartTitle">Lucro operacional por dia</title><desc id="profitChartDesc">${history.length} dias. Menor resultado ${money(min)}, maior resultado ${money(max)}. Valores exatos disponíveis no diário.</desc><text x="5" y="18" fill="#bdcbbf" font-size="12">${money(max)}</text><text x="5" y="${height-bottom+16}" fill="#bdcbbf" font-size="12">${money(min)}</text><line x1="${left}" y1="${zero}" x2="${width-right}" y2="${zero}" stroke="#76917d"/>${bars}</svg>`;
}
