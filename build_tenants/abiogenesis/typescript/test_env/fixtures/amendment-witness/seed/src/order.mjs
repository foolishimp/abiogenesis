import { discountFor } from './discount.mjs';
import { requiresManagerApproval } from './approval.mjs';

const cents = value => Math.round(value * 100) / 100;

export function priceOrder(lines) {
  const itemCount = lines.reduce((count, line) => count + line.quantity, 0);
  const subtotal = cents(lines.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0));
  const discount = discountFor(itemCount, subtotal);
  const total = cents(subtotal - discount);
  return { itemCount, subtotal, discount, total, managerApproval: requiresManagerApproval(total) };
}
