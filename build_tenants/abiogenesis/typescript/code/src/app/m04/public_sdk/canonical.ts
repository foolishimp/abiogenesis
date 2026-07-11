// Implements: REQ-P-PUBLIC-CONTRACTS

export {
  admitIJsonText,
  admitIJsonValue,
  stableJson as canonicalizeIJson,
  stableSha256Digest as digestCanonicalIJson
} from "../../../shared/runtime_identity.js";
export type {
  IJsonArray,
  IJsonObject,
  IJsonValue
} from "../../../shared/runtime_identity.js";
