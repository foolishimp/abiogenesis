/** Pure declaration coordinates; usable by GTL without loading worksite owners. */
export const governanceRef = (kind, name) => `${kind}://abiogenesis/default-library/${name}@5`;
export const governanceContract = (name) => governanceRef("contract", name);
