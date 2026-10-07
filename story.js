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
export const availableDilemma = s => !s.over && Object.hasOwn(dilemmas, s.day) &&
  !s.decisions.some(d => d.day === s.day) ? dilemmas[s.day] : null;
export function resolveDilemma(s, choiceId) {
  const story = availableDilemma(s), choice = story?.choices.find(c => c.id === choiceId);
  if (!choice || s.cash < choice.cost) return false;
  s.cash -= choice.cost;
  s.reputation = Math.max(0, Math.min(100, s.reputation + choice.reputation));
  if (choice.id === 'promotion') s.promotionUntil = s.day + 2;
  s.decisions.push({day: s.day, choice: choice.id});
  return true;
}
