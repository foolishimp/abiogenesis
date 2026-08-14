import { isAbsolute, relative, resolve } from "node:path";
import { pathToFileURL } from "node:url";

import { hasAdmittedProductInstall } from "../abg/environment_admission.js";
import type { ExactPrefixArtifactTruthProjection } from "../abg/artifact_truth.js";
import {
  hasAdmittedImplementationSetAtPrefix,
  type AdmittedImplementationSet,
} from "../abg/execution_basis.js";
import type { ValidatedRuntimeEventPrefix } from "../abg/event_prefix.js";
import type { ModulePublication } from "../gtl/contracts.js";
import {
  inspectProductLeafSemanticsProjection,
  type InstalledLeafSemanticsProjection,
} from "../product/semantics.js";
import type { JsonValue } from "../shared/canonical_json.js";
import { sha256Canonical } from "../shared/digests.js";
import { admitIJsonValue } from "../shared/i_json.js";
import { validateActorProcessCarrierPair } from "../abg/actor_process.js";
import type {
  ClosedLeafInvocationReceipt,
  ClosedLeafOwnerReceipt,
  LeafInvocationPort,
  LeafInvocationOwnerRefusal,
  LeafInvocationOwnerResult,
  LeafInvocationResolution,
  LeafRealizationCandidate,
  ProbabilisticLeafEffectPort,
  ProbabilisticLeafInvocationReceipt,
  ProbabilisticResultContractPreimageRefusal,
  ProbabilisticResultContractPreimageVerification,
} from "./contracts.js";
import { deepFreeze, isDeeplyFrozen } from "../shared/immutable.js";

export type LeafInvocationInstall =
  Parameters<typeof hasAdmittedProductInstall>[1];

export function isClosedProbabilisticLeafInvocation(
  value: unknown,
): value is Readonly<ProbabilisticLeafInvocationReceipt<unknown>> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }
  const receipt = value as Partial<ProbabilisticLeafInvocationReceipt<unknown>>;
  const exchange = receipt.actorProcessExchange;
  const receiptKeys = Reflect.ownKeys(value);
  const exchangeKeys = typeof exchange === "object" && exchange !== null
    ? Reflect.ownKeys(exchange)
    : [];
  if (
    receiptKeys.length !== 5 ||
    !["actorProcessExchange", "candidate", "computeRegime", "kind", "schemaVersion"]
      .every((key) => receiptKeys.includes(key)) ||
    exchangeKeys.length !== 5 ||
    !["disposition", "kind", "observation", "request", "schemaVersion"]
      .every((key) => exchangeKeys.includes(key)) ||
    !isDeeplyFrozen(value)
  ) return false;
  const validated = validateActorProcessCarrierPair(
    exchange?.request,
    exchange?.observation,
  );
  return receipt.kind === "leaf_invocation_receipt" &&
    receipt.schemaVersion === "5.0.0" &&
    receipt.computeRegime === "F_P" &&
    Object.hasOwn(receipt, "candidate") &&
    typeof exchange === "object" && exchange !== null &&
    exchange.kind === "actor_process_carrier_validation" &&
    exchange.schemaVersion === "5.0.0" &&
    exchange.disposition === "valid" &&
    validated.kind === "actor_process_carrier_validation" &&
    sha256Canonical(validated as unknown as JsonValue) ===
      sha256Canonical(exchange as unknown as JsonValue);
}

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasExactDataFields(
  value: Readonly<Record<string, unknown>>,
  fields: readonly string[],
): boolean {
  const keys = Reflect.ownKeys(value);
  if (keys.some((key) => typeof key !== "string")) return false;
  const actual = (keys as string[]).sort();
  const expected = [...fields].sort();
  return actual.length === expected.length &&
    actual.every((key, index) => key === expected[index]) &&
    actual.every((key) => {
      const descriptor = Object.getOwnPropertyDescriptor(value, key);
      return descriptor !== undefined &&
        Object.hasOwn(descriptor, "value") &&
        descriptor.enumerable === true;
    });
}

function isDeterministicEvidenceCandidate(value: unknown): boolean {
  return isRecord(value) &&
    hasExactDataFields(value, [
      "implementationRef",
      "inputDigest",
      "kind",
      "outputDigest",
      "schemaVersion",
    ]) &&
    value.kind === "deterministic_evidence_candidate" &&
    value.schemaVersion === "5.0.0" &&
    typeof value.implementationRef === "string" &&
    typeof value.inputDigest === "string" &&
    /^sha256:[a-f0-9]{64}$/u.test(value.inputDigest) &&
    typeof value.outputDigest === "string" &&
    /^sha256:[a-f0-9]{64}$/u.test(value.outputDigest);
}

function isLeafRealizationCandidate(
  value: unknown,
  regime: "F_D" | "F_P",
  validateSuccess: (value: unknown) => boolean,
  failureValueKind: string,
): value is Readonly<LeafRealizationCandidate> {
  if (!isRecord(value) || !Array.isArray(value.evidenceCandidates)) return false;
  if (!hasExactDataFields(
    value,
    value.disposition === "failure"
      ? [
        "diagnosticRef",
        "disposition",
        "evidenceCandidates",
        "kind",
        "resultCandidate",
        "schemaVersion",
      ]
      : [
        "disposition",
        "evidenceCandidates",
        "kind",
        "resultCandidate",
        "schemaVersion",
      ],
  )) return false;
  const evidence = Array.from(value.evidenceCandidates);
  return value.kind === "leaf_realization_candidate" &&
    value.schemaVersion === "5.0.0" &&
    (value.disposition === "success" || value.disposition === "failure") &&
    (regime === "F_D" ? evidence.length > 0 : evidence.length === 0) &&
    evidence.every(isDeterministicEvidenceCandidate) &&
    isRecord(value.resultCandidate) &&
    value.resultCandidate.schemaVersion === "5.0.0" &&
    (value.disposition === "success"
      ? validateSuccess(value.resultCandidate)
      : value.resultCandidate.kind === failureValueKind &&
        typeof value.diagnosticRef === "string" &&
        value.resultCandidate.diagnosticRef === value.diagnosticRef);
}

export function totalizeLeafImplementationFailure(input: Readonly<{
  resolution: Readonly<LeafInvocationResolution>;
  inputDigest: `sha256:${string}`;
  failureValueKind: string;
  failureClass: "implementation_exception" | "malformed_return";
}>,
): Readonly<LeafRealizationCandidate> {
  const { resolution, inputDigest, failureValueKind, failureClass } = input;
  const diagnosticRef =
    `diagnostic://abiogenesis/implementation/${failureClass.replaceAll("_", "-")}@5`;
  const resultCandidate = deepFreeze({
    kind: failureValueKind,
    schemaVersion: "5.0.0" as const,
    failureClass,
    diagnosticRef,
  }) as Readonly<Record<string, JsonValue>>;
  const evidenceCandidates = resolution.computeRegime === "F_D"
    ? [{
        kind: "deterministic_evidence_candidate" as const,
        schemaVersion: "5.0.0" as const,
        implementationRef: resolution.implementationRef,
        inputDigest,
        outputDigest: sha256Canonical(resultCandidate),
      }]
    : [];
  const candidate = deepFreeze({
    kind: "leaf_realization_candidate" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "failure" as const,
    evidenceCandidates,
    resultCandidate,
    diagnosticRef,
  });
  if (!isLeafRealizationCandidate(
    candidate,
    resolution.computeRegime,
    () => false,
    failureValueKind,
  )) {
    throw new TypeError(
      "leaf implementation failure totalization violated its regime contract",
    );
  }
  return candidate;
}

function closedInvocationReceipt(
  regime: "F_D" | "F_P",
  candidate: Readonly<LeafRealizationCandidate>,
  exchange: Readonly<ProbabilisticLeafInvocationReceipt<unknown>>["actorProcessExchange"] | null,
): Readonly<ClosedLeafInvocationReceipt> {
  return regime === "F_P"
    ? deepFreeze({
        kind: "leaf_invocation_receipt" as const,
        schemaVersion: "5.0.0" as const,
        computeRegime: "F_P" as const,
        candidate,
        actorProcessExchange: exchange!,
      })
    : deepFreeze({
        kind: "leaf_invocation_receipt" as const,
        schemaVersion: "5.0.0" as const,
        computeRegime: "F_D" as const,
        candidate,
        actorProcessExchange: null,
      });
}

function closedOwnerReceipt(
  candidate: Readonly<LeafRealizationCandidate>,
  receipt: Readonly<ClosedLeafInvocationReceipt> | null,
  workerContracts: ClosedLeafOwnerReceipt["workerContracts"],
): Readonly<ClosedLeafOwnerReceipt> {
  return deepFreeze({
    kind: "closed_leaf_owner_receipt" as const,
    schemaVersion: "5.0.0" as const,
    candidate,
    receipt,
    workerContracts,
  });
}

function ownerRefusal(
  code: LeafInvocationOwnerRefusal["code"],
): Readonly<LeafInvocationOwnerRefusal> {
  return deepFreeze({
    kind: "leaf_invocation_owner_refusal" as const,
    schemaVersion: "5.0.0" as const,
    code,
    diagnosticRef:
      `diagnostic://abiogenesis/implementation/${code.replaceAll("_", "-")}@5`,
  });
}

type WorkerContracts = NonNullable<ClosedLeafOwnerReceipt["workerContracts"]>;

function preimageRefusal(
  code: ProbabilisticResultContractPreimageRefusal["code"],
): Readonly<ProbabilisticResultContractPreimageRefusal> {
  return deepFreeze({
    kind: "probabilistic_result_contract_preimage_refusal" as const,
    schemaVersion: "5.0.0" as const,
    code,
    diagnosticRef:
      `diagnostic://abiogenesis/implementation/${code.replaceAll("_", "-")}@5`,
  });
}

export async function invokeLeafOwnerBoundary(input: Readonly<{
  resolution: Readonly<LeafInvocationResolution>;
  value: Readonly<Record<string, JsonValue>>;
  inputDigest: `sha256:${string}`;
  failureValueKind: string;
  verifyAuthority: () => boolean | Promise<boolean>;
  validateSuccess: (value: unknown) => boolean;
  resolveWorkerContracts: (
    resolution: Readonly<LeafInvocationResolution>,
    value: Readonly<Record<string, JsonValue>>,
  ) => Readonly<WorkerContracts> | null;
  bindProbabilisticEffects: ((
    workerContracts: Readonly<WorkerContracts>,
  ) => ProbabilisticLeafEffectPort) | null;
  loadImplementation: () => Promise<unknown>;
}>): Promise<Readonly<LeafInvocationOwnerResult>> {
  const { resolution, inputDigest, failureValueKind } = input;
  let workerContracts: Readonly<WorkerContracts> | null = null;
  const totalized = (
    failureClass: "implementation_exception" | "malformed_return",
    receipt: Readonly<ClosedLeafInvocationReceipt> | null = null,
  ): Readonly<ClosedLeafOwnerReceipt> => {
    const candidate = totalizeLeafImplementationFailure({
      resolution,
      inputDigest,
      failureValueKind,
      failureClass,
    });
    const sanitizedReceipt = receipt === null
      ? null
      : closedInvocationReceipt(
          resolution.computeRegime,
          candidate,
          receipt.computeRegime === "F_P"
            ? receipt.actorProcessExchange
            : null,
        );
    return closedOwnerReceipt(candidate, sanitizedReceipt, workerContracts);
  };

  try {
    if (
      !(await input.verifyAuthority()) ||
      sha256Canonical(input.value) !== inputDigest
    ) {
      return totalized("implementation_exception");
    }
    workerContracts = resolution.computeRegime === "F_P"
      ? input.resolveWorkerContracts(resolution, input.value)
      : null;
    const effects = resolution.computeRegime === "F_P" && workerContracts !== null
      ? input.bindProbabilisticEffects?.(workerContracts) ?? null
      : null;
    if (
      (resolution.computeRegime === "F_P" &&
        (workerContracts === null || effects === null)) ||
      (resolution.computeRegime === "F_D" &&
        (workerContracts !== null || input.bindProbabilisticEffects !== null))
    ) {
      return totalized("implementation_exception");
    }
    const implementation = await input.loadImplementation();
    if (typeof implementation !== "function") {
      return totalized("implementation_exception");
    }
    if (resolution.computeRegime === "F_P") {
      const implementationOutput: unknown = await implementation(input.value, effects);
      let rawReceipt: unknown;
      try {
        rawReceipt = admitIJsonValue(
          implementationOutput,
          "probabilistic leaf owner output",
        );
      } catch {
        return totalized("malformed_return");
      }
      if (!isClosedProbabilisticLeafInvocation(rawReceipt)) {
        return totalized("malformed_return");
      }
      const rawCandidate = rawReceipt.candidate;
      const safeRawReceipt = closedInvocationReceipt(
        "F_P",
        totalizeLeafImplementationFailure({
          resolution,
          inputDigest,
          failureValueKind,
          failureClass: "malformed_return",
        }),
        rawReceipt.actorProcessExchange,
      );
      let valid = false;
      try {
        valid = isLeafRealizationCandidate(
          rawCandidate,
          "F_P",
          input.validateSuccess,
          failureValueKind,
        );
      } catch {
        valid = false;
      }
      if (!valid) return totalized("malformed_return", safeRawReceipt);
      const candidate = rawCandidate as Readonly<LeafRealizationCandidate>;
      return closedOwnerReceipt(
        candidate,
        closedInvocationReceipt(
          "F_P",
          candidate,
          rawReceipt.actorProcessExchange,
        ),
        workerContracts,
      );
    }
    const implementationOutput: unknown = await implementation(input.value);
    let admittedCandidate: unknown;
    try {
      admittedCandidate = admitIJsonValue(
        implementationOutput,
        "deterministic leaf owner output",
      );
    } catch {
      admittedCandidate = null;
    }
    let valid = false;
    try {
      valid = isLeafRealizationCandidate(
        admittedCandidate,
        "F_D",
        input.validateSuccess,
        failureValueKind,
      );
    } catch {
      valid = false;
    }
    if (!valid) {
      const sanitized = totalizeLeafImplementationFailure({
        resolution,
        inputDigest,
        failureValueKind,
        failureClass: "malformed_return",
      });
      return closedOwnerReceipt(
        sanitized,
        closedInvocationReceipt("F_D", sanitized, null),
        null,
      );
    }
    const candidate = admittedCandidate as Readonly<LeafRealizationCandidate>;
    return closedOwnerReceipt(
      candidate,
      closedInvocationReceipt("F_D", candidate, null),
      null,
    );
  } catch {
    try {
      return totalized("implementation_exception");
    } catch {
      return ownerRefusal("owner_boundary_exception");
    }
  }
}

export function isAdmittedLeafInvocationPort(value: object): boolean {
  const candidate = value as Partial<LeafInvocationPort>;
  let exactLoadedCapability = false;
  try {
    exactLoadedCapability =
      typeof candidate.isExactLoadedCapability === "function" &&
      candidate.isExactLoadedCapability.call(value) === true;
  } catch {
    exactLoadedCapability = false;
  }
  return exactLoadedCapability &&
    candidate.kind === "admitted_leaf_invocation_port" &&
    typeof candidate.installId === "string" && candidate.installId.length > 0 &&
    typeof candidate.implementationSetRef === "string" &&
      candidate.implementationSetRef.length > 0 &&
    typeof candidate.implementationSetDigest === "string" &&
      candidate.implementationSetDigest.startsWith("sha256:") &&
    typeof candidate.publicationDigest === "string" &&
      candidate.publicationDigest.startsWith("sha256:") &&
    typeof candidate.contractValueKindByRef === "function" &&
    typeof candidate.validateContractValueByRef === "function" &&
    typeof candidate.contractValueKind === "function" &&
    typeof candidate.validateContractValue === "function" &&
    typeof candidate.resolveJudgmentRelation === "function" &&
    typeof candidate.validateResultEvidenceLineage === "function" &&
    typeof candidate.verifyProbabilisticResultContractPreimage === "function" &&
    typeof candidate.invoke === "function";
}

export function isAdmittedLeafInvocationResolution(
  port: object,
  resolution: object,
): boolean {
  if (!isAdmittedLeafInvocationPort(port)) return false;
  const candidate = port as LeafInvocationPort;
  return candidate.publication.implementationBindings.some((binding) =>
    binding.implementationRef ===
      (resolution as LeafInvocationResolution).implementationRef &&
    binding.inputContractRef ===
      (resolution as LeafInvocationResolution).inputContractRef &&
    binding.outputContractRef ===
      (resolution as LeafInvocationResolution).outputContractRef
  );
}

function leafInvocationBindingMatches(authority: Readonly<{
  install: Pick<
    LeafInvocationInstall,
    | "installId"
    | "manifestDigest"
    | "packageName"
    | "packageVersion"
    | "productContentDigest"
  >;
  implementationSet: Pick<
    AdmittedImplementationSet,
    "publicationDigest" | "rows"
  >;
  publication: Readonly<ModulePublication>;
  semanticsProjection: unknown;
}>): boolean {
  const publicationDigest = sha256Canonical(
    authority.publication as unknown as JsonValue,
  );
  const semanticsBinding = authority.publication.productSemanticsBinding;
  const inspected = inspectProductLeafSemanticsProjection(
    authority.semanticsProjection,
  );
  return (
    inspected !== null &&
    authority.implementationSet.publicationDigest === publicationDigest &&
    authority.implementationSet.rows.every(
      (row) =>
        row.packageName === authority.install.packageName &&
        row.packageVersion === authority.install.packageVersion,
    ) &&
    inspected.projection.installId === authority.install.installId &&
    inspected.projection.productContentDigest ===
      authority.install.productContentDigest &&
    inspected.projection.manifestDigest === authority.install.manifestDigest &&
    inspected.projection.publicationDigest === publicationDigest &&
    inspected.projection.bindingRef === semanticsBinding.bindingRef &&
    inspected.projection.packageName === semanticsBinding.packageName &&
    inspected.projection.packageVersion === semanticsBinding.packageVersion
  );
}

export async function constructAdmittedLeafInvocationPort(authority: {
  readonly prefix: ValidatedRuntimeEventPrefix;
  readonly artifactTruth: ExactPrefixArtifactTruthProjection;
  readonly install: LeafInvocationInstall;
  readonly implementationSet: AdmittedImplementationSet;
  readonly publication: Readonly<ModulePublication>;
  readonly semanticsProjection: InstalledLeafSemanticsProjection;
}): Promise<LeafInvocationPort> {
  const publicationDigest = sha256Canonical(authority.publication as unknown as JsonValue);
  const inspected = inspectProductLeafSemanticsProjection(
    authority.semanticsProjection,
  );
  if (
    inspected === null ||
    !hasAdmittedProductInstall(authority.artifactTruth, authority.install) ||
    !hasAdmittedImplementationSetAtPrefix(
      authority.prefix,
      authority.implementationSet,
    ) ||
    !leafInvocationBindingMatches(authority) ||
    !(await inspected.runtime.verifyInstalledContent())
  ) {
    throw new TypeError(
      "leaf invocation port requires one exact admitted install, publication, and implementation set",
    );
  }
  const semantics = inspected.runtime;
  const modules = new Map<string, Promise<Record<string, unknown>>>();

  function uniqueContractByRef(contractRef: string) {
    const matches = authority.publication.contracts.filter(
      (contract) => contract.contractRef === contractRef,
    );
    const contract = matches.length === 1 ? matches[0] : undefined;
    return contract !== undefined && contract.valueKind.length > 0
      ? contract
      : null;
  }

  async function loadModule(modulePath: string): Promise<Record<string, unknown>> {
    const exactPath = resolve(authority.install.installedRoot, modulePath);
    const relation = relative(authority.install.installedRoot, exactPath);
    if (relation.length === 0 || relation.startsWith("..") || isAbsolute(relation)) {
      throw new TypeError("leaf implementation module escapes the admitted Product install");
    }
    let loaded = modules.get(exactPath);
    if (loaded === undefined) {
      loaded = import(pathToFileURL(exactPath).href) as Promise<Record<string, unknown>>;
      modules.set(exactPath, loaded);
    }
    return loaded;
  }

  function exactAdmittedResolution(
    resolution: Readonly<LeafInvocationResolution>,
  ): AdmittedImplementationSet["rows"][number] | null {
    const resolutionDigest = sha256Canonical(
      resolution as unknown as JsonValue,
    );
    const matches = authority.implementationSet.rows.filter(
      (row) =>
        sha256Canonical(row as unknown as JsonValue) === resolutionDigest,
    );
    return matches.length === 1 ? matches[0]! : null;
  }

  function resolveWorkerContracts(
    resolution: Readonly<LeafInvocationResolution>,
    input: Readonly<Record<string, JsonValue>>,
  ): Readonly<WorkerContracts> | null {
    const admittedResolution = exactAdmittedResolution(resolution);
    if (admittedResolution === null) return null;
    return semantics.resolveProbabilisticWorkerContracts({
      inputContractRef: admittedResolution.inputContractRef,
      outputContractRef: admittedResolution.outputContractRef,
      input,
    });
  }

  const port = Object.freeze({
    kind: "admitted_leaf_invocation_port" as const,
    isExactLoadedCapability(): boolean {
      return this === port;
    },
    installId: authority.install.installId,
    implementationSetRef: authority.implementationSet.implementationSetRef,
    implementationSetDigest: authority.implementationSet.implementationSetDigest,
    publicationDigest,
    publication: authority.publication,
    contractValueKindByRef(contractRef: string): string | null {
      return uniqueContractByRef(contractRef)?.valueKind ?? null;
    },
    validateContractValueByRef(
      contractRef: string,
      value: unknown,
    ): value is Readonly<Record<string, JsonValue>> {
      const contract = uniqueContractByRef(contractRef);
      return contract !== null &&
        semantics.validateContractValue(contract.valueKind, value);
    },
    contractValueKind(
      contractRef: string,
      contractKind: "failure" | "output",
    ): string | null {
      return authority.publication.contracts.find(
        (contract) =>
          contract.contractRef === contractRef &&
          contract.contractKind === contractKind,
      )?.valueKind ?? null;
    },
    validateContractValue(
      contractRef: string,
      contractKind: "failure" | "output",
      value: unknown,
    ): value is Readonly<Record<string, JsonValue>> {
      const valueKind = authority.publication.contracts.find(
        (contract) =>
          contract.contractRef === contractRef &&
          contract.contractKind === contractKind,
      )?.valueKind;
      return valueKind !== undefined &&
        semantics.validateContractValue(valueKind, value);
    },
    resolveJudgmentRelation(predicateRef: string) {
      return semantics.resolveJudgmentRelation(predicateRef);
    },
    validateResultEvidenceLineage(
      outputContractRef: string,
      value: Readonly<Record<string, JsonValue>>,
      admittedEvidence: readonly Readonly<Record<string, JsonValue>>[],
    ) {
      return semantics.validateResultEvidenceLineage({
        outputContractRef,
        value,
        admittedEvidence,
      });
    },
    verifyProbabilisticResultContractPreimage(
      input: Parameters<
        LeafInvocationPort["verifyProbabilisticResultContractPreimage"]
      >[0],
    ): Readonly<ProbabilisticResultContractPreimageVerification> {
      try {
        const admittedResolution = exactAdmittedResolution(input.resolution);
        if (
          this !== port ||
          !isAdmittedLeafInvocationPort(port) ||
          input.resolution.computeRegime !== "F_P" ||
          !hasAdmittedProductInstall(authority.artifactTruth, authority.install) ||
          !hasAdmittedImplementationSetAtPrefix(
            authority.prefix,
            authority.implementationSet,
          ) ||
          admittedResolution === null
        ) {
          return preimageRefusal("unadmitted_resolution");
        }
        if (
          sha256Canonical(input.input as unknown as JsonValue) !==
            input.inputDigest ||
          !port.validateContractValueByRef(
            input.resolution.inputContractRef,
            input.input,
          )
        ) {
          return preimageRefusal("input_contract_refused");
        }
        const workerContracts = resolveWorkerContracts(
          input.resolution,
          input.input,
        );
        if (
          workerContracts === null ||
          workerContracts.instructionContractRef !==
            input.instructionContractRef ||
          workerContracts.resultContractRef !== input.rawResultContractRef
        ) {
          return preimageRefusal("contract_identity_mismatch");
        }
        if (!port.validateContractValueByRef(
          workerContracts.resultContractRef,
          input.rawResult,
        )) {
          return preimageRefusal("result_contract_refused");
        }
        const body = deepFreeze({
          contractCapabilityBasis: {
            installId: port.installId,
            implementationSetRef: port.implementationSetRef,
            implementationSetDigest: port.implementationSetDigest,
            publicationDigest: port.publicationDigest,
          },
          implementationResolutionDigest: sha256Canonical(
            admittedResolution as unknown as JsonValue,
          ),
          implementationRef: admittedResolution.implementationRef,
          inputContractRef: admittedResolution.inputContractRef,
          targetOutputContractRef: admittedResolution.outputContractRef,
          instructionContractRef: workerContracts.instructionContractRef,
          rawResultContractRef: workerContracts.resultContractRef,
          inputDigest: input.inputDigest,
          rawResultDigest: sha256Canonical(
            input.rawResult as unknown as JsonValue,
          ),
        });
        const verificationDigest = sha256Canonical(body as unknown as JsonValue);
        return deepFreeze({
          kind: "verified_probabilistic_result_contract_preimage" as const,
          schemaVersion: "5.0.0" as const,
          verificationRef:
            `probabilistic-result-contract-preimage://abiogenesis/${verificationDigest.slice("sha256:".length)}`,
          verificationDigest,
          ...body,
        });
      } catch {
        return preimageRefusal("owner_boundary_exception");
      }
    },
    async invoke(
      call: Parameters<LeafInvocationPort["invoke"]>[0],
    ): Promise<Readonly<LeafInvocationOwnerResult>> {
      try {
        if (this !== port) return ownerRefusal("owner_boundary_exception");
        const failureValueKind = port.contractValueKind(
          call.failureContractRef,
          "failure",
        );
        if (failureValueKind === null) {
          return ownerRefusal("failure_contract_absent");
        }
        return invokeLeafOwnerBoundary({
          resolution: call.resolution,
          value: call.input,
          inputDigest: call.inputDigest,
          failureValueKind,
          verifyAuthority: async () =>
            isAdmittedLeafInvocationPort(port) &&
            hasAdmittedProductInstall(authority.artifactTruth, authority.install) &&
            hasAdmittedImplementationSetAtPrefix(
              authority.prefix,
              authority.implementationSet,
            ) &&
            exactAdmittedResolution(call.resolution) !== null &&
            await semantics.verifyInstalledContent(),
          validateSuccess: (value) => port.validateContractValue(
            call.resolution.outputContractRef,
            "output",
            value,
          ),
          resolveWorkerContracts,
          bindProbabilisticEffects: call.bindProbabilisticEffects,
          loadImplementation: async () => {
            const module = await loadModule(call.resolution.modulePath);
            return module[call.resolution.namedSymbol];
          },
        });
      } catch {
        return ownerRefusal("owner_boundary_exception");
      }
    },
  }) satisfies LeafInvocationPort;
  return port;
}
