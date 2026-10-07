export const world={width:840,height:720};
export const sites=[
  {id:'residential',name:'Vila Jardim',x:140,y:180,color:'#b9c986'},
  {id:'center',name:'Centro',x:420,y:180,color:'#ebc987'},
  {id:'station',name:'Estação',x:700,y:180,color:'#9bcac8'}
];
export const businessSites=[
  {id:'bakery',kind:'business',name:'Pão da Vila',x:140,y:505,visitY:585,color:'#d8b885'},
  {id:'market',kind:'business',name:'Mercado Horizonte',x:420,y:505,visitY:585,color:'#9dbda0'},
  {id:'electronics',kind:'business',name:'Aurora Tecnologia',x:700,y:505,visitY:585,color:'#8fbdcd'}
];
export const serviceSites=[
  {id:'cafe',kind:'service',name:'Café Aurora',x:60,y:360,visitY:360,color:'#ead69a'},
  {id:'bank',kind:'service',name:'Banco empresarial',x:280,y:660,visitY:625,color:'#8da9b8'},
  {id:'supplier',kind:'service',name:'Fornecedor',x:560,y:660,visitY:625,color:'#b5c585'}
];
export const places=[...sites.map(s=>({...s,kind:'district',visitY:245})),...businessSites,...serviceSites];
export const obstacles=[...sites.map(s=>({x:s.x-85,y:70,width:170,height:150})),...businessSites.map(s=>({x:s.x-85,y:410,width:170,height:150}))];
const blocked=(x,y)=>obstacles.some(b=>x>b.x-9&&x<b.x+b.width+9&&y>b.y-9&&y<b.y+b.height+9);
export function movePlayer(player,dx,dy,seconds){
  const length=Math.hypot(dx,dy)||1,speed=160*Math.max(0,Math.min(seconds,.05));
  const x=Math.max(12,Math.min(world.width-12,player.x+dx/length*speed));
  const y=Math.max(12,Math.min(world.height-12,player.y+dy/length*speed));
  return {x:blocked(x,player.y)?player.x:x,y:blocked(blocked(x,player.y)?player.x:x,y)?player.y:y};
}
export const nearbySite=player=>sites.find(s=>Math.hypot(s.x-player.x,245-player.y)<75)??null;
export function nearbyPlace(player){
  return places.map(p=>({place:p,distance:Math.hypot(p.x-player.x,p.visitY-player.y)})).filter(p=>p.distance<65).sort((a,b)=>a.distance-b.distance)[0]?.place??null;
}
