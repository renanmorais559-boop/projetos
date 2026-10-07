const week=[
  {name:'Segunda-feira',cafe:1.15,bakery:.95,market:.9,electronics:.85,note:'Escritórios movimentam o café; varejo começa mais devagar.'},
  {name:'Terça-feira',cafe:1.1,bakery:1,market:.95,electronics:.9,note:'Cafeteria em alta, compras de tecnologia mais contidas.'},
  {name:'Quarta-feira',cafe:1,bakery:1,market:1,electronics:1,note:'Movimento equilibrado nos quatro ramos.'},
  {name:'Quinta-feira',cafe:1.05,bakery:1,market:1.05,electronics:1,note:'O comércio começa a aquecer para o fim de semana.'},
  {name:'Sexta-feira',cafe:1.15,bakery:1.1,market:1.15,electronics:1.25,note:'Mais compras e encontros; prepare estoque para o movimento.'},
  {name:'Sábado',cafe:.9,bakery:1.2,market:1.25,electronics:1.2,note:'Padaria, mercado e tecnologia recebem mais movimento.'},
  {name:'Domingo',cafe:.75,bakery:1.1,market:1,electronics:.8,note:'Café e tecnologia têm movimento menor; custos continuam.'}
];
export function marketCalendar(day,sandbox=false){
  const entry=week[(day-1)%7];
  return {...entry,day,active:sandbox,factors:sandbox?{cafe:entry.cafe,bakery:entry.bakery,market:entry.market,electronics:entry.electronics}:{cafe:1,bakery:1,market:1,electronics:1}};
}
export const calendarWeek=s=>Array.from({length:7},(_,i)=>marketCalendar(s.day+i,s.sandbox));
