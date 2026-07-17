// Private T-281 P1 composition of project.read owner projections and relations.

import * as v from "valibot";

import {
  CATALOG_OPERATION_NATIVE_CHECK_REGISTRY,
  CATALOG_OPERATION_NATIVE_CONTRACT_SOURCES,
  CATALOG_OPERATION_PROJECT_READ_RELATION_SOURCES
} from "../../../abg/m03/contracts/catalog_operation_contracts.js";
import {
  CONSENSUS_NATIVE_CHECK_REGISTRY,
  CONSENSUS_PROJECT_READ_RELATION_SOURCES,
  CONSENSUS_PUBLIC_CONTRACT_SOURCES
} from "../../../abg/m03/contracts/consensus_contract_family.js";
import {
  OBSERVER_PROJECT_READ_NATIVE_CHECK_REGISTRY,
  OBSERVER_PROJECT_READ_NATIVE_CONTRACT_SOURCES,
  OBSERVER_PROJECT_READ_RELATION_SOURCES
} from "../../../abg/m03/contracts/observer_operation_contracts.js";
import {
  ONE_SURFACE_NATIVE_CONTRACT_SOURCES,
  ONE_SURFACE_OPERATION_NATIVE_CHECK_REGISTRY,
  ONE_SURFACE_PROJECT_READ_RELATION_SOURCES
} from "../../../abg/m03/contracts/one_surface_operation_contracts.js";
import {
  RUNTIME_AUTHORING_OPERATION_NATIVE_CHECK_REGISTRY,
  RUNTIME_AUTHORING_OPERATION_NATIVE_CONTRACT_SOURCES,
  RUNTIME_AUTHORING_OPERATION_PROJECT_READ_RELATION_SOURCES
} from "../../../abg/m03/contracts/runtime_authoring_operation_contracts.js";
import {
  RUNTIME_PROJECTION_NATIVE_CHECK_REGISTRY,
  RUNTIME_PROJECTION_NATIVE_CONTRACT_SOURCES,
  RUNTIME_PROJECTION_PROJECT_READ_RELATION_SOURCES
} from "../../../abg/m03/contracts/runtime_projection_operation_contracts.js";
import {
  TUNER_PROJECT_READ_NATIVE_CHECK_REGISTRY,
  TUNER_PROJECT_READ_NATIVE_CONTRACT_SOURCES,
  TUNER_PROJECT_READ_RELATION_SOURCES
} from "../../../abg/m03/contracts/tuner_operation_contracts.js";
import {
  stableJson,
  stableJsonEquals
} from "../../../shared/runtime_identity.js";
import {
  resolveSemanticBuildNativeSchemaSource,
  resolveSemanticBuildOwnerProjectionRelation,
  type OwnerNativeContractSourceRow
} from "../../../shared/validation/canonical_native_schema_projector.js";
import { freezeNativeValue } from "../../../shared/validation/immutable_native_value.js";
import type { NativeNamedCheckRegistry } from "../../../shared/validation/native_named_check_registry.js";
import {
  refSchema,
  sha256DigestSchema
} from "../../../shared/validation/native_contract_primitives.js";
import type {
  OwnerNativeDefinitionContractSource,
  OwnerNativeOperationContractSlot,
  OwnerNativeProjectReadCaseDefinitionKey,
  OwnerNativeSemanticOwner,
  OwnerProjectionRelationSource
} from "../../../shared/validation/owner_native_operation_contract_source.js";
import {
  EXACT_CANDIDATE_QUALIFICATION_NATIVE_CHECK_REGISTRY,
  RELEASE_OPERATION_NATIVE_CONTRACT_SOURCES,
  RELEASE_OPERATION_PROJECT_READ_RELATION_SOURCES
} from "../../../qualification/m05/exact_candidate_release_operation_contracts.js";
import {
  GAPS_PROJECT_READ_NATIVE_CHECK_REGISTRY,
  GAPS_PROJECT_READ_NATIVE_CONTRACT_SOURCES,
  GAPS_PROJECT_READ_RELATION_SOURCES
} from "../gaps/operation_contracts.js";
import {
  PRODUCT_INTAKE_NATIVE_CHECK_REGISTRY,
  PRODUCT_INTAKE_NATIVE_CONTRACT_SOURCES,
  PRODUCT_INTAKE_PROJECT_READ_RELATION_SOURCES
} from "../product_intake/operation_contracts.js";
import {
  RESULT_ASSESSMENT_NATIVE_CHECK_REGISTRY,
  RESULT_ASSESSMENT_NATIVE_CONTRACT_SOURCES,
  RESULT_ASSESSMENT_PROJECT_READ_RELATION_SOURCES
} from "../result_assessment/operation_contracts.js";
import {
  WORKSPACE_NATIVE_CHECK_REGISTRY,
  WORKSPACE_NATIVE_CONTRACT_SOURCES,
  WORKSPACE_PROJECT_READ_RELATION_SOURCES
} from "../workspace/operation_contracts.js";
import { defineNativeContract } from "./native_contract_phase_a.js";
import {
  PROJECT_READ_OPERATION_NATIVE_CONTRACT_SOURCES,
  type ProjectReadCase
} from "./project_read_operation_contracts.js";

type NativeSchema = v.GenericSchema;
type Sha256Digest = `sha256:${string}`;
type ProjectReadKey<C extends ProjectReadCase> =
  OwnerNativeProjectReadCaseDefinitionKey<C>;
type ProjectReadOwnerSource<
  S extends NativeSchema,
  C extends ProjectReadCase,
  Slot extends OwnerNativeOperationContractSlot
> = OwnerNativeDefinitionContractSource<
  S,
  OwnerNativeSemanticOwner,
  ProjectReadKey<C>,
  Slot
>;

const MODULE_PATH =
  "code/src/app/m04/public_contracts/project_read_case_family.js" as const;
const EXPORT_NAME = "PROJECT_READ_CASE_FAMILY" as const;
const REGISTRY_EXPORT_NAME =
  "PROJECT_READ_CASE_FAMILY_NATIVE_CHECK_REGISTRY" as const;
/** @internal */
export const P1_CONTRACT_SHAPE_BASIS = freezeNativeValue({
  ref: "design://abg/m04/public-operation-definition-family",
  digest:
    "sha256:18d9bcc559d973daac355ad768b1cf5eb8ffb7f9dcd3cd6d2c60c95e5bea1801"
} as const);
const PROJECT_READ_WRAPPER_BASIS = freezeNativeValue({
  ref: "specification/requirements/abg/REQ-R-ABG3-PROJECTION.md#REQ-R-ABG3-PROJECTION-023",
  digest:
    "sha256:ea67216190dc59dd14eac9797ab544ee79d9798673a82925d2d8bcddb2a2dfb5"
} as const);
const CONSENSUS_PROJECTION_OWNER_BASIS = freezeNativeValue({
  ref: "specification/requirements/product/REQ-P-CONSENSUS.md#REQ-P-CONSENSUS-004/-008A/-012",
  digest:
    "sha256:d6e92b75cd52fb9f2063d0a6ff99d36a7617a52c997ff165236cb2571c9fd36d"
} as const);

const refDigestSchema = v.pipe(
  v.strictObject({ ref: refSchema, digest: sha256DigestSchema }),
  v.readonly()
);
const PROJECT_READ_BASIS_REF_ACTION = Object.freeze(
  v.check(
    (coordinate: v.InferOutput<typeof refDigestSchema>) =>
      coordinate.ref === `project-read-basis:${coordinate.digest}`,
    "project.read projection-basis ref must derive from its digest"
  )
);

const OWNER_NAMED_CHECK_REGISTRIES = Object.freeze([
  CATALOG_OPERATION_NATIVE_CHECK_REGISTRY,
  WORKSPACE_NATIVE_CHECK_REGISTRY,
  RUNTIME_PROJECTION_NATIVE_CHECK_REGISTRY,
  RESULT_ASSESSMENT_NATIVE_CHECK_REGISTRY,
  RUNTIME_AUTHORING_OPERATION_NATIVE_CHECK_REGISTRY,
  PRODUCT_INTAKE_NATIVE_CHECK_REGISTRY,
  EXACT_CANDIDATE_QUALIFICATION_NATIVE_CHECK_REGISTRY,
  GAPS_PROJECT_READ_NATIVE_CHECK_REGISTRY,
  ONE_SURFACE_OPERATION_NATIVE_CHECK_REGISTRY,
  OBSERVER_PROJECT_READ_NATIVE_CHECK_REGISTRY,
  TUNER_PROJECT_READ_NATIVE_CHECK_REGISTRY,
  CONSENSUS_NATIVE_CHECK_REGISTRY
]);

function projectReadNamedCheckRegistry(): NativeNamedCheckRegistry {
  const actions = new Map<object, string | null>();
  const checks: {
    checkId: string;
    action: unknown;
    relationRef: string | null;
  }[] = [{
    checkId: "projection-basis-ref-derived",
    action: PROJECT_READ_BASIS_REF_ACTION,
    relationRef: "REQ-R-ABG3-PROJECTION-023"
  }];
  actions.set(PROJECT_READ_BASIS_REF_ACTION, "REQ-R-ABG3-PROJECTION-023");
  let index = 0;
  for (const registry of OWNER_NAMED_CHECK_REGISTRIES) {
    for (const check of registry.checks) {
      if (typeof check.action !== "object" || check.action === null) {
        throw new TypeError("project.read registry: invalid owner action");
      }
      const prior = actions.get(check.action);
      if (prior !== undefined) {
        if (prior !== check.relationRef) {
          throw new TypeError("project.read registry: divergent relation ref");
        }
        continue;
      }
      checks.push({
        checkId: `owner-${String(index).padStart(2, "0")}-${check.checkId}`,
        action: check.action,
        relationRef: check.relationRef
      });
      actions.set(check.action, check.relationRef);
      index += 1;
    }
  }
  return freezeNativeValue({
    familyRef: "native-check://abg/m04/project-read-case-family",
    checks
  });
}

/** @internal */
export const PROJECT_READ_CASE_FAMILY_NATIVE_CHECK_REGISTRY =
  projectReadNamedCheckRegistry();

function projectReadKey<const C extends ProjectReadCase>(
  caseKey: C
): ProjectReadKey<C> {
  return freezeNativeValue({
    operationId: "abg.operation.project.read",
    memberKind: "project_read_case",
    caseKey
  });
}

function contractIdentity(
  caseKey: ProjectReadCase,
  slot: "request" | "result" | "refusal"
) {
  const suffix = `project.read.${caseKey}.${slot}`;
  return freezeNativeValue({
    contractId: `abg.contract.operation.${suffix}`,
    contractVersion: "5.0.0" as const,
    schemaId: `abg.schema.operation.${suffix}`,
    schemaVersion: "5.0.0" as const
  });
}

function projectionIdentity(caseKey: ProjectReadCase) {
  return freezeNativeValue({
    contractId: `abg.contract.projection.project.read.${caseKey}`,
    contractVersion: "5.0.0" as const,
    schemaId: `abg.schema.projection.project.read.${caseKey}`,
    schemaVersion: "5.0.0" as const
  });
}

function structuralSlot<
  const C extends ProjectReadCase,
  const Slot extends "request" | "refusal",
  const S extends NativeSchema
>(caseKey: C, slot: Slot, source: ProjectReadOwnerSource<S, C, Slot>) {
  const subject = source.authority.subject;
  if (
    subject.operationId !== "abg.operation.project.read" ||
    subject.memberKind !== "project_read_case" ||
    subject.caseKey !== caseKey ||
    subject.slot !== slot ||
    !stableJsonEquals(source.identity, contractIdentity(caseKey, slot))
  ) {
    throw new TypeError(`project.read family: invalid ${caseKey}.${slot} source`);
  }
  return freezeNativeValue({
    kind: "project_read_structural_slot_source" as const,
    coordinate: { definitionKey: projectReadKey(caseKey), slot },
    ownerAuthorityRef: source.authority.semanticOwnerBasis.ref,
    ownerAuthorityDigest: source.authority.semanticOwnerBasis.digest,
    identity: source.identity,
    source
  });
}

interface ProjectionInput<
  C extends ProjectReadCase,
  Projection extends NativeSchema,
  RelationRequest
> {
  readonly coordinate: {
    readonly definitionKey: ProjectReadKey<C>;
    readonly slot: "result_projection";
  };
  readonly ownerAuthorityRef: string;
  readonly ownerAuthorityDigest: Sha256Digest;
  readonly source: OwnerNativeContractSourceRow<Projection>;
  readonly relationSource: OwnerProjectionRelationSource<
    ProjectReadKey<C>,
    RelationRequest,
    v.InferOutput<Projection>
  >;
}

function projectionInput<
  const C extends ProjectReadCase,
  const Projection extends NativeSchema,
  RelationRequest
>(input: {
  readonly caseKey: C;
  readonly ownerAuthorityRef: string;
  readonly ownerAuthorityDigest: Sha256Digest;
  readonly source: OwnerNativeContractSourceRow<Projection>;
  readonly relationSource: OwnerProjectionRelationSource<
    ProjectReadKey<C>,
    RelationRequest,
    v.InferOutput<Projection>
  >;
}): ProjectionInput<C, Projection, RelationRequest> {
  const key = projectReadKey(input.caseKey);
  if (
    !stableJsonEquals(input.relationSource.definitionKey, key) ||
    input.relationSource.semanticOwnerBasis.ref !== input.ownerAuthorityRef ||
    input.relationSource.semanticOwnerBasis.digest !== input.ownerAuthorityDigest ||
    input.relationSource.sourceLocator.modulePath !==
      input.source.sourceLocator.modulePath
  ) {
    throw new TypeError(`project.read family: invalid ${input.caseKey} projection relation`);
  }
  return freezeNativeValue({
    coordinate: { definitionKey: key, slot: "result_projection" as const },
    ownerAuthorityRef: input.ownerAuthorityRef,
    ownerAuthorityDigest: input.ownerAuthorityDigest,
    source: input.source,
    relationSource: input.relationSource
  });
}

function ownerProjection<
  const C extends Exclude<ProjectReadCase, "ticket_consensus">,
  const Projection extends NativeSchema,
  RelationRequest
>(
  caseKey: C,
  source: ProjectReadOwnerSource<Projection, C, "result">,
  relationSource: OwnerProjectionRelationSource<
    ProjectReadKey<C>,
    RelationRequest,
    v.InferOutput<Projection>
  >
) {
  const subject = source.authority.subject;
  if (subject.caseKey !== caseKey || subject.slot !== "result") {
    throw new TypeError(`project.read family: cross-case ${caseKey} projection`);
  }
  return projectionInput({
    caseKey,
    ownerAuthorityRef: source.authority.semanticOwnerBasis.ref,
    ownerAuthorityDigest: source.authority.semanticOwnerBasis.digest,
    source,
    relationSource
  });
}

function consensusProjection() {
  const source = CONSENSUS_PUBLIC_CONTRACT_SOURCES.ticket_consensus_projection;
  return projectionInput({
    caseKey: "ticket_consensus",
    ownerAuthorityRef: CONSENSUS_PROJECTION_OWNER_BASIS.ref,
    ownerAuthorityDigest: CONSENSUS_PROJECTION_OWNER_BASIS.digest,
    source,
    relationSource: CONSENSUS_PROJECT_READ_RELATION_SOURCES.ticket_consensus
  });
}

function projectReadCase<
  const C extends ProjectReadCase,
  const Request extends NativeSchema,
  const Projection extends NativeSchema,
  const Refusal extends NativeSchema
>(input: {
  readonly caseKey: C;
  readonly structuralSources: {
    readonly request: ProjectReadOwnerSource<Request, C, "request">;
    readonly refusal: ProjectReadOwnerSource<Refusal, C, "refusal">;
  };
  readonly projection: ProjectionInput<
    C,
    Projection,
    v.InferOutput<Request>
  >;
}) {
  const definitionKey = projectReadKey(input.caseKey);
  const resultSchema = v.pipe(
    v.strictObject({
      kind: v.literal("project_read_result"),
      caseKey: v.literal(input.caseKey),
      projectionBasis: v.pipe(refDigestSchema, PROJECT_READ_BASIS_REF_ACTION),
      projection: input.projection.source.schema
    }),
    v.readonly()
  );
  const resultSource = freezeNativeValue({
    sourceLocator: {
      kind: "private_source_module" as const,
      sourceRoot: "semantic_build" as const,
      modulePath: MODULE_PATH,
      exportName: EXPORT_NAME,
      memberPath: [input.caseKey, "result", "source", "schema"] as const
    },
    namedChecks: {
      kind: "family_registry" as const,
      exportName: REGISTRY_EXPORT_NAME,
      memberPath: [] as const
    },
    schema: resultSchema
  });
  return freezeNativeValue({
    definitionKey,
    request: structuralSlot(
      input.caseKey,
      "request",
      input.structuralSources.request
    ),
    result: {
      kind: "project_read_wrapped_result_source" as const,
      coordinate: { definitionKey, slot: "result" as const },
      wrapperAuthorityRef: PROJECT_READ_WRAPPER_BASIS.ref,
      wrapperAuthorityDigest: PROJECT_READ_WRAPPER_BASIS.digest,
      identity: contractIdentity(input.caseKey, "result"),
      projection: input.projection,
      source: resultSource
    },
    refusal: structuralSlot(
      input.caseKey,
      "refusal",
      input.structuralSources.refusal
    ),
    nonterminal: {
      kind: "nonterminal_not_declared" as const,
      coordinate: { definitionKey, slot: "nonterminal" as const }
    }
  });
}

type ProjectReadCaseSourceRow<
  C extends ProjectReadCase,
  Request extends NativeSchema,
  Projection extends NativeSchema,
  Refusal extends NativeSchema
> = ReturnType<
  typeof projectReadCase<C, Request, Projection, Refusal>
>;

/** @internal */
export const PROJECT_READ_CASE_FAMILY = freezeNativeValue({
  catalog_list: projectReadCase({
    caseKey: "catalog_list",
    structuralSources: PROJECT_READ_OPERATION_NATIVE_CONTRACT_SOURCES.catalog_list,
    projection: ownerProjection(
      "catalog_list",
      CATALOG_OPERATION_NATIVE_CONTRACT_SOURCES.project_read.catalog_list.result,
      CATALOG_OPERATION_PROJECT_READ_RELATION_SOURCES.catalog_list
    )
  }),
  catalog_describe: projectReadCase({
    caseKey: "catalog_describe",
    structuralSources: PROJECT_READ_OPERATION_NATIVE_CONTRACT_SOURCES.catalog_describe,
    projection: ownerProjection(
      "catalog_describe",
      CATALOG_OPERATION_NATIVE_CONTRACT_SOURCES.project_read.catalog_describe.result,
      CATALOG_OPERATION_PROJECT_READ_RELATION_SOURCES.catalog_describe
    )
  }),
  workspace_status: projectReadCase({
    caseKey: "workspace_status",
    structuralSources: PROJECT_READ_OPERATION_NATIVE_CONTRACT_SOURCES.workspace_status,
    projection: ownerProjection(
      "workspace_status",
      WORKSPACE_NATIVE_CONTRACT_SOURCES.project_read.workspace_status.result,
      WORKSPACE_PROJECT_READ_RELATION_SOURCES.workspace_status
    )
  }),
  run_status: projectReadCase({
    caseKey: "run_status",
    structuralSources: PROJECT_READ_OPERATION_NATIVE_CONTRACT_SOURCES.run_status,
    projection: ownerProjection("run_status", RUNTIME_PROJECTION_NATIVE_CONTRACT_SOURCES.project_read.run_status.result, RUNTIME_PROJECTION_PROJECT_READ_RELATION_SOURCES.run_status)
  }),
  graph_call_status: projectReadCase({
    caseKey: "graph_call_status",
    structuralSources: PROJECT_READ_OPERATION_NATIVE_CONTRACT_SOURCES.graph_call_status,
    projection: ownerProjection("graph_call_status", RUNTIME_PROJECTION_NATIVE_CONTRACT_SOURCES.project_read.graph_call_status.result, RUNTIME_PROJECTION_PROJECT_READ_RELATION_SOURCES.graph_call_status)
  }),
  run_result: projectReadCase({
    caseKey: "run_result",
    structuralSources: PROJECT_READ_OPERATION_NATIVE_CONTRACT_SOURCES.run_result,
    projection: ownerProjection("run_result", RUNTIME_PROJECTION_NATIVE_CONTRACT_SOURCES.project_read.run_result.result, RUNTIME_PROJECTION_PROJECT_READ_RELATION_SOURCES.run_result)
  }),
  graph_call_result: projectReadCase({
    caseKey: "graph_call_result",
    structuralSources: PROJECT_READ_OPERATION_NATIVE_CONTRACT_SOURCES.graph_call_result,
    projection: ownerProjection("graph_call_result", RUNTIME_PROJECTION_NATIVE_CONTRACT_SOURCES.project_read.graph_call_result.result, RUNTIME_PROJECTION_PROJECT_READ_RELATION_SOURCES.graph_call_result)
  }),
  run_evidence: projectReadCase({
    caseKey: "run_evidence",
    structuralSources: PROJECT_READ_OPERATION_NATIVE_CONTRACT_SOURCES.run_evidence,
    projection: ownerProjection("run_evidence", RUNTIME_PROJECTION_NATIVE_CONTRACT_SOURCES.project_read.run_evidence.result, RUNTIME_PROJECTION_PROJECT_READ_RELATION_SOURCES.run_evidence)
  }),
  graph_call_evidence: projectReadCase({
    caseKey: "graph_call_evidence",
    structuralSources: PROJECT_READ_OPERATION_NATIVE_CONTRACT_SOURCES.graph_call_evidence,
    projection: ownerProjection("graph_call_evidence", RUNTIME_PROJECTION_NATIVE_CONTRACT_SOURCES.project_read.graph_call_evidence.result, RUNTIME_PROJECTION_PROJECT_READ_RELATION_SOURCES.graph_call_evidence)
  }),
  result_evidence: projectReadCase({
    caseKey: "result_evidence",
    structuralSources: PROJECT_READ_OPERATION_NATIVE_CONTRACT_SOURCES.result_evidence,
    projection: ownerProjection("result_evidence", RUNTIME_PROJECTION_NATIVE_CONTRACT_SOURCES.project_read.result_evidence.result, RUNTIME_PROJECTION_PROJECT_READ_RELATION_SOURCES.result_evidence)
  }),
  assessment_evidence: projectReadCase({
    caseKey: "assessment_evidence",
    structuralSources: PROJECT_READ_OPERATION_NATIVE_CONTRACT_SOURCES.assessment_evidence,
    projection: ownerProjection("assessment_evidence", RESULT_ASSESSMENT_NATIVE_CONTRACT_SOURCES.project_read.assessment_evidence.result, RESULT_ASSESSMENT_PROJECT_READ_RELATION_SOURCES.assessment_evidence)
  }),
  witness_evidence: projectReadCase({
    caseKey: "witness_evidence",
    structuralSources: PROJECT_READ_OPERATION_NATIVE_CONTRACT_SOURCES.witness_evidence,
    projection: ownerProjection("witness_evidence", RUNTIME_AUTHORING_OPERATION_NATIVE_CONTRACT_SOURCES.project_read.witness_evidence.result, RUNTIME_AUTHORING_OPERATION_PROJECT_READ_RELATION_SOURCES.witness_evidence)
  }),
  install_evidence: projectReadCase({
    caseKey: "install_evidence",
    structuralSources: PROJECT_READ_OPERATION_NATIVE_CONTRACT_SOURCES.install_evidence,
    projection: ownerProjection("install_evidence", PRODUCT_INTAKE_NATIVE_CONTRACT_SOURCES.project_read.install_evidence.result, PRODUCT_INTAKE_PROJECT_READ_RELATION_SOURCES.install_evidence)
  }),
  release_evidence: projectReadCase({
    caseKey: "release_evidence",
    structuralSources: PROJECT_READ_OPERATION_NATIVE_CONTRACT_SOURCES.release_evidence,
    projection: ownerProjection("release_evidence", RELEASE_OPERATION_NATIVE_CONTRACT_SOURCES.project_read.release_evidence.result, RELEASE_OPERATION_PROJECT_READ_RELATION_SOURCES.release_evidence)
  }),
  workspace_replay: projectReadCase({
    caseKey: "workspace_replay",
    structuralSources: PROJECT_READ_OPERATION_NATIVE_CONTRACT_SOURCES.workspace_replay,
    projection: ownerProjection("workspace_replay", RUNTIME_PROJECTION_NATIVE_CONTRACT_SOURCES.project_read.workspace_replay.result, RUNTIME_PROJECTION_PROJECT_READ_RELATION_SOURCES.workspace_replay)
  }),
  run_replay: projectReadCase({
    caseKey: "run_replay",
    structuralSources: PROJECT_READ_OPERATION_NATIVE_CONTRACT_SOURCES.run_replay,
    projection: ownerProjection("run_replay", RUNTIME_PROJECTION_NATIVE_CONTRACT_SOURCES.project_read.run_replay.result, RUNTIME_PROJECTION_PROJECT_READ_RELATION_SOURCES.run_replay)
  }),
  graph_call_replay: projectReadCase({
    caseKey: "graph_call_replay",
    structuralSources: PROJECT_READ_OPERATION_NATIVE_CONTRACT_SOURCES.graph_call_replay,
    projection: ownerProjection("graph_call_replay", RUNTIME_PROJECTION_NATIVE_CONTRACT_SOURCES.project_read.graph_call_replay.result, RUNTIME_PROJECTION_PROJECT_READ_RELATION_SOURCES.graph_call_replay)
  }),
  interaction_replay: projectReadCase({
    caseKey: "interaction_replay",
    structuralSources: PROJECT_READ_OPERATION_NATIVE_CONTRACT_SOURCES.interaction_replay,
    projection: ownerProjection("interaction_replay", RUNTIME_PROJECTION_NATIVE_CONTRACT_SOURCES.project_read.interaction_replay.result, RUNTIME_PROJECTION_PROJECT_READ_RELATION_SOURCES.interaction_replay)
  }),
  continuation_replay: projectReadCase({
    caseKey: "continuation_replay",
    structuralSources: PROJECT_READ_OPERATION_NATIVE_CONTRACT_SOURCES.continuation_replay,
    projection: ownerProjection("continuation_replay", RUNTIME_PROJECTION_NATIVE_CONTRACT_SOURCES.project_read.continuation_replay.result, RUNTIME_PROJECTION_PROJECT_READ_RELATION_SOURCES.continuation_replay)
  }),
  c_call_replay: projectReadCase({
    caseKey: "c_call_replay",
    structuralSources: PROJECT_READ_OPERATION_NATIVE_CONTRACT_SOURCES.c_call_replay,
    projection: ownerProjection("c_call_replay", RUNTIME_PROJECTION_NATIVE_CONTRACT_SOURCES.project_read.c_call_replay.result, RUNTIME_PROJECTION_PROJECT_READ_RELATION_SOURCES.c_call_replay)
  }),
  workspace_gaps: projectReadCase({
    caseKey: "workspace_gaps",
    structuralSources: PROJECT_READ_OPERATION_NATIVE_CONTRACT_SOURCES.workspace_gaps,
    projection: ownerProjection("workspace_gaps", GAPS_PROJECT_READ_NATIVE_CONTRACT_SOURCES.project_read.workspace_gaps.result, GAPS_PROJECT_READ_RELATION_SOURCES.workspace_gaps)
  }),
  run_gaps: projectReadCase({
    caseKey: "run_gaps",
    structuralSources: PROJECT_READ_OPERATION_NATIVE_CONTRACT_SOURCES.run_gaps,
    projection: ownerProjection("run_gaps", GAPS_PROJECT_READ_NATIVE_CONTRACT_SOURCES.project_read.run_gaps.result, GAPS_PROJECT_READ_RELATION_SOURCES.run_gaps)
  }),
  run_lawful_actions: projectReadCase({
    caseKey: "run_lawful_actions",
    structuralSources: PROJECT_READ_OPERATION_NATIVE_CONTRACT_SOURCES.run_lawful_actions,
    projection: ownerProjection("run_lawful_actions", ONE_SURFACE_NATIVE_CONTRACT_SOURCES.project_read.run_lawful_actions.result, ONE_SURFACE_PROJECT_READ_RELATION_SOURCES.run_lawful_actions)
  }),
  observer_report: projectReadCase({
    caseKey: "observer_report",
    structuralSources: PROJECT_READ_OPERATION_NATIVE_CONTRACT_SOURCES.observer_report,
    projection: ownerProjection("observer_report", OBSERVER_PROJECT_READ_NATIVE_CONTRACT_SOURCES.project_read.observer_report.result, OBSERVER_PROJECT_READ_RELATION_SOURCES.observer_report)
  }),
  observer_drafts: projectReadCase({
    caseKey: "observer_drafts",
    structuralSources: PROJECT_READ_OPERATION_NATIVE_CONTRACT_SOURCES.observer_drafts,
    projection: ownerProjection("observer_drafts", OBSERVER_PROJECT_READ_NATIVE_CONTRACT_SOURCES.project_read.observer_drafts.result, OBSERVER_PROJECT_READ_RELATION_SOURCES.observer_drafts)
  }),
  tuning_report: projectReadCase({
    caseKey: "tuning_report",
    structuralSources: PROJECT_READ_OPERATION_NATIVE_CONTRACT_SOURCES.tuning_report,
    projection: ownerProjection("tuning_report", TUNER_PROJECT_READ_NATIVE_CONTRACT_SOURCES.project_read.tuning_report.result, TUNER_PROJECT_READ_RELATION_SOURCES.tuning_report)
  }),
  ticket_consensus: projectReadCase({
    caseKey: "ticket_consensus",
    structuralSources: PROJECT_READ_OPERATION_NATIVE_CONTRACT_SOURCES.ticket_consensus,
    projection: consensusProjection()
  })
} as const);

function exactOwnKeys(input: object, expected: readonly string[], label: string): void {
  const actual = Reflect.ownKeys(input);
  if (
    actual.length !== expected.length ||
    !expected.every((key) => actual.includes(key))
  ) {
    throw new TypeError(`${label}: expected exact keys ${expected.join(",")}`);
  }
}

function objectField(input: object, key: string, label: string): object {
  const value: unknown = Reflect.get(input, key);
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new TypeError(`${label}: expected object field ${key}`);
  }
  return value;
}

function fieldValue(input: object, key: string): unknown {
  const value: unknown = Reflect.get(input, key);
  return value;
}

/** @internal */
export function assertProjectReadCaseFamily(input: unknown): void {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    throw new TypeError("project.read family: expected object");
  }
  const expectedCases = Object.keys(PROJECT_READ_OPERATION_NATIVE_CONTRACT_SOURCES);
  exactOwnKeys(input, expectedCases, "project.read family");
  if (expectedCases.length !== 27) {
    throw new TypeError("project.read family: expected 27 cases");
  }
  const locators = new Set<string>();
  for (const caseKey of expectedCases) {
    const row = objectField(input, caseKey, "project.read family");
    exactOwnKeys(
      row,
      ["definitionKey", "request", "result", "refusal", "nonterminal"],
      `project.read.${caseKey}`
    );
    const definitionKey = objectField(row, "definitionKey", `project.read.${caseKey}`);
    const request = objectField(row, "request", `project.read.${caseKey}`);
    const result = objectField(row, "result", `project.read.${caseKey}`);
    const refusal = objectField(row, "refusal", `project.read.${caseKey}`);
    const nonterminal = objectField(row, "nonterminal", `project.read.${caseKey}`);
    if (
      fieldValue(definitionKey, "caseKey") !== caseKey ||
      fieldValue(
        objectField(request, "coordinate", `project.read.${caseKey}.request`),
        "slot"
      ) !== "request" ||
      fieldValue(
        objectField(result, "coordinate", `project.read.${caseKey}.result`),
        "slot"
      ) !== "result" ||
      fieldValue(
        objectField(refusal, "coordinate", `project.read.${caseKey}.refusal`),
        "slot"
      ) !== "refusal" ||
      fieldValue(nonterminal, "kind") !== "nonterminal_not_declared"
    ) {
      throw new TypeError(`project.read.${caseKey}: coordinate mismatch`);
    }
    const projection = objectField(result, "projection", `project.read.${caseKey}.result`);
    for (const locator of [
      fieldValue(
        objectField(request, "source", `project.read.${caseKey}.request`),
        "sourceLocator"
      ),
      fieldValue(
        objectField(projection, "source", `project.read.${caseKey}.projection`),
        "sourceLocator"
      ),
      fieldValue(
        objectField(
          projection,
          "relationSource",
          `project.read.${caseKey}.projection`
        ),
        "sourceLocator"
      ),
      fieldValue(
        objectField(result, "source", `project.read.${caseKey}.result`),
        "sourceLocator"
      ),
      fieldValue(
        objectField(refusal, "source", `project.read.${caseKey}.refusal`),
        "sourceLocator"
      )
    ]) {
      const identity = stableJson(locator);
      if (locators.has(identity)) {
        throw new TypeError(`project.read.${caseKey}: duplicate source locator`);
      }
      locators.add(identity);
    }
  }
  if (locators.size !== 135) {
    throw new TypeError("project.read family: expected 135 unique source coordinates");
  }
}

/** @internal */
export async function resolveProjectReadCaseRow<
  const C extends ProjectReadCase,
  Request extends NativeSchema,
  Projection extends NativeSchema,
  Refusal extends NativeSchema
>(row: ProjectReadCaseSourceRow<
  C,
  Request,
  Projection,
  Refusal
>) {
  const [requestSource, projectionSource, resultSource, refusalSource] =
    await Promise.all([
      resolveSemanticBuildNativeSchemaSource(row.request.source),
      resolveSemanticBuildNativeSchemaSource(row.result.projection.source),
      resolveSemanticBuildNativeSchemaSource(row.result.source),
      resolveSemanticBuildNativeSchemaSource(row.refusal.source)
    ]);
  const request = defineNativeContract({
    identity: row.request.identity,
    source: requestSource
  });
  const projectionContract = defineNativeContract({
    identity: projectionIdentity(row.definitionKey.caseKey),
    source: projectionSource
  });
  const projectionRelation = resolveSemanticBuildOwnerProjectionRelation({
    source: row.result.projection.relationSource,
    projectionSource,
    expectedDefinitionKey: row.definitionKey,
    expectedSemanticOwnerBasis: {
      ref: row.result.projection.ownerAuthorityRef,
      digest: row.result.projection.ownerAuthorityDigest
    }
  });
  const result = defineNativeContract({
    identity: row.result.identity,
    source: resultSource
  });
  const refusal = defineNativeContract({
    identity: row.refusal.identity,
    source: refusalSource
  });
  return freezeNativeValue({
    kind: "project_read_contract_resolved" as const,
    definitionKey: row.definitionKey,
    request: {
      kind: "owner_contract_slot_resolved" as const,
      coordinate: row.request.coordinate,
      ownerAuthorityRef: row.request.ownerAuthorityRef,
      ownerAuthorityDigest: row.request.ownerAuthorityDigest,
      contractShapeBasisRef: P1_CONTRACT_SHAPE_BASIS.ref,
      contractShapeBasisDigest: P1_CONTRACT_SHAPE_BASIS.digest,
      contract: request
    },
    result: {
      kind: "project_read_wrapped_result_contract" as const,
      coordinate: row.result.coordinate,
      wrapperAuthorityRef: row.result.wrapperAuthorityRef,
      wrapperAuthorityDigest: row.result.wrapperAuthorityDigest,
      projectionOwnerAuthorityRef: row.result.projection.ownerAuthorityRef,
      projectionOwnerAuthorityDigest: row.result.projection.ownerAuthorityDigest,
      projectionContract,
      projectionWitnessDigest: projectionContract.projectionWitness.witnessDigest,
      projectionRelationWitnessDigest:
        projectionRelation.witness.relationWitnessDigest,
      projectionRelation,
      contractShapeBasisRef: P1_CONTRACT_SHAPE_BASIS.ref,
      contractShapeBasisDigest: P1_CONTRACT_SHAPE_BASIS.digest,
      contract: result
    },
    refusal: {
      kind: "owner_contract_slot_resolved" as const,
      coordinate: row.refusal.coordinate,
      ownerAuthorityRef: row.refusal.ownerAuthorityRef,
      ownerAuthorityDigest: row.refusal.ownerAuthorityDigest,
      contractShapeBasisRef: P1_CONTRACT_SHAPE_BASIS.ref,
      contractShapeBasisDigest: P1_CONTRACT_SHAPE_BASIS.digest,
      contract: refusal
    },
    nonterminal: row.nonterminal
  });
}

/** @internal */
export async function constructResolvedProjectReadCaseFamily() {
  const family = freezeNativeValue({
    catalog_list: await resolveProjectReadCaseRow(PROJECT_READ_CASE_FAMILY.catalog_list),
    catalog_describe: await resolveProjectReadCaseRow(PROJECT_READ_CASE_FAMILY.catalog_describe),
    workspace_status: await resolveProjectReadCaseRow(PROJECT_READ_CASE_FAMILY.workspace_status),
    run_status: await resolveProjectReadCaseRow(PROJECT_READ_CASE_FAMILY.run_status),
    graph_call_status: await resolveProjectReadCaseRow(PROJECT_READ_CASE_FAMILY.graph_call_status),
    run_result: await resolveProjectReadCaseRow(PROJECT_READ_CASE_FAMILY.run_result),
    graph_call_result: await resolveProjectReadCaseRow(PROJECT_READ_CASE_FAMILY.graph_call_result),
    run_evidence: await resolveProjectReadCaseRow(PROJECT_READ_CASE_FAMILY.run_evidence),
    graph_call_evidence: await resolveProjectReadCaseRow(PROJECT_READ_CASE_FAMILY.graph_call_evidence),
    result_evidence: await resolveProjectReadCaseRow(PROJECT_READ_CASE_FAMILY.result_evidence),
    assessment_evidence: await resolveProjectReadCaseRow(PROJECT_READ_CASE_FAMILY.assessment_evidence),
    witness_evidence: await resolveProjectReadCaseRow(PROJECT_READ_CASE_FAMILY.witness_evidence),
    install_evidence: await resolveProjectReadCaseRow(PROJECT_READ_CASE_FAMILY.install_evidence),
    release_evidence: await resolveProjectReadCaseRow(PROJECT_READ_CASE_FAMILY.release_evidence),
    workspace_replay: await resolveProjectReadCaseRow(PROJECT_READ_CASE_FAMILY.workspace_replay),
    run_replay: await resolveProjectReadCaseRow(PROJECT_READ_CASE_FAMILY.run_replay),
    graph_call_replay: await resolveProjectReadCaseRow(PROJECT_READ_CASE_FAMILY.graph_call_replay),
    interaction_replay: await resolveProjectReadCaseRow(PROJECT_READ_CASE_FAMILY.interaction_replay),
    continuation_replay: await resolveProjectReadCaseRow(PROJECT_READ_CASE_FAMILY.continuation_replay),
    c_call_replay: await resolveProjectReadCaseRow(PROJECT_READ_CASE_FAMILY.c_call_replay),
    workspace_gaps: await resolveProjectReadCaseRow(PROJECT_READ_CASE_FAMILY.workspace_gaps),
    run_gaps: await resolveProjectReadCaseRow(PROJECT_READ_CASE_FAMILY.run_gaps),
    run_lawful_actions: await resolveProjectReadCaseRow(PROJECT_READ_CASE_FAMILY.run_lawful_actions),
    observer_report: await resolveProjectReadCaseRow(PROJECT_READ_CASE_FAMILY.observer_report),
    observer_drafts: await resolveProjectReadCaseRow(PROJECT_READ_CASE_FAMILY.observer_drafts),
    tuning_report: await resolveProjectReadCaseRow(PROJECT_READ_CASE_FAMILY.tuning_report),
    ticket_consensus: await resolveProjectReadCaseRow(PROJECT_READ_CASE_FAMILY.ticket_consensus)
  } as const);
  if (Reflect.ownKeys(family).length !== 27) {
    throw new TypeError("project.read resolved family: incomplete construction");
  }
  return family;
}

assertProjectReadCaseFamily(PROJECT_READ_CASE_FAMILY);

/** @internal */
export type ProjectReadCaseFamily = typeof PROJECT_READ_CASE_FAMILY;
/** @internal */
export type ProjectReadCaseRow<C extends ProjectReadCase> =
  ProjectReadCaseFamily[C];
/** @internal */
export type ProjectReadProjection<C extends ProjectReadCase> = v.InferOutput<
  ProjectReadCaseRow<C>["result"]["projection"]["source"]["schema"]
>;
/** @internal */
export type ProjectReadResult<C extends ProjectReadCase> = v.InferOutput<
  ProjectReadCaseRow<C>["result"]["source"]["schema"]
>;
