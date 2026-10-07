export const dilemmas = {
  7: {title: 'Uma oportunidade na vizinhança', text: 'A associação do bairro quer divulgar negócios locais. Qual será sua prioridade?',
    choices: [
      {id: 'quality', title: 'Melhorar o atendimento', cost: 180, reputation: 8, description: 'R$ 180 · +8 de reputação da cafeteria.'},
      {id: 'promotion', title: 'Participar da divulgação', cost: 120, reputation: 0, description: 'R$ 120 · +8 de demanda base da cafeteria por 3 dias.'}
    ]},
  14: {title: 'Um cliente publicou uma reclamação', text: 'Ele diz que esperou demais pelo atendimento. Como você responde?',
    choices: [
      {id: 'resolve', title: 'Conversar e compensar o cliente', cost: 100, reputation: 6, description: 'R$ 100 · +6 de reputação.'},
      {id: 'ignore', title: 'Não responder', cost: 0, reputation: -6, description: 'Sem gasto · −6 de reputação.'}
    ]},
  23: {title: 'Um convite para apoiar a comunidade', text: 'A escola local procura uma empresa parceira para um encontro de orientação profissional.',
    choices: [
      {id: 'support', title: 'Patrocinar o encontro', cost: 200, reputation: 10, description: 'R$ 200 · +10 de reputação.'},
      {id: 'decline', title: 'Priorizar a reserva de caixa', cost: 0, reputation: 0, description: 'Sem gasto ou penalidade.'}
    ]}
};
export const availableDilemma = s => !s.over && !s.decisions.some(d => d.day === s.day) ? storyForDay(s.day,s.sandbox) : null;
export function resolveDilemma(s, choiceId) {
  const story = availableDilemma(s), choice = story?.choices.find(c => c.id === choiceId);
  if (!choice || s.cash < choice.cost) return false;
  s.cash -= choice.cost;
  s.reputation = Math.max(0, Math.min(100, s.reputation + choice.reputation));
  if(choice.scope==='active')for(const v of s.ventures)if(!v.paused)v.reputation=Math.max(0,Math.min(100,v.reputation+choice.reputation));
  if (choice.id === 'promotion'||choice.promotion) s.promotionUntil = s.day + 2;
  s.decisions.push({day: s.day, choice: choice.id});
  if(s.decisions.length>120)s.decisions.shift();
  return true;
}
export const recurringDilemmas=[
  {title:'Parceria com os comerciantes',text:'Outros empresários convidam seu grupo para uma ação conjunta no bairro.',choices:[
    {id:'network',title:'Investir na parceria',cost:350,reputation:5,scope:'active',description:'R$ 350 · +5 de reputação na cafeteria e nos negócios ativos.'},
    {id:'reserve',title:'Preservar o capital de giro',cost:0,reputation:0,description:'Sem gasto ou penalidade. Mantenha a reserva.'}
  ]},
  {title:'Divulgação para um novo público',text:'Uma campanha de três dias pode trazer mais movimento à cafeteria. Sua equipe está preparada?',choices:[
    {id:'outreach',title:'Divulgar a cafeteria',cost:220,reputation:0,promotion:true,description:'R$ 220 · +8 de demanda base da cafeteria por 3 dias.'},
    {id:'focus',title:'Consolidar a operação atual',cost:0,reputation:0,description:'Sem gasto. Priorize margem e atendimento com a demanda atual.'}
  ]},
  {title:'Uma rodada de atendimento',text:'A equipe propõe reservar tempo para melhorar a experiência dos clientes em todas as lojas ativas.',choices:[
    {id:'care',title:'Organizar a ação',cost:250,reputation:4,scope:'active',description:'R$ 250 · +4 de reputação na cafeteria e nos negócios ativos.'},
    {id:'postpone',title:'Adiar esta rodada',cost:0,reputation:0,description:'Sem gasto ou penalidade.'}
  ]}
];
export function storyForDay(day,sandbox=false){
  if(Object.hasOwn(dilemmas,day))return dilemmas[day];
  if(!sandbox||day<33||(day-33)%7!==0)return null;
  return recurringDilemmas[Math.floor((day-33)/7)%recurringDilemmas.length];
}
