export const positioningTypes={
  balanced:{name:'Equilibrado',factor:1,elasticity:1,daily:0,description:'Demanda e sensibilidade ao preço padrão, sem custo adicional.'},
  value:{name:'Preço acessível',factor:1.15,elasticity:1.15,daily:15,description:'+15% de demanda base; clientes 15% mais sensíveis ao preço. R$ 15/dia em comunicação.'},
  premium:{name:'Experiência premium',factor:.9,elasticity:.65,daily:30,description:'−10% de demanda base; clientes 35% menos sensíveis ao preço. R$ 30/dia em apresentação e serviço.'}
};
const rivals={cafe:{name:'Café da Praça',reference:20,offset:0},bakery:{name:'Padaria Trigo Bom',reference:12,offset:1},market:{name:'Mercado Esquina',reference:24,offset:2},electronics:{name:'Conecta Digital',reference:75,offset:0}};
const campaigns=[{name:'Semana de descontos',factor:.9},{name:'Preço regular',factor:1},{name:'Oferta de maior valor',factor:1.1}];
export function competitionFor(id,day,sandbox=false){
  const rival=Object.hasOwn(rivals,id)?rivals[id]:null;if(!rival)return null;
  const campaign=campaigns[(Math.floor((day-1)/7)+rival.offset)%campaigns.length];
  return {name:rival.name,price:Math.round(rival.reference*campaign.factor),reference:rival.reference,campaign:campaign.name,active:sandbox&&day>=45,nextChange:(Math.floor((day-1)/7)+1)*7+1};
}
export function marketInfluence(id,price,positioning,day,sandbox=false){
  const profile=sandbox&&Object.hasOwn(positioningTypes,positioning)?positioningTypes[positioning]:positioningTypes.balanced;
  const rival=competitionFor(id,day,sandbox);
  const effect=rival?.active?Math.max(-.12,Math.min(.12,(rival.price-price)/rival.reference*.12)):0;
  return {factor:profile.factor*(1+effect),elasticity:profile.elasticity,daily:profile.daily,rival,effect};
}
export function setPositioning(s,id,profile){
  if(s.over||!s.sandbox||!Object.hasOwn(positioningTypes,profile))return false;
  const target=id==='cafe'?s:s.ventures.find(v=>v.id===id);
  if(!target)return false;target.positioning=profile;return true;
}
