import { type QualificationResources } from "../validator/qualification_resources.js";
import type { QualificationResourceAssertion } from "../validator/qualification_contracts.js";
import { type RunEnvironmentResources } from "./stdo_environment.js";
import type { RunEnvironmentEvidence } from "../abg/stdo_environment.js";
import { type AbgHistoricalGraphCallSourceResource } from "../abg/terminal_result_contracts.js";
import type { AbgRunTruthProjection, AbgRunTruthRefusal } from "../abg/project_read_ports.js";
import { type JsonValue } from "../shared/canonical_json.js";
import { type OwnerSemanticOutput } from "../shared/public_function_contracts.js";
import { type RawAdmittedValue } from "../validator/index.js";
import { type DeclarationApplication, type GraphFunctionCatalogView, type ReadyGraphFunctionCatalog } from "./catalog.js";
import { type LoadedProductExecutionResolution } from "./execution_resolution.js";
import { type ProductInstall, type WorkspaceBinding } from "./environment.js";
import { constructRootInvocationPolicy, type CapabilityGrant, type ExactDirectRunInvocation, type ExactStartRunInvocation, type InvocationAuthority, type PublicInvocationCandidate } from "./invocation.js";
import { RUN_OPERATION_CONTRACTS } from "./run_operation_contracts.js";
import { type ProductInvocationSourceResultBasis } from "./semantics.js";
export type RunInvocationMemberKey = "invoke" | "start";
type InvokePacket = typeof RUN_OPERATION_CONTRACTS.invoke.invoke;
type StartPacket = typeof RUN_OPERATION_CONTRACTS.invoke.start;
type RunPacket<M extends RunInvocationMemberKey> = M extends "invoke" ? InvokePacket : StartPacket;
type ExactRunInvocation<M extends RunInvocationMemberKey> = M extends "invoke" ? ExactDirectRunInvocation : ExactStartRunInvocation;
export type ProductRunInvocationSourceAssertion = Readonly<{
    readonly kind: "none";
}> | Readonly<{
    readonly kind: "admitted_source_result";
    readonly basis: ProductInvocationSourceResultBasis;
}>;
export interface ProductRunInvocationResourceAssertion {
    readonly historicalSource?: AbgHistoricalGraphCallSourceResource;
    readonly qualificationResources?: QualificationResourceAssertion;
    readonly runEnvironmentResources?: RunEnvironmentResources;
    readonly catalog: ReadyGraphFunctionCatalog;
    readonly catalogView: GraphFunctionCatalogView;
    readonly applications: readonly DeclarationApplication[];
    readonly source: ProductRunInvocationSourceAssertion;
}
export interface PreparedProductRunInvocation<M extends RunInvocationMemberKey> {
    readonly runEnvironment: RunEnvironmentEvidence | null;
    readonly qualificationResources?: QualificationResources;
    readonly kind: "prepared_product_run_invocation";
    readonly schemaVersion: "5.0.0";
    readonly memberKey: M;
    readonly invocation: ExactRunInvocation<M>;
    readonly resolution: LoadedProductExecutionResolution;
    readonly workspaceBinding: WorkspaceBinding;
    readonly admittedInput: Readonly<Record<string, JsonValue>>;
    readonly rawInput: RawAdmittedValue<Readonly<Record<string, JsonValue>>>;
    readonly sourceResultBasis: ProductInvocationSourceResultBasis | null;
    readonly policy: ReturnType<typeof constructRootInvocationPolicy>;
    readonly grants: readonly CapabilityGrant[];
    readonly authority: InvocationAuthority;
    readonly candidate: PublicInvocationCandidate;
}
export interface ProductRunInvocationPreparationRefusal<M extends RunInvocationMemberKey> {
    readonly kind: "product_run_invocation_preparation_refusal";
    readonly memberKey: M;
    readonly ownerOutput: OwnerSemanticOutput<RunPacket<M>>;
}
export type ProductRunInvocationPreparation<M extends RunInvocationMemberKey> = PreparedProductRunInvocation<M> | ProductRunInvocationPreparationRefusal<M>;
export type ProductRunInvocationOwnerRefusal = Readonly<{
    readonly stage: "setup" | "observation" | "invocation_admission" | "graph_validation" | "execution_basis" | "open_call" | "traversal" | "run_truth";
    readonly code: string;
    readonly evidenceRefs?: readonly string[];
}>;
export declare function runOperationAuthorityMatches(invocation: ExactDirectRunInvocation | ExactStartRunInvocation | import("../shared/effect_definition.js").DefinitionCall<typeof RUN_OPERATION_CONTRACTS.continue.current_intent, unknown>["invocation"] | import("../shared/effect_definition.js").DefinitionCall<typeof RUN_OPERATION_CONTRACTS.continue.selected_action, unknown>["invocation"], resources: ProductRunInvocationResourceAssertion, resolution: LoadedProductExecutionResolution, workspaceBinding: WorkspaceBinding, admittedInstalls: readonly ProductInstall[], policy: ReturnType<typeof constructRootInvocationPolicy>, grants: readonly CapabilityGrant[], authority: Pick<InvocationAuthority, "authorityRef" | "authorityDigest">, transportResourceAssertion: JsonValue): boolean;
export declare function prepareProductRunInvocation<M extends RunInvocationMemberKey>(input: Readonly<{
    readonly memberKey: M;
    readonly invocation: ExactRunInvocation<M>;
    readonly resources: ProductRunInvocationResourceAssertion;
    readonly admittedInstalls: readonly ProductInstall[];
    readonly workspaceBinding: WorkspaceBinding;
    readonly verifyInstallAdmission: (install: ProductInstall) => boolean;
    readonly transportResourceAssertion: JsonValue;
}>): Promise<ProductRunInvocationPreparation<M>>;
export declare function constructRunInvocationOwnerRefusal<M extends RunInvocationMemberKey>(memberKey: M, owner: ProductRunInvocationOwnerRefusal): OwnerSemanticOutput<RunPacket<M>>;
export declare function constructRunInvocationOutcome<M extends RunInvocationMemberKey>(memberKey: M, truth: AbgRunTruthProjection | AbgRunTruthRefusal): OwnerSemanticOutput<RunPacket<M>>;
export declare const ProductRunInvocationPort: Readonly<{
    prepare: typeof prepareProductRunInvocation;
    projectOutcome: typeof constructRunInvocationOutcome;
    projectOwnerRefusal: typeof constructRunInvocationOwnerRefusal;
}>;
export {};
