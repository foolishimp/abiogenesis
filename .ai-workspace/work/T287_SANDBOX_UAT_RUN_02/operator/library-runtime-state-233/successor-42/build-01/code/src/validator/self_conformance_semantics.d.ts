import type { NativeJudgmentProofOperations } from "../implementation/contracts.js";
import { type ProductSemanticsProvider } from "../product/semantics.js";
import type { JsonValue } from "../shared/canonical_json.js";
import { type DurablePrefixCoordinate } from "../abg/event_store.js";
export declare function isQualificationContractValue(valueKind: string, value: unknown): value is Readonly<Record<string, JsonValue>>;
export declare function qualificationResultRelation(predicateRef: string, input: unknown, output: unknown, currentOwnerPrefix?: DurablePrefixCoordinate, nativeProof?: NativeJudgmentProofOperations): boolean;
export declare const ABI5_SELF_CONFORMANCE_PRODUCT_SEMANTICS: ProductSemanticsProvider;
