import type {
  ClosureContract,
  ContractDeclaration,
  GraphFunction,
  GtlProgram,
  ModulePublication,
} from "../gtl/contracts.js";
import { HELLO_WORLD_IDS } from "../gtl/hello_world.js";
import * as v from "valibot";
import {
  isRawAdmittedValue,
  rawAdmitValue,
  type RawSubjectKind,
} from "../validator/raw_admission.js";
import { ConformancePort } from "../validator/conformance_operation.js";
import { canonicalJson, type JsonValue } from "../shared/canonical_json.js";
import {
  isSha256Digest,
  sha256Canonical,
  type Sha256Digest,
} from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import { ABI5_PRODUCT_ID, type ProductModulePublicationBinding } from "./contracts.js";
import { resolveExactMatch } from "./exact_match.js";
import { modulePublicationSemanticDigest } from "./publication.js";

export interface Abi5RootBindingCarrier {
  readonly kind: "abi5_root_binding";
  readonly schemaVersion: "5.0.0";
  readonly bindingId: "ABI5-ROOT-001";
  readonly governorId: "abg5.root.s01.hello_world@5";
  readonly scenarioId: "ABG5-S01";
  readonly owningProductId: typeof ABI5_PRODUCT_ID;
  readonly moduleRef: typeof HELLO_WORLD_IDS.moduleRef;
  readonly programRef: typeof HELLO_WORLD_IDS.programRef;
  readonly graphFunctionRef: typeof HELLO_WORLD_IDS.graphFunctionRef;
  readonly inputContractRef: typeof HELLO_WORLD_IDS.inputContractRef;
  readonly outputContractRef: typeof HELLO_WORLD_IDS.outputContractRef;
  readonly closureContractRef: typeof HELLO_WORLD_IDS.closureContractRef;
  readonly computeRegime: "F_D";
}

export const ABI5_ROOT_BINDING: Readonly<Abi5RootBindingCarrier> = deepFreeze({
  kind: "abi5_root_binding",
  schemaVersion: "5.0.0",
  bindingId: "ABI5-ROOT-001",
  governorId: "abg5.root.s01.hello_world@5",
  scenarioId: "ABG5-S01",
  owningProductId: ABI5_PRODUCT_ID,
  moduleRef: HELLO_WORLD_IDS.moduleRef,
  programRef: HELLO_WORLD_IDS.programRef,
  graphFunctionRef: HELLO_WORLD_IDS.graphFunctionRef,
  inputContractRef: HELLO_WORLD_IDS.inputContractRef,
  outputContractRef: HELLO_WORLD_IDS.outputContractRef,
  closureContractRef: HELLO_WORLD_IDS.closureContractRef,
  computeRegime: "F_D",
});

export const ABI5_ROOT_BINDING_ASSET_PATH = "contracts/abi5-root-binding.json";
export const abi5RootBindingAssetBytes =
  `${canonicalJson(ABI5_ROOT_BINDING as unknown as JsonValue)}\n`;

export const ABI5_ROOT_BINDING_REFUSAL_CODES = [
  "invalid_carrier",
  "invalid_validation",
  "binding_mismatch",
  "publication_mismatch",
  "selection_mismatch",
  "validation_mismatch",
  "leaf_mismatch",
] as const;

export type Abi5RootBindingRefusalCode =
  (typeof ABI5_ROOT_BINDING_REFUSAL_CODES)[number];

export interface Abi5RootBindingRefusal {
  readonly kind: "abi5_root_binding_refusal";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "refused";
  readonly bindingId: "ABI5-ROOT-001";
  readonly code: Abi5RootBindingRefusalCode;
}

export interface Abi5RootBindingReceipt {
  readonly kind: "abi5_root_binding_receipt";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "verified";
  readonly rootBinding: Abi5RootBindingCarrier;
  readonly publicationBinding: ProductModulePublicationBinding;
  readonly program: Readonly<{
    readonly programRef: typeof HELLO_WORLD_IDS.programRef;
    readonly programDigest: Sha256Digest;
    readonly startRef: typeof HELLO_WORLD_IDS.startRef;
  }>;
  readonly graphFunction: Readonly<{
    readonly graphFunctionRef: typeof HELLO_WORLD_IDS.graphFunctionRef;
    readonly graphFunctionDigest: Sha256Digest;
  }>;
  readonly inputContract: Readonly<{
    readonly contractRef: typeof HELLO_WORLD_IDS.inputContractRef;
    readonly contractDigest: Sha256Digest;
  }>;
  readonly outputContract: Readonly<{
    readonly contractRef: typeof HELLO_WORLD_IDS.outputContractRef;
    readonly contractDigest: Sha256Digest;
  }>;
  readonly closureContract: Readonly<{
    readonly closureContractRef: typeof HELLO_WORLD_IDS.closureContractRef;
    readonly closureContractDigest: Sha256Digest;
  }>;
  readonly programValidation: Readonly<{
    readonly evidenceRef: string;
    readonly evidenceDigest: Sha256Digest;
    readonly validationRef: string;
    readonly validationDigest: Sha256Digest;
  }>;
  readonly executableLeafRequirementKey: string;
  readonly executableLeafRequirementKeyDigest: Sha256Digest;
  readonly receiptRef: string;
  readonly receiptDigest: Sha256Digest;
}

export type Abi5RootBindingResolution =
  | Abi5RootBindingReceipt
  | Abi5RootBindingRefusal;

const sha256DigestSchema = v.pipe(
  v.string(),
  v.regex(/^sha256:[0-9a-f]{64}$/u),
);

const rootBindingCarrierSchema = v.strictObject({
  kind: v.literal("abi5_root_binding"),
  schemaVersion: v.literal("5.0.0"),
  bindingId: v.literal(ABI5_ROOT_BINDING.bindingId),
  governorId: v.literal(ABI5_ROOT_BINDING.governorId),
  scenarioId: v.literal(ABI5_ROOT_BINDING.scenarioId),
  owningProductId: v.literal(ABI5_ROOT_BINDING.owningProductId),
  moduleRef: v.literal(ABI5_ROOT_BINDING.moduleRef),
  programRef: v.literal(ABI5_ROOT_BINDING.programRef),
  graphFunctionRef: v.literal(ABI5_ROOT_BINDING.graphFunctionRef),
  inputContractRef: v.literal(ABI5_ROOT_BINDING.inputContractRef),
  outputContractRef: v.literal(ABI5_ROOT_BINDING.outputContractRef),
  closureContractRef: v.literal(ABI5_ROOT_BINDING.closureContractRef),
  computeRegime: v.literal("F_D"),
});

const publicationBindingSchema = v.strictObject({
  moduleRef: v.literal(ABI5_ROOT_BINDING.moduleRef),
  publicationDigest: sha256DigestSchema,
});

const rootBindingReceiptSchema = v.strictObject({
  kind: v.literal("abi5_root_binding_receipt"),
  schemaVersion: v.literal("5.0.0"),
  disposition: v.literal("verified"),
  rootBinding: rootBindingCarrierSchema,
  publicationBinding: publicationBindingSchema,
  program: v.strictObject({
    programRef: v.literal(ABI5_ROOT_BINDING.programRef),
    programDigest: sha256DigestSchema,
    startRef: v.literal(HELLO_WORLD_IDS.startRef),
  }),
  graphFunction: v.strictObject({
    graphFunctionRef: v.literal(ABI5_ROOT_BINDING.graphFunctionRef),
    graphFunctionDigest: sha256DigestSchema,
  }),
  inputContract: v.strictObject({
    contractRef: v.literal(ABI5_ROOT_BINDING.inputContractRef),
    contractDigest: sha256DigestSchema,
  }),
  outputContract: v.strictObject({
    contractRef: v.literal(ABI5_ROOT_BINDING.outputContractRef),
    contractDigest: sha256DigestSchema,
  }),
  closureContract: v.strictObject({
    closureContractRef: v.literal(ABI5_ROOT_BINDING.closureContractRef),
    closureContractDigest: sha256DigestSchema,
  }),
  programValidation: v.strictObject({
    evidenceRef: v.pipe(v.string(), v.nonEmpty()),
    evidenceDigest: sha256DigestSchema,
    validationRef: v.pipe(v.string(), v.nonEmpty()),
    validationDigest: sha256DigestSchema,
  }),
  executableLeafRequirementKey: v.pipe(v.string(), v.nonEmpty()),
  executableLeafRequirementKeyDigest: sha256DigestSchema,
  receiptRef: v.pipe(v.string(), v.nonEmpty()),
  receiptDigest: sha256DigestSchema,
});

type Abi5RootBindingReceiptBody = Omit<
  Abi5RootBindingReceipt,
  "receiptRef" | "receiptDigest"
>;

function refusal(code: Abi5RootBindingRefusalCode): Abi5RootBindingRefusal {
  return deepFreeze({
    kind: "abi5_root_binding_refusal",
    schemaVersion: "5.0.0",
    disposition: "refused",
    bindingId: "ABI5-ROOT-001",
    code,
  });
}

function isExactCarrier(value: unknown): value is Abi5RootBindingCarrier {
  return v.safeParse(rootBindingCarrierSchema, value).success;
}

function admitPublicationBinding(
  value: unknown,
): ProductModulePublicationBinding | null {
  const admitted = v.safeParse(publicationBindingSchema, value);
  return admitted.success && isSha256Digest(admitted.output.publicationDigest)
    ? {
      moduleRef: admitted.output.moduleRef,
      publicationDigest: admitted.output.publicationDigest,
    }
    : null;
}

function receiptBody(
  receipt: Abi5RootBindingReceipt,
): Abi5RootBindingReceiptBody {
  const { receiptRef: _receiptRef, receiptDigest: _receiptDigest, ...body } = receipt;
  return body;
}

function receiptRefFor(receiptDigest: Sha256Digest): string {
  return `root-binding-receipt://abiogenesis/${receiptDigest.slice("sha256:".length)}`;
}

/** Pure integrity check for a content-addressed fixed-root receipt. */
export function isAbi5RootBindingReceipt(
  value: unknown,
): value is Abi5RootBindingReceipt {
  const admitted = v.safeParse(rootBindingReceiptSchema, value);
  if (!admitted.success) return false;
  const receipt = admitted.output as Abi5RootBindingReceipt;
  const receiptDigest = sha256Canonical(
    receiptBody(receipt) as unknown as JsonValue,
  );
  return receipt.receiptDigest === receiptDigest &&
    receipt.receiptRef === receiptRefFor(receiptDigest);
}

function selectOne<T>(values: readonly T[], predicate: (value: T) => boolean): T | null {
  const selected = resolveExactMatch(values, predicate);
  return selected.kind === "one" ? selected.value : null;
}

function admittedDigest<S>(
  value: unknown,
  kind: RawSubjectKind,
  contractRef: string,
): Sha256Digest | null {
  const admitted = rawAdmitValue<S>(value, kind, contractRef);
  return isRawAdmittedValue(admitted)
    ? (admitted as { readonly subjectDigest: Sha256Digest }).subjectDigest
    : null;
}

function isOnce(values: readonly Sha256Digest[], digest: Sha256Digest): boolean {
  return values.filter((value) => value === digest).length === 1;
}

/** Resolves only the fixed S01 root carrier against already-issued authority. */
export function resolveAbi5RootBinding(
  carrier: unknown,
  publicationBinding: Readonly<ProductModulePublicationBinding>,
  publication: Readonly<ModulePublication>,
): Abi5RootBindingResolution {
  try {
    if (!isExactCarrier(carrier)) return refusal("invalid_carrier");
    const exactPublicationBinding = admitPublicationBinding(publicationBinding);
    if (
      exactPublicationBinding === null
    ) return refusal("binding_mismatch");
    if (
      publication.kind !== "module_publication" ||
      publication.moduleRef !== ABI5_ROOT_BINDING.moduleRef ||
      publication.owningProductId !== ABI5_ROOT_BINDING.owningProductId ||
      modulePublicationSemanticDigest(publication) !== exactPublicationBinding.publicationDigest
    ) return refusal("publication_mismatch");
    const program = selectOne(publication.programs, (value) =>
      value.programRef === ABI5_ROOT_BINDING.programRef
    );
    const graphFunction = selectOne(publication.graphFunctions, (value) =>
      value.name === ABI5_ROOT_BINDING.graphFunctionRef
    );
    const inputContract = selectOne(publication.contracts, (value) =>
      value.contractRef === ABI5_ROOT_BINDING.inputContractRef
    );
    const outputContract = selectOne(publication.contracts, (value) =>
      value.contractRef === ABI5_ROOT_BINDING.outputContractRef
    );
    const closureContract = selectOne(publication.closureContracts, (value) =>
      value.closureContractRef === ABI5_ROOT_BINDING.closureContractRef
    );
    if (
      program === null || graphFunction === null || inputContract === null ||
      outputContract === null || closureContract === null
    ) return refusal("selection_mismatch");
    const [start] = program.starts;
    if (
      program.moduleRef !== ABI5_ROOT_BINDING.moduleRef ||
      program.closureContractRef !== ABI5_ROOT_BINDING.closureContractRef ||
      program.starts.length !== 1 ||
      start?.startRef !== HELLO_WORLD_IDS.startRef ||
      start.graphFunctionRef !== ABI5_ROOT_BINDING.graphFunctionRef ||
      program.callableMembership.length !== 1 ||
      program.callableMembership[0] !== ABI5_ROOT_BINDING.graphFunctionRef ||
      program.policies["abg.compute_regime"] !== ABI5_ROOT_BINDING.computeRegime ||
      graphFunction.declarations["abg.compute_regime"] !==
        ABI5_ROOT_BINDING.computeRegime
    ) return refusal("selection_mismatch");

    const conformance = ConformancePort.evaluateGtlProgram({
      kind: "conformance_evaluate_packet",
      schemaVersion: "5.0.0",
      memberKey: "gtl_program",
      publication,
      program,
    });
    if (conformance.kind !== "gtl_program_conformance_result") {
      return refusal("invalid_validation");
    }
    const validation = conformance.validation;
    if (
      validation.publicationDigest !== sha256Canonical(publication as unknown as JsonValue) ||
      validation.programRef !== ABI5_ROOT_BINDING.programRef
    ) return refusal("validation_mismatch");

    const programDigest = admittedDigest<GtlProgram>(program, "gtl_program", program.programRef);
    const graphFunctionDigest = admittedDigest<GraphFunction>(graphFunction, "graph_function", graphFunction.name);
    const inputContractDigest = admittedDigest<ContractDeclaration>(inputContract, "contract_declaration", inputContract.contractRef);
    const outputContractDigest = admittedDigest<ContractDeclaration>(outputContract, "contract_declaration", outputContract.contractRef);
    const closureContractDigest = admittedDigest<ClosureContract>(closureContract, "closure_contract", closureContract.closureContractRef);
    if (
      programDigest === null || graphFunctionDigest === null || inputContractDigest === null ||
      outputContractDigest === null || closureContractDigest === null
    ) return refusal("selection_mismatch");
    if (
      validation.programDigest !== programDigest ||
      validation.graphFunctionDigests.length !== 1 ||
      validation.graphFunctionDigests[0] !== graphFunctionDigest ||
      !isOnce(validation.contractDigests, inputContractDigest) ||
      !isOnce(validation.contractDigests, outputContractDigest) ||
      !isOnce(validation.closureContractDigests, closureContractDigest)
    ) return refusal("validation_mismatch");

    const [leaf] = validation.executableLeafRows;
    if (
      validation.executableLeafRows.length !== 1 ||
      validation.interactionLeafRows.length !== 0 ||
      validation.transitiveReachableExecutableLeafKeys.length !== 1 ||
      validation.transitiveReachableExecutableLeafKeys[0] !== leaf?.requirementKey ||
      validation.transitiveReachableInteractionLeafKeys.length !== 0 ||
      leaf?.fibre !== "F_D" ||
      leaf.graphFunctionRef !== ABI5_ROOT_BINDING.graphFunctionRef ||
      leaf.graphFunctionDigest !== graphFunctionDigest ||
      leaf.inputCarrierRef !== ABI5_ROOT_BINDING.inputContractRef ||
      leaf.outputCarrierRef !== ABI5_ROOT_BINDING.outputContractRef
    ) return refusal("leaf_mismatch");
    if (leaf === undefined) return refusal("leaf_mismatch");

    const body: Abi5RootBindingReceiptBody = {
      kind: "abi5_root_binding_receipt" as const,
      schemaVersion: "5.0.0" as const,
      disposition: "verified" as const,
      rootBinding: ABI5_ROOT_BINDING,
      publicationBinding: exactPublicationBinding,
      program: {
        programRef: ABI5_ROOT_BINDING.programRef,
        programDigest,
        startRef: HELLO_WORLD_IDS.startRef,
      },
      graphFunction: {
        graphFunctionRef: ABI5_ROOT_BINDING.graphFunctionRef,
        graphFunctionDigest,
      },
      inputContract: {
        contractRef: ABI5_ROOT_BINDING.inputContractRef,
        contractDigest: inputContractDigest,
      },
      outputContract: {
        contractRef: ABI5_ROOT_BINDING.outputContractRef,
        contractDigest: outputContractDigest,
      },
      closureContract: {
        closureContractRef: ABI5_ROOT_BINDING.closureContractRef,
        closureContractDigest,
      },
      programValidation: {
        evidenceRef: conformance.evidenceRef,
        evidenceDigest: conformance.evidenceDigest,
        validationRef: validation.validationRef,
        validationDigest: sha256Canonical(validation as unknown as JsonValue),
      },
      executableLeafRequirementKey: leaf.requirementKey,
      executableLeafRequirementKeyDigest: leaf.requirementKeyDigest,
    };
    const receiptDigest = sha256Canonical(body as unknown as JsonValue);
    return deepFreeze({
      ...body,
      receiptRef: receiptRefFor(receiptDigest),
      receiptDigest,
    });
  } catch {
    return refusal("publication_mismatch");
  }
}
