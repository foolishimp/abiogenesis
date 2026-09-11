import { resolveSelfConformanceOwner, type QualificationOwnerBasis } from "./self_conformance_basis.js";
import { SELF_CONFORMANCE_IDS as ids } from "../gtl/self_conformance.js";
import { ABI5_PACKAGE_NAME, ABI5_PACKAGE_VERSION } from "../product/contracts.js";
import { type ProductSemanticsProvider } from "../product/semantics.js";
import { sha256Canonical, sha256Bytes } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import type { JsonValue } from "../shared/canonical_json.js";
import { isSelfConformanceInput, isSelfConformanceResult, type SelfConformanceOwner } from "./self_conformance_contracts.js";
import { evaluateSelfConformance, readSelfConformanceCatalog, SELF_CONFORMANCE_CATALOG_ASSET_PATH } from "./self_conformance.js";

export const ABI5_SELF_CONFORMANCE_PRODUCT_SEMANTICS: ProductSemanticsProvider = Object.freeze({
  kind: "product_semantics_provider", schemaVersion: "5.0.0", bindingRef: "product-semantics://abiogenesis/qualification/self-conformance@5",
  packageName: ABI5_PACKAGE_NAME, packageVersion: ABI5_PACKAGE_VERSION,
  admitInput(contractRef: string, value: unknown) {
    return contractRef === ids.inputContractRef && isSelfConformanceInput(value) ? deepFreeze(value) as unknown as Readonly<Record<string, JsonValue>> : null;
  },
  evaluateInteractionResponse() { return null; },
  validateContractValue(valueKind: string, value: unknown): value is Readonly<Record<string, JsonValue>> {
    return valueKind === "self_conformance_input" ? isSelfConformanceInput(value)
      : valueKind === "self_conformance_result" && isSelfConformanceResult(value);
  },
  validateInvocationBasis(basis: Parameters<NonNullable<ProductSemanticsProvider["validateInvocationBasis"]>>[0]) {
    if (!isSelfConformanceInput(basis.input)) return false;
    const selected = basis.input.basis.workspaceBinding;
    return selected !== null && selected.ref === basis.workspaceBindingId && selected.digest === basis.workspaceBindingDigest;
  },
  resolveJudgmentRelation(predicateRef: string) {
    return predicateRef === ids.judgmentPredicateRef ? { predicateRef,
      advanceReasonRef: "reason://abiogenesis/qualification/self-conformance/evaluated@5",
      rejectionReasonRef: "reason://abiogenesis/qualification/self-conformance/result-mismatch@5",
      evaluate(input: unknown, output: unknown) {
        return isSelfConformanceInput(input) && isSelfConformanceResult(output) &&
          (() => { const owner = resolveSelfConformanceOwner(output.owner.nativeBasis as QualificationOwnerBasis, input);
            return owner !== null && sha256Canonical(owner as unknown as JsonValue) === sha256Canonical(output.owner as unknown as JsonValue) &&
              sha256Canonical(evaluateSelfConformance(input, owner) as unknown as JsonValue) === sha256Canonical(output as unknown as JsonValue); })();
      } } : null;
  },
});
