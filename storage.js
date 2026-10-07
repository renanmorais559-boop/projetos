import {initial,districts,scenarios,orders} from './engine.js';
export const SAVE_KEY='primeiro-imperio.save.v1';
const integer=(n,min,max=Number.MAX_SAFE_INTEGER)=>Number.isSafeInteger(n)&&n>=min&&n<=max;
const finite=n=>typeof n==='number'&&Number.isFinite(n);
function valid(s){
  return s&&Object.hasOwn(scenarios,s.scenario)&&(s.contract===null||(!s.over&&s.contract===s.day&&Object.hasOwn(orders,s.contract)))&&typeof s.equipment==='boolean'&&(s.loan===null||(s.loan&&integer(s.loan.remaining,1,10)))&&integer(s.branches,1,2)&&(s.branches===1?s.district===null:Object.hasOwn(districts,s.district))&&integer(s.day,1,31)&&finite(s.cash)&&integer(s.stock,0)&&Array.isArray(s.lots)&&s.lots.length<=1000&&s.lots.every(l=>l&&integer(l.quantity,1)&&[6,8].includes(l.cost))&&s.lots.reduce((n,l)=>n+l.quantity,0)===s.stock&&integer(s.price,10,35)&&[0,40,100].includes(s.marketing)&&typeof s.staff==='boolean'&&integer(s.reputation,0,100)&&typeof s.over==='boolean'&&s.over===(s.cash<0||s.day>30)&&Array.isArray(s.history)&&s.history.length===s.day-1&&s.history.every((r,i)=>r&&r.day===i+1&&typeof r.event==='string'&&r.event.length<=200&&integer(r.demand,0)&&integer(r.sold,0,85)&&r.sold<=r.demand&&finite(r.revenue)&&finite(r.expenses)&&finite(r.profit)&&integer(r.contractSold,0,40)&&r.contractSold<=r.sold&&typeof r.contractFailed==='boolean'&&(!r.contractFailed||r.contractSold===0)&&[0,220].includes(r.payment)&&r.revenue>=0&&r.expenses>=70&&integer(r.goodsCost,r.sold*6,r.sold*8)&&r.profit===r.revenue-r.goodsCost-r.expenses&&r.lost===r.demand-r.sold);
}
export const MAX_BACKUP_BYTES=100000;
export function decodeGame(raw){
  if(typeof raw!=='string'||raw.length>MAX_BACKUP_BYTES)throw new Error('O backup excede o tamanho permitido.');
    const data=JSON.parse(raw);
    if(data?.version===1&&data.state&&data.state.branches===undefined)data.state.branches=1;
    if([1,2].includes(data?.version)&&data.state&&data.state.district===undefined)data.state.district=data.state.branches===2?'center':null;
    if([1,2,3].includes(data?.version)&&data.state){
      if(data.state.loan===undefined)data.state.loan=null;
      if(Array.isArray(data.state.history))for(const r of data.state.history)if(r&&r.payment===undefined)r.payment=0;
    }
    if([1,2,3,4].includes(data?.version)&&data.state&&data.state.equipment===undefined)data.state.equipment=false;
    if([1,2,3,4,5].includes(data?.version)&&data.state&&data.state.scenario===undefined)data.state.scenario='standard';
    if([1,2,3,4,5,6].includes(data?.version)&&data.state){
      if(data.state.lots===undefined)data.state.lots=data.state.stock>0?[{quantity:data.state.stock,cost:8}]:[];
      if(Array.isArray(data.state.history))for(const r of data.state.history)if(r&&r.goodsCost===undefined)r.goodsCost=r.sold*8;
    }
    if([1,2,3,4,5,6,7].includes(data?.version)&&data.state){
      if(data.state.contract===undefined)data.state.contract=null;
      if(Array.isArray(data.state.history))for(const r of data.state.history)if(r){if(r.contractSold===undefined)r.contractSold=0;if(r.contractFailed===undefined)r.contractFailed=false;}
    }
    if(![1,2,3,4,5,6,7,8].includes(data?.version)||!valid(data.state))throw new Error('Backup inválido ou versão incompatível.');
    return data.state;
}
export function encodeGame(state){
  if(!valid(state))throw new Error('Não foi possível gerar o backup desta partida.');
  return JSON.stringify({version:8,state},null,2);
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
  try{
    if(!storage||!valid(state))return false;
    storage.setItem(SAVE_KEY,encodeGame(state));
    return true;
  }catch{return false}
}
