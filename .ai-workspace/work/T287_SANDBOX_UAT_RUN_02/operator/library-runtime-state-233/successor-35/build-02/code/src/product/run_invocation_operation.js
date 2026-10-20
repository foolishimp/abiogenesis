import { acquireQualificationResources } from "../validator/qualification_resources.js";
import { isQualificationAssessmentInput, establishQualificationAssessment } from "../validator/qualification.js";
import { isSelfConformanceInput } from "../validator/self_conformance_contracts.js";
import { resolveSelfConformanceInput, isQualificationReferenceForm, resolveQualificationProof } from "../validator/qualification_resources.js";
import { readSelfConformanceCatalog } from "../validator/self_conformance.js";
import { qualificationScopeCorrespondence } from "../validator/qualification.js";
import { isRecord } from "../shared/admission_predicates.js";
import { observeRunEnvironment } from "./stdo_environment.js";
import { isAbgTypedTerminalResult } from "../abg/terminal_result_contracts.js";
import { canonicalJson } from "../shared/canonical_json.js";
import { sha256Bytes, sha256Canonical } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import { admitRuntimeContract, } from "../shared/public_function_contracts.js";
import { rawAdmitValue } from "../validator/index.js";
import { applyCatalogDeclaration, } from "./catalog.js";
import { ProductExecutionResolutionPort, } from "./execution_resolution.js";
import { productInstallCoordinate } from "./environment.js";
import { constructCapabilityGrant, constructExactDirectInvocation, constructExactStartInvocation, constructInvocationAuthority, constructRootInvocationPolicy, DIRECT_INVOKE_CAPABILITY, } from "./invocation.js";
import { RUN_OPERATION_CONTRACTS } from "./run_operation_contracts.js";
import { admitInstalledProductInput, validateInstalledInvocationBasis, } from "./semantics.js";
function packet(memberKey) {
    return RUN_OPERATION_CONTRACTS.invoke[memberKey];
}
function validatedOutput(memberKey, output) {
    const ownerPacket = packet(memberKey);
    const schema = output.outcomeKind === "result"
        ? ownerPacket.resultSchema
        : output.outcomeKind === "refusal"
            ? ownerPacket.refusalSchema
            : ownerPacket.nonTerminalSchema;
    if (schema === null ||
        admitRuntimeContract(schema, output.value).disposition !== "admitted") {
        throw new TypeError("Product.RunInvocation output differs from its exact owner contract");
    }
    return deepFreeze(output);
}
function refusal(memberKey, code, issuePaths, evidenceRefs = []) {
    return validatedOutput(memberKey, {
        outcomeKind: "refusal",
        value: { code, issuePaths, evidenceRefs },
    });
}
function preparationRefusal(memberKey, code, issuePaths) {
    return deepFreeze({
        kind: "product_run_invocation_preparation_refusal",
        memberKey,
        ownerOutput: refusal(memberKey, code, issuePaths),
    });
}
function exactJson(left, right) {
    try {
        return canonicalJson(left) === canonicalJson(right);
    }
    catch {
        return false;
    }
}
function catalogRef(digest) {
    return `graph-function-catalog://abiogenesis/${digest.slice("sha256:".length)}`;
}
function catalogViewRef(digest) {
    return `graph-function-catalog-view://abiogenesis/${digest.slice("sha256:".length)}`;
}
function exactApplications(view, applications) {
    try {
        return new Set(applications.map((row) => row.applicationRef)).size ===
            applications.length && applications.every((application) => {
            const reconstructed = applyCatalogDeclaration(view, {
                applicationKind: application.declaration.declarationKind,
                handle: application.declaration.handle,
                targetRef: application.targetRef,
                targetDigest: application.targetDigest,
                appliedValueRef: application.appliedValueRef,
                appliedValueDigest: application.appliedValueDigest,
            });
            return reconstructed.kind === "declaration_application" &&
                exactJson(reconstructed, application);
        });
    }
    catch {
        return false;
    }
}
function startSelection(request) {
    if (request.scope !== "program" || request.until !== "converged" ||
        (request.rootMode !== "direct" && request.rootMode !== "supervised") ||
        !isRecord(request.target))
        return null;
    if (request.target.kind === "next") {
        return {
            kind: "start",
            scope: "program",
            target: "next",
            until: "converged",
            rootMode: request.rootMode,
        };
    }
    if (request.target.kind === "graph_function" &&
        typeof request.target.handle === "string") {
        return {
            kind: "start",
            scope: "program",
            target: "graph_function",
            graphFunctionHandle: request.target.handle,
            until: "converged",
            rootMode: request.rootMode,
        };
    }
    if (request.target.kind === "asset" &&
        typeof request.target.handle === "string") {
        return {
            kind: "start",
            scope: "program",
            target: `asset:${request.target.handle}`,
            until: "converged",
            rootMode: request.rootMode,
        };
    }
    if (request.target.kind === "declared_start" &&
        isRecord(request.target.start) &&
        typeof request.target.start.ref === "string") {
        return {
            kind: "start",
            scope: "program",
            target: request.target.start.ref,
            startRef: request.target.start.ref,
            until: "converged",
            rootMode: request.rootMode,
        };
    }
    return null;
}
function resolutionRefusalCode(result) {
    return result.stage === "catalog"
        ? "invalid_target"
        : result.stage === "implementation"
            ? "invalid_graph_function"
            : "invalid_program";
}
function sourceBasis(request, assertion) {
    if (!isRecord(request.sourceBasis))
        return false;
    if (request.sourceBasis.kind === "none") {
        return assertion.kind === "none" ? null : false;
    }
    if (request.sourceBasis.kind !== "admitted_source_result" ||
        assertion.kind !== "admitted_source_result" ||
        !isRecord(request.sourceBasis.projectionAuthority) ||
        !isRecord(request.sourceBasis.sourceResult))
        return false;
    return request.sourceBasis.projectionAuthority.digest ===
        assertion.basis.publicAuthorityDigest &&
        request.sourceBasis.sourceResult.ref === assertion.basis.sourceResultRef &&
        request.sourceBasis.sourceResult.digest === assertion.basis.sourceResultDigest
        ? assertion.basis
        : false;
}
export function runOperationAuthorityMatches(invocation, resources, resolution, workspaceBinding, admittedInstalls, policy, grants, authority, transportResourceAssertion) {
    const slots = invocation.invocationAuthority.slots;
    const workspace = slots.workspace_binding;
    const lock = slots.dependency_lock;
    const productSet = slots.product_set;
    const catalogScope = slots.catalog_scope;
    const program = slots.execution_program;
    const graphFunction = slots.graph_function;
    const actor = slots.actor;
    const sessionPolicy = slots.session_policy;
    const capabilities = slots.capability_grants;
    const steering = slots.transport_steering;
    const isContinue = invocation.definitionKey.operationId === "abg.operation.run.continue";
    const requiredCapabilities = (isContinue ? RUN_OPERATION_CONTRACTS.continue[invocation.definitionKey.memberKey]
        : packet(invocation.definitionKey.memberKey)).metadata.capabilityRefs;
    const steeringDigest = sha256Canonical(transportResourceAssertion);
    const authorityRequest = invocation.request;
    const inputSlot = slots.input_contract;
    // The public binder authenticates slot syntax/digests; this owner joins the
    // exact asserted input to the selected request, just as the other coordinates.
    const exactInputAuthority = inputSlot !== null && (isContinue
        ? invocation.definitionKey.memberKey === "selected_action"
            ? inputSlot.valueDigest === sha256Canonical(inputSlot.value) // exact selected cursor/input joins in its owner
            : isRecord(authorityRequest.continuationInput) && inputSlot.valueDigest === authorityRequest.continuationInput.digest
        : invocation.definitionKey.memberKey === "start"
            ? exactJson(inputSlot, authorityRequest.input)
            : exactJson(inputSlot.contract, authorityRequest.inputContract) && exactJson(inputSlot.value, authorityRequest.input) &&
                inputSlot.valueDigest === sha256Canonical(authorityRequest.input));
    const requestTarget = isRecord(authorityRequest.target)
        ? authorityRequest.target
        : null;
    const requiresGraphFunction = isContinue || invocation.definitionKey.memberKey ===
        "invoke" || requestTarget?.kind === "graph_function";
    const exactGraphFunctionAuthority = requiresGraphFunction
        ? graphFunction !== null &&
            graphFunction.graphFunction.ref ===
                resolution.resolution.graphFunctionRef &&
            graphFunction.graphFunction.digest ===
                resolution.resolution.graphFunctionDigest &&
            graphFunction.membership.ref ===
                resolution.resolution.programGraphFunctionMembership.ref &&
            graphFunction.membership.digest ===
                resolution.resolution.programGraphFunctionMembership.digest
        : graphFunction === null;
    return workspace !== null && workspace.ref === workspaceBinding.bindingId &&
        workspace.digest === workspaceBinding.bindingDigest &&
        lock !== null && lock.ref === workspaceBinding.lockId &&
        lock.digest === workspaceBinding.lockDigest &&
        productSet !== null && productSet.length === admittedInstalls.length &&
        admittedInstalls.map(productInstallCoordinate).every((install) => productSet.some((row) => row.ref === install.ref && row.digest === install.digest)) &&
        catalogScope !== null && "view" in catalogScope &&
        catalogScope.catalog.ref === catalogRef(resources.catalog.basisDigest) &&
        catalogScope.catalog.digest === resources.catalog.basisDigest &&
        catalogScope.view.ref === catalogViewRef(resources.catalogView.viewDigest) &&
        catalogScope.view.digest === resources.catalogView.viewDigest &&
        exactJson(catalogScope.allowlist, resources.catalogView.allowlist) &&
        program !== null && program.ref === resolution.resolution.programRef &&
        program.digest === resolution.resolution.programDigest &&
        exactGraphFunctionAuthority && exactInputAuthority &&
        sessionPolicy !== null && sessionPolicy.ref === policy.policyRef &&
        sessionPolicy.digest === policy.policyDigest &&
        capabilities !== null &&
        exactJson(capabilities.requiredCapabilityRefs, requiredCapabilities) &&
        capabilities.grants.length === grants.length &&
        grants.every((grant) => capabilities.grants.some((row) => row.ref === grant.grantRef && row.digest === grant.grantDigest)) &&
        actor !== null && actor.actor.ref === workspaceBinding.authorizedActorRef &&
        actor.actor.digest === sha256Canonical({
            actorRef: workspaceBinding.authorizedActorRef,
        }) &&
        actor.attribution.ref === authority.authorityRef &&
        actor.attribution.digest === authority.authorityDigest &&
        steering !== null && steering.digest === steeringDigest &&
        steering.ref ===
            `transport-steering://abiogenesis/${steeringDigest.slice("sha256:".length)}`;
}
/** @internal Finite raw/cold acquisition before dependent invocation effects. */
export function prepareRunQualificationResources(resources, value) {
    let qualificationResources;
    if (resources.qualificationResources !== undefined) {
        const existing = [{ kind: "abg_historical_declaration_proof", schemaVersion: "5.0.0", catalog: resources.catalog, catalogView: resources.catalogView },
            ...(resources.historicalSource === undefined ? [] : [resources.historicalSource.declarationProof, ...(resources.historicalSource.declarationDependencies ?? [])])];
        // Current/historical proofs are explicit alternate sources. Duplicate exact dependencies refuse.
        const selected = resources.qualificationResources.manifests.flatMap(m => m.declarationSelections);
        const extras = existing.filter(p => selected.some(d => d.catalogBasisDigest === p.catalog.basisDigest && d.readinessBasisDigest === p.catalog.readinessBasisDigest && d.viewDigest === p.catalogView.viewDigest && d.proofDigest === sha256Canonical(p)));
        qualificationResources = acquireQualificationResources(resources.qualificationResources, extras);
    }
    const establish = (value) => {
        if (isQualificationAssessmentInput(value)) {
            const established = establishQualificationAssessment(value, qualificationResources);
            if ("representation" in value.task && !established.task.declarations.some(p => p.catalog.basisDigest === resources.catalog.basisDigest && p.catalogView.viewDigest === resources.catalogView.viewDigest))
                throw new TypeError("qualification invoking declaration dependency missing");
            return;
        }
        if (isSelfConformanceInput(value)) {
            const view = resolveSelfConformanceInput(value, qualificationResources), scope = view.input.scope;
            if (scope !== undefined) {
                const { catalog, bytes } = readSelfConformanceCatalog();
                if (qualificationScopeCorrespondence(scope, catalog, sha256Bytes(bytes), view.normalizedScope).length > 0)
                    throw new TypeError("qualification scope differs");
            }
            if (view.input.qualification !== undefined)
                resolveQualificationProof(view.input.qualification.proof, qualificationResources);
            return;
        }
        if (isRecord(value)) {
            if (isQualificationReferenceForm(value.proof))
                resolveQualificationProof(value.proof, qualificationResources);
            // Declared wrapper/child inputs are finite data; acquisition grants no new call rights.
            for (const [key, child] of Object.entries(value))
                if (key !== "task" && key !== "plan" && child !== null && typeof child === "object")
                    establish(child);
        }
        else if (Array.isArray(value))
            for (const child of value)
                establish(child);
    };
    establish(value);
    return qualificationResources;
}
export async function prepareProductRunInvocation(input) {
    const { memberKey, invocation, resources } = input;
    if (invocation.definitionKey.memberKey !== memberKey ||
        !exactApplications(resources.catalogView, resources.applications)) {
        return preparationRefusal(memberKey, "invalid_view", ["/catalogView"]);
    }
    const request = invocation.request;
    const programCoordinate = request.program;
    if (!isRecord(programCoordinate) || typeof programCoordinate.ref !== "string") {
        return preparationRefusal(memberKey, "invalid_program", ["/program"]);
    }
    const programRef = programCoordinate.ref;
    const selection = memberKey === "invoke"
        ? typeof request.catalogHandle === "string"
            ? { kind: "direct", catalogHandle: request.catalogHandle }
            : { kind: "direct", catalogHandle: "" }
        : startSelection(invocation.request) ?? {
            kind: "start",
            scope: "program",
            target: "",
            until: "converged",
            rootMode: "direct",
        };
    if ((selection.kind === "direct" && selection.catalogHandle.length === 0) ||
        (selection.kind === "start" && selection.target.length === 0)) {
        return preparationRefusal(memberKey, "invalid_target", ["/target"]);
    }
    const resolution = await ProductExecutionResolutionPort.resolve({
        catalog: resources.catalog,
        catalogView: resources.catalogView,
        admittedInstalls: input.admittedInstalls,
        verifyInstallAdmission: input.verifyInstallAdmission,
        programRef,
        selection,
    });
    if (resolution.kind !== "loaded_product_execution_resolution") {
        return preparationRefusal(memberKey, resolutionRefusalCode(resolution), ["/program"]);
    }
    if (programCoordinate.digest !==
        sha256Canonical(resolution.program) ||
        !isRecord(request.catalogView) ||
        request.catalogView.ref !== catalogViewRef(resolution.resolution.catalogViewDigest) ||
        request.catalogView.digest !== resolution.resolution.catalogViewDigest ||
        !exactJson(request.allowlist, resources.catalogView.allowlist)) {
        return preparationRefusal(memberKey, "invalid_view", ["/catalogView"]);
    }
    const inputCarrier = memberKey === "invoke"
        ? { contract: request.inputContract, value: request.input }
        : isRecord(request.input)
            ? { contract: request.input.contract, value: request.input.value }
            : null;
    if (inputCarrier === null || !isRecord(inputCarrier.contract) ||
        inputCarrier.contract.ref !== resolution.resolution.inputContract.contractRef ||
        inputCarrier.contract.digest !== resolution.resolution.inputContractDigest) {
        return preparationRefusal(memberKey, "invalid_input", ["/input"]);
    }
    let qualificationResources;
    try {
        qualificationResources = prepareRunQualificationResources(resources, inputCarrier.value);
    }
    catch {
        return preparationRefusal(memberKey, "invalid_input", ["/qualificationResources"]);
    }
    const admittedSource = sourceBasis(request, resources.source);
    if (admittedSource === false) {
        return preparationRefusal(memberKey, "invalid_input", ["/sourceBasis"]);
    }
    const admittedInput = admitInstalledProductInput(resolution.productSemantics, inputCarrier.contract.ref, inputCarrier.value);
    const currentSourceUse = admittedSource !== null && (admittedSource.workspaceBindingId !== input.workspaceBinding.bindingId ||
        admittedSource.workspaceBindingDigest !== input.workspaceBinding.bindingDigest)
        ? input.deriveCurrentSourceUse?.(admittedSource, resolution) ?? null : null;
    if (admittedInput === null ||
        !validateInstalledInvocationBasis(resolution.productSemantics, {
            input: admittedInput,
            workspaceBindingId: input.workspaceBinding.bindingId,
            workspaceBindingDigest: input.workspaceBinding.bindingDigest,
            workspaceId: input.workspaceBinding.workspaceId,
            actionCatalog: resolution.program.actionCatalog === undefined
                ? null
                : resolution.program.actionCatalog,
            catalogView: resources.catalogView,
            catalogApplications: resources.applications,
            sourceResultBasis: admittedSource,
            ...(currentSourceUse === null ? {} : { currentSourceUse: () => currentSourceUse }),
        })) {
        return preparationRefusal(memberKey, "invalid_input", ["/input"]);
    }
    const rawInput = rawAdmitValue(admittedInput, "invocation_input", inputCarrier.contract.ref);
    if (rawInput.kind !== "raw_admitted_value") {
        return preparationRefusal(memberKey, "invalid_input", ["/input"]);
    }
    const declaredRegimes = new Set([
        ...resolution.programValidation.executableLeafRows.map((row) => row.fibre),
        ...resolution.programValidation.interactionLeafRows.map((row) => row.fibre),
    ]);
    const policy = constructRootInvocationPolicy(input.workspaceBinding, resolution.program, resolution.programValidation.interactionLeafRows.map((row) => ({
        requirementKey: row.requirementKey,
        requirementKeyDigest: row.requirementKeyDigest,
        actorCapabilityRef: row.requirement.actorCapabilityRef,
    })), ["F_D", "F_P", "F_H"].filter((regime) => declaredRegimes.has(regime)), resources.applications);
    const actorRef = invocation.invocationAuthority.slots.actor?.actor.ref ?? "";
    const fixedPacket = packet(memberKey);
    const grants = Object.freeze([
        constructCapabilityGrant(policy, actorRef, "abg.operation.run.invoke", DIRECT_INVOKE_CAPABILITY, {
            admittedInstalls: input.admittedInstalls,
            workspaceBinding: input.workspaceBinding,
            fixedPacket,
        }),
    ]);
    const authority = constructInvocationAuthority(actorRef, input.workspaceBinding, resources.catalogView, resolution.program.programRef, resolution.selectedCatalogEntry, policy, grants, {
        admittedInstalls: input.admittedInstalls,
        workspaceBinding: input.workspaceBinding,
        fixedPacket,
    });
    if (authority.kind !== "invocation_authority" ||
        !runOperationAuthorityMatches(invocation, resources, resolution, input.workspaceBinding, input.admittedInstalls, policy, grants, authority, input.transportResourceAssertion)) {
        return preparationRefusal(memberKey, "invalid_capability", ["/invocationAuthority"]);
    }
    const candidate = memberKey === "invoke"
        ? constructExactDirectInvocation(invocation, input.workspaceBinding, resources.catalogView, resolution.program, resolution.selectedCatalogEntry, rawInput, policy, grants, authority)
        : constructExactStartInvocation(invocation, input.workspaceBinding, resources.catalogView, resolution.program, resolution.selectedCatalogEntry, rawInput, policy, grants, authority);
    if (candidate.kind !== "public_invocation_candidate") {
        return preparationRefusal(memberKey, candidate.code === "contract_mismatch"
            ? "invalid_input"
            : candidate.code === "capability_mismatch"
                ? "invalid_capability"
                : "invalid_intent", ["/request"]);
    }
    const environmentObservation = await observeRunEnvironment({
        publication: resolution.programPublication, program: resolution.program,
        graphFunctions: resolution.declarationPublications.flatMap(p => p.graphFunctions),
        authority: { authorityRef: authority.authorityRef, authorityDigest: authority.authorityDigest, actorRef: authority.actorRef },
        archiveRoot: input.workspaceBinding.roots.archiveRoot,
        ...(resources.runEnvironmentResources === undefined ? {} : { resources: resources.runEnvironmentResources }),
    });
    if (environmentObservation.kind === "run_environment_refusal")
        return preparationRefusal(memberKey, environmentObservation.cause === "unsupported_declaration" ? "invalid_program" : environmentObservation.cause === "identity_mismatch" ? "invalid_input" : "invalid_capability", [environmentObservation.issuePath, "/runEnvironment/cause/" + environmentObservation.cause]);
    return deepFreeze({
        kind: "prepared_product_run_invocation",
        runEnvironment: environmentObservation.evidence,
        ...(qualificationResources === undefined ? {} : { qualificationResources }),
        schemaVersion: "5.0.0",
        memberKey,
        invocation,
        resolution,
        workspaceBinding: input.workspaceBinding,
        admittedInput,
        rawInput,
        sourceResultBasis: admittedSource,
        ...(currentSourceUse === null ? {} : { currentSourceUse }),
        policy,
        grants,
        authority,
        candidate,
    });
}
export function constructRunInvocationOwnerRefusal(memberKey, owner) {
    const code = owner.stage === "setup"
        ? "invalid_program"
        : owner.stage === "observation"
            ? "invalid_input"
            : owner.stage === "graph_validation" || owner.stage === "execution_basis"
                ? "invalid_graph_function"
                : owner.stage === "open_call" || owner.stage === "traversal"
                    ? "invalid_target"
                    : owner.stage === "invocation_admission" &&
                        owner.code === "capability_mismatch"
                        ? "invalid_capability"
                        : owner.stage === "invocation_admission" &&
                            owner.code === "catalog_view_not_admitted"
                            ? "invalid_view"
                            : owner.stage === "invocation_admission" &&
                                owner.code === "contract_mismatch"
                                ? "invalid_input"
                                : "invalid_intent";
    return refusal(memberKey, code, [`/${owner.stage}`], owner.evidenceRefs ?? []);
}
export function constructRunInvocationOutcome(memberKey, truth) {
    if (truth.kind === "abg_run_truth_refusal") {
        return constructRunInvocationOwnerRefusal(memberKey, {
            stage: "run_truth",
            code: truth.code,
            evidenceRefs: truth.diagnosticRef === undefined ? [] : [truth.diagnosticRef],
        });
    }
    if (truth.evidence.length === 0 ||
        (memberKey === "invoke" && truth.graphCall === null)) {
        return refusal(memberKey, "invalid_intent", ["/run"]);
    }
    if (truth.runtimeStatus === "held" || truth.runtimeStatus === "gap_stopped") {
        return validatedOutput(memberKey, {
            outcomeKind: "nonterminal",
            value: {
                invocationKind: memberKey,
                disposition: truth.runtimeStatus === "held" ? "held" : "gap_stop",
                run: truth.run,
                graphCall: truth.graphCall,
                interaction: truth.interaction,
                gap: truth.gap,
                evidence: truth.evidence,
                replay: truth.replay,
            },
        });
    }
    if (["active", "workspace"].includes(truth.runtimeStatus)) {
        return refusal(memberKey, "invalid_intent", ["/run"]);
    }
    if (truth.runtimeStatus === "closed" &&
        (!isAbgTypedTerminalResult(truth.terminalResult) || truth.result === null ||
            truth.result.ref !== truth.terminalResult.result.ref || truth.result.digest !== truth.terminalResult.result.digest ||
            truth.terminalResult.producer.runRef !== truth.run.ref ||
            truth.terminalResult.producer.graphCallRef !== truth.graphCall?.ref)) {
        return refusal(memberKey, "invalid_intent", ["/terminalResult"]);
    }
    return validatedOutput(memberKey, {
        outcomeKind: "result",
        value: {
            invocationKind: memberKey,
            run: truth.run,
            graphCall: truth.graphCall,
            disposition: truth.runtimeStatus === "closed"
                ? "completed"
                : truth.runtimeStatus === "blocked"
                    ? "blocked"
                    : "runtime_failed",
            result: truth.runtimeStatus === "closed" ? truth.terminalResult.result : null,
            terminalResult: truth.runtimeStatus === "closed" ? truth.terminalResult : null,
            stop: truth.stop,
            gap: truth.gap,
            interaction: truth.interaction,
            evidence: truth.evidence,
            replay: truth.replay,
        },
    });
}
export const ProductRunInvocationPort = Object.freeze({
    prepare: prepareProductRunInvocation,
    projectOutcome: constructRunInvocationOutcome,
    projectOwnerRefusal: constructRunInvocationOwnerRefusal,
});
