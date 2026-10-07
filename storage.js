import {totalsFor,HISTORY_LIMIT} from './lifetime.js';
import {initial,districts,scenarios,orderForDay,targetFor} from './engine.js';
import {businessTypes,businessOperation} from './ventures.js';
import {challengeTypes} from './challenges.js';
import {storyForDay} from './story.js';
export const SAVE_KEY='primeiro-imperio.save.v1';
export const MAX_BACKUP_BYTES=1000000;
const integer=(n,min,max=Number.MAX_SAFE_INTEGER)=>Number.isSafeInteger(n)&&n>=min&&n<=max;
const finite=n=>typeof n==='number'&&Number.isFinite(n);
const totals=['demand','sold','revenue','expenses','goodsCost','profit','lost'];
function accounting(r,limit=260,minCost=5,maxCost=40){
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
  return accounting(r)&&r.day===index&&typeof r.event==='string'&&r.event.length<=200&&
    [0,220].includes(r.payment)&&cafeReport(r.cafe)&&r.cafe.day===r.day&&
    r.contractSold===r.cafe.contractSold&&r.contractFailed===r.cafe.contractFailed&&
    Array.isArray(r.ventures)&&r.ventures.length<=Object.keys(businessTypes).length&&new Set(r.ventures.map(v=>v?.id)).size===r.ventures.length&&
    r.ventures.every(v=>v&&Object.hasOwn(businessTypes,v.id)&&accounting(v,55,businessTypes[v.id].cost,businessTypes[v.id].cost)&&(v.paused===undefined||typeof v.paused==='boolean')&&integer(v.level,0,2)&&v.expenses>=businessOperation(v)/(v.paused?2:1)&&(!v.paused||(v.demand===0&&v.sold===0&&v.revenue===0&&v.expenses===businessOperation(v)/2)))&&
    totals.every(key=>r[key]===r.cafe[key]+r.ventures.reduce((n,v)=>n+v[key],0));
}
function validChallenges(s){
  if(!Array.isArray(s.badges)||s.badges.length>3||new Set(s.badges).size!==s.badges.length||!s.badges.every(id=>Object.hasOwn(challengeTypes,id)))return false;
  const c=s.challenge;
  if(c!==null){
    if(!s.sandbox||s.over||!c||!Object.hasOwn(challengeTypes,c.id)||!integer(c.startDay,31,s.day)||s.day-c.startDay>=7)return false;
    const b=c.baseline;
    if(!b||b.days!==c.startDay-1||!integer(b.sold,0,s.totals.sold)||!integer(b.demand,b.sold,s.totals.demand)||!finite(b.profit)||!integer(b.profitable,0,Math.min(b.days,s.totals.profitable))||!integer(b.perfect,0,Math.min(b.days,s.totals.perfect)))return false;
    if(s.totals.profitable-b.profitable>s.day-c.startDay)return false;
  }
  const last=s.lastChallenge;
  if(last!==null){
    if(!s.sandbox||!last||!Object.hasOwn(challengeTypes,last.id)||!integer(last.startDay,31)||!integer(last.endDay,last.startDay,last.startDay+6)||last.endDay>=s.day||typeof last.won!=='boolean')return false;
    const p=last.progress;
    if(!p||p.days!==last.endDay-last.startDay+1||!integer(p.sold,0)||!integer(p.demand,p.sold)||!finite(p.profit)||!integer(p.profitable,0,p.days)||p.remaining!==7-p.days||p.service!==(p.demand?Math.floor(p.sold/p.demand*1000)/10:null))return false;
    const met=last.id==='profit'?p.profit>=2000:last.id==='service'?p.sold>=150&&p.demand>0&&p.sold/p.demand>=.9:p.profitable===7;
    if(p.met!==met||last.won!==(p.days===7&&met)||(last.won&&!s.badges.includes(last.id)))return false;
  }
  return true;
}
function valid(s){
  if(!s||!Object.hasOwn(scenarios,s.scenario)||!integer(s.day,1)||!finite(s.cash)||
    typeof s.sandbox!=='boolean'||(s.sandbox&&s.day<31)||(!s.sandbox&&s.day>31)||typeof s.over!=='boolean'||s.over!==(s.cash<0||(!s.sandbox&&s.day>30)))return false;
  if(!(s.contract===null||(!s.over&&s.contract===s.day&&orderForDay(s.contract,s.sandbox)))||
    typeof s.equipment!=='boolean'||!integer(s.training,0,2)||
    !(s.loan===null||(s.loan&&integer(s.loan.remaining,1,10))))return false;
  if(!integer(s.branches,1,2)||(s.branches===1?s.district!==null:!Object.hasOwn(districts,s.district))||
    !integer(s.stock,0)||!Array.isArray(s.lots)||s.lots.length>1000||
    !s.lots.every(l=>l&&integer(l.quantity,1)&&[6,8].includes(l.cost))||
    s.lots.reduce((n,l)=>n+l.quantity,0)!==s.stock||!integer(s.price,10,35)||
    ![0,40,100].includes(s.marketing)||typeof s.staff!=='boolean'||!integer(s.reputation,0,100))return false;
  if(!Array.isArray(s.ventures)||s.ventures.length>Object.keys(businessTypes).length||new Set(s.ventures.map(v=>v?.id)).size!==s.ventures.length||
    !s.ventures.every(v=>v&&Object.hasOwn(businessTypes,v.id)&&s.day>=businessTypes[v.id].unlockDay&&
      integer(v.stock,0)&&integer(v.price,businessTypes[v.id].minPrice,businessTypes[v.id].maxPrice)&&
      integer(v.level,0,2)&&typeof v.paused==='boolean'&&typeof v.staff==='boolean'&&integer(v.reputation,0,100)))return false;
  if(!integer(s.promotionUntil,0,s.day+2)||!Array.isArray(s.decisions)||s.decisions.length>120||
    new Set(s.decisions.map(d=>d?.day)).size!==s.decisions.length||
    !s.decisions.every(d=>d&&d.day<=s.day&&integer(d.day,1)&&storyForDay(d.day,s.sandbox)?.choices.some(c=>c.id===d.choice)))return false;
  if(!(s.campaign===null&&s.day<=30)&&!(s.day>=31&&s.campaign&&finite(s.campaign.cash)&&finite(s.campaign.netCash)&&s.campaign.netCash<=s.campaign.cash&&typeof s.campaign.won==='boolean'&&s.campaign.won===(s.campaign.cash>=0&&s.campaign.netCash>=targetFor(s))))return false;
  if(!Array.isArray(s.history)||s.history.length!==Math.min(s.day-1,HISTORY_LIMIT)||!s.history.every((r,i)=>report(r,s.day-s.history.length+i)))return false;
  const t=s.totals,retained=totalsFor(s.history);
  if(!t||t.days!==s.day-1||!integer(t.sold,retained.sold)||!integer(t.demand,Math.max(t.sold,retained.demand))||!finite(t.profit)||!integer(t.profitable,retained.profitable,t.days)||!integer(t.perfect,retained.perfect,t.days))return false;
  if(s.day<=HISTORY_LIMIT+1&&Object.keys(retained).some(k=>t[k]!==retained[k]))return false;
  return validChallenges(s);
}
export function decodeGame(raw){
  if(typeof raw!=='string'||raw.length>MAX_BACKUP_BYTES)throw new Error('O backup excede o tamanho permitido.');
  const data=JSON.parse(raw),s=data?.state,v=data?.version;
  if(!integer(v,1,11)||!s||typeof s!=='object'||Array.isArray(s))throw new Error('Backup inválido ou versão incompatível.');
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
  if(v<=9){
    s.sandbox=false;s.campaign=s.day===31?{cash:s.cash,netCash:s.cash-(s.loan?s.loan.remaining*220:0),won:s.cash>=0&&s.cash-(s.loan?s.loan.remaining*220:0)>=targetFor(s)}:null;
    if(Array.isArray(s.history))s.totals=totalsFor(s.history);
    if(Array.isArray(s.ventures))for(const venture of s.ventures)if(venture)venture.paused=false;
  }
  if(v<=10){
    s.challenge=null;s.lastChallenge=null;s.badges=[];
    if(Array.isArray(s.ventures))for(const venture of s.ventures)if(venture)venture.level=0;
    if(Array.isArray(s.history))for(const r of s.history)if(Array.isArray(r?.ventures))for(const venture of r.ventures)if(venture)venture.level=0;
  }
  if(!valid(s))throw new Error('Backup inválido ou versão incompatível.');
  return s;
}
export function encodeGame(state){
  if(!valid(state))throw new Error('Não foi possível gerar o backup desta partida.');
  return JSON.stringify({version:11,state},null,2);
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
