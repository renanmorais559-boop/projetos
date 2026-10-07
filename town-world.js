export const world={width:840,height:480};
export const sites=[
  {id:'residential',name:'Vila Jardim',x:140,y:180,color:'#b9c986'},
  {id:'center',name:'Centro',x:420,y:180,color:'#ebc987'},
  {id:'station',name:'Estação',x:700,y:180,color:'#9bcac8'}
];
export const obstacles=sites.map(s=>({x:s.x-85,y:70,width:170,height:150}));
const blocked=(x,y)=>obstacles.some(b=>x>b.x-9&&x<b.x+b.width+9&&y>b.y-9&&y<b.y+b.height+9);
export function movePlayer(player,dx,dy,seconds){
  const length=Math.hypot(dx,dy)||1,speed=160*Math.max(0,Math.min(seconds,.05));
  const x=Math.max(12,Math.min(world.width-12,player.x+dx/length*speed));
  const y=Math.max(12,Math.min(world.height-12,player.y+dy/length*speed));
  return {x:blocked(x,player.y)?player.x:x,y:blocked(blocked(x,player.y)?player.x:x,y)?player.y:y};
}
export const nearbySite=player=>sites.find(s=>Math.hypot(s.x-player.x,245-player.y)<75)??null;
