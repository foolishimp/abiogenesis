import type { ResultEvidenceLineage } from "/Users/jim/src/apps/abiogenesis/.ai-workspace/comments/codex/20260928_FRAMED_GOVERNANCE/result-lineage-typed-contract-realization-01/readiness-stage/build_tenants/abiogenesis/typescript/code/src/abg/result_evidence_lineage_contracts.js";
import type { AdmittedCCallEvidence } from "/Users/jim/src/apps/abiogenesis/.ai-workspace/comments/codex/20260928_FRAMED_GOVERNANCE/result-lineage-typed-contract-realization-01/readiness-stage/build_tenants/abiogenesis/typescript/code/src/abg/c_call.js";
import type { LeafInvocationPort } from "/Users/jim/src/apps/abiogenesis/.ai-workspace/comments/codex/20260928_FRAMED_GOVERNANCE/result-lineage-typed-contract-realization-01/readiness-stage/build_tenants/abiogenesis/typescript/code/src/implementation/contracts.js";
import type { ProductSemanticsProvider, InstalledLeafSemanticsProjection } from "/Users/jim/src/apps/abiogenesis/.ai-workspace/comments/codex/20260928_FRAMED_GOVERNANCE/result-lineage-typed-contract-realization-01/readiness-stage/build_tenants/abiogenesis/typescript/code/src/product/semantics.js";
type Probabilistic = Extract<ResultEvidenceLineage, {evidenceClass: 'probabilistic_transport'}>;
type AdmittedProbabilistic = Extract<AdmittedCCallEvidence, {evidenceClass: 'probabilistic_transport'}>;
const valid: Probabilistic = {
  cCallRef: 'c-call://component/probabilistic', cCallAttempt: 0,
  evidenceRef: 'evidence://component/probabilistic', evidenceDigest: 'sha256:evidence',
  evidenceClass: 'probabilistic_transport', inputDigest: 'sha256:input',
  outputDigest: 'sha256:output', transportDigest: 'sha256:transport',
  actorInvocationRef: 'actor-invocation://component', actorRef: 'actor://component',
  workerBindingRef: 'worker://component', transportBindingRef: 'transport://component',
  transportBindingDigest: 'sha256:binding', requestDigest: 'sha256:request',
  promptDigest: 'sha256:prompt', transportDisposition: 'success', transportFailureClass: null,
};
const admitted: AdmittedProbabilistic = {...valid, transportDigest: 'sha256:transport',
  kind: 'admitted_c_call_evidence', schemaVersion: '5.0.0', disposition: 'admitted',
  contractRef: 'contract://component', implementationRef: 'implementation://component',
  admissionEventRef: 'event://component'};
type LeafRows = Parameters<LeafInvocationPort['validateResultEvidenceLineage']>[2];
type ProductRows = Parameters<NonNullable<ProductSemanticsProvider['validateResultEvidenceLineage']>>[0]['admittedEvidence'];
type InstalledRows = Parameters<InstalledLeafSemanticsProjection['validateResultEvidenceLineage']>[0]['admittedEvidence'];

const shared: ResultEvidenceLineage = valid;
const source: AdmittedCCallEvidence = admitted;
const leaf: LeafRows = [valid];
const product: ProductRows = [valid];
const installed: InstalledRows = [valid];
const nonprobabilistic: ResultEvidenceLineage = {
  cCallRef: 'c-call://component/ordinary', cCallAttempt: 0,
  evidenceRef: 'evidence://component/ordinary', evidenceDigest: 'sha256:ordinary',
  evidenceClass: 'deterministic', inputDigest: 'sha256:input',
  outputDigest: 'sha256:output', transportDigest: null,
};
const failed: ResultEvidenceLineage = {...valid,
  transportDisposition: 'failure', transportFailureClass: 'component_failure'};
const {transportDigest: omittedTransportDigest, ...ordinary} = nonprobabilistic;
const ordinarySource: AdmittedCCallEvidence = {...ordinary,
  kind: 'admitted_c_call_evidence', schemaVersion: '5.0.0', disposition: 'admitted',
  contractRef: 'contract://component', implementationRef: null, admissionEventRef: 'event://component'};

