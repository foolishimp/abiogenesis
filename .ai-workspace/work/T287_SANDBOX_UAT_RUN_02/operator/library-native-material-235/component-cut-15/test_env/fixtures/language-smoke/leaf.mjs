import { createHash } from "node:crypto";
import { LANGUAGE_TEST_IDS as ids, LANGUAGE_FIXTURE_OWNER as owner, evaluateLanguageTestResult } from "./program.mjs";

function canonical(value) {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (value !== null && typeof value === "object") return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${canonical(value[key])}`).join(",")}}`;
  return JSON.stringify(value);
}
const digest = value => `sha256:${createHash("sha256").update(canonical(value)).digest("hex")}`;
const descriptor = { implementationRef: ids.implementationRef, packageName: owner.packageName,
  packageVersion: owner.packageVersion, modulePath: "build/leaf.mjs", namedSymbol: "render", computeRegime: "F_D",
  inputContractRef: ids.inputContractRef, outputContractRef: ids.outputContractRef,
  failureContractRef: ids.failureContractRef, refusalContractRef: ids.refusalContractRef };
export const RENDER_DESCRIPTOR = Object.freeze({ kind: "packaged_leaf_implementation_descriptor",
  schemaVersion: "5.0.0", descriptorDigest: digest(descriptor), ...descriptor });
export function render(input) {
  const resultCandidate = Object.freeze({ kind: "hello_world_output", schemaVersion: "5.0.0", message: `Hello ${input.subject}` });
  return Object.freeze({ kind: "leaf_realization_candidate", schemaVersion: "5.0.0", disposition: "success",
    evidenceCandidates: [Object.freeze({ kind: "deterministic_evidence_candidate", schemaVersion: "5.0.0",
      implementationRef: ids.implementationRef, inputDigest: digest(input), outputDigest: digest(resultCandidate) })], resultCandidate });
}
function valid(valueKind, value) {
  if (value === null || typeof value !== "object" || Array.isArray(value) || value.kind !== valueKind || value.schemaVersion !== "5.0.0") return false;
  if (valueKind === "hello_world_input") return typeof value.subject === "string" && value.subject.length > 0;
  if (valueKind === "hello_world_output") return typeof value.message === "string";
  if (valueKind === "deterministic_evidence_candidate") return value.implementationRef === ids.implementationRef &&
    /^sha256:[0-9a-f]{64}$/u.test(value.inputDigest) && /^sha256:[0-9a-f]{64}$/u.test(value.outputDigest);
  return false;
}
export const semantics = Object.freeze({ kind: "product_semantics_provider", schemaVersion: "5.0.0",
  bindingRef: "product-semantics://abi5-tests/language-fixtures@5", packageName: owner.packageName, packageVersion: owner.packageVersion,
  admitInput(contractRef, value) { return contractRef === ids.inputContractRef && valid("hello_world_input", value) ? Object.freeze({ ...value }) : null; },
  evaluateInteractionResponse() { return null; }, validateContractValue: valid,
  resolveJudgmentRelation(predicateRef) { return predicateRef === ids.judgmentPredicateRef ? Object.freeze({ predicateRef,
    advanceReasonRef: "reason://abi5-tests/language-smoke/valid", rejectionReasonRef: "reason://abi5-tests/language-smoke/invalid",
    evaluate: evaluateLanguageTestResult }) : null; },
});
