import { requiresManagerApproval } from './approval.mjs';

const cents = value => Math.round(value * 100) / 100;

// Approval reads the order total directly.
export function priceOrder(lines) {
  const itemCount = lines.reduce((count, line) => count + line.quantity, 0);
  const total = cents(lines.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0));
  return { itemCount, subtotal: total, discount: 0, total, managerApproval: requiresManagerApproval(total) };
}
