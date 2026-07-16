// Implements: T-280. One total replay projection owns One Surface result
// truth; the derived fluent is only its Event Calculus index.

import type {
  CCallJudgment,
  RuntimeEvent
} from "../contracts/carriers.js";
import { buildCCallSpineClose } from "./c_call_spine.js";
import {
  constructRuntimeFluent,
  runtimeFluentKey,
  type RuntimeDerivedFluentRule,
  type RuntimeEventCalculusEffectRow,
  type RuntimeEventCalculusProjection
} from "../contracts/event_calculus.js";
import {
  deriveAdmittedOutputAuthorityProjection,
  mintTargetCarrierPayloadIdentity,
  type PayloadLedgerProjection
} from "../contracts/payload_ledger.js";
import {
  validateTargetCarrierCandidate,
  type TargetCarrierContractBinding
} from "../../../gtl/m01/contracts/index.js";
import type {
  CompiledCPlanNode,
  CompiledCStageLeaf
} from "../contracts/complete_c_program.js";
import {
  assertOneSurfaceAuthorityProgramBinding,
  assertOneSurfaceStageAuthority,
  type OneSurfaceAuthorityProgramBinding,
  type OneSurfaceStageAuthority
} from "../contracts/one_surface_program_compiler.js";
import type {
  OneSurfaceAuthorityFunctionKind,
  OneSurfaceAuthorityInputBasis
} from "../contracts/one_surface_authority.js";
import {
  assertAdmittedOneSurfaceAuthorityResult,
  constructAdmittedOneSurfaceAuthorityResult,
  type AdmittedOneSurfaceAuthorityResult
} from "../contracts/one_surface_authority.js";
import {
  stableJsonEquals,
  stableSha256Digest
} from "../../../shared/runtime_identity.js";
import {
  admitOneSurfaceResultForClose,
  assertAdmittedOneSurfaceResultValue,
  isOneSurfaceTypedRefusal,
  type AdmittedOneSurfaceResultValue
} from "../contracts/one_surface_contract_family.js";

export type OneSurfaceAuthorityResultDiagnosticId =
  | "one_surface_result_authority_mismatch"
  | "one_surface_result_not_admitted"
  | "one_surface_event_binding_semantic_not_realized";

export interface OneSurfaceAuthorityResultDiagnostic {
  readonly kind: "one_surface_authority_result_diagnostic";
  readonly diagnosticId: OneSurfaceAuthorityResultDiagnosticId;
  readonly reason: string;
  readonly evidenceRefs: readonly string[];
}

export interface OneSurfaceAuthorityReplayBinding {
  readonly kind: "one_surface_authority_replay_binding";
  readonly bindingRef: string;
  readonly bindingDigest: `sha256:${string}`;
  readonly outcome: "success" | "refusal";
  readonly functionKind: OneSurfaceAuthorityFunctionKind;
  readonly applicationRef: string;
  readonly applicationDigest: `sha256:${string}`;
  readonly stageAuthorityRef: string;
  readonly stageAuthorityDigest: `sha256:${string}`;
  readonly cCallRef: string;
  readonly basisId: string;
  readonly graphFunctionId: string;
  readonly graphCallId: string;
  readonly frameId: string;
  readonly vectorIndex: number;
  readonly edge: string;
  readonly inputRefs: readonly string[];
  readonly inputDigest: string;
  readonly payloadRef: string;
  readonly payloadDigest: string;
  readonly resultContractRef: string;
  readonly resultContractDigest: string;
  readonly authoritySnapshotRef: string;
  readonly artifactResultPairRef: string;
  readonly artifactResultPairDigest: `sha256:${string}`;
  readonly resultAdmissionRef: string;
  readonly resultValueDigest: `sha256:${string}`;
  readonly evidenceRefs: readonly string[];
  readonly judgment: Exclude<CCallJudgment, "no_declared_check">;
  readonly reasonRef: string | null;
}

export interface OneSurfaceAuthorityReplayProjection {
  readonly kind: "one_surface_authority_replay_projection";
  readonly applicationRef: string;
  readonly bindings: readonly OneSurfaceAuthorityReplayBinding[];
  readonly diagnostics: readonly OneSurfaceAuthorityResultDiagnostic[];
}

type EventRow<K extends RuntimeEvent["kind"]> =
  RuntimeEventCalculusEffectRow & {
    readonly sourceEvent: Extract<RuntimeEvent, { readonly kind: K }>;
  };

function rowsOfKind<K extends RuntimeEvent["kind"]>(
  rows: readonly RuntimeEventCalculusEffectRow[],
  kind: K
): readonly EventRow<K>[] {
  return rows.filter(
    (row): row is EventRow<K> => row.sourceEvent.kind === kind
  );
}

function diagnostic(
  reason: string,
  evidenceRefs: readonly string[],
  diagnosticId: OneSurfaceAuthorityResultDiagnosticId =
    "one_surface_event_binding_semantic_not_realized"
): OneSurfaceAuthorityResultDiagnostic {
  return Object.freeze({
    kind: "one_surface_authority_result_diagnostic",
    diagnosticId,
    reason,
    evidenceRefs: Object.freeze([...evidenceRefs])
  });
}

function leafAtLocus(
  node: CompiledCPlanNode,
  locusRef: string
): CompiledCStageLeaf | null {
  if (node.kind === "compiled_c_stage_leaf") {
    return node.nodeRef === locusRef ? node : null;
  }
  if (node.kind === "compiled_c_sequence") {
    for (const child of node.children) {
      const leaf = leafAtLocus(child, locusRef);
      if (leaf !== null) return leaf;
    }
  } else if (node.kind === "compiled_c_complete_batch") {
    for (const task of node.tasks) {
      const leaf = leafAtLocus(task.child, locusRef);
      if (leaf !== null) return leaf;
    }
  } else if (node.kind === "compiled_c_complete_retry") {
    return leafAtLocus(node.child, locusRef);
  }
  return null;
}

function canonicalDistinctRefs(
  values: readonly string[],
  label: string
): readonly string[] {
  if (
    values.length === 0 ||
    values.some((value) => value.length === 0) ||
    new Set(values).size !== values.length
  ) {
    throw new TypeError(`${label} requires distinct non-empty refs`);
  }
  return Object.freeze([...values].sort());
}

function orderedNonEmptyRefs(
  values: readonly string[],
  label: string
): readonly string[] {
  if (
    values.length === 0 ||
    values.some((value) => value.length === 0)
  ) {
    throw new TypeError(`${label} requires non-empty refs`);
  }
  return Object.freeze([...values]);
}

function hasDistinctNonEmptyRefs(values: readonly string[]): boolean {
  return values.length > 0 &&
    values.every((value) => value.length > 0) &&
    new Set(values).size === values.length;
}

function hasCanonicalDistinctNonEmptyRefs(values: readonly string[]): boolean {
  return hasDistinctNonEmptyRefs(values) &&
    stableJsonEquals(values, [...values].sort());
}

function isSha256Digest(value: string): value is `sha256:${string}` {
  return /^sha256:[a-f0-9]{64}$/u.test(value);
}

function assertOneSurfaceAuthorityInputBasis<
  K extends OneSurfaceAuthorityFunctionKind
>(basis: OneSurfaceAuthorityInputBasis<K>, functionKind: K): void {
  if (
    basis.kind !== "one_surface_authority_input_basis" ||
    basis.functionKind !== functionKind ||
    !hasCanonicalDistinctNonEmptyRefs(basis.inputRefs) ||
    !isSha256Digest(basis.inputDigest)
  ) {
    throw new TypeError("One Surface function input basis differs");
  }
}

const ONE_SURFACE_ARTIFACT_RESULT_PAIR = Symbol(
  "ONE_SURFACE_ARTIFACT_RESULT_PAIR"
);

export interface OneSurfaceArtifactResultPair<
  K extends OneSurfaceAuthorityFunctionKind = OneSurfaceAuthorityFunctionKind
> {
  readonly [ONE_SURFACE_ARTIFACT_RESULT_PAIR]: true;
  readonly kind: "one_surface_artifact_result_pair";
  readonly functionKind: K;
  readonly pairRef: string;
  readonly pairDigest: `sha256:${string}`;
  readonly stageAuthorityRef: string;
  readonly stageAuthorityDigest: `sha256:${string}`;
  readonly inputBasis: OneSurfaceAuthorityInputBasis<K>;
  readonly sourceEventRef: string;
  readonly payloadRef: string;
  readonly payloadDigest: string;
  readonly resultContractRef: string;
  readonly resultContractDigest: string;
  readonly resultAdmission: AdmittedOneSurfaceResultValue<K>;
  readonly targetCarrierValidationRef: string;
}

function artifactResultPairBasis(input: {
  readonly functionKind: OneSurfaceAuthorityFunctionKind;
  readonly stageAuthorityRef: string;
  readonly stageAuthorityDigest: `sha256:${string}`;
  readonly inputRefs: readonly string[];
  readonly inputDigest: `sha256:${string}`;
  readonly sourceEventRef: string;
  readonly payloadRef: string;
  readonly payloadDigest: string;
  readonly resultContractRef: string;
  readonly resultContractDigest: string;
  readonly resultAdmissionRef: string;
  readonly resultValueDigest: `sha256:${string}`;
}) {
  return Object.freeze({ ...input });
}

function artifactResultPairIdentity(
  basis: ReturnType<typeof artifactResultPairBasis>
): Readonly<{
  readonly pairRef: string;
  readonly pairDigest: `sha256:${string}`;
}> {
  const pairDigest = stableSha256Digest(basis);
  return Object.freeze({
    pairRef:
      `abg://one-surface/artifact-result-pair/` +
      pairDigest.slice("sha256:".length),
    pairDigest
  });
}

export function admitOneSurfaceArtifactResultPair<
  K extends OneSurfaceAuthorityFunctionKind
>(input: {
  readonly stageAuthority: OneSurfaceStageAuthority<K>;
  readonly inputBasis: OneSurfaceAuthorityInputBasis<K>;
  readonly admittedResult: AdmittedOneSurfaceResultValue<K>;
  readonly targetCarrierContract: TargetCarrierContractBinding;
  readonly sourceEventRef: string;
  readonly artifactPayloadDigestBasis: unknown;
}): OneSurfaceArtifactResultPair<K> {
  assertOneSurfaceStageAuthority(input.stageAuthority);
  assertOneSurfaceAuthorityInputBasis(
    input.inputBasis,
    input.stageAuthority.functionKind
  );
  assertAdmittedOneSurfaceResultValue(input.admittedResult);
  if (
    input.sourceEventRef.length === 0 ||
    input.admittedResult.functionKind !== input.stageAuthority.functionKind ||
    input.admittedResult.schemaRef !== input.stageAuthority.nativeResultSchema.schemaRef ||
    input.targetCarrierContract.contractRef !==
      input.stageAuthority.resultAuthority.selectedResultContractRef ||
    input.targetCarrierContract.configDigest !==
      input.stageAuthority.targetCarrierContract.targetCarrierContractDigest ||
    input.targetCarrierContract.schemaRef !==
      input.stageAuthority.nativeResultSchema.schemaRef
  ) {
    throw new TypeError("One Surface artifact/result pair authority differs");
  }
  const payloadIdentity = mintTargetCarrierPayloadIdentity({
    resultRef: input.sourceEventRef,
    artifactPayload: input.artifactPayloadDigestBasis,
    targetCarrierContractRef: input.targetCarrierContract.contractRef,
    targetCarrierContractDigest: input.targetCarrierContract.configDigest
  });
  const candidate = validateTargetCarrierCandidate({
    binding: input.targetCarrierContract,
    payloadRef: payloadIdentity.payloadRef,
    candidate: input.artifactPayloadDigestBasis
  });
  if (candidate.status !== "admitted") {
    throw new TypeError(candidate.reason);
  }
  const decodedAdmission = admitOneSurfaceResultForClose(
    input.stageAuthority.functionKind,
    candidate.decodedValue
  );
  if (
    decodedAdmission.admissionRef !== input.admittedResult.admissionRef ||
    decodedAdmission.valueDigest !== input.admittedResult.valueDigest ||
    !stableJsonEquals(decodedAdmission.value, input.admittedResult.value)
  ) {
    throw new TypeError(
      "One Surface artifact and admitted result do not form one exact pair"
    );
  }
  const basis = artifactResultPairBasis({
    functionKind: input.stageAuthority.functionKind,
    stageAuthorityRef: input.stageAuthority.authorityRef,
    stageAuthorityDigest: input.stageAuthority.authorityDigest,
    inputRefs: input.inputBasis.inputRefs,
    inputDigest: input.inputBasis.inputDigest,
    sourceEventRef: input.sourceEventRef,
    payloadRef: payloadIdentity.payloadRef,
    payloadDigest: payloadIdentity.digest,
    resultContractRef: input.targetCarrierContract.contractRef,
    resultContractDigest: input.targetCarrierContract.configDigest,
    resultAdmissionRef: input.admittedResult.admissionRef,
    resultValueDigest: input.admittedResult.valueDigest
  });
  const identity = artifactResultPairIdentity(basis);
  return Object.freeze({
    [ONE_SURFACE_ARTIFACT_RESULT_PAIR]: true as const,
    kind: "one_surface_artifact_result_pair",
    functionKind: input.stageAuthority.functionKind,
    ...identity,
    stageAuthorityRef: input.stageAuthority.authorityRef,
    stageAuthorityDigest: input.stageAuthority.authorityDigest,
    inputBasis: input.inputBasis,
    sourceEventRef: input.sourceEventRef,
    payloadRef: payloadIdentity.payloadRef,
    payloadDigest: payloadIdentity.digest,
    resultContractRef: input.targetCarrierContract.contractRef,
    resultContractDigest: input.targetCarrierContract.configDigest,
    resultAdmission: input.admittedResult,
    targetCarrierValidationRef: candidate.validationRef
  });
}

function assertOneSurfaceArtifactResultPair<
  K extends OneSurfaceAuthorityFunctionKind
>(
  pair: OneSurfaceArtifactResultPair<K>,
  stage: OneSurfaceStageAuthority<K>
): void {
  assertOneSurfaceAuthorityInputBasis(pair.inputBasis, stage.functionKind);
  assertAdmittedOneSurfaceResultValue(pair.resultAdmission);
  const identity = artifactResultPairIdentity(artifactResultPairBasis({
    functionKind: pair.functionKind,
    stageAuthorityRef: pair.stageAuthorityRef,
    stageAuthorityDigest: pair.stageAuthorityDigest,
    inputRefs: pair.inputBasis.inputRefs,
    inputDigest: pair.inputBasis.inputDigest,
    sourceEventRef: pair.sourceEventRef,
    payloadRef: pair.payloadRef,
    payloadDigest: pair.payloadDigest,
    resultContractRef: pair.resultContractRef,
    resultContractDigest: pair.resultContractDigest,
    resultAdmissionRef: pair.resultAdmission.admissionRef,
    resultValueDigest: pair.resultAdmission.valueDigest
  }));
  if (
    pair[ONE_SURFACE_ARTIFACT_RESULT_PAIR] !== true ||
    pair.kind !== "one_surface_artifact_result_pair" ||
    pair.functionKind !== stage.functionKind ||
    pair.stageAuthorityRef !== stage.authorityRef ||
    pair.stageAuthorityDigest !== stage.authorityDigest ||
    pair.resultContractRef !== stage.resultAuthority.selectedResultContractRef ||
    pair.resultContractDigest !==
      stage.targetCarrierContract.targetCarrierContractDigest ||
    pair.resultAdmission.functionKind !== stage.functionKind ||
    pair.resultAdmission.schemaRef !== stage.nativeResultSchema.schemaRef ||
    pair.pairRef !== identity.pairRef ||
    pair.pairDigest !== identity.pairDigest
  ) {
    throw new TypeError("One Surface artifact/result pair seal differs");
  }
}

export interface OneSurfaceAuthorityCloseProjection<
  K extends OneSurfaceAuthorityFunctionKind = OneSurfaceAuthorityFunctionKind
> {
  readonly kind: "one_surface_authority_close_projection";
  readonly functionKind: K;
  readonly admissionRef: string;
  readonly outcome: "success" | "refusal";
  readonly outcomeStatus: "completed" | "retry" | "pending" | "blocked" | "escalated";
  readonly judgment: "advance" | "retry" | "pending" | "blocked" | "escalated";
  readonly reasonRef: string | null;
  readonly events: ReturnType<typeof buildCCallSpineClose>;
}

export function buildOneSurfaceAuthorityCloseEvents<
  K extends OneSurfaceAuthorityFunctionKind
>(input: {
  readonly stageAuthority: OneSurfaceStageAuthority<K>;
  readonly resultPair: OneSurfaceArtifactResultPair<K>;
  readonly cCallRef: string;
  readonly basisId: string;
  readonly evidenceRefs: readonly string[];
}): OneSurfaceAuthorityCloseProjection<K> {
  assertOneSurfaceStageAuthority(input.stageAuthority);
  assertOneSurfaceArtifactResultPair(input.resultPair, input.stageAuthority);
  if (
    input.cCallRef.length === 0 ||
    input.basisId.length === 0
  ) {
    throw new TypeError("One Surface close authority differs");
  }
  const refusal = isOneSurfaceTypedRefusal(input.resultPair.resultAdmission.value)
    ? input.resultPair.resultAdmission.value
    : null;
  const evidenceRefs = canonicalDistinctRefs([
    ...input.evidenceRefs,
    input.resultPair.pairRef,
    input.resultPair.resultAdmission.admissionRef,
    ...(refusal === null
      ? []
      : [refusal.refusalRef, ...refusal.reasonRefs])
  ], "One Surface close evidence");
  const outcome = refusal === null ? "success" as const : "refusal" as const;
  const outcomeStatus = refusal?.judgment ?? "completed";
  const judgment = refusal?.judgment ?? "advance";
  const reasonRef = refusal?.refusalRef ?? null;
  return Object.freeze({
    kind: "one_surface_authority_close_projection",
    functionKind: input.stageAuthority.functionKind,
    admissionRef: input.resultPair.resultAdmission.admissionRef,
    outcome,
    outcomeStatus,
    judgment,
    reasonRef,
    events: buildCCallSpineClose({
      cCallRef: input.cCallRef,
      basisId: input.basisId,
      evidenceClass: "one_surface_authority_result",
      evidenceRefs,
      outcomeStatus,
      payloadRef: input.resultPair.payloadRef,
      responseContractRef:
        input.stageAuthority.resultAuthority.selectedResultContractRef,
      judgment,
      reasonRef
    })
  });
}

export function oneSurfaceAuthoritySnapshotBasis(input: {
  readonly application: OneSurfaceAuthorityProgramBinding;
  readonly stage: OneSurfaceStageAuthority;
}): Readonly<{
  readonly authorityRefs: readonly string[];
  readonly authorityDigest: `sha256:${string}`;
}> {
  const authorityRefs = orderedNonEmptyRefs([
    input.application.bindingRef,
    input.application.admittedProgramRef,
    input.stage.authorityRef,
    input.stage.stage.stageBindingRef,
    input.stage.plan.planRef,
    input.stage.plan.compositionRef,
    input.stage.resultAuthority.authorityRef,
    input.stage.resultAuthority.currentSourceAuthorityRef,
    input.stage.targetCarrierContract.targetCarrierContractRef,
    input.stage.nativeResultSchema.schemaRef,
    input.stage.closureContract.ref,
    input.stage.traversalContracts.bundleRef
  ], "One Surface authority snapshot");
  return Object.freeze({
    authorityRefs,
    authorityDigest: stableSha256Digest({
      application: Object.freeze({
        ref: input.application.bindingRef,
        digest: input.application.bindingDigest,
        programRef: input.application.admittedProgramRef,
        programDigest: input.application.admittedProgramDigest
      }),
      stage: Object.freeze({
        ref: input.stage.authorityRef,
        digest: input.stage.authorityDigest,
        stageBindingRef: input.stage.stage.stageBindingRef,
        planRef: input.stage.plan.planRef,
        planDigest: input.stage.plan.planDigest,
        compositionRef: input.stage.plan.compositionRef,
        compositionDigest: input.stage.plan.compositionDigest,
        resultAuthorityRef: input.stage.resultAuthority.authorityRef,
        resultAuthorityDigest: input.stage.resultAuthority.authorityDigest,
        currentSourceAuthorityRef:
          input.stage.resultAuthority.currentSourceAuthorityRef,
        currentSourceAuthorityDigest:
          input.stage.resultAuthority.currentSourceAuthorityDigest,
        targetCarrierContractRef:
          input.stage.targetCarrierContract.targetCarrierContractRef,
        targetCarrierContractDigest:
          input.stage.targetCarrierContract.targetCarrierContractDigest,
        nativeResultSchema: input.stage.nativeResultSchema,
        closureContract: input.stage.closureContract,
        traversalBundleRef: input.stage.traversalContracts.bundleRef,
        traversalBundleDigest: input.stage.traversalContracts.bundleDigest
      }),
      authorityRefs
    })
  });
}

function sameScope(
  event: {
    readonly basisId: string;
    readonly graphCallId: string;
    readonly frameId: string;
    readonly vectorIndex: number;
    readonly edge: string;
  },
  opened: EventRow<"c_call_opened">["sourceEvent"]
): boolean {
  return event.basisId === opened.basisId &&
    event.graphCallId === opened.graphCallId &&
    event.frameId === opened.frameId &&
    event.vectorIndex === opened.vectorIndex &&
    event.edge === opened.edge;
}

function exactOne<T>(values: readonly T[]): T | null {
  return values.length === 1 ? values[0] ?? null : null;
}

function resultAdmissionValueDigest(input: {
  readonly functionKind: OneSurfaceAuthorityFunctionKind;
  readonly admissionRef: string;
}): `sha256:${string}` | null {
  const prefix =
    `abg://one-surface/result-admission/${input.functionKind}/`;
  if (!input.admissionRef.startsWith(prefix)) return null;
  const digest = input.admissionRef.slice(prefix.length);
  return /^[a-f0-9]{64}$/u.test(digest) ? `sha256:${digest}` : null;
}

function bindingBasis(
  binding: Omit<
    OneSurfaceAuthorityReplayBinding,
    "kind" | "bindingRef" | "bindingDigest"
  >
) {
  return Object.freeze({ ...binding });
}

export function deriveOneSurfaceAuthorityReplayProjection(input: {
  readonly application: OneSurfaceAuthorityProgramBinding;
  readonly effectRows: readonly RuntimeEventCalculusEffectRow[];
}): OneSurfaceAuthorityReplayProjection {
  assertOneSurfaceAuthorityProgramBinding(input.application);
  const bindings: OneSurfaceAuthorityReplayBinding[] = [];
  const diagnostics: OneSurfaceAuthorityResultDiagnostic[] = [];
  const opens = rowsOfKind(input.effectRows, "c_call_opened");
  for (const stage of input.application.stages) {
    const stageOpens = opens.filter((row) =>
      row.sourceEvent.programLocusRef === stage.resultAuthority.programLocusRef &&
      row.sourceEvent.graphFunctionId === stage.plan.executionGraphFunctionRef &&
      row.sourceEvent.stageRole === stage.functionKind
    );
    for (const openRow of stageOpens) {
      const opened = openRow.sourceEvent;
      const matchingCallOpens = opens.filter((row) =>
        row.sourceEvent.cCallRef === opened.cCallRef &&
        row.sourceEvent.basisId === opened.basisId
      );
      if (matchingCallOpens.length !== 1) {
        diagnostics.push(diagnostic(
          "C-call identity requires exactly one opened event",
          [opened.cCallRef, opened.basisId]
        ));
        continue;
      }
      const openOrdinal = input.effectRows.indexOf(openRow);
      const nextOpenOrdinal = stageOpens
        .map((row) => input.effectRows.indexOf(row))
        .filter((ordinal) => ordinal > openOrdinal)
        .sort((left, right) => left - right)[0] ?? input.effectRows.length;
      const callRows = input.effectRows.slice(openOrdinal, nextOpenOrdinal);
      const leaf = leafAtLocus(stage.plan.root, stage.resultAuthority.programLocusRef);
      const fibre = exactOne(rowsOfKind(callRows, "c_call_fibre_selected")
        .filter((row) =>
          row.sourceEvent.cCallRef === opened.cCallRef &&
          row.sourceEvent.basisId === opened.basisId
        ));
      const authorityBasis = oneSurfaceAuthoritySnapshotBasis({
        application: input.application,
        stage
      });
      const authority = exactOne(rowsOfKind(callRows, "authority_snapshot_admitted")
        .filter((row) =>
          sameScope(row.sourceEvent, opened) &&
          stableJsonEquals(
            row.sourceEvent.authorityRefs,
            authorityBasis.authorityRefs
          ) &&
          row.sourceEvent.authorityDigest === authorityBasis.authorityDigest
        ));
      if (
        leaf === null ||
        fibre === null ||
        authority === null ||
        fibre.sourceEvent.regime !== stage.resultAuthority.regime ||
        fibre.sourceEvent.armId !== leaf.armId ||
        fibre.sourceEvent.programRef !== stage.plan.programRef ||
        fibre.sourceEvent.compositionRef !== stage.plan.compositionRef ||
        !hasCanonicalDistinctNonEmptyRefs(authority.sourceEvent.inputRefs) ||
        !isSha256Digest(authority.sourceEvent.inputDigest) ||
        !authority.sourceEvent.closureCapable ||
        authority.sourceEvent.contradictoryAuthority ||
        authority.sourceEvent.deferredAuthorityRefs.length > 0
      ) {
        diagnostics.push(diagnostic(
          "call, fibre, program, composition, or authority snapshot is incomplete",
          [opened.cCallRef, stage.authorityRef]
        ));
        continue;
      }
      const observed = exactOne(rowsOfKind(callRows, "payload_observed")
        .filter((row) =>
          sameScope(row.sourceEvent, opened) &&
          row.sourceEvent.authorityRef === authority.sourceEvent.authoritySnapshotRef &&
          row.sourceEvent.inputDigest === authority.sourceEvent.inputDigest &&
          row.sourceEvent.contractRef === stage.resultAuthority.selectedResultContractRef &&
          row.sourceEvent.schemaRef === stage.nativeResultSchema.schemaRef &&
          row.sourceEvent.sourceEventRef !== null
        ));
      const validated = observed === null ? null : exactOne(
        rowsOfKind(callRows, "payload_validated").filter((row) =>
          sameScope(row.sourceEvent, opened) &&
          row.sourceEvent.payloadRef === observed.sourceEvent.payloadRef &&
          row.sourceEvent.digest === observed.sourceEvent.digest &&
          row.sourceEvent.schemaRef === stage.nativeResultSchema.schemaRef &&
          row.sourceEvent.contractRef === stage.resultAuthority.selectedResultContractRef &&
          row.sourceEvent.contractDigest ===
            stage.targetCarrierContract.targetCarrierContractDigest
        )
      );
      if (observed === null || validated === null) {
        diagnostics.push(diagnostic(
          "observed and validated target payload relation is incomplete",
          [opened.cCallRef, stage.targetCarrierContract.targetCarrierContractRef]
        ));
        continue;
      }
      const evidence = rowsOfKind(callRows, "evidence_admitted").filter(
        (row) =>
          sameScope(row.sourceEvent, opened) &&
          row.sourceEvent.payloadRef === observed.sourceEvent.payloadRef &&
          row.sourceEvent.authorityRef === authority.sourceEvent.authoritySnapshotRef &&
          row.sourceEvent.authorityDigest === authority.sourceEvent.authorityDigest &&
          row.sourceEvent.inputDigest === authority.sourceEvent.inputDigest &&
          row.sourceEvent.complete &&
          !row.sourceEvent.shallow &&
          !row.sourceEvent.contradictsAuthority &&
          !row.sourceEvent.deferred
      );
      const evidenceRefs = evidence.map((row) => row.sourceEvent.evidenceRef);
      const resultAdmissionRef = exactOne(evidenceRefs.filter((evidenceRef) =>
        resultAdmissionValueDigest({
          functionKind: stage.functionKind,
          admissionRef: evidenceRef
        }) !== null
      ));
      const resultValueDigest = resultAdmissionRef === null
        ? null
        : resultAdmissionValueDigest({
            functionKind: stage.functionKind,
            admissionRef: resultAdmissionRef
          });
      const artifactResultPair =
        resultAdmissionRef === null ||
        resultValueDigest === null ||
        observed.sourceEvent.sourceEventRef === null
          ? null
          : artifactResultPairIdentity(artifactResultPairBasis({
              functionKind: stage.functionKind,
              stageAuthorityRef: stage.authorityRef,
              stageAuthorityDigest: stage.authorityDigest,
              inputRefs: authority.sourceEvent.inputRefs,
              inputDigest: authority.sourceEvent.inputDigest,
              sourceEventRef: observed.sourceEvent.sourceEventRef,
              payloadRef: observed.sourceEvent.payloadRef,
              payloadDigest: observed.sourceEvent.digest,
              resultContractRef:
                stage.resultAuthority.selectedResultContractRef,
              resultContractDigest:
                stage.targetCarrierContract.targetCarrierContractDigest,
              resultAdmissionRef,
              resultValueDigest
            }));
      const observedPairRefs = evidenceRefs.filter((evidenceRef) =>
        evidenceRef.startsWith(
          "abg://one-surface/artifact-result-pair/"
        )
      );
      const exactPairRef = exactOne(observedPairRefs);
      let expectedEnclosureRefs: readonly string[] | null = null;
      if (
        hasDistinctNonEmptyRefs(evidenceRefs) &&
        artifactResultPair !== null &&
        exactPairRef === artifactResultPair.pairRef
      ) {
        try {
          expectedEnclosureRefs = canonicalDistinctRefs([
            authority.sourceEvent.authoritySnapshotRef,
            validated.sourceEvent.validationRef,
            ...evidenceRefs
          ], "One Surface C-call enclosure");
        } catch {
          expectedEnclosureRefs = null;
        }
      }
      const evidenced = expectedEnclosureRefs === null
        ? null
        : exactOne(rowsOfKind(callRows, "c_call_evidenced")
          .filter((row) =>
            row.sourceEvent.cCallRef === opened.cCallRef &&
            row.sourceEvent.basisId === opened.basisId &&
            row.sourceEvent.evidenceClass === "one_surface_authority_result" &&
            hasDistinctNonEmptyRefs(row.sourceEvent.evidenceRefs) &&
            stableJsonEquals(
              [...row.sourceEvent.evidenceRefs].sort(),
              expectedEnclosureRefs
            )
          ));
      const result = exactOne(rowsOfKind(callRows, "c_call_result_admitted")
        .filter((row) =>
          row.sourceEvent.cCallRef === opened.cCallRef &&
          row.sourceEvent.basisId === opened.basisId &&
          row.sourceEvent.payloadRef === observed.sourceEvent.payloadRef &&
          row.sourceEvent.responseContractRef ===
            stage.resultAuthority.selectedResultContractRef
        ));
      const judged = exactOne(rowsOfKind(callRows, "c_call_judged")
        .filter((row) =>
          row.sourceEvent.cCallRef === opened.cCallRef &&
          row.sourceEvent.basisId === opened.basisId
        ));
      if (
        expectedEnclosureRefs === null ||
        artifactResultPair === null ||
        resultAdmissionRef === null ||
        resultValueDigest === null ||
        evidenced === null ||
        result === null ||
        judged === null
      ) {
        diagnostics.push(diagnostic(
          "evidence, result admission, judgment, or canonical order is incomplete",
          [opened.cCallRef, observed.sourceEvent.payloadRef]
        ));
        continue;
      }
      const successClose =
        result.sourceEvent.outcomeStatus === "completed" &&
        judged.sourceEvent.judgment === "advance" &&
        judged.sourceEvent.reasonRef === null;
      const refusalClose =
        (judged.sourceEvent.judgment === "retry" ||
          judged.sourceEvent.judgment === "pending" ||
          judged.sourceEvent.judgment === "blocked" ||
          judged.sourceEvent.judgment === "escalated") &&
        result.sourceEvent.outcomeStatus === judged.sourceEvent.judgment &&
        judged.sourceEvent.reasonRef !== null;
      if (!successClose && !refusalClose) {
        diagnostics.push(diagnostic(
          "result status, judgment, and reason do not form an admitted close",
          [opened.cCallRef, observed.sourceEvent.payloadRef]
        ));
        continue;
      }
      const orderedRows: readonly RuntimeEventCalculusEffectRow[] = [
        openRow,
        fibre,
        authority,
        observed,
        validated,
        ...evidence,
        evidenced,
        result,
        judged
      ];
      const ordinals = orderedRows.map((row) => input.effectRows.indexOf(row));
      const ordered = ordinals.every(
        (ordinal, index) => ordinal >= 0 &&
          (index === 0 || ordinal > (ordinals[index - 1] ?? -1))
      );
      if (!ordered) {
        diagnostics.push(diagnostic(
          "call evidence is not in canonical replay order",
          [opened.cCallRef, observed.sourceEvent.payloadRef]
        ));
        continue;
      }
      const basis = bindingBasis({
        outcome: successClose ? "success" : "refusal",
        functionKind: stage.functionKind,
        applicationRef: input.application.bindingRef,
        applicationDigest: input.application.bindingDigest,
        stageAuthorityRef: stage.authorityRef,
        stageAuthorityDigest: stage.authorityDigest,
        cCallRef: opened.cCallRef,
        basisId: opened.basisId,
        graphFunctionId: opened.graphFunctionId,
        graphCallId: opened.graphCallId,
        frameId: opened.frameId,
        vectorIndex: opened.vectorIndex,
        edge: opened.edge,
        inputRefs: authority.sourceEvent.inputRefs,
        inputDigest: authority.sourceEvent.inputDigest,
        payloadRef: observed.sourceEvent.payloadRef,
        payloadDigest: observed.sourceEvent.digest,
        resultContractRef: stage.resultAuthority.selectedResultContractRef,
        resultContractDigest:
          stage.targetCarrierContract.targetCarrierContractDigest,
        authoritySnapshotRef: authority.sourceEvent.authoritySnapshotRef,
        artifactResultPairRef: artifactResultPair.pairRef,
        artifactResultPairDigest: artifactResultPair.pairDigest,
        resultAdmissionRef,
        resultValueDigest,
        evidenceRefs: expectedEnclosureRefs,
        judgment: judged.sourceEvent.judgment,
        reasonRef: judged.sourceEvent.reasonRef
      });
      const bindingDigest = stableSha256Digest(basis);
      bindings.push(Object.freeze({
        kind: "one_surface_authority_replay_binding",
        bindingRef:
          `abg://one-surface/replay-result/${bindingDigest.slice("sha256:".length)}`,
        bindingDigest,
        ...basis
      }));
    }
  }
  return Object.freeze({
    kind: "one_surface_authority_replay_projection",
    applicationRef: input.application.bindingRef,
    bindings: Object.freeze(bindings),
    diagnostics: Object.freeze(diagnostics)
  });
}

export function constructOneSurfaceAuthorityResultRule(
  application: OneSurfaceAuthorityProgramBinding
): RuntimeDerivedFluentRule {
  assertOneSurfaceAuthorityProgramBinding(application);
  return Object.freeze({
    kind: "derived_fluent_rule",
    ruleRef:
      `rule://abg/one-surface/authority-result/${application.bindingDigest}`,
    derive: (input: Parameters<RuntimeDerivedFluentRule["derive"]>[0]) =>
      deriveOneSurfaceAuthorityReplayProjection({
      application,
      effectRows: input.effectRows
    }).bindings.map((binding) => constructRuntimeFluent({
      name: "one_surface_authority_outcome",
      scope: "graph_call",
      basisId: binding.basisId,
      graphFunctionId: binding.graphFunctionId,
      graphCallId: binding.graphCallId,
      frameId: binding.frameId,
      vectorIndex: binding.vectorIndex,
      edge: binding.edge,
      ref: binding.bindingRef
    }))
  });
}

export type OneSurfaceAuthorityResultProjection<
  K extends OneSurfaceAuthorityFunctionKind = OneSurfaceAuthorityFunctionKind
> =
  | {
      readonly kind: "one_surface_authority_result_projection";
      readonly status: "admitted";
      readonly result: AdmittedOneSurfaceAuthorityResult<K>;
      readonly diagnostic: null;
    }
  | {
      readonly kind: "one_surface_authority_result_projection";
      readonly status: "refused" | "semantic_not_realized";
      readonly result: null;
      readonly diagnostic: OneSurfaceAuthorityResultDiagnostic;
    };

function refused<K extends OneSurfaceAuthorityFunctionKind>(input: {
  readonly status: "refused" | "semantic_not_realized";
  readonly diagnosticId: OneSurfaceAuthorityResultDiagnosticId;
  readonly reason: string;
  readonly evidenceRefs: readonly string[];
}): OneSurfaceAuthorityResultProjection<K> {
  return Object.freeze({
    kind: "one_surface_authority_result_projection",
    status: input.status,
    result: null,
    diagnostic: diagnostic(input.reason, input.evidenceRefs, input.diagnosticId)
  });
}

export function projectOneSurfaceAuthorityResult<
  K extends OneSurfaceAuthorityFunctionKind
>(input: {
  readonly application: OneSurfaceAuthorityProgramBinding;
  readonly stageAuthority: OneSurfaceStageAuthority<K>;
  readonly eventCalculus: RuntimeEventCalculusProjection;
  readonly payloadLedger: PayloadLedgerProjection;
  readonly artifactPayloadDigestBasis: unknown;
  readonly expectedCCallRef: string;
  readonly expectedFunctionInputBasis: OneSurfaceAuthorityInputBasis<K>;
}): OneSurfaceAuthorityResultProjection<K> {
  try {
    assertOneSurfaceAuthorityProgramBinding(input.application);
    assertOneSurfaceStageAuthority(input.stageAuthority);
    assertOneSurfaceAuthorityInputBasis(
      input.expectedFunctionInputBasis,
      input.stageAuthority.functionKind
    );
  } catch (error: unknown) {
    return refused({
      status: "refused",
      diagnosticId: "one_surface_result_authority_mismatch",
      reason: error instanceof Error ? error.message : String(error),
      evidenceRefs: []
    });
  }
  if (
    input.expectedCCallRef.length === 0
  ) {
    return refused({
      status: "refused",
      diagnosticId: "one_surface_result_authority_mismatch",
      reason: "expected C-call ref is required",
      evidenceRefs: []
    });
  }
  const replay = deriveOneSurfaceAuthorityReplayProjection({
    application: input.application,
    effectRows: input.eventCalculus.effectRows
  });
  const candidates = replay.bindings.filter((binding) =>
    binding.stageAuthorityRef === input.stageAuthority.authorityRef &&
    binding.stageAuthorityDigest === input.stageAuthority.authorityDigest &&
    binding.cCallRef === input.expectedCCallRef &&
    stableJsonEquals(
      binding.inputRefs,
      input.expectedFunctionInputBasis.inputRefs
    ) &&
    binding.inputDigest === input.expectedFunctionInputBasis.inputDigest &&
    binding.basisId === input.payloadLedger.scope.basisId &&
    binding.graphFunctionId === input.payloadLedger.scope.graphFunctionId &&
    binding.graphCallId === input.payloadLedger.scope.graphCallId &&
    binding.frameId === input.payloadLedger.scope.frameId &&
    binding.vectorIndex === input.payloadLedger.scope.vectorIndex &&
    binding.edge === input.payloadLedger.scope.edge
  );
  const binding = exactOne(candidates);
  if (binding === null) {
    return refused({
      status: "semantic_not_realized",
      diagnosticId: "one_surface_event_binding_semantic_not_realized",
      reason: "exact replay binding is absent or ambiguous",
      evidenceRefs: replay.diagnostics.flatMap((row) => row.evidenceRefs)
    });
  }
  const expectedFluent = constructRuntimeFluent({
    name: "one_surface_authority_outcome",
    scope: "graph_call",
    basisId: binding.basisId,
    graphFunctionId: binding.graphFunctionId,
    graphCallId: binding.graphCallId,
    frameId: binding.frameId,
    vectorIndex: binding.vectorIndex,
    edge: binding.edge,
    ref: binding.bindingRef
  });
  if (!input.eventCalculus.holds.some(
    (fluent) => runtimeFluentKey(fluent) === runtimeFluentKey(expectedFluent)
  )) {
    return refused({
      status: "semantic_not_realized",
      diagnosticId: "one_surface_event_binding_semantic_not_realized",
      reason: "application-bound derived fluent is absent",
      evidenceRefs: [binding.bindingRef]
    });
  }
  const admittedOutput = deriveAdmittedOutputAuthorityProjection({
    ledger: input.payloadLedger,
    payloadRef: binding.payloadRef
  });
  if (
    admittedOutput.status !== "admitted" ||
    admittedOutput.payloadRef !== binding.payloadRef ||
    admittedOutput.payloadDigest !== binding.payloadDigest ||
    admittedOutput.inputDigest !== binding.inputDigest ||
    admittedOutput.targetCarrierContractRef !== binding.resultContractRef ||
    admittedOutput.targetCarrierContractDigest !== binding.resultContractDigest ||
    admittedOutput.sourceEventRef === null
  ) {
    return refused({
      status: admittedOutput.status === "missing"
        ? "semantic_not_realized"
        : "refused",
      diagnosticId: admittedOutput.status === "missing"
        ? "one_surface_event_binding_semantic_not_realized"
        : "one_surface_result_not_admitted",
      reason: admittedOutput.reason ?? "payload ledger differs from replay result",
      evidenceRefs: [binding.bindingRef, admittedOutput.projectionRef]
    });
  }
  const payloadIdentity = mintTargetCarrierPayloadIdentity({
    resultRef: admittedOutput.sourceEventRef,
    artifactPayload: input.artifactPayloadDigestBasis,
    targetCarrierContractRef: admittedOutput.targetCarrierContractRef,
    targetCarrierContractDigest: admittedOutput.targetCarrierContractDigest
  });
  const candidate = validateTargetCarrierCandidate({
    binding: input.payloadLedger.targetCarrierContract,
    payloadRef: admittedOutput.payloadRef,
    candidate: input.artifactPayloadDigestBasis
  });
  if (
    candidate.status !== "admitted" ||
    payloadIdentity.payloadRef !== binding.payloadRef ||
    payloadIdentity.digest !== binding.payloadDigest ||
    candidate.contractRef !== binding.resultContractRef ||
    candidate.contractDigest !== binding.resultContractDigest
  ) {
    return refused({
      status: "refused",
      diagnosticId: "one_surface_result_not_admitted",
      reason: candidate.status === "rejected"
        ? candidate.reason
        : "decoded target-carrier value differs from replay truth",
      evidenceRefs: [binding.bindingRef, admittedOutput.projectionRef]
    });
  }
  let decodedAdmission;
  try {
    decodedAdmission = admitOneSurfaceResultForClose(
      input.stageAuthority.functionKind,
      candidate.decodedValue
    );
  } catch (error: unknown) {
    return refused({
      status: "refused",
      diagnosticId: "one_surface_result_not_admitted",
      reason: error instanceof Error ? error.message : String(error),
      evidenceRefs: [binding.bindingRef, admittedOutput.projectionRef]
    });
  }
  if (
    decodedAdmission.admissionRef !== binding.resultAdmissionRef ||
    decodedAdmission.valueDigest !== binding.resultValueDigest ||
    !binding.evidenceRefs.includes(decodedAdmission.admissionRef)
  ) {
    return refused({
      status: "refused",
      diagnosticId: "one_surface_result_not_admitted",
      reason: "decoded result admission is absent from the exact C-call enclosure",
      evidenceRefs: [
        binding.bindingRef,
        admittedOutput.projectionRef,
        decodedAdmission.admissionRef
      ]
    });
  }
  const decodedValue = decodedAdmission.value;
  const typedRefusal = isOneSurfaceTypedRefusal(decodedValue)
    ? decodedValue
    : null;
  if (
    typedRefusal !== null &&
    (!binding.evidenceRefs.includes(typedRefusal.refusalRef) ||
      typedRefusal.reasonRefs.some(
        (reasonRef) => !binding.evidenceRefs.includes(reasonRef)
      ))
  ) {
    return refused({
      status: "refused",
      diagnosticId: "one_surface_result_not_admitted",
      reason: "typed refusal authority is absent from the exact C-call enclosure",
      evidenceRefs: [binding.bindingRef, typedRefusal.refusalRef]
    });
  }
  if (
    (typedRefusal === null &&
      (binding.outcome !== "success" ||
        binding.judgment !== "advance" ||
        binding.reasonRef !== null)) ||
    (typedRefusal !== null &&
      (binding.outcome !== "refusal" ||
        binding.judgment !== typedRefusal.judgment ||
        binding.reasonRef !== typedRefusal.refusalRef))
  ) {
    return refused({
      status: "refused",
      diagnosticId: "one_surface_result_not_admitted",
      reason: "decoded result differs from admitted close truth",
      evidenceRefs: [binding.bindingRef, admittedOutput.projectionRef]
    });
  }
  const decodedValueDigest = stableSha256Digest(decodedValue);
  const result = constructAdmittedOneSurfaceAuthorityResult({
    functionKind: input.stageAuthority.functionKind,
    stageAuthorityRef: input.stageAuthority.authorityRef,
    stageAuthorityDigest: input.stageAuthority.authorityDigest,
    replayBindingRef: binding.bindingRef,
    replayBindingDigest: binding.bindingDigest,
    cCallRef: binding.cCallRef,
    inputDigest: binding.inputDigest,
    admittedOutput,
    targetCarrierValidationRef: candidate.validationRef,
    decodedValueDigest,
    decodedValue
  });
  assertAdmittedOneSurfaceAuthorityResult(result);
  return Object.freeze({
    kind: "one_surface_authority_result_projection",
    status: "admitted",
    result,
    diagnostic: null
  });
}
