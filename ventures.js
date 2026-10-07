export const businessTypes = {
  bakery: {
    name: 'Padaria Pão da Vila', icon: '🥐', category: 'Alimentação',
    description: 'Produto acessível, movimento frequente e margem menor por venda.',
    opening: 2000, unlockDay: 8, cost: 5, rent: 110, wage: 80,
    price: 12, minPrice: 8, maxPrice: 22, demand: 30, capacity: 25, staffedCapacity: 45
  },
  market: {
    name: 'Mini Mercado Horizonte', icon: '🛒', category: 'Varejo',
    description: 'Ticket maior e mais capital parado em mercadorias. Exige cuidado com o giro.',
    opening: 2800, unlockDay: 15, cost: 12, rent: 140, wage: 90,
    price: 24, minPrice: 16, maxPrice: 38, demand: 25, capacity: 25, staffedCapacity: 42
  }
};
export function openBusiness(s, id) {
  const type = Object.hasOwn(businessTypes, id) ? businessTypes[id] : null;
  if (!type || s.over || s.day < type.unlockDay || s.ventures.some(v => v.id === id) || s.cash < type.opening) return false;
  s.cash -= type.opening;
  s.ventures.push({id, stock: 0, price: type.price, staff: false, reputation: 50});
  return true;
}
export function buyBusinessStock(s, id, quantity) {
  const v = s.ventures.find(v => v.id === id), type = businessTypes[id];
  if (!v || s.over || !Number.isSafeInteger(quantity) || quantity < 1 || quantity > 1000 ||
      !Number.isSafeInteger(v.stock + quantity) || s.cash < quantity * type.cost) return false;
  s.cash -= quantity * type.cost; v.stock += quantity; return true;
}
export function configureBusiness(s, id, field, value) {
  const v = s.ventures.find(v => v.id === id), type = businessTypes[id];
  if (!v || s.over) return false;
  if (field === 'price' && Number.isInteger(value) && value >= type.minPrice && value <= type.maxPrice) v.price = value;
  else if (field === 'staff' && typeof value === 'boolean') v.staff = value;
  else return false;
  return true;
}
export function projectBusiness(v, event) {
  const type = businessTypes[v.id];
  const demand = Math.max(0, Math.round((type.demand + (v.reputation - 50) * .2) *
    Math.max(.1, 1 + (type.price - v.price) * .055) * event.factor));
  const capacity = v.staff ? type.staffedCapacity : type.capacity;
  const sold = Math.min(v.stock, demand, capacity), revenue = sold * v.price;
  const expenses = type.rent + (v.staff ? type.wage : 0), goodsCost = sold * type.cost;
  return {id: v.id, demand, sold, revenue, expenses, goodsCost, profit: revenue - expenses - goodsCost, lost: demand - sold};
}
