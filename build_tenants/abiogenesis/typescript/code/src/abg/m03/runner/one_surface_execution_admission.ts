// Implements: T-270 AF-15 execution admission.
// This prepares the payload-independent AF-15 authority closure. ExecutionBasis
// admission remains blocked until neutral invocation/binding authority content
// reaches M03. The witness is subordinate and never authorizes effects.

import type {
  StartInputAssetBinding,
  StartIntent
} from "../contracts/carriers.js";
import type { InferOutput } from "valibot";
import {
  assertNextActionProjection,
  type NextActionProjection
} from "../contracts/one_surface_authority.js";
import {
  assertProgramExecutionAuthoritySet,
  compileProgramExecutionAuthoritySet,
  ProgramExecutionAuthorityCompileError,
  type ProgramExecutionAuthoritySet
} from "../contracts/one_surface_execution_authority.js";
import {
  RUN_INVOKE_NATIVE_CONTRACT_SOURCES
} from "../contracts/one_surface_operation_contracts.js";
import {
  assertOneSurfaceAuthorityProgramBinding,
  type OneSurfaceAuthorityProgramBinding
} from "../contracts/one_surface_program_compiler.js";
import {
  deriveRegistrySessionView,
  type AdmittedRuntimeCatalogBasis,
  type CatalogExecutionBinding
} from "../contracts/runtime_catalog.js";
import type { AdmittedTenantConformanceManifest } from
  "../../../shared/abg_library/tenant_conformance_manifest.js";
import {
  stableJsonEquals,
  stableSha256Digest,
  type IJsonValue
} from "../../../shared/runtime_identity.js";
import {
  assertOneSurfaceConstructionIntentAdmission,
  type OneSurfaceConstructionIntentAdmission
} from "./one_surface_semantic_admission.js";

export type T270ExecutionAdmissionRefusalCode =
  InferOutput<
    typeof RUN_INVOKE_NATIVE_CONTRACT_SOURCES.start.refusal.schema
  >["code"];

const T270_RUNTIME_AUTHORITY_PROJECTION_GAP =
  "gap://abg/t270/admitted-runtime-authority-projection";
const T270_LOCUS_PAYLOAD_VALUE_PROJECTION_GAP =
  "gap://abg/t270/admitted-locus-payload-value-projection";

const T270_START_ADMISSION_WITNESS = Symbol(
  "T270_START_ADMISSION_WITNESS"
);

export interface T270StartAdmissionWitness {
  readonly [T270_START_ADMISSION_WITNESS]: true;
  readonly kind: "t270_start_admission_witness";
  readonly status: "admitted";
  readonly effectsPermitted: false;
  readonly witnessRef: string;
  readonly witnessDigest: `sha256:${string}`;
  readonly admittedProgramRef: string;
  readonly admittedProgramDigest: string;
  readonly af15SlotRef: string;
  readonly af15SlotDigest: `sha256:${string}`;
  readonly nextActionRef: string;
  readonly nextActionDigest: `sha256:${string}`;
  readonly constructionIntentAdmissionRef: string;
  readonly constructionIntentAdmissionDigest: `sha256:${string}`;
  readonly constructionIntentRef: string;
  readonly selectedActionRef: string;
  readonly catalogViewRef: string;
  readonly catalogViewDigest: `sha256:${string}`;
  readonly workspaceBindingRef: string;
  readonly workspaceBindingDigest: string;
  readonly invocationAuthorityRef: string;
  readonly invocationAuthorityDigest: string;
  readonly selectedCatalogEntryRef: string;
  readonly selectedGraphFunctionRef: string;
  readonly selectedGraphFunctionDigest: `sha256:${string}`;
  readonly startIntentDigest: `sha256:${string}`;
  readonly inputBindingsDigest: `sha256:${string}`;
  readonly inputValueDigest: `sha256:${string}`;
  readonly authoritySetRef: string;
  readonly authoritySetDigest: `sha256:${string}`;
  readonly orderedTraversalAdmissionRefs: readonly string[];
  readonly orderedTraversalAdmissionDigests: readonly `sha256:${string}`[];
}

export interface T270ExecutionAdmissionRefused {
  readonly kind: "t270_execution_admission_refused";
  readonly status: "refused";
  readonly effectsPermitted: false;
  readonly code: T270ExecutionAdmissionRefusalCode;
  readonly message: string;
  readonly residualRefs: readonly string[];
}

export type T270ExecutionAdmissionResult = T270ExecutionAdmissionRefused;

export interface AdmitOneSurfaceExecutionInput {
  readonly program: OneSurfaceAuthorityProgramBinding;
  readonly nextAction: NextActionProjection;
  readonly intentAdmission: OneSurfaceConstructionIntentAdmission;
  readonly catalogBasis: AdmittedRuntimeCatalogBasis;
  readonly allowedEntryRefs: readonly string[];
  readonly executionBinding: CatalogExecutionBinding;
  readonly startIntent: StartIntent;
  readonly inputBindings: readonly StartInputAssetBinding[];
  readonly inputValue: IJsonValue;
  readonly admittedTenantConformanceManifest:
    | AdmittedTenantConformanceManifest
    | null;
}

function refusal(
  code: T270ExecutionAdmissionRefusalCode,
  message: string,
  residualRefs: readonly string[] = []
): T270ExecutionAdmissionRefused {
  const normalizedResiduals = Object.freeze([...new Set(residualRefs)].sort());
  return Object.freeze({
    kind: "t270_execution_admission_refused",
    status: "refused",
    effectsPermitted: false,
    code,
    message,
    residualRefs: normalizedResiduals
  });
}

function exactExecutionBinding(input: {
  readonly basis: AdmittedRuntimeCatalogBasis;
  readonly candidate: CatalogExecutionBinding;
}): CatalogExecutionBinding | null {
  const matches = input.basis.executionBindings.filter(
    (binding) =>
      binding.entryRef === input.candidate.entryRef &&
      stableJsonEquals(binding, input.candidate)
  );
  return matches.length === 1 ? matches[0] ?? null : null;
}

function orderedTraversalAdmissionIdentity(
  authoritySet: ProgramExecutionAuthoritySet
): Readonly<{
  refs: readonly string[];
  digests: readonly `sha256:${string}`[];
}> {
  const admissions = authoritySet.subjects.flatMap((subject) =>
    subject.vectors.map((vector) => vector.admission)
  );
  return Object.freeze({
    refs: Object.freeze(admissions.map((admission) => admission.admissionRef)),
    digests: Object.freeze(
      admissions.map((admission) => admission.admissionDigest)
    )
  });
}

function witnessBasis(input: Omit<
  T270StartAdmissionWitness,
  | typeof T270_START_ADMISSION_WITNESS
  | "kind"
  | "status"
  | "effectsPermitted"
  | "witnessRef"
  | "witnessDigest"
>) {
  return Object.freeze({
    ...input,
    orderedTraversalAdmissionRefs: Object.freeze([
      ...input.orderedTraversalAdmissionRefs
    ]),
    orderedTraversalAdmissionDigests: Object.freeze([
      ...input.orderedTraversalAdmissionDigests
    ])
  });
}

function sealT270StartAdmissionWitness(input: Omit<
  T270StartAdmissionWitness,
  | typeof T270_START_ADMISSION_WITNESS
  | "kind"
  | "status"
  | "effectsPermitted"
  | "witnessRef"
  | "witnessDigest"
>): T270StartAdmissionWitness {
  const basis = witnessBasis(input);
  const witnessDigest = stableSha256Digest(basis);
  return Object.freeze({
    [T270_START_ADMISSION_WITNESS]: true as const,
    kind: "t270_start_admission_witness" as const,
    status: "admitted" as const,
    effectsPermitted: false as const,
    witnessRef:
      `abg://one-surface/af15/start/${witnessDigest.slice("sha256:".length)}`,
    witnessDigest,
    ...basis
  });
}

export function assertT270StartAdmissionWitness(
  witness: T270StartAdmissionWitness
): void {
  const expected = sealT270StartAdmissionWitness({
    admittedProgramRef: witness.admittedProgramRef,
    admittedProgramDigest: witness.admittedProgramDigest,
    af15SlotRef: witness.af15SlotRef,
    af15SlotDigest: witness.af15SlotDigest,
    nextActionRef: witness.nextActionRef,
    nextActionDigest: witness.nextActionDigest,
    constructionIntentAdmissionRef: witness.constructionIntentAdmissionRef,
    constructionIntentAdmissionDigest:
      witness.constructionIntentAdmissionDigest,
    constructionIntentRef: witness.constructionIntentRef,
    selectedActionRef: witness.selectedActionRef,
    catalogViewRef: witness.catalogViewRef,
    catalogViewDigest: witness.catalogViewDigest,
    workspaceBindingRef: witness.workspaceBindingRef,
    workspaceBindingDigest: witness.workspaceBindingDigest,
    invocationAuthorityRef: witness.invocationAuthorityRef,
    invocationAuthorityDigest: witness.invocationAuthorityDigest,
    selectedCatalogEntryRef: witness.selectedCatalogEntryRef,
    selectedGraphFunctionRef: witness.selectedGraphFunctionRef,
    selectedGraphFunctionDigest: witness.selectedGraphFunctionDigest,
    startIntentDigest: witness.startIntentDigest,
    inputBindingsDigest: witness.inputBindingsDigest,
    inputValueDigest: witness.inputValueDigest,
    authoritySetRef: witness.authoritySetRef,
    authoritySetDigest: witness.authoritySetDigest,
    orderedTraversalAdmissionRefs: witness.orderedTraversalAdmissionRefs,
    orderedTraversalAdmissionDigests: witness.orderedTraversalAdmissionDigests
  });
  if (
    witness[T270_START_ADMISSION_WITNESS] !== true ||
    !stableJsonEquals(witness, expected)
  ) {
    throw new TypeError("T270StartAdmissionWitness seal differs");
  }
}

export function admitOneSurfaceExecution(
  input: AdmitOneSurfaceExecutionInput
): T270ExecutionAdmissionResult {
  try {
    assertOneSurfaceAuthorityProgramBinding(input.program);
    assertNextActionProjection(input.nextAction);
    assertOneSurfaceConstructionIntentAdmission(input.intentAdmission);
  } catch (error: unknown) {
    return refusal(
      "program_invalid",
      error instanceof Error ? error.message : String(error)
    );
  }

  const admittedIntent =
    input.intentAdmission.constructionIntentAdmission.admittedIntent;
  if (admittedIntent === null) {
    return refusal("intent_missing", "AF-14 has no admitted construction intent");
  }
  if (
    input.intentAdmission.program.ref !== input.program.admittedProgramRef ||
    input.intentAdmission.program.digest !== input.program.admittedProgramDigest ||
    input.nextAction.admittedProgram.ref !== input.program.admittedProgramRef ||
    input.nextAction.admittedProgram.digest !== input.program.admittedProgramDigest
  ) {
    return refusal(
      "program_invalid",
      "AF-13 and AF-14 must bind the exact admitted One Surface program"
    );
  }
  if (
    input.intentAdmission.nextAction.ref !== input.nextAction.projectionRef ||
    input.intentAdmission.nextAction.digest !== input.nextAction.projectionDigest ||
    input.nextAction.disposition.actionRef === null ||
    input.nextAction.disposition.actionRef !== admittedIntent.selectedActionRef ||
    input.nextAction.selectedBindingRef !== admittedIntent.selectedBindingRef ||
    input.nextAction.selectedOutcomeRef !== admittedIntent.selectedOutcomeRef
  ) {
    return refusal(
      "next_action_mismatch",
      "AF-14 intent differs from the admitted AF-13 action"
    );
  }
  if (
    admittedIntent.selectedGraphFunctionRef === null ||
    input.nextAction.disposition.variant !== "callable_member_action"
  ) {
    return refusal(
      "function_nonmember",
      "AF-15 requires one callable program-owned GraphFunction action"
    );
  }

  const viewResult = deriveRegistrySessionView({
    basis: input.catalogBasis,
    allowedEntryRefs: input.allowedEntryRefs
  });
  if (!viewResult.accepted || viewResult.view === null) {
    return refusal(
      "outside_view",
      "current catalog truth cannot derive the admitted narrowing view",
      viewResult.residuals.map(
        (row) => `catalog_view:${row.reason}:${row.entryRef}`
      )
    );
  }
  const currentViewDigest = stableSha256Digest(viewResult.view);
  if (
    input.intentAdmission.catalogView.ref !== viewResult.view.sessionViewRef ||
    input.intentAdmission.catalogView.digest !== currentViewDigest ||
    input.nextAction.catalogView.ref !== viewResult.view.sessionViewRef ||
    input.nextAction.catalogView.digest !== currentViewDigest
  ) {
    return refusal(
      "outside_view",
      "AF-13 or AF-14 catalog view differs from current narrowing truth"
    );
  }

  const executionBinding = exactExecutionBinding({
    basis: input.catalogBasis,
    candidate: input.executionBinding
  });
  if (executionBinding === null) {
    return refusal(
      "function_nonmember",
      "selected execution binding is not one exact member of the admitted catalog basis"
    );
  }
  const visibleEntries = viewResult.view.entries.filter(
    (entry) =>
      entry.kind === "registry_session_graph_function_entry" &&
      entry.entryRef === executionBinding.entryRef &&
      entry.graphFunctionRef === admittedIntent.selectedGraphFunctionRef
  );
  const visibleEntry = visibleEntries[0];
  if (visibleEntries.length !== 1 || visibleEntry === undefined) {
    return refusal(
      "outside_view",
      "selected GraphFunction is not retained exactly once by the current catalog view"
    );
  }
  if (!visibleEntry.callable || !visibleEntry.ready) {
    return refusal("noncallable", "selected catalog member is not callable and ready");
  }
  if (
    executionBinding.graphFunctionId !== admittedIntent.selectedGraphFunctionRef ||
    executionBinding.graphFunctionId !== executionBinding.graphFunction.id ||
    executionBinding.graphFunctionDigest !==
      stableSha256Digest(executionBinding.graphFunction) ||
    executionBinding.moduleDigest !== stableSha256Digest(executionBinding.module)
  ) {
    return refusal(
      "function_nonmember",
      "selected GraphFunction or Module identity differs from admitted catalog truth"
    );
  }

  const startInputBindings = input.startIntent.inputBindings ?? [];
  if (
    input.startIntent.scope.kind !== "workspace" ||
    input.startIntent.scope.workspaceRoot.length === 0 ||
    input.startIntent.scope.moduleName !== executionBinding.moduleName ||
    input.startIntent.target.kind !== "graph_function" ||
    input.startIntent.target.handle !== executionBinding.graphFunctionHandle
  ) {
    return refusal(
      "target_invalid",
      "start scope and target must match the admitted catalog execution binding"
    );
  }
  if (
    input.startIntent.until !== "first_traversal" &&
    input.startIntent.until !== "blocked" &&
    input.startIntent.until !== "converged"
  ) {
    return refusal("until_invalid", "start until value is not admitted");
  }
  const selectedInputRefs = input.inputBindings.map(
    (binding) => binding.assetRef
  );
  if (
    !stableJsonEquals(startInputBindings, input.inputBindings) ||
    input.inputBindings.length !== executionBinding.graphFunction.inputs.length ||
    new Set(selectedInputRefs).size !== selectedInputRefs.length ||
    !stableJsonEquals(
      [...selectedInputRefs].sort(),
      [...admittedIntent.inputAssetRefs].sort()
    )
  ) {
    return refusal(
      "input_invalid",
      "start input binding differs from the admitted construction intent"
    );
  }

  let authoritySet: ProgramExecutionAuthoritySet;
  try {
    authoritySet = compileProgramExecutionAuthoritySet({
      basis: input.catalogBasis,
      executionBinding,
      admittedTenantConformanceManifest:
        input.admittedTenantConformanceManifest
    });
    assertProgramExecutionAuthoritySet(authoritySet);
  } catch (error: unknown) {
    return refusal(
      error instanceof ProgramExecutionAuthorityCompileError
        ? error.code
        : "runtime_failed",
      error instanceof Error ? error.message : String(error),
      error instanceof ProgramExecutionAuthorityCompileError
        ? error.diagnosticRefs
        : []
    );
  }

  const traversalAdmissions = orderedTraversalAdmissionIdentity(authoritySet);
  const witness = sealT270StartAdmissionWitness({
    admittedProgramRef: input.program.admittedProgramRef,
    admittedProgramDigest: input.program.admittedProgramDigest,
    af15SlotRef: input.program.af15Slot.constructionIntentInputJoinRef,
    af15SlotDigest: input.program.af15Slot.constructionIntentInputJoinDigest,
    nextActionRef: input.nextAction.projectionRef,
    nextActionDigest: input.nextAction.projectionDigest,
    constructionIntentAdmissionRef: input.intentAdmission.admissionRef,
    constructionIntentAdmissionDigest: input.intentAdmission.admissionDigest,
    constructionIntentRef: admittedIntent.intentId,
    selectedActionRef: admittedIntent.selectedActionRef,
    catalogViewRef: viewResult.view.sessionViewRef,
    catalogViewDigest: currentViewDigest,
    workspaceBindingRef: input.intentAdmission.workspaceBinding.ref,
    workspaceBindingDigest: input.intentAdmission.workspaceBinding.digest,
    invocationAuthorityRef: input.intentAdmission.invocationAuthority.ref,
    invocationAuthorityDigest: input.intentAdmission.invocationAuthority.digest,
    selectedCatalogEntryRef: executionBinding.entryRef,
    selectedGraphFunctionRef: executionBinding.graphFunctionId,
    selectedGraphFunctionDigest: stableSha256Digest(
      executionBinding.graphFunction
    ),
    startIntentDigest: stableSha256Digest(input.startIntent),
    inputBindingsDigest: stableSha256Digest(input.inputBindings),
    inputValueDigest: stableSha256Digest(input.inputValue),
    authoritySetRef: authoritySet.authoritySetRef,
    authoritySetDigest: authoritySet.authoritySetDigest,
    orderedTraversalAdmissionRefs: traversalAdmissions.refs,
    orderedTraversalAdmissionDigests: traversalAdmissions.digests
  });
  assertT270StartAdmissionWitness(witness);

  return refusal(
    "runtime_failed",
    "semantic_not_realized: AF-15 requires neutral admitted runtime-authority content and per-locus admitted payload values before ExecutionBasis or atom invocation",
    [
      T270_RUNTIME_AUTHORITY_PROJECTION_GAP,
      T270_LOCUS_PAYLOAD_VALUE_PROJECTION_GAP,
      witness.witnessRef,
      witness.witnessDigest
    ]
  );
}
