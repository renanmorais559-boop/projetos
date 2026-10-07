import {test} from 'node:test';
import assert from 'node:assert/strict';
import {initial,buy,runDay} from '../engine.js';
import {SAVE_KEY,loadGame,saveGame} from '../storage.js';
function memory(){const data=new Map();return {getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v)}}
test('retoma decisões, estoque e histórico e permite continuar',()=>{const store=memory(),s=initial();buy(s,20);s.price=23;s.marketing=40;s.staff=true;runDay(s,()=>0);assert.equal(saveGame(store,s),true);const loaded=loadGame(store);assert.equal(loaded.status,'loaded');assert.deepEqual(loaded.state,s);runDay(loaded.state,()=>0);assert.equal(loaded.state.day,3)});
test('restaura partida encerrada e recomeço substitui o save',()=>{const store=memory(),s=initial();s.cash=100000;s.stock=10000;s.lots=[{quantity:10000,cost:8}];for(let i=0;i<30;i++)runDay(s,()=>0);assert.equal(saveGame(store,s),true);assert.equal(loadGame(store).state.over,true);saveGame(store,initial());assert.deepEqual(loadGame(store).state,initial())});
test('dados corrompidos, versões incompatíveis e estado inválido não quebram jogo',()=>{const store=memory();for(const raw of ['{','null',JSON.stringify({version:99,state:initial()}),JSON.stringify({version:1,state:{...initial(),stock:-1}})]){store.setItem(SAVE_KEY,raw);assert.equal(loadGame(store).status,'invalid');assert.deepEqual(loadGame(store).state,initial())}});
test('armazenamento ausente ou bloqueado não lança erro',()=>{assert.equal(saveGame(undefined,initial()),false);assert.equal(loadGame(undefined).status,'unavailable');const blocked={getItem(){throw Error('blocked')},setItem(){throw Error('quota')}};assert.deepEqual(loadGame(blocked).state,initial());assert.equal(saveGame(blocked,initial()),false)});
