import {test} from 'node:test';
import assert from 'node:assert/strict';
import {initial,buy,runDay,projectDay} from '../engine.js';
import {availableDilemma,resolveDilemma} from '../story.js';
import {decodeGame,encodeGame} from '../storage.js';
function advance(day){const s=initial();while(s.day<day){buy(s,30);runDay(s,()=>0)}return s;}
test('escolhas cobram uma vez e respeitam disponibilidade e caixa',()=>{assert.equal(resolveDilemma(initial(),'quality'),false);const s=advance(7),before=s.cash,rep=s.reputation;assert.ok(availableDilemma(s));assert.equal(resolveDilemma(s,'quality'),true);assert.equal(s.cash,before-180);assert.equal(s.reputation,Math.min(100,rep+8));assert.equal(resolveDilemma(s,'quality'),false);assert.deepEqual(decodeGame(encodeGame(s)),s)});
test('promoção termina depois de três dias sem alterar outros custos',()=>{const s=advance(7);const base=projectDay(s).demand;resolveDilemma(s,'promotion');assert.ok(projectDay(s).demand>base);assert.equal(s.promotionUntil,9);while(s.day<10){buy(s,30);runDay(s,()=>0)}const copy=structuredClone(s);copy.promotionUntil=0;assert.deepEqual(projectDay(s),projectDay(copy))});
test('recusar apoio conserva caixa, responder reclamação exige dinheiro',()=>{const s=advance(14);s.cash=50;assert.equal(resolveDilemma(s,'resolve'),false);assert.equal(resolveDilemma(s,'ignore'),true);const later=advance(23),before=later.cash;assert.equal(resolveDilemma(later,'decline'),true);assert.equal(later.cash,before)});
