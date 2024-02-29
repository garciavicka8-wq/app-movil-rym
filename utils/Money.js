import currency from 'currency.js';

export default function money(value, withSimbol = true, number = false) {
  const formattedAmount = currency(value, {precision: 2}).format();
  // RETURN NUMBER
  if (number) return currency(value, {precision: 2});
  // CON SIMBOLO $ ej: $1,500.00
  if (withSimbol) return formattedAmount;
  // SIN SIMBOLO $ ej: 1,500.00
  const amount = formattedAmount.replace(/[$]/g, '');
  return amount;
}
