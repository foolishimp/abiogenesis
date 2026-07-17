// Private T-281 P1 composition of the accepted non-project.read owner sources.

import type * as v from "valibot";

import { CATALOG_OPERATION_NATIVE_CONTRACT_SOURCES } from "../../../abg/m03/contracts/catalog_operation_contracts.js";
import { GTL_CONFORMANCE_OPERATION_NATIVE_CONTRACT_SOURCES } from "../../../abg/m03/contracts/gtl_conformance_operation_contracts.js";
import { ONE_SURFACE_NATIVE_CONTRACT_SOURCES } from "../../../abg/m03/contracts/one_surface_operation_contracts.js";
import { RUNTIME_AUTHORING_OPERATION_NATIVE_CONTRACT_SOURCES } from "../../../abg/m03/contracts/runtime_authoring_operation_contracts.js";
import {
  stableJson,
  stableJsonEquals
} from "../../../shared/runtime_identity.js";
import { resolveSemanticBuildNativeSchemaSource } from "../../../shared/validation/canonical_native_schema_projector.js";
import { freezeNativeValue } from "../../../shared/validation/immutable_native_value.js";
import type {
  OwnerNativeOperationContractSlot,
  OwnerNativeOperationContractSource,
  OwnerNativeSemanticOwner
} from "../../../shared/validation/owner_native_operation_contract_source.js";
import { INSTALL_BOOTSTRAP_NATIVE_CONTRACT_SOURCES } from "../install_bootstrap/operation_contracts.js";
import { PRODUCT_INTAKE_NATIVE_CONTRACT_SOURCES } from "../product_intake/operation_contracts.js";
import { RESULT_ASSESSMENT_NATIVE_CONTRACT_SOURCES } from "../result_assessment/operation_contracts.js";
import { TOOLCHAIN_BINDING_NATIVE_CONTRACT_SOURCES } from "../toolchain_binding/operation_contracts.js";
import { WORKSPACE_NATIVE_CONTRACT_SOURCES } from "../workspace/operation_contracts.js";
import { RELEASE_OPERATION_NATIVE_CONTRACT_SOURCES } from "../../../qualification/m05/exact_candidate_release_operation_contracts.js";
import { defineNativeContract } from "./native_contract_phase_a.js";

type NativeSchema = v.GenericSchema;
type VariantSource<
  S extends NativeSchema,
  OperationId extends string,
  Variant extends string,
  Slot extends OwnerNativeOperationContractSlot
> = OwnerNativeOperationContractSource<
  S,
  OwnerNativeSemanticOwner,
  OperationId,
  Variant,
  Slot
>;

const RESOLVED_CONTRACT_AUTHORITY = new WeakMap<
  object,
  Readonly<{ ref: string; digest: `sha256:${string}` }>
>();

function exactOwnKeys(
  input: object,
  expected: readonly string[],
  label: string
): void {
  const actual = Reflect.ownKeys(input);
  if (
    actual.length !== expected.length ||
    !expected.every((key) => actual.includes(key))
  ) {
    throw new TypeError(`${label}: expected exact keys ${expected.join(",")}`);
  }
}

function requireObject(input: unknown, label: string): object {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    throw new TypeError(`${label}: expected an object`);
  }
  return input;
}

function ownValue(input: object, key: string, label: string): unknown {
  const descriptor = Object.getOwnPropertyDescriptor(input, key);
  if (
    descriptor === undefined ||
    !("value" in descriptor) ||
    descriptor.enumerable !== true
  ) {
    throw new TypeError(`${label}: missing own data field ${key}`);
  }
  return descriptor.value;
}

function definitionKey<const OperationId extends string, const Variant extends string>(
  operationId: OperationId,
  variant: Variant
) {
  return freezeNativeValue({
    operationId,
    memberKind: "variant" as const,
    variant
  });
}

async function resolveOwnerSlot<
  const OperationId extends string,
  const Variant extends string,
  const Slot extends OwnerNativeOperationContractSlot,
  const S extends NativeSchema
>(
  operationId: OperationId,
  variant: Variant,
  slot: Slot,
  source: VariantSource<S, OperationId, Variant, Slot>
) {
  const key = definitionKey(operationId, variant);
  if (
    source.authority.subject.operationId !== operationId ||
    source.authority.subject.memberKind !== "variant" ||
    source.authority.subject.variant !== variant ||
    source.authority.subject.slot !== slot
  ) {
    throw new TypeError(
      `non-project-read owner family: cross-key source for ${operationId}(${variant}).${slot}`
    );
  }
  const resolvedSource = await resolveSemanticBuildNativeSchemaSource(source);
  const contract = defineNativeContract({
    identity: source.identity,
    source: resolvedSource
  });
  RESOLVED_CONTRACT_AUTHORITY.set(
    contract,
    source.authority.semanticOwnerBasis
  );
  return freezeNativeValue({
    kind: "owner_contract_slot_resolved" as const,
    coordinate: { definitionKey: key, slot },
    ownerAuthorityRef: source.authority.semanticOwnerBasis.ref,
    ownerAuthorityDigest: source.authority.semanticOwnerBasis.digest,
    contract
  });
}

async function resolveTerminalVariant<
  const OperationId extends string,
  const Variant extends string,
  const Request extends NativeSchema,
  const Result extends NativeSchema,
  const Refusal extends NativeSchema
>(
  operationId: OperationId,
  variant: Variant,
  sources: {
    readonly request: VariantSource<Request, OperationId, Variant, "request">;
    readonly result: VariantSource<Result, OperationId, Variant, "result">;
    readonly refusal: VariantSource<Refusal, OperationId, Variant, "refusal">;
  }
) {
  exactOwnKeys(sources, ["request", "result", "refusal"], `${operationId}(${variant})`);
  const key = definitionKey(operationId, variant);
  const [request, result, refusal] = await Promise.all([
    resolveOwnerSlot(operationId, variant, "request", sources.request),
    resolveOwnerSlot(operationId, variant, "result", sources.result),
    resolveOwnerSlot(operationId, variant, "refusal", sources.refusal)
  ]);
  return freezeNativeValue({
    kind: "owner_contract_resolved" as const,
    definitionKey: key,
    request,
    result,
    refusal,
    nonterminal: {
      kind: "nonterminal_not_declared" as const,
      coordinate: { definitionKey: key, slot: "nonterminal" as const }
    }
  });
}

async function resolveNonterminalVariant<
  const OperationId extends string,
  const Variant extends string,
  const Request extends NativeSchema,
  const Result extends NativeSchema,
  const Refusal extends NativeSchema,
  const Nonterminal extends NativeSchema
>(
  operationId: OperationId,
  variant: Variant,
  sources: {
    readonly request: VariantSource<Request, OperationId, Variant, "request">;
    readonly result: VariantSource<Result, OperationId, Variant, "result">;
    readonly refusal: VariantSource<Refusal, OperationId, Variant, "refusal">;
    readonly nonterminal: VariantSource<
      Nonterminal,
      OperationId,
      Variant,
      "nonterminal"
    >;
  }
) {
  exactOwnKeys(
    sources,
    ["request", "result", "refusal", "nonterminal"],
    `${operationId}(${variant})`
  );
  const key = definitionKey(operationId, variant);
  const [request, result, refusal, nonterminal] = await Promise.all([
    resolveOwnerSlot(operationId, variant, "request", sources.request),
    resolveOwnerSlot(operationId, variant, "result", sources.result),
    resolveOwnerSlot(operationId, variant, "refusal", sources.refusal),
    resolveOwnerSlot(
      operationId,
      variant,
      "nonterminal",
      sources.nonterminal
    )
  ]);
  return freezeNativeValue({
    kind: "owner_contract_resolved" as const,
    definitionKey: key,
    request,
    result,
    refusal,
    nonterminal
  });
}

function assertDefinitionKey(
  input: unknown,
  operationId: string,
  variant: string,
  label: string
): void {
  const key = requireObject(input, label);
  exactOwnKeys(key, ["operationId", "memberKind", "variant"], label);
  if (
    ownValue(key, "operationId", label) !== operationId ||
    ownValue(key, "memberKind", label) !== "variant" ||
    ownValue(key, "variant", label) !== variant
  ) {
    throw new TypeError(`${label}: cross-key definition`);
  }
}

function expectedContractIdentity(
  operationId: string,
  variant: string,
  slot: string
) {
  const suffix = `${operationId.slice("abg.operation.".length)}.${variant}.${slot}`;
  return {
    contractId: `abg.contract.operation.${suffix}`,
    schemaId: `abg.schema.operation.${suffix}`
  };
}

function assertResolvedSlot(
  input: unknown,
  operationId: string,
  variant: string,
  slot: OwnerNativeOperationContractSlot,
  locators: Set<string>,
  label: string
): void {
  const row = requireObject(input, label);
  exactOwnKeys(
    row,
    [
      "kind",
      "coordinate",
      "ownerAuthorityRef",
      "ownerAuthorityDigest",
      "contract"
    ],
    label
  );
  if (ownValue(row, "kind", label) !== "owner_contract_slot_resolved") {
    throw new TypeError(`${label}: unresolved slot`);
  }
  const coordinate = requireObject(ownValue(row, "coordinate", label), `${label}.coordinate`);
  exactOwnKeys(coordinate, ["definitionKey", "slot"], `${label}.coordinate`);
  assertDefinitionKey(
    ownValue(coordinate, "definitionKey", `${label}.coordinate`),
    operationId,
    variant,
    `${label}.coordinate.definitionKey`
  );
  if (ownValue(coordinate, "slot", `${label}.coordinate`) !== slot) {
    throw new TypeError(`${label}: slot mismatch`);
  }
  const contract = requireObject(ownValue(row, "contract", label), `${label}.contract`);
  const schemaCoordinate = requireObject(
    ownValue(contract, "schemaCoordinate", `${label}.contract`),
    `${label}.contract.schemaCoordinate`
  );
  const witness = requireObject(
    ownValue(contract, "projectionWitness", `${label}.contract`),
    `${label}.contract.projectionWitness`
  );
  const nativeLocator = ownValue(
    schemaCoordinate,
    "nativeLocator",
    `${label}.contract.schemaCoordinate`
  );
  const witnessLocator = ownValue(
    witness,
    "sourceLocator",
    `${label}.contract.projectionWitness`
  );
  if (!stableJsonEquals(nativeLocator, witnessLocator)) {
    throw new TypeError(`${label}: locator mismatch`);
  }
  const locatorKey = stableJson(nativeLocator);
  if (locators.has(locatorKey)) {
    throw new TypeError(`${label}: duplicate source locator`);
  }
  locators.add(locatorKey);
  const identity = expectedContractIdentity(operationId, variant, slot);
  if (
    ownValue(schemaCoordinate, "contractId", `${label}.contract.schemaCoordinate`) !==
      identity.contractId ||
    ownValue(schemaCoordinate, "schemaId", `${label}.contract.schemaCoordinate`) !==
      identity.schemaId
  ) {
    throw new TypeError(`${label}: contract identity mismatch`);
  }
  const ownerAuthority = RESOLVED_CONTRACT_AUTHORITY.get(contract);
  if (
    ownerAuthority === undefined ||
    ownValue(row, "ownerAuthorityRef", label) !== ownerAuthority.ref ||
    ownValue(row, "ownerAuthorityDigest", label) !== ownerAuthority.digest
  ) {
    throw new TypeError(`${label}: owner authority mismatch`);
  }
}

/** @internal */
export function assertNonProjectReadOwnerContractFamily(input: unknown): void {
  const family = requireObject(input, "non-project-read owner family");
  const operationKeys = Reflect.ownKeys(family);
  if (
    operationKeys.length !== 18 ||
    !operationKeys.every((key): key is string => typeof key === "string")
  ) {
    throw new TypeError("non-project-read owner family: expected 18 operations");
  }
  const operationIds = operationKeys;
  let variantCount = 0;
  let declaredSlotCount = 0;
  let absentNonterminalCount = 0;
  const definitions = new Map<string, Set<string>>();
  const locators = new Set<string>();

  for (const operationId of operationIds) {
    if (!operationId.startsWith("abg.operation.")) {
      throw new TypeError(
        `non-project-read owner family: invalid operation identity ${operationId}`
      );
    }
    const variants = requireObject(
      ownValue(family, operationId, "non-project-read owner family"),
      operationId
    );
    const variantKeys = Reflect.ownKeys(variants);
    if (
      variantKeys.length === 0 ||
      !variantKeys.every((key): key is string => typeof key === "string")
    ) {
      throw new TypeError(`${operationId}: operation has no variants`);
    }
    const variantNames = variantKeys;
    const operationDefinitions = new Set<string>();
    definitions.set(operationId, operationDefinitions);

    for (const variant of variantNames) {
      if (operationDefinitions.has(variant)) {
        throw new TypeError(`${operationId}: duplicate variant ${variant}`);
      }
      operationDefinitions.add(variant);
      variantCount += 1;
      const label = `${operationId}(${variant})`;
      const row = requireObject(ownValue(variants, variant, operationId), label);
      exactOwnKeys(
        row,
        [
          "kind",
          "definitionKey",
          "request",
          "result",
          "refusal",
          "nonterminal"
        ],
        label
      );
      if (ownValue(row, "kind", label) !== "owner_contract_resolved") {
        throw new TypeError(`${label}: unresolved definition`);
      }
      assertDefinitionKey(
        ownValue(row, "definitionKey", label),
        operationId,
        variant,
        `${label}.definitionKey`
      );
      for (const slot of ["request", "result", "refusal"] as const) {
        assertResolvedSlot(
          ownValue(row, slot, label),
          operationId,
          variant,
          slot,
          locators,
          `${label}.${slot}`
        );
        declaredSlotCount += 1;
      }
      const nonterminal = requireObject(
        ownValue(row, "nonterminal", label),
        `${label}.nonterminal`
      );
      if (
        ownValue(nonterminal, "kind", `${label}.nonterminal`) ===
        "nonterminal_not_declared"
      ) {
        exactOwnKeys(
          nonterminal,
          ["kind", "coordinate"],
          `${label}.nonterminal`
        );
        const coordinate = requireObject(
          ownValue(nonterminal, "coordinate", `${label}.nonterminal`),
          `${label}.nonterminal.coordinate`
        );
        exactOwnKeys(
          coordinate,
          ["definitionKey", "slot"],
          `${label}.nonterminal.coordinate`
        );
        assertDefinitionKey(
          ownValue(
            coordinate,
            "definitionKey",
            `${label}.nonterminal.coordinate`
          ),
          operationId,
          variant,
          `${label}.nonterminal.coordinate.definitionKey`
        );
        if (
          ownValue(coordinate, "slot", `${label}.nonterminal.coordinate`) !==
          "nonterminal"
        ) {
          throw new TypeError(`${label}: absent nonterminal slot mismatch`);
        }
        absentNonterminalCount += 1;
      } else {
        assertResolvedSlot(
          nonterminal,
          operationId,
          variant,
          "nonterminal",
          locators,
          `${label}.nonterminal`
        );
        declaredSlotCount += 1;
      }
    }
  }

  if (
    variantCount !== 35 ||
    declaredSlotCount !== 115 ||
    absentNonterminalCount !== 25 ||
    declaredSlotCount + absentNonterminalCount !== 140
  ) {
    throw new TypeError(
      "non-project-read owner family: expected 35 keys and 140 exact coordinates"
    );
  }
}

/** @internal */
export async function constructNonProjectReadOwnerContractFamily() {
  const family = {
    "abg.operation.workspace.create": {
      clean: await resolveTerminalVariant(
        "abg.operation.workspace.create",
        "clean",
        WORKSPACE_NATIVE_CONTRACT_SOURCES.workspace_create.clean
      ),
      imported: await resolveTerminalVariant(
        "abg.operation.workspace.create",
        "imported",
        WORKSPACE_NATIVE_CONTRACT_SOURCES.workspace_create.imported
      )
    },
    "abg.operation.workspace.open": {
      open: await resolveTerminalVariant(
        "abg.operation.workspace.open",
        "open",
        WORKSPACE_NATIVE_CONTRACT_SOURCES.workspace_open.open
      )
    },
    "abg.operation.product.verify": {
      verify: await resolveTerminalVariant(
        "abg.operation.product.verify",
        "verify",
        PRODUCT_INTAKE_NATIVE_CONTRACT_SOURCES.product_verify.verify
      )
    },
    "abg.operation.product.resolve": {
      resolve: await resolveTerminalVariant(
        "abg.operation.product.resolve",
        "resolve",
        PRODUCT_INTAKE_NATIVE_CONTRACT_SOURCES.product_resolve.resolve
      )
    },
    "abg.operation.product.install": {
      install: await resolveTerminalVariant(
        "abg.operation.product.install",
        "install",
        PRODUCT_INTAKE_NATIVE_CONTRACT_SOURCES.product_install.install
      )
    },
    "abg.operation.workspace.bind": {
      bind: await resolveTerminalVariant(
        "abg.operation.workspace.bind",
        "bind",
        TOOLCHAIN_BINDING_NATIVE_CONTRACT_SOURCES.workspace_bind.bind
      )
    },
    "abg.operation.catalog.admit": {
      admit: await resolveTerminalVariant(
        "abg.operation.catalog.admit",
        "admit",
        CATALOG_OPERATION_NATIVE_CONTRACT_SOURCES.catalog_admit.admit
      )
    },
    "abg.operation.catalog.view": {
      allowlist: await resolveTerminalVariant(
        "abg.operation.catalog.view",
        "allowlist",
        CATALOG_OPERATION_NATIVE_CONTRACT_SOURCES.catalog_view.allowlist
      )
    },
    "abg.operation.catalog.apply": {
      node_type: await resolveTerminalVariant(
        "abg.operation.catalog.apply",
        "node_type",
        CATALOG_OPERATION_NATIVE_CONTRACT_SOURCES.catalog_apply.node_type
      ),
      overlay: await resolveTerminalVariant(
        "abg.operation.catalog.apply",
        "overlay",
        CATALOG_OPERATION_NATIVE_CONTRACT_SOURCES.catalog_apply.overlay
      )
    },
    "abg.operation.run.invoke": {
      invoke: await resolveNonterminalVariant(
        "abg.operation.run.invoke",
        "invoke",
        ONE_SURFACE_NATIVE_CONTRACT_SOURCES.run_invoke.invoke
      ),
      start: await resolveNonterminalVariant(
        "abg.operation.run.invoke",
        "start",
        ONE_SURFACE_NATIVE_CONTRACT_SOURCES.run_invoke.start
      )
    },
    "abg.operation.run.continue": {
      current_intent: await resolveNonterminalVariant(
        "abg.operation.run.continue",
        "current_intent",
        ONE_SURFACE_NATIVE_CONTRACT_SOURCES.run_continue.current_intent
      ),
      selected_action: await resolveNonterminalVariant(
        "abg.operation.run.continue",
        "selected_action",
        ONE_SURFACE_NATIVE_CONTRACT_SOURCES.run_continue.selected_action
      )
    },
    "abg.operation.interaction.respond": {
      select: await resolveNonterminalVariant(
        "abg.operation.interaction.respond",
        "select",
        ONE_SURFACE_NATIVE_CONTRACT_SOURCES.interaction_respond.select
      ),
      approve: await resolveNonterminalVariant(
        "abg.operation.interaction.respond",
        "approve",
        ONE_SURFACE_NATIVE_CONTRACT_SOURCES.interaction_respond.approve
      ),
      reject: await resolveNonterminalVariant(
        "abg.operation.interaction.respond",
        "reject",
        ONE_SURFACE_NATIVE_CONTRACT_SOURCES.interaction_respond.reject
      ),
      assess: await resolveNonterminalVariant(
        "abg.operation.interaction.respond",
        "assess",
        ONE_SURFACE_NATIVE_CONTRACT_SOURCES.interaction_respond.assess
      ),
      answer_escalation: await resolveNonterminalVariant(
        "abg.operation.interaction.respond",
        "answer_escalation",
        ONE_SURFACE_NATIVE_CONTRACT_SOURCES.interaction_respond.answer_escalation
      )
    },
    "abg.operation.result.assess": {
      assess: await resolveNonterminalVariant(
        "abg.operation.result.assess",
        "assess",
        RESULT_ASSESSMENT_NATIVE_CONTRACT_SOURCES.result_assess.assess
      )
    },
    "abg.operation.witness.admit": {
      reprice: await resolveTerminalVariant(
        "abg.operation.witness.admit",
        "reprice",
        RUNTIME_AUTHORING_OPERATION_NATIVE_CONTRACT_SOURCES.witness_admit.reprice
      ),
      attest: await resolveTerminalVariant(
        "abg.operation.witness.admit",
        "attest",
        RUNTIME_AUTHORING_OPERATION_NATIVE_CONTRACT_SOURCES.witness_admit.attest
      ),
      "hygiene-stamp": await resolveTerminalVariant(
        "abg.operation.witness.admit",
        "hygiene-stamp",
        RUNTIME_AUTHORING_OPERATION_NATIVE_CONTRACT_SOURCES.witness_admit.hygiene_stamp
      ),
      intake: await resolveTerminalVariant(
        "abg.operation.witness.admit",
        "intake",
        RUNTIME_AUTHORING_OPERATION_NATIVE_CONTRACT_SOURCES.witness_admit.intake
      ),
      "run-resumed": await resolveTerminalVariant(
        "abg.operation.witness.admit",
        "run-resumed",
        RUNTIME_AUTHORING_OPERATION_NATIVE_CONTRACT_SOURCES.witness_admit.run_resumed
      ),
      "run-stopped": await resolveTerminalVariant(
        "abg.operation.witness.admit",
        "run-stopped",
        RUNTIME_AUTHORING_OPERATION_NATIVE_CONTRACT_SOURCES.witness_admit.run_stopped
      )
    },
    "abg.operation.tuning.transition": {
      propose: await resolveTerminalVariant(
        "abg.operation.tuning.transition",
        "propose",
        RUNTIME_AUTHORING_OPERATION_NATIVE_CONTRACT_SOURCES.tuning_transition.propose
      ),
      ratify: await resolveTerminalVariant(
        "abg.operation.tuning.transition",
        "ratify",
        RUNTIME_AUTHORING_OPERATION_NATIVE_CONTRACT_SOURCES.tuning_transition.ratify
      ),
      reject: await resolveTerminalVariant(
        "abg.operation.tuning.transition",
        "reject",
        RUNTIME_AUTHORING_OPERATION_NATIVE_CONTRACT_SOURCES.tuning_transition.reject
      )
    },
    "abg.operation.conformance.evaluate": {
      gtl_program: await resolveTerminalVariant(
        "abg.operation.conformance.evaluate",
        "gtl_program",
        GTL_CONFORMANCE_OPERATION_NATIVE_CONTRACT_SOURCES.conformance_evaluate.gtl_program
      )
    },
    "abg.operation.product.materialize": {
      context_bootstrap: await resolveTerminalVariant(
        "abg.operation.product.materialize",
        "context_bootstrap",
        INSTALL_BOOTSTRAP_NATIVE_CONTRACT_SOURCES.product_materialize.context_bootstrap
      ),
      configuration: await resolveTerminalVariant(
        "abg.operation.product.materialize",
        "configuration",
        INSTALL_BOOTSTRAP_NATIVE_CONTRACT_SOURCES.product_materialize.configuration
      )
    },
    "abg.operation.release.snapshot": {
      published_rc: await resolveTerminalVariant(
        "abg.operation.release.snapshot",
        "published_rc",
        RELEASE_OPERATION_NATIVE_CONTRACT_SOURCES.release_snapshot.published_rc
      ),
      tapped_release: await resolveTerminalVariant(
        "abg.operation.release.snapshot",
        "tapped_release",
        RELEASE_OPERATION_NATIVE_CONTRACT_SOURCES.release_snapshot.tapped_release
      )
    }
  } as const;
  assertNonProjectReadOwnerContractFamily(family);
  return freezeNativeValue(family);
}

/** @internal */
export type NonProjectReadOwnerContractFamily = Awaited<
  ReturnType<typeof constructNonProjectReadOwnerContractFamily>
>;
