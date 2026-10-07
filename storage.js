import {initial,districts,scenarios,orders} from './engine.js';
import {businessTypes} from './ventures.js';
import {dilemmas} from './story.js';
export const SAVE_KEY='primeiro-imperio.save.v1';
export const MAX_BACKUP_BYTES=100000;
const integer=(n,min,max=Number.MAX_SAFE_INTEGER)=>Number.isSafeInteger(n)&&n>=min&&n<=max;
const finite=n=>typeof n==='number'&&Number.isFinite(n);
const totals=['demand','sold','revenue','expenses','goodsCost','profit','lost'];
function accounting(r,limit=200,minCost=5,maxCost=12){
  return r&&integer(r.demand,0)&&integer(r.sold,0,limit)&&r.sold<=r.demand&&
    finite(r.revenue)&&r.revenue>=0&&finite(r.expenses)&&r.expenses>=0&&
    integer(r.goodsCost,r.sold*minCost,r.sold*maxCost)&&finite(r.profit)&&
    r.profit===r.revenue-r.goodsCost-r.expenses&&r.lost===r.demand-r.sold;
}
function cafeReport(r){
  return accounting(r,101,6,8)&&r.expenses>=70&&integer(r.contractSold,0,40)&&r.contractSold<=r.sold&&
    typeof r.contractFailed==='boolean'&&(!r.contractFailed||r.contractSold===0);
}
function report(r,index){
  return accounting(r)&&r.day===index+1&&typeof r.event==='string'&&r.event.length<=200&&
    [0,220].includes(r.payment)&&cafeReport(r.cafe)&&r.cafe.day===r.day&&
    r.contractSold===r.cafe.contractSold&&r.contractFailed===r.cafe.contractFailed&&
    Array.isArray(r.ventures)&&r.ventures.length<=2&&new Set(r.ventures.map(v=>v?.id)).size===r.ventures.length&&
    r.ventures.every(v=>v&&Object.hasOwn(businessTypes,v.id)&&accounting(v,45,businessTypes[v.id].cost,businessTypes[v.id].cost)&&v.expenses>=businessTypes[v.id].rent)&&
    totals.every(key=>r[key]===r.cafe[key]+r.ventures.reduce((n,v)=>n+v[key],0));
}
function valid(s){
  if(!s||!Object.hasOwn(scenarios,s.scenario)||!integer(s.day,1,31)||!finite(s.cash)||
    typeof s.over!=='boolean'||s.over!==(s.cash<0||s.day>30))return false;
  if(!(s.contract===null||(!s.over&&s.contract===s.day&&Object.hasOwn(orders,s.contract)))||
    typeof s.equipment!=='boolean'||!integer(s.training,0,2)||
    !(s.loan===null||(s.loan&&integer(s.loan.remaining,1,10))))return false;
  if(!integer(s.branches,1,2)||(s.branches===1?s.district!==null:!Object.hasOwn(districts,s.district))||
    !integer(s.stock,0)||!Array.isArray(s.lots)||s.lots.length>1000||
    !s.lots.every(l=>l&&integer(l.quantity,1)&&[6,8].includes(l.cost))||
    s.lots.reduce((n,l)=>n+l.quantity,0)!==s.stock||!integer(s.price,10,35)||
    ![0,40,100].includes(s.marketing)||typeof s.staff!=='boolean'||!integer(s.reputation,0,100))return false;
  if(!Array.isArray(s.ventures)||s.ventures.length>2||new Set(s.ventures.map(v=>v?.id)).size!==s.ventures.length||
    !s.ventures.every(v=>v&&Object.hasOwn(businessTypes,v.id)&&s.day>=businessTypes[v.id].unlockDay&&
      integer(v.stock,0)&&integer(v.price,businessTypes[v.id].minPrice,businessTypes[v.id].maxPrice)&&
      typeof v.staff==='boolean'&&integer(v.reputation,0,100)))return false;
  if(!integer(s.promotionUntil,0,25)||!Array.isArray(s.decisions)||s.decisions.length>3||
    new Set(s.decisions.map(d=>d?.day)).size!==s.decisions.length||
    !s.decisions.every(d=>d&&d.day<=s.day&&Object.hasOwn(dilemmas,d.day)&&dilemmas[d.day].choices.some(c=>c.id===d.choice)))return false;
  return Array.isArray(s.history)&&s.history.length===s.day-1&&s.history.every(report);
}
export function decodeGame(raw){
  if(typeof raw!=='string'||raw.length>MAX_BACKUP_BYTES)throw new Error('O backup excede o tamanho permitido.');
  const data=JSON.parse(raw),s=data?.state,v=data?.version;
  if(!integer(v,1,9)||!s||typeof s!=='object'||Array.isArray(s))throw new Error('Backup inválido ou versão incompatível.');
  if(v<=1&&s.branches===undefined)s.branches=1;
  if(v<=2&&s.district===undefined)s.district=s.branches===2?'center':null;
  if(v<=3){
    if(s.loan===undefined)s.loan=null;
    if(Array.isArray(s.history))for(const r of s.history)if(r&&r.payment===undefined)r.payment=0;
  }
  if(v<=4&&s.equipment===undefined)s.equipment=false;
  if(v<=5&&s.scenario===undefined)s.scenario='standard';
  if(v<=6){
    if(s.lots===undefined)s.lots=s.stock>0?[{quantity:s.stock,cost:8}]:[];
    if(Array.isArray(s.history))for(const r of s.history)if(r&&r.goodsCost===undefined)r.goodsCost=r.sold*8;
  }
  if(v<=7){
    if(s.contract===undefined)s.contract=null;
    if(Array.isArray(s.history))for(const r of s.history)if(r){
      if(r.contractSold===undefined)r.contractSold=0;if(r.contractFailed===undefined)r.contractFailed=false;
    }
  }
  if(v<=8){
    if(s.training===undefined)s.training=0;
    if(s.ventures===undefined)s.ventures=[];
    if(s.decisions===undefined)s.decisions=[];
    if(s.promotionUntil===undefined)s.promotionUntil=0;
    if(Array.isArray(s.history))for(const r of s.history)if(r){
      if(r.cafe===undefined)r.cafe=Object.fromEntries([...totals,'day','event','payment','contractSold','contractFailed'].map(k=>[k,r[k]]));
      if(r.ventures===undefined)r.ventures=[];
    }
  }
  if(!valid(s))throw new Error('Backup inválido ou versão incompatível.');
  return s;
}
export function encodeGame(state){
  if(!valid(state))throw new Error('Não foi possível gerar o backup desta partida.');
  return JSON.stringify({version:9,state},null,2);
}
export function loadGame(storage){
  try{
    if(!storage)return {state:initial(),status:'unavailable'};
    const raw=storage.getItem(SAVE_KEY);
    if(raw===null)return {state:initial(),status:'new'};
    return {state:decodeGame(raw),status:'loaded'};
  }catch{return {state:initial(),status:storage?'invalid':'unavailable'}}
}
export function saveGame(storage,state){
  try{if(!storage)return false;storage.setItem(SAVE_KEY,encodeGame(state));return true;}
  catch{return false;}
}
