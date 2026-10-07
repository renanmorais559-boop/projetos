import {world,sites,obstacles,movePlayer,nearbySite} from './town-world.js';
import {districts} from './engine.js';
export function createTown({canvas,info,inspect,controls,onChoose}){
  const ctx=canvas.getContext('2d');
  let player={x:420,y:360},active=false,frame=null,last=0,selected='center',owned=null;
  const keys=new Set(),directions={ArrowUp:[0,-1],w:[0,-1],ArrowDown:[0,1],s:[0,1],ArrowLeft:[-1,0],a:[-1,0],ArrowRight:[1,0],d:[1,0]};
  canvas.width=world.width;canvas.height=world.height;
  function draw(){
    ctx.fillStyle='#aec49d';ctx.fillRect(0,0,world.width,world.height);
    ctx.fillStyle='#668378';ctx.fillRect(0,270,840,82);ctx.fillRect(380,0,80,480);
    ctx.strokeStyle='#bed1b2';ctx.setLineDash([16,18]);ctx.beginPath();ctx.moveTo(0,310);ctx.lineTo(840,310);ctx.stroke();ctx.setLineDash([]);
    ctx.fillStyle='#c8d1ac';ctx.fillRect(0,230,840,28);ctx.fillRect(0,362,840,20);
    sites.forEach((s,i)=>{
      const b=obstacles[i];ctx.fillStyle='#7c9373';ctx.fillRect(b.x+7,b.y+9,b.width,b.height);
      ctx.fillStyle=s.color;ctx.fillRect(b.x,b.y,b.width,b.height);ctx.fillStyle='#2d4d3b';ctx.fillRect(b.x-4,b.y,178,22);
      ctx.fillStyle='#476d5a';ctx.fillRect(b.x+16,b.y+44,45,46);ctx.fillRect(b.x+109,b.y+44,45,46);ctx.fillRect(s.x-18,165,36,55);
      ctx.fillStyle='#fff1cd';ctx.font='bold 15px system-ui';ctx.textAlign='center';ctx.fillText(s.name,s.x,58);
      ctx.fillStyle='#243e2d';ctx.font='12px system-ui';ctx.fillText(owned===s.id?'CAFÉ AURORA · FILIAL':'PONTO DISPONÍVEL',s.x,201);
      if(selected===s.id){ctx.strokeStyle='#f4ffbf';ctx.lineWidth=4;ctx.strokeRect(b.x-7,b.y-7,b.width+14,b.height+14);}
      ctx.beginPath();ctx.arc(s.x,245,9,0,Math.PI*2);ctx.fillStyle=owned===s.id?'#e9c568':'#f0f5d3';ctx.fill();
    });
    for(const [x,y] of [[40,400],[170,420],[650,415],[790,395]]){ctx.fillStyle='#614f36';ctx.fillRect(x-3,y,6,18);ctx.fillStyle='#4b7b4e';ctx.beginPath();ctx.arc(x,y-8,18,0,Math.PI*2);ctx.fill();}
    ctx.fillStyle='#355947';ctx.fillRect(300,405,240,35);ctx.fillStyle='#e9dfac';ctx.font='bold 13px system-ui';ctx.fillText('VILA AURORA · SUA PRIMEIRA LOJA',420,427);
    ctx.fillStyle='#283b32';ctx.beginPath();ctx.ellipse(player.x,player.y+10,11,5,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#ecd4a5';ctx.beginPath();ctx.arc(player.x,player.y-8,7,0,Math.PI*2);ctx.fill();ctx.fillStyle='#eaeec6';ctx.fillRect(player.x-7,player.y,14,12);
    const site=nearbySite(player);
    inspect.disabled=!site;
    info.textContent=site?`${site.name}: abertura R$ ${districts[site.id].cost.toLocaleString('pt-BR')}, operação +R$ ${districts[site.id].rent}/dia. ${owned===site.id?'Sua filial fica aqui.':'Use Escolher este bairro para comparar o investimento.'}`:'Caminhe até um ponto marcado ou use os botões Visitar. Explorar não avança o dia nem gasta dinheiro.';
  }
  function stop(){keys.clear();if(frame!==null)cancelAnimationFrame(frame);frame=null;last=0;}
  function tick(time){
    frame=null;if(!active||!keys.size){last=0;return;}
    const seconds=last?(time-last)/1000:1/60;last=time;
    let dx=0,dy=0;for(const key of keys){dx+=directions[key][0];dy+=directions[key][1];}
    player=movePlayer(player,dx,dy,seconds);draw();frame=requestAnimationFrame(tick);
  }
  function start(){if(active&&frame===null)frame=requestAnimationFrame(tick);}
  canvas.onkeydown=e=>{const key=e.key.length===1?e.key.toLowerCase():e.key;if(directions[key]){e.preventDefault();keys.add(key);start()}else if(e.key==='Enter'){e.preventDefault();inspect.click()}};
  canvas.onkeyup=e=>{keys.delete(e.key.length===1?e.key.toLowerCase():e.key);};canvas.onblur=stop;
  for(const button of controls.querySelectorAll('[data-move]')){
    const key=button.dataset.move;
    button.onpointerdown=e=>{e.preventDefault();button.setPointerCapture(e.pointerId);keys.add(key);start()};
    button.onpointerup=button.onpointercancel=button.onlostpointercapture=()=>{keys.delete(key)};
    button.onclick=e=>{if(e.detail===0){player=movePlayer(player,...directions[key],.05);draw()}};
  }
  controls.onclick=e=>{const button=e.target.closest('[data-visit]');if(button){stop();const site=sites.find(s=>s.id===button.dataset.visit);if(site){player={x:site.x,y:245};draw();canvas.focus({preventScroll:true})}}};
  inspect.onclick=()=>{const site=nearbySite(player);if(site)onChoose(site.id)};
  draw();
  return {setActive(value){active=value;if(!active)stop();else draw()},setState(selection,location){selected=selection;owned=location;if(active)draw()}};
}
