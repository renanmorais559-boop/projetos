import {test} from 'node:test';
import assert from 'node:assert/strict';
import {movePlayer,nearbySite,sites} from '../town-world.js';
test('andar respeita bordas e fachadas',()=>{assert.equal(movePlayer({x:12,y:12},-1,0,.05).x,12);assert.equal(movePlayer({x:140,y:230},0,-1,.05).y,230)});
test('diagonal não acelera e quadro lento não teleporta',()=>{const p={x:300,y:400};assert.ok(Math.abs(Math.hypot(...Object.values(movePlayer(p,1,1,.05)).map((n,i)=>n-Object.values(p)[i]))-8)<.001);assert.deepEqual(movePlayer(p,1,0,10),{x:308,y:400})});
test('inspeção só identifica pontos próximos',()=>{assert.equal(nearbySite({x:420,y:400}),null);for(const s of sites)assert.equal(nearbySite({x:s.x,y:245}).id,s.id)});
