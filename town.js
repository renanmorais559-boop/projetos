import {world,sites,businessSites,serviceSites,places,obstacles,movePlayer,nearbyPlace} from './town-world.js';
import {districts} from './engine.js';
import {businessTypes} from './ventures.js';
export function createTown({canvas,info,inspect,controls,onChoose,onVisit}){
  const ctx=canvas.getContext('2d');
  let player={x:420,y:360},active=false,frame=null,last=0,selected='center',owned=null,state=null;
  const keys=new Set(),directions={ArrowUp:[0,-1],w:[0,-1],ArrowDown:[0,1],s:[0,1],ArrowLeft:[-1,0],a:[-1,0],ArrowRight:[1,0],d:[1,0]};
  canvas.width=world.width;canvas.height=world.height;
  function marker(x,y,color){ctx.beginPath();ctx.arc(x,y,9,0,Math.PI*2);ctx.fillStyle=color;ctx.fill();}
  function building(site,box,label,chosen=false){
    ctx.fillStyle='#708976';ctx.fillRect(box.x+7,box.y+9,box.width,box.height);
    ctx.fillStyle=site.color;ctx.fillRect(box.x,box.y,box.width,box.height);ctx.fillStyle='#2d4d3b';ctx.fillRect(box.x-4,box.y,box.width+8,22);
    ctx.fillStyle='#476d5a';ctx.fillRect(box.x+16,box.y+44,45,46);ctx.fillRect(box.x+109,box.y+44,45,46);ctx.fillRect(site.x-18,box.y+95,36,55);
    ctx.fillStyle='#263e2d';ctx.font='bold 15px system-ui';ctx.textAlign='center';ctx.fillText(site.name,site.x,box.y-12);
    ctx.fillStyle='#fff1cd';ctx.font='10px system-ui';ctx.fillText(label,site.x,box.y+17);
    if(chosen){ctx.strokeStyle='#f4ffbf';ctx.lineWidth=4;ctx.strokeRect(box.x-7,box.y-7,box.width+14,box.height+14);}
  }
  function draw(){
    ctx.fillStyle='#aec49d';ctx.fillRect(0,0,world.width,world.height);
    ctx.fillStyle='#668378';ctx.fillRect(0,270,840,82);ctx.fillRect(380,0,80,world.height);
    ctx.strokeStyle='#bed1b2';ctx.setLineDash([16,18]);ctx.beginPath();ctx.moveTo(0,310);ctx.lineTo(840,310);ctx.stroke();ctx.setLineDash([]);
    ctx.fillStyle='#c8d1ac';ctx.fillRect(0,230,840,28);ctx.fillRect(0,362,840,28);ctx.fillRect(0,572,840,26);
    sites.forEach((site,i)=>{building(site,obstacles[i],owned===site.id?'CAFÉ AURORA · FILIAL':'PONTO PARA FILIAL',selected===site.id);marker(site.x,245,owned===site.id?'#e9c568':'#f0f5d3')});
    businessSites.forEach((site,i)=>{
      const venture=state?.ventures.find(v=>v.id===site.id),type=businessTypes[site.id];
      const label=venture?(venture.paused?'SUA LOJA · SUSPENSA':`SUA LOJA · NÍVEL ${venture.level}`):state?.day<type.unlockDay?`DISPONÍVEL NO DIA ${type.unlockDay}`:'OPORTUNIDADE DE NEGÓCIO';
      building(site,obstacles[i+3],label);marker(site.x,site.visitY,venture?'#e9c568':'#f0f5d3');
    });
    serviceSites.forEach(site=>{
      if(site.id==='cafe'){ctx.fillStyle='#304d38';ctx.fillRect(20,328,110,25);ctx.fillStyle='#f3e2a8';ctx.font='bold 11px system-ui';ctx.fillText('CAFÉ AURORA',75,345);}
      else{ctx.fillStyle=site.color;ctx.fillRect(site.x-78,645,156,50);ctx.fillStyle='#284131';ctx.font='bold 12px system-ui';ctx.fillText(site.name,site.x,675);}
      marker(site.x,site.visitY,'#f6e2a5');
    });
    for(const [x,y] of [[30,450],[295,490],[540,480],[805,490]]){ctx.fillStyle='#614f36';ctx.fillRect(x-3,y,6,18);ctx.fillStyle='#4b7b4e';ctx.beginPath();ctx.arc(x,y-8,16,0,Math.PI*2);ctx.fill();}
    ctx.fillStyle='#283b32';ctx.beginPath();ctx.ellipse(player.x,player.y+10,11,5,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#ecd4a5';ctx.beginPath();ctx.arc(player.x,player.y-8,7,0,Math.PI*2);ctx.fill();ctx.fillStyle='#eaeec6';ctx.fillRect(player.x-7,player.y,14,12);
    const place=nearbyPlace(player);inspect.disabled=!place;
    if(place?.kind==='district'){
      inspect.textContent='Comparar este bairro';info.textContent=`${place.name}: abertura R$ ${districts[place.id].cost.toLocaleString('pt-BR')}, operação +R$ ${districts[place.id].rent}/dia. ${owned===place.id?'Sua filial fica aqui.':'Compare o investimento antes de abrir a filial.'}`;
    }else if(place?.kind==='business'){
      const v=state?.ventures.find(v=>v.id===place.id);inspect.textContent=v?'Gerenciar esta loja':'Conhecer este negócio';info.textContent=`${businessTypes[place.id].name}: ${v?v.paused?'loja suspensa. Retome a operação ou revise as decisões.':`sua loja, com ${v.stock} unidades de estoque.`:`abertura R$ ${businessTypes[place.id].opening.toLocaleString('pt-BR')}, disponível no dia ${businessTypes[place.id].unlockDay}.`} A visita não realiza compras.`;
    }else if(place){inspect.textContent=place.id==='supplier'?'Conversar com o fornecedor':place.id==='bank'?'Visitar o banco':'Gerenciar a cafeteria';info.textContent=place.id==='supplier'?'Compare os fornecedores e prepare o estoque da cafeteria. Comprar requer sua decisão.':place.id==='bank'?'Confira capital de giro, parcelas e condições de crédito. Visitar não contrata empréstimo.':'Sua primeira cafeteria. Abra seus controles para preparar o próximo expediente.';}
    else{inspect.textContent='Interagir com o local próximo';info.textContent='Caminhe até um marcador, toque nele ou use Visitar. Explorar não avança o dia nem gasta dinheiro.';}
  }
  function stop(){keys.clear();if(frame!==null)cancelAnimationFrame(frame);frame=null;last=0;}
  function tick(time){
    frame=null;if(!active||!keys.size){last=0;return;}
    const seconds=last?(time-last)/1000:1/60;last=time;
    let dx=0,dy=0;for(const key of keys){dx+=directions[key][0];dy+=directions[key][1];}
    player=movePlayer(player,dx,dy,seconds);draw();frame=requestAnimationFrame(tick);
  }
  function start(){if(active&&frame===null)frame=requestAnimationFrame(tick);}
  function visit(id){const place=places.find(p=>p.id===id);if(!place)return;stop();player={x:place.x,y:place.visitY};draw();canvas.focus({preventScroll:true})}
  canvas.onkeydown=e=>{const key=e.key.length===1?e.key.toLowerCase():e.key;if(directions[key]){e.preventDefault();keys.add(key);start()}else if(e.key==='Enter'){e.preventDefault();inspect.click()}};
  canvas.onkeyup=e=>{keys.delete(e.key.length===1?e.key.toLowerCase():e.key);};canvas.onblur=stop;
  canvas.onclick=e=>{const box=canvas.getBoundingClientRect(),x=(e.clientX-box.left)*world.width/box.width,y=(e.clientY-box.top)*world.height/box.height;const place=places.map(p=>({p,d:Math.hypot(p.x-x,p.visitY-y)})).sort((a,b)=>a.d-b.d)[0];if(place?.d<45)visit(place.p.id)};
  for(const button of controls.querySelectorAll('[data-move]')){
    const key=button.dataset.move;
    button.onpointerdown=e=>{e.preventDefault();button.setPointerCapture(e.pointerId);keys.add(key);start()};
    button.onpointerup=button.onpointercancel=button.onlostpointercapture=()=>{keys.delete(key)};
    button.onclick=e=>{if(e.detail===0){player=movePlayer(player,...directions[key],.05);draw()}};
  }
  controls.onclick=e=>{const button=e.target.closest('[data-visit]');if(button)visit(button.dataset.visit)};
  inspect.onclick=()=>{const place=nearbyPlace(player);if(place?.kind==='district')onChoose(place.id);else if(place)onVisit?.(place.kind,place.id)};
  draw();
  return {setActive(value){active=value;if(!active)stop();else draw()},setState(selection,location,company){selected=selection;owned=location;state=company;if(active)draw()}};
}
