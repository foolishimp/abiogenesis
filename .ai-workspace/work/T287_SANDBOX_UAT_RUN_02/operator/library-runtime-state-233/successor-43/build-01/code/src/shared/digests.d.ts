import { type JsonValue } from "./canonical_json.js";
export type Sha256Digest = `sha256:${string}`;
export interface PayloadInventoryRow {
    readonly path: string;
    readonly sha256: Sha256Digest;
}
export declare function sha256Bytes(value: Uint8Array | string): Sha256Digest;
export declare function sha256File(path: string): Promise<Sha256Digest>;
export declare function sha256Canonical(value: JsonValue): Sha256Digest;
export declare function payloadInventoryDigest(rows: readonly PayloadInventoryRow[]): Sha256Digest;
export declare function isSha256Digest(value: unknown): value is Sha256Digest;
