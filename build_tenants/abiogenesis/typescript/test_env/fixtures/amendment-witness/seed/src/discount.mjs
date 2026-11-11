// REQ-ORDER-DISCOUNT: an order of ten or more items receives a 5% discount.
export const BULK_ITEM_COUNT = 10;
export const BULK_DISCOUNT_RATE = 0.05;

export function discountFor(itemCount, subtotal) {
  if (itemCount < BULK_ITEM_COUNT) return 0;
  return Math.round(subtotal * BULK_DISCOUNT_RATE * 100) / 100;
}
