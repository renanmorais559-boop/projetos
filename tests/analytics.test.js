import {test} from 'node:test';
import assert from 'node:assert/strict';
import {profitChart} from '../analytics.js';
test('gráfico vazio convida a jogar sem inventar dados',()=>assert.match(profitChart([]),/primeiro dia/));
test('gráfico suporta lucro, prejuízo e zeros sem coordenadas inválidas',()=>{for(const values of [[0,0],[-100,-20],[200,50],[-100,0,200]]){const chart=profitChart(values.map((profit,i)=>({day:i+1,profit})));assert.doesNotMatch(chart,/NaN|Infinity/);assert.equal((chart.match(/<rect /g)||[]).length,values.length);assert.match(chart,/role="img"/);if(values.some(v=>v<0))assert.match(chart,/#f0a59a/)}});
