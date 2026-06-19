// Implements: T-116
// Implements: T-121
// Implements: T-122
// Implements: B-086

import { admitDesignDepthRegisterFromArtifact } from "../operator/design_depth_register.js";
import type {
  SdlcAggregateDomainModel,
  SdlcAggregateSunnyDaySequence,
  SdlcDesignCompletenessAxisVerdict,
  SdlcDesignDepthRegister,
  SdlcDesignDepthRegisterAdmission,
  SdlcFeatureScope,
  SdlcModuleSchemaFragment,
  SdlcModuleStateDiagramFragment,
  SdlcWorkerHandoffManifest,
  SdlcWorkerResultReport
} from "../operator/carriers.js";
import {
  assuranceLedger,
  assuranceReason,
  uniqueSorted,
  verdictFromReasons
} from "./shared.js";
import type {
  SdlcAssuranceLedger,
  SdlcAssuranceLedgerReason
} from "./carriers.js";

const DESIGN_COMPLETENESS_TARGETS = Object.freeze([
  "implementation_design_surface"
] as const);

function targetRequiresDesignCompleteness(targetAssetType: string): boolean {
  return DESIGN_COMPLETENESS_TARGETS.some((target) => target === targetAssetType);
}

function reason(input: {
  readonly code: string;
  readonly message: string;
  readonly evidenceRefs: readonly string[];
}): SdlcAssuranceLedgerReason {
  return assuranceReason({
    code: input.code,
    message: input.message,
    evidenceRefs: input.evidenceRefs,
    lawfulReentryPoint: "same_edge_retry"
  });
}

function fpEscalationReason(input: {
  readonly code: string;
  readonly message: string;
  readonly evidenceRefs: readonly string[];
}): SdlcAssuranceLedgerReason {
  return assuranceReason({
    code: input.code,
    message: input.message,
    evidenceRefs: input.evidenceRefs,
    lawfulReentryPoint: "escalate_to_fp"
  });
}

function duplicateValues(values: readonly string[]): readonly string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) {
      duplicates.add(value);
    }
    seen.add(value);
  }
  return uniqueSorted([...duplicates]);
}

function identitySlug(input: string): string {
  return input
    .trim()
    .replace(/[^A-Za-z0-9]+/gu, "-")
    .replace(/^-+|-+$/gu, "")
    .toLowerCase();
}

function identityCompactSlug(input: string): string {
  return input
    .trim()
    .replace(/[^A-Za-z0-9]+/gu, "")
    .toLowerCase();
}

function identityLocalName(input: string, scheme: string): string {
  const schemePrefix = `${scheme}:`;
  const withoutScheme = input.startsWith(schemePrefix)
    ? input.slice(schemePrefix.length)
    : input;
  return withoutScheme.split(".").filter((part) => part.length > 0).at(-1) ??
    withoutScheme;
}

function scopedIdentityAliases(input: {
  readonly scheme: "entity" | "operation";
  readonly id: string;
  readonly moduleName?: string | undefined;
}): readonly string[] {
  const aliases = new Set<string>();
  aliases.add(input.id);
  const local = identityLocalName(input.id, input.scheme);
  const localSlug = identitySlug(local);
  const localCompactSlug = identityCompactSlug(local);
  if (localSlug.length > 0) {
    aliases.add(`${input.scheme}:${localSlug}`);
    if (input.moduleName !== undefined && input.moduleName.length > 0) {
      aliases.add(`${input.scheme}:${identitySlug(input.moduleName)}.${localSlug}`);
    }
  }
  if (localCompactSlug.length > 0) {
    aliases.add(`${input.scheme}:${localCompactSlug}`);
    if (input.moduleName !== undefined && input.moduleName.length > 0) {
      aliases.add(`${input.scheme}:${identitySlug(input.moduleName)}.${localCompactSlug}`);
    }
  }
  const schemePrefix = `${input.scheme}:`;
  const withoutScheme = input.id.startsWith(schemePrefix)
    ? input.id.slice(schemePrefix.length)
    : input.id;
  const wholeSlug = identitySlug(withoutScheme);
  const wholeCompactSlug = identityCompactSlug(withoutScheme);
  if (wholeSlug.length > 0) {
    aliases.add(`${input.scheme}:${wholeSlug}`);
  }
  if (wholeCompactSlug.length > 0) {
    aliases.add(`${input.scheme}:${wholeCompactSlug}`);
  }
  return Object.freeze([...aliases]);
}

function scopedIdsMatch(input: {
  readonly scheme: "entity" | "operation";
  readonly leftId: string;
  readonly leftModuleName?: string | undefined;
  readonly rightId: string;
  readonly rightModuleName?: string | undefined;
}): boolean {
  if (
    input.leftModuleName !== undefined &&
    input.leftModuleName.length > 0 &&
    input.rightModuleName !== undefined &&
    input.rightModuleName.length > 0 &&
    input.leftModuleName !== input.rightModuleName
  ) {
    return false;
  }
  const rightAliases = new Set(
    scopedIdentityAliases({
      scheme: input.scheme,
      id: input.rightId,
      moduleName: input.rightModuleName
    })
  );
  return scopedIdentityAliases({
    scheme: input.scheme,
    id: input.leftId,
    moduleName: input.leftModuleName
  }).some((alias) => rightAliases.has(alias));
}

function entityIdsMatch(input: {
  readonly leftEntityId: string;
  readonly leftModuleName?: string | undefined;
  readonly rightEntityId: string;
  readonly rightModuleName?: string | undefined;
}): boolean {
  return scopedIdsMatch({
    scheme: "entity",
    leftId: input.leftEntityId,
    leftModuleName: input.leftModuleName,
    rightId: input.rightEntityId,
    rightModuleName: input.rightModuleName
  });
}

function operationIdsMatch(input: {
  readonly leftOperationId: string;
  readonly leftModuleName?: string | undefined;
  readonly rightOperationId: string;
  readonly rightModuleName?: string | undefined;
}): boolean {
  return scopedIdsMatch({
    scheme: "operation",
    leftId: input.leftOperationId,
    leftModuleName: input.leftModuleName,
    rightId: input.rightOperationId,
    rightModuleName: input.rightModuleName
  });
}

function admissionReasons(
  admission: SdlcDesignDepthRegisterAdmission
): readonly SdlcAssuranceLedgerReason[] {
  if (admission.status === "admitted" || admission.status === "not_required") {
    return Object.freeze([]);
  }
  return Object.freeze(
    admission.blockingReasons.map((blockingReason) =>
      reason({
        code: blockingReason,
        message: `Design-depth register admission ${admission.status}: ${blockingReason}`,
        evidenceRefs: admission.evidenceRefs
      })
    )
  );
}

function contentPresenceReasons(input: {
  readonly register: SdlcDesignDepthRegister;
  readonly evidenceRefs: readonly string[];
}): readonly SdlcAssuranceLedgerReason[] {
  if (input.register.targetAssetType !== "implementation_design_surface") {
    return Object.freeze([]);
  }
  return Object.freeze([
    ...(input.register.stackProfileRows.length > 0
      ? []
      : [
          reason({
            code: "design_depth_stack_profile_rows_missing",
            message: "Implementation design content does not declare a stack profile row.",
            evidenceRefs: input.evidenceRefs
          })
        ]),
    ...(input.register.implementationModuleRows.length > 0
      ? []
      : [
          reason({
            code: "design_depth_implementation_module_rows_missing",
            message: "Implementation design content does not declare an implementation module row.",
            evidenceRefs: input.evidenceRefs
          })
        ]),
    ...(input.register.aggregateDomainModelRows.length > 0
      ? []
      : [
          reason({
            code: "design_depth_aggregate_domain_model_rows_missing",
            message: "Implementation design content does not declare an aggregate domain model row.",
            evidenceRefs: input.evidenceRefs
          })
        ]),
    ...(input.register.moduleSchemaFragments.length > 0
      ? []
      : [
          reason({
            code: "design_depth_module_schema_fragments_missing",
            message: "Implementation design content does not declare module schema fragments.",
            evidenceRefs: input.evidenceRefs
          })
        ]),
    ...(input.register.moduleStateDiagramFragments.length > 0
      ? []
      : [
          reason({
            code: "design_depth_module_state_diagram_fragments_missing",
            message: "Implementation design content does not declare module state diagram fragments.",
            evidenceRefs: input.evidenceRefs
          })
        ]),
    ...(input.register.aggregateDomainModel === null
      ? [
          reason({
            code: "design_depth_aggregate_domain_model_missing",
            message: "Implementation design content does not declare an aggregate domain model.",
            evidenceRefs: input.evidenceRefs
          })
        ]
      : []),
    ...(input.register.sunnyDaySequenceRows.length > 0
      ? []
      : [
          reason({
            code: "design_depth_sunny_day_sequence_rows_missing",
            message: "Implementation design content does not declare a sunny-day sequence row.",
            evidenceRefs: input.evidenceRefs
          })
        ]),
    ...(input.register.aggregateSunnyDaySequence === null
      ? [
          reason({
            code: "design_depth_aggregate_sunny_day_sequence_missing",
            message: "Implementation design content does not declare an aggregate sunny-day sequence.",
            evidenceRefs: input.evidenceRefs
          })
        ]
      : []),
    ...(input.register.componentTopologyRows.length > 0
      ? []
      : [
          reason({
            code: "design_depth_component_topology_rows_missing",
            message: "Implementation design content does not declare component topology rows.",
            evidenceRefs: input.evidenceRefs
          })
        ]),
    ...(input.register.componentRealizationRows.length > 0
      ? []
      : [
          reason({
            code: "design_depth_component_realization_rows_missing",
            message: "Implementation design content does not declare component realization rows.",
            evidenceRefs: input.evidenceRefs
          })
        ]),
    ...(input.register.fileTargetRows.length > 0
      ? []
      : [
          reason({
            code: "design_depth_file_target_rows_missing",
            message: "Implementation design content does not declare file target rows.",
            evidenceRefs: input.evidenceRefs
          })
        ]),
    ...(input.register.designCompletenessVerdict === null
      ? [
          reason({
            code: "design_depth_completeness_verdict_missing",
            message: "Implementation design content does not declare a design completeness verdict.",
            evidenceRefs: input.evidenceRefs
          })
        ]
      : [])
  ]);
}

function moduleSchemaReasons(input: {
  readonly schemas: readonly SdlcModuleSchemaFragment[];
  readonly diagrams: readonly SdlcModuleStateDiagramFragment[];
  readonly featureScope: SdlcFeatureScope;
  readonly evidenceRefs: readonly string[];
}): readonly SdlcAssuranceLedgerReason[] {
  const schemaModules = new Set(input.schemas.map((schema) => schema.moduleName));
  const diagramModules = new Set(input.diagrams.map((diagram) => diagram.moduleName));
  return Object.freeze([
    ...duplicateValues(input.schemas.map((schema) => schema.moduleName)).map(
      (moduleName) =>
        reason({
          code: `design_module_schema_duplicate:${moduleName}`,
          message: `Module schema fragment is duplicated for ${moduleName}.`,
          evidenceRefs: input.evidenceRefs
        })
    ),
    ...input.schemas
      .filter((schema) => schema.entities.length === 0)
      .map((schema) =>
        reason({
          code: `design_entity_missing_for_module:${schema.moduleName}`,
          message: `Module ${schema.moduleName} declares no entities.`,
          evidenceRefs: input.evidenceRefs
        })
      ),
    ...input.schemas.flatMap((schema) =>
      schema.entities
        .filter((entity) => entity.ownership === "owned" && entity.attributes.length === 0)
        .map((entity) =>
          reason({
            code: `design_attribute_missing:${entity.entityId}`,
            message: `Owned entity ${entity.entityId} has no typed attributes.`,
            evidenceRefs: input.evidenceRefs
          })
        )
    ),
    ...input.schemas
      .filter((schema) => !diagramModules.has(schema.moduleName))
      .map((schema) =>
        reason({
          code: `design_state_diagram_missing_for_module:${schema.moduleName}`,
          message: `Module ${schema.moduleName} has no state diagram fragment.`,
          evidenceRefs: input.evidenceRefs
        })
      ),
    ...input.diagrams
      .filter((diagram) => !schemaModules.has(diagram.moduleName))
      .map((diagram) =>
        reason({
          code: `design_state_diagram_unowned_module:${diagram.moduleName}`,
          message: `State diagram fragment references undeclared module ${diagram.moduleName}.`,
          evidenceRefs: input.evidenceRefs
        })
      ),
    ...input.diagrams
      .filter((diagram) => !diagram.stateless && diagram.transitions.length === 0)
      .map((diagram) =>
        reason({
          code: `design_state_transition_missing:${diagram.entityId}`,
          message: `Stateful entity ${diagram.entityId} has no declared transitions.`,
          evidenceRefs: input.evidenceRefs
        })
      )
  ]);
}

function moduleInScope(input: {
  readonly featureScope: SdlcFeatureScope;
  readonly moduleName: string;
}): boolean {
  if (input.featureScope.mode === "full_breadth") {
    return true;
  }
  if (input.featureScope.includedModuleNames.length === 0) {
    return false;
  }
  return input.featureScope.includedModuleNames.includes(input.moduleName);
}

function aggregateEntityInScope(input: {
  readonly featureScope: SdlcFeatureScope;
  readonly entity: SdlcAggregateDomainModel["entities"][number];
}): boolean {
  if (input.featureScope.mode === "full_breadth") {
    return true;
  }
  if (
    input.featureScope.includedEntityIds.some((entityId) =>
      entityIdsMatch({
        leftEntityId: entityId,
        rightEntityId: input.entity.entityId,
        rightModuleName: input.entity.ownerModuleName
      })
    )
  ) {
    return true;
  }
  return (
    moduleInScope({
      featureScope: input.featureScope,
      moduleName: input.entity.ownerModuleName
    }) ||
    input.entity.sourceModuleNames.some((moduleName) =>
      moduleInScope({ featureScope: input.featureScope, moduleName })
    )
  );
}

function domainEntityInScope(input: {
  readonly featureScope: SdlcFeatureScope;
  readonly entity: SdlcModuleSchemaFragment["entities"][number];
}): boolean {
  if (input.featureScope.mode === "full_breadth") {
    return true;
  }
  if (
    input.featureScope.includedEntityIds.some((entityId) =>
      entityIdsMatch({
        leftEntityId: entityId,
        rightEntityId: input.entity.entityId,
        rightModuleName: input.entity.moduleName
      })
    )
  ) {
    return true;
  }
  return moduleInScope({
    featureScope: input.featureScope,
    moduleName: input.entity.moduleName
  });
}

function operationInScope(input: {
  readonly featureScope: SdlcFeatureScope;
  readonly operation: SdlcAggregateDomainModel["operations"][number];
}): boolean {
  if (input.featureScope.mode === "full_breadth") {
    return true;
  }
  if (
    input.featureScope.includedOperationIds.some((operationId) =>
      operationIdsMatch({
        leftOperationId: operationId,
        rightOperationId: input.operation.operationId,
        rightModuleName: input.operation.moduleName
      })
    )
  ) {
    return true;
  }
  return moduleInScope({
    featureScope: input.featureScope,
    moduleName: input.operation.moduleName
  });
}

function sequenceStepInScope(input: {
  readonly featureScope: SdlcFeatureScope;
  readonly step: SdlcAggregateSunnyDaySequence["steps"][number];
}): boolean {
  if (input.featureScope.mode === "full_breadth") {
    return true;
  }
  if (
    input.featureScope.includedOperationIds.some((operationId) =>
      operationIdsMatch({
        leftOperationId: operationId,
        rightOperationId: input.step.operationId,
        rightModuleName: input.step.moduleName
      })
    )
  ) {
    return true;
  }
  return moduleInScope({
    featureScope: input.featureScope,
    moduleName: input.step.moduleName
  });
}

function scopedModuleSchemaReasons(input: {
  readonly register: SdlcDesignDepthRegister;
  readonly featureScope: SdlcFeatureScope;
  readonly evidenceRefs: readonly string[];
}): readonly SdlcAssuranceLedgerReason[] {
  const scopedSchemas = input.register.moduleSchemaFragments
    .filter((schema) =>
      moduleInScope({
        featureScope: input.featureScope,
        moduleName: schema.moduleName
      })
    )
    .map((schema) =>
      Object.freeze({
        ...schema,
        entities: Object.freeze(
          schema.entities.filter((entity) =>
            domainEntityInScope({ featureScope: input.featureScope, entity })
          )
        ),
        operations: Object.freeze(
          schema.operations.filter((operation) =>
            operationInScope({ featureScope: input.featureScope, operation })
          )
        )
      })
    );
  const scopedDiagrams = input.register.moduleStateDiagramFragments.filter((diagram) =>
    moduleInScope({
      featureScope: input.featureScope,
      moduleName: diagram.moduleName
    })
  );
  return Object.freeze([
    ...input.featureScope.mode !== "full_breadth"
      ? input.featureScope.includedModuleNames
          .filter((moduleName) =>
            !scopedSchemas.some((schema) => schema.moduleName === moduleName)
          )
          .map((moduleName) =>
            reason({
              code: `design_module_schema_missing_for_scope:${moduleName}`,
              message: `Feature scope includes module ${moduleName}, but no module schema fragment was emitted for it.`,
              evidenceRefs: input.evidenceRefs
            })
          )
      : [],
    ...moduleSchemaReasons({
      schemas: scopedSchemas,
      diagrams: scopedDiagrams,
      featureScope: input.featureScope,
      evidenceRefs: input.evidenceRefs
    })
  ]);
}

function aggregateDomainReasons(input: {
  readonly model: SdlcAggregateDomainModel | null;
  readonly featureScope: SdlcFeatureScope;
  readonly evidenceRefs: readonly string[];
}): readonly SdlcAssuranceLedgerReason[] {
  if (input.model === null) {
    return Object.freeze([]);
  }
  const model = input.model;
  const scopedEntities = model.entities.filter((entity) =>
    aggregateEntityInScope({ featureScope: input.featureScope, entity })
  );
  const scopedOperations = model.operations.filter((operation) =>
    operationInScope({ featureScope: input.featureScope, operation })
  );
  const entityMatchesModel = (candidate: {
    readonly entityId: string;
    readonly moduleName?: string | undefined;
  }): boolean =>
    model.entities.some((entity) =>
      entityIdsMatch({
        leftEntityId: entity.entityId,
        leftModuleName: entity.ownerModuleName,
        rightEntityId: candidate.entityId,
        rightModuleName: candidate.moduleName
      })
    );
  return Object.freeze([
    ...(input.featureScope.mode !== "full_breadth"
      ? input.featureScope.includedModuleNames
          .filter((moduleName) =>
            !scopedEntities.some(
              (entity) =>
                entity.ownerModuleName === moduleName ||
                entity.sourceModuleNames.includes(moduleName)
            )
          )
          .map((moduleName) =>
            reason({
              code: `design_aggregate_entity_missing_for_scope_module:${moduleName}`,
              message: `Feature scope includes module ${moduleName}, but no aggregate entity was emitted for it.`,
              evidenceRefs: input.evidenceRefs
            })
          )
      : []),
    ...duplicateValues(scopedEntities.map((entity) => entity.entityId)).map(
      (entityId) =>
        reason({
          code: `design_aggregate_entity_duplicate:${entityId}`,
          message: `Aggregate domain model declares duplicate entity ${entityId}.`,
          evidenceRefs: input.evidenceRefs
        })
    ),
    ...scopedEntities
      .filter((entity) => entity.attributes.length === 0)
      .map((entity) =>
        reason({
          code: `design_attribute_missing:${entity.entityId}`,
          message: `Aggregate entity ${entity.entityId} has no attributes.`,
          evidenceRefs: input.evidenceRefs
        })
      ),
    ...scopedOperations
      .filter((operation) => operation.requiredAttributeIds.length === 0)
      .map((operation) =>
        reason({
          code: `design_operation_required_attributes_missing:${operation.operationId}`,
          message: `Operation ${operation.operationId} declares no required attributes.`,
          evidenceRefs: input.evidenceRefs
        })
      ),
    ...input.model.crossModuleReferences
      .filter(
        (ref) =>
          input.featureScope.mode === "full_breadth" ||
          input.featureScope.includedEntityIds.some((entityId) =>
            entityIdsMatch({
              leftEntityId: entityId,
              rightEntityId: ref.entityId,
              rightModuleName: ref.fromModuleName
            })
          ) ||
          moduleInScope({
            featureScope: input.featureScope,
            moduleName: ref.fromModuleName
          }) ||
          moduleInScope({
            featureScope: input.featureScope,
            moduleName: ref.toModuleName
          })
      )
      .filter((ref) =>
        !entityMatchesModel({
          entityId: ref.entityId,
          moduleName: ref.fromModuleName
        })
      )
      .map((ref) =>
        reason({
          code: `design_cross_module_entity_missing:${ref.entityId}`,
          message: `Cross-module reference names undeclared entity ${ref.entityId}.`,
          evidenceRefs: input.evidenceRefs
        })
      )
  ]);
}

function sunnyDaySequenceReasons(input: {
  readonly model: SdlcAggregateDomainModel | null;
  readonly sequence: SdlcAggregateSunnyDaySequence | null;
  readonly featureScope: SdlcFeatureScope;
  readonly evidenceRefs: readonly string[];
}): readonly SdlcAssuranceLedgerReason[] {
  if (input.sequence === null || input.model === null) {
    return Object.freeze([]);
  }
  const model = input.model;
  const entityMatchesModel = (candidate: {
    readonly entityId: string;
  }): boolean =>
    model.entities.some((entity) =>
      entityIdsMatch({
        leftEntityId: entity.entityId,
        rightEntityId: candidate.entityId
      })
    );
  const scopedSteps = input.sequence.steps.filter((step) =>
    sequenceStepInScope({ featureScope: input.featureScope, step })
  );
  return Object.freeze([
    ...scopedSteps
      .filter(
        (step) =>
          !model.operations.some((operation) =>
            operationIdsMatch({
              leftOperationId: operation.operationId,
              leftModuleName: operation.moduleName,
              rightOperationId: step.operationId,
              rightModuleName: step.moduleName
            })
          )
      )
      .map((step) =>
        reason({
          code: `design_flow_operation_missing:${step.operationId}`,
          message: `Sunny-day step ${step.stepId} calls undeclared operation ${step.operationId}.`,
          evidenceRefs: input.evidenceRefs
        })
      ),
    ...scopedSteps.flatMap((step) =>
      [...step.inputEntityIds, ...step.outputEntityIds]
        .filter((entityId) =>
          !entityMatchesModel({
            entityId
          })
        )
        .map((entityId) =>
          reason({
            code: `design_flow_entity_missing:${entityId}`,
            message: `Sunny-day step ${step.stepId} exchanges undeclared entity ${entityId}.`,
            evidenceRefs: input.evidenceRefs
          })
        )
    )
  ]);
}

function axisReasonMentionsScope(input: {
  readonly featureScope: SdlcFeatureScope;
  readonly axisReason: string;
}): boolean {
  if (input.featureScope.mode === "full_breadth") {
    return true;
  }
  const normalizedReason = input.axisReason.toLowerCase();
  return [
    ...input.featureScope.includedModuleNames,
    ...input.featureScope.includedEntityIds,
    ...input.featureScope.includedOperationIds
  ].some(
    (token) =>
      token.length > 0 && normalizedReason.includes(token.toLowerCase())
  );
}

function axisReasonMentionsDeferredScope(input: {
  readonly featureScope: SdlcFeatureScope;
  readonly axisReason: string;
}): boolean {
  if (input.featureScope.mode === "full_breadth") {
    return false;
  }
  const normalizedReason = input.axisReason.toLowerCase();
  return input.featureScope.deferredModuleNames.some(
    (token) =>
      token.length > 0 && normalizedReason.includes(token.toLowerCase())
  );
}

function axisVerdictReasons(input: {
  readonly targetAssetType: string;
  readonly axis: SdlcDesignCompletenessAxisVerdict;
  readonly featureScope: SdlcFeatureScope;
  readonly evidenceRefs: readonly string[];
}): readonly SdlcAssuranceLedgerReason[] {
  if (input.axis.status === "satisfied") {
    return Object.freeze([]);
  }
  if (input.featureScope.mode !== "full_breadth") {
    const mentionsCurrentScope = input.axis.reasons.some((axisReason) =>
      axisReasonMentionsScope({
        featureScope: input.featureScope,
        axisReason
      })
    );
    const mentionsOnlyDeferredScope =
      !mentionsCurrentScope &&
      input.axis.reasons.length > 0 &&
      input.axis.reasons.every((axisReason) =>
        axisReasonMentionsDeferredScope({
          featureScope: input.featureScope,
          axisReason
        })
      );
    if (mentionsOnlyDeferredScope) {
      return Object.freeze([]);
    }
  }
  return Object.freeze([
    fpEscalationReason({
      code: `design_completeness_${input.axis.axis}_${input.axis.status}`,
      message: `Design completeness axis ${input.axis.axis} is ${input.axis.status}.`,
      evidenceRefs: uniqueSorted([...input.evidenceRefs, ...input.axis.evidenceRefs])
    }),
    ...input.axis.reasons
      .filter((axisReason) =>
        axisReasonMentionsScope({
          featureScope: input.featureScope,
          axisReason
        })
      )
      .map((axisReason) =>
        fpEscalationReason({
          code: `design_completeness_${input.axis.axis}_reason:${axisReason}`,
          message: `Design completeness axis ${input.axis.axis} reason: ${axisReason}`,
          evidenceRefs: uniqueSorted([...input.evidenceRefs, ...input.axis.evidenceRefs])
        })
      )
  ]);
}

function verdictReasons(input: {
  readonly register: SdlcDesignDepthRegister;
  readonly featureScope: SdlcFeatureScope;
  readonly evidenceRefs: readonly string[];
}): readonly SdlcAssuranceLedgerReason[] {
  const verdict = input.register.designCompletenessVerdict;
  if (verdict === null) {
    return Object.freeze([]);
  }
  return Object.freeze([
    ...axisVerdictReasons({
      targetAssetType: input.register.targetAssetType,
      axis: verdict.entity,
      featureScope: input.featureScope,
      evidenceRefs: input.evidenceRefs
    }),
    ...axisVerdictReasons({
      targetAssetType: input.register.targetAssetType,
      axis: verdict.attribute,
      featureScope: input.featureScope,
      evidenceRefs: input.evidenceRefs
    }),
    ...axisVerdictReasons({
      targetAssetType: input.register.targetAssetType,
      axis: verdict.flow,
      featureScope: input.featureScope,
      evidenceRefs: input.evidenceRefs
    })
  ]);
}

function registerReasons(input: {
  readonly register: SdlcDesignDepthRegister;
  readonly featureScope: SdlcFeatureScope;
  readonly evidenceRefs: readonly string[];
}): readonly SdlcAssuranceLedgerReason[] {
  return Object.freeze([
    ...contentPresenceReasons({
      register: input.register,
      evidenceRefs: input.evidenceRefs
    }),
    ...(input.register.targetAssetType === "implementation_design_surface"
      ? scopedModuleSchemaReasons({
          register: input.register,
          featureScope: input.featureScope,
          evidenceRefs: input.evidenceRefs
        })
      : []),
    ...aggregateDomainReasons({
      model: input.register.aggregateDomainModel,
      featureScope: input.featureScope,
      evidenceRefs: input.evidenceRefs
    }),
    ...sunnyDaySequenceReasons({
      model: input.register.aggregateDomainModel,
      sequence: input.register.aggregateSunnyDaySequence,
      featureScope: input.featureScope,
      evidenceRefs: input.evidenceRefs
    }),
    ...verdictReasons(input)
  ]);
}

function defaultFullBreadthScope(targetAssetType: string): SdlcFeatureScope {
  return Object.freeze({
    kind: "sdlc_feature_scope" as const,
    scopeVersion: "ts-scope-v1" as const,
    mode: "full_breadth" as const,
    scopeRef: `scope://odd_sdlc/${targetAssetType}/legacy-full-breadth`,
    basisRefs: Object.freeze([]),
    includedRequirementRefs: Object.freeze([]),
    includedModuleNames: Object.freeze([]),
    includedEntityIds: Object.freeze([]),
    includedOperationIds: Object.freeze([]),
    deferredModuleNames: Object.freeze([])
  });
}

export function deriveDesignCompletenessAssuranceLedger(input: {
  readonly manifest: Pick<SdlcWorkerHandoffManifest, "targetAssetType"> &
    Partial<Pick<SdlcWorkerHandoffManifest, "archiveRoot" | "featureScope">>;
  readonly report: Pick<SdlcWorkerResultReport, "outputFile">;
}): SdlcAssuranceLedger | null {
  if (!targetRequiresDesignCompleteness(input.manifest.targetAssetType)) {
    return null;
  }
  const admission = admitDesignDepthRegisterFromArtifact({
    targetAssetType: input.manifest.targetAssetType,
    outputFile: input.report.outputFile,
    archiveRoot: input.manifest.archiveRoot ?? null
  });
  const evidenceRefs = admission.evidenceRefs;
  const featureScope =
    input.manifest.featureScope ??
    defaultFullBreadthScope(input.manifest.targetAssetType);
  const reasons = Object.freeze([
    ...admissionReasons(admission),
    ...(admission.register === null
      ? []
      : registerReasons({
          register: admission.register,
          featureScope,
          evidenceRefs
        }))
  ]);
  return assuranceLedger({
    dimension: "design_completeness",
    verdict: verdictFromReasons({
      blockedReasonCodes: Object.freeze([]),
      openGapReasonCodes: reasons
        .filter((item) => item.lawfulReentryPoint !== "escalate_to_fp")
        .map((item) => item.code),
      fpEscalationReasonCodes: reasons
        .filter((item) => item.lawfulReentryPoint === "escalate_to_fp")
        .map((item) => item.code)
    }),
    // Structural admission gates closure; admitted content gaps remain assurance evidence.
    required: admission.status !== "admitted",
    reasons,
    evidenceRefs,
    carryForwardObligationRefs:
      featureScope.mode !== "full_breadth"
        ? featureScope.deferredModuleNames.map((moduleName) => `module:${moduleName}`)
        : Object.freeze([])
  });
}
