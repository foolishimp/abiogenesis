// REQ-ORDER-APPROVAL: an order whose total is above the threshold needs manager approval.
export const APPROVAL_THRESHOLD = 5000;

export function requiresManagerApproval(total) {
  return total > APPROVAL_THRESHOLD;
}
