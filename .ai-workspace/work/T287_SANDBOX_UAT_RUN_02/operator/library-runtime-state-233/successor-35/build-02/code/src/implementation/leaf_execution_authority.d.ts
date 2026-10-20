import type { LeafExecutionAuthority } from "./contracts.js";
type LeafExecutionAuthorityBody = Omit<LeafExecutionAuthority, "kind" | "schemaVersion" | "authorityRef" | "authorityDigest">;
export declare function constructLeafExecutionAuthority(body: Readonly<LeafExecutionAuthorityBody>): Readonly<LeafExecutionAuthority>;
export declare function isLeafExecutionAuthority(value: unknown): value is Readonly<LeafExecutionAuthority>;
export {};
