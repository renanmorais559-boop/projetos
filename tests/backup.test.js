import {test} from 'node:test';
import assert from 'node:assert/strict';
import {initial,borrow,expand,upgrade,runDay} from '../engine.js';
import {encodeGame,decodeGame,MAX_BACKUP_BYTES} from '../storage.js';
test('backup transporta rede, equipamento, dívida e histórico sem compartilhar referências',()=>{const s=initial();borrow(s);expand(s);upgrade(s);s.stock=100;s.lots=[{quantity:100,cost:8}];runDay(s,()=>0);const restored=decodeGame(encodeGame(s));assert.deepEqual(restored,s);restored.cash=0;assert.notEqual(restored.cash,s.cash)});
test('backup antigo é migrado',()=>{const s=initial();delete s.loan;delete s.equipment;delete s.branches;delete s.district;const restored=decodeGame(JSON.stringify({version:1,state:s}));assert.deepEqual(restored,initial())});
test('backups inválidos e grandes são rejeitados sem mudar partida original',()=>{const s=initial(),before=structuredClone(s);for(const raw of ['{','null','x'.repeat(MAX_BACKUP_BYTES+1),JSON.stringify({version:99,state:s}),JSON.stringify({version:5,state:{...s,day:0}})])assert.throws(()=>decodeGame(raw));assert.deepEqual(s,before)});
test('backup de partida encerrada mantém encerramento',()=>{const s=initial();s.cash=100000;s.stock=10000;s.lots=[{quantity:10000,cost:8}];for(let i=0;i<30;i++)runDay(s,()=>0);const restored=decodeGame(encodeGame(s));assert.equal(restored.over,true);assert.equal(restored.history.length,30);assert.equal(runDay(restored),null)});
