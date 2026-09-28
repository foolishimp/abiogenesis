/** Pure declaration coordinates; usable by GTL without loading worksite owners. */
export const governanceRef = (kind: string, name: string) => `${kind}://abiogenesis/default-library/${name}@5`;
export const governanceContract = (name: string) => governanceRef("contract", name);
