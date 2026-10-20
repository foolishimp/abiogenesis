import { admitPendingConstructionIntentContinuation } from "../abg/construction_continuation.js";
import * as Cause from "effect/Cause";
import * as Effect from "effect/Effect";
import * as Exit from "effect/Exit";
import * as Option from "effect/Option";
import { commitFhInteractionResumeAtExpectedPrefix, deriveFhResumeSuccessorInputAtPrefix, projectOpenedTraversalScopeClassAtDurablePrefix, selectAdmittedImplementationResolution, } from "../abg/index.js";
import { projectOwnedRuntimeEventPrefixAtDurablePrefix } from "../abg/event_prefix.js";
import { projectTraversalInputAtPrefix } from "../abg/traversal_cursor.js";
import { resolveCProgramTermAtSourcePath } from "../gtl/source_path.js";
import { sha256Canonical } from "../shared/digests.js";
import { runEffectProgram } from "../shared/effect_definition.js";
import { constructChildTraversalBasis, } from "./child_traversal.js";
import { evaluateOwnedExecutableCCall as evaluateExecutableCCall, } from "./ccall_lifecycle.js";
import { enterTraversal, prepareInteractionResumeTraversalEntry, } from "./entry.js";
import { holdOwnedInteraction as holdInteraction } from "./interaction_lifecycle.js";
import { completeOwnedInteractionResume as resumeInteractionOwner, } from "./interaction_resume.js";
import { isExactLocusStep, traversalBasis, } from "./operator_support.js";
import { rehydrateParentReturnFrames, } from "./parent_rehydration.js";
import { beginOwnedRecursionApplication as beginRecursionApplication, completeOwnedRecursionChild as completeRecursionChild, recursionApplication, restoreOwnedDeferredRecursion as restoreDeferredRecursion, } from "./recursion_lifecycle.js";
import { advanceOwnedRetryLifecycle as advanceRetryLifecycle, resumeProjectedRetry, } from "./retry_lifecycle.js";
import { advanceStructuralTransition } from "./structural_transition.js";
import { failTraversal, GraphTraversalFailure, isGraphTraversalEntryRefusal, projectGraphTraversalFailure, refuseTraversalEntry, } from "./traversal_failure.js";
import { resolveTraversalTerm, deriveInteractionResumeCursor, deriveInteractionSuccessorInputCarrierRef, rehydrateHeldInteractionCursor, traverseFromCursor, } from "./traversal.js";
import {} from "./traversal_completion.js";
import { beginOwnedWorkflowLocus as beginWorkflowLocus, completeOwnedWorkflowLocus as completeWorkflowLocus, } from "./workflow_lifecycle.js";
export { GraphTraversalFailure };
export { resumeProjectedRetry };
import { completePublicOutcome } from "../abg/c_call_outcome.js";
function childTraversalBasis(runtime) {
    return constructChildTraversalBasis({
        graphFunctionByRef: runtime.leafPort.graphFunctionByRef,
        closureContractByRef: runtime.leafPort.closureContractByRef,
        program: runtime.program,
        ...(runtime.programPublication === undefined ? {} : { programPublication: runtime.programPublication }),
        programValidation: runtime.programValidation,
        rootImplementationSet: runtime.implementationSet,
        rootInteractionSet: runtime.interactionSet,
    });
}
function failFrame(frame, predecessorPrefix, stage, diagnosticRef, candidate) {
    const runtime = frame.runtime;
    return failTraversal({
        store: runtime.store,
        predecessorPrefix,
        executionBasis: runtime.executionBasis,
        openedTraversalScope: runtime.openedTraversalScope,
        eventTime: runtime.eventTime,
        correlationId: runtime.correlationId,
        stage,
        diagnosticRef,
        candidate,
    });
}
function workflowAuthority(runtime, scopeClass) {
    return Object.freeze({
        store: runtime.store,
        predecessorPrefix: runtime.predecessorPrefix,
        executionBasis: runtime.executionBasis,
        openedTraversalScope: runtime.openedTraversalScope,
        program: runtime.program,
        graphFunction: runtime.graphFunction,
        graph: runtime.graph,
        implementationSet: runtime.implementationSet,
        leafPort: runtime.leafPort,
        childTraversalBasis: childTraversalBasis(runtime),
        closureContract: runtime.closureContract,
        ...(runtime.deferFailedRunStop === undefined
            ? {}
            : { deferFailedRunStop: runtime.deferFailedRunStop }),
        eventTime: runtime.eventTime,
        correlationId: runtime.correlationId,
        scopeClass,
    });
}
function termFor(frame) {
    const term = resolveTraversalTerm(frame.runtime.graph, frame.cursor);
    return term.kind === "traversal_refusal"
        ? failFrame(frame, frame.runtime.predecessorPrefix, `term-${frame.ordinal}`, `diagnostic://abiogenesis/hog/${term.code}@5`, term)
        : term;
}
function executableContext(frame, stop) {
    const runtime = frame.runtime;
    const application = recursionApplication(runtime.graph, stop.compositionRef);
    return Object.freeze({
        store: runtime.store,
        predecessorPrefix: runtime.predecessorPrefix,
        executionBasis: runtime.executionBasis,
        openedTraversalScope: runtime.openedTraversalScope,
        program: runtime.program,
        ...(runtime.programPublication === undefined ? {} : { programPublication: runtime.programPublication }),
        graphFunction: runtime.graphFunction,
        graph: runtime.graph,
        graphValidation: runtime.graphValidation,
        stop,
        implementationSet: runtime.implementationSet,
        leafPort: runtime.leafPort,
        input: frame.input,
        closureContract: runtime.closureContract,
        actorRuntimeBinding: runtime.actorRuntimeBinding,
        scopeClass: frame.scopeClass,
        ...(application === null ? {} : { deferToApplication: true }),
        clock: {
            eventTime: runtime.eventTime,
            correlationId: `${runtime.correlationId}/leaf/${frame.ordinal}`,
        },
        ordinal: frame.ordinal,
    });
}
function recursionTraversalInput(frame, context, completion) {
    const resolution = selectAdmittedImplementationResolution(context.implementationSet, {
        graphFunctionRef: context.graph.graphFunctionRef,
        nodeRef: context.stop.nodeRef,
        programLocusRef: context.stop.programLocusRef,
        implementationBindingRef: context.stop.implementationBindingRef,
    });
    if (resolution === null) {
        return failFrame(frame, completion.successorPrefix, `recursion-resolution-${frame.ordinal}`, "diagnostic://abiogenesis/implementation/admitted-row-absent@5", context.stop);
    }
    return Object.freeze({
        store: context.store,
        predecessorPrefix: completion.successorPrefix,
        executionBasis: context.executionBasis,
        openedTraversalScope: context.openedTraversalScope,
        program: context.program,
        graphFunction: context.graphFunction,
        graph: context.graph,
        traversalStop: context.stop,
        implementationSet: context.implementationSet,
        implementationResolution: resolution,
        leafPort: context.leafPort,
        input: context.input,
        inputDigest: context.stop.cursor.inputDigest,
        closureContract: context.closureContract,
        actorRuntimeBinding: context.actorRuntimeBinding,
        ...(frame.runtime.deferFailedRunStop === true
            ? { deferFailedRunStop: true }
            : {}),
        deferToApplication: true,
        completionScopeClass: frame.scopeClass,
        clock: context.clock,
    });
}
function evaluateLocus(frame, term) {
    return Effect.suspend(() => {
        const runtime = frame.runtime;
        if (term.kind === "c_workflow") {
            if (!isExactLocusStep(frame.cursor, term)) {
                return Effect.sync(() => failFrame(frame, runtime.predecessorPrefix, `workflow-step-${frame.ordinal}`, "diagnostic://abiogenesis/hog/workflow-step-mismatch@5", frame.cursor));
            }
            return Effect.sync(() => beginWorkflowLocus({
                authority: workflowAuthority(runtime, frame.scopeClass),
                cursor: frame.cursor,
                value: frame.input,
                graphEntryInput: frame.graphEntryInput,
                graphEntryInputDigest: frame.graphEntryInputDigest,
                ordinal: frame.ordinal,
            }));
        }
        if (term.kind !== "c_of") {
            return Effect.sync(() => failFrame(frame, runtime.predecessorPrefix, `direct-step-${frame.ordinal}`, "diagnostic://abiogenesis/hog/direct-c-step-mismatch@5", frame.cursor));
        }
        const current = traverseFromCursor(traversalBasis(runtime), frame.cursor, term);
        if (current.kind !== "traversal_stop_ref" ||
            !isExactLocusStep(current, term)) {
            return Effect.sync(() => failFrame(frame, runtime.predecessorPrefix, `direct-step-${frame.ordinal}`, "diagnostic://abiogenesis/hog/direct-c-step-mismatch@5", current));
        }
        if (term.fibre === "F_H") {
            if (current.stopClass !== "interaction") {
                return Effect.sync(() => failFrame(frame, runtime.predecessorPrefix, `interaction-step-${frame.ordinal}`, "diagnostic://abiogenesis/hog/interaction-step-mismatch@5", current));
            }
            return Effect.sync(() => ({
                kind: "locus_evaluation",
                evaluation: holdInteraction({
                    store: runtime.store,
                    predecessorPrefix: runtime.predecessorPrefix,
                    executionBasis: runtime.executionBasis,
                    openedTraversalScope: runtime.openedTraversalScope,
                    program: runtime.program,
                    graphFunction: runtime.graphFunction,
                    graph: runtime.graph,
                    interactionSet: runtime.interactionSet,
                    ...(runtime.continuationProductBasis === undefined
                        ? {}
                        : {
                            continuationProductBasis: runtime.continuationProductBasis,
                        }),
                    closureContract: runtime.closureContract,
                    stop: current,
                    value: frame.input,
                    ordinal: frame.ordinal,
                    eventTime: runtime.eventTime,
                    correlationId: runtime.correlationId,
                }),
            }));
        }
        if (current.stopClass !== "executable") {
            return Effect.sync(() => failFrame(frame, runtime.predecessorPrefix, `executable-step-${frame.ordinal}`, "diagnostic://abiogenesis/hog/executable-step-mismatch@5", current));
        }
        const context = executableContext(frame, current);
        return Effect.flatMap(evaluateExecutableCCall(context), (owner) => {
            if (owner.kind === "c_call_retry") {
                const retry = advanceRetryLifecycle(owner);
                return Effect.succeed(retry.kind === "retry_resume"
                    ? {
                        kind: "retry_request",
                        resume: retry.resume,
                        correlationId: retry.correlationId,
                    }
                    : {
                        kind: "locus_evaluation",
                        evaluation: {
                            completion: retry.completion,
                            outputValueKind: retry.outputValueKind,
                            outputContractRef: retry.outputContractRef,
                        },
                    });
            }
            const application = recursionApplication(runtime.graph, current.compositionRef);
            if (application === null ||
                owner.completion.disposition !== "application_ready") {
                return Effect.succeed({
                    kind: "locus_evaluation",
                    evaluation: {
                        completion: owner.completion,
                        outputValueKind: owner.outputValueKind,
                        outputContractRef: owner.outputContractRef,
                    },
                });
            }
            const recursion = beginRecursionApplication({
                traversalInput: recursionTraversalInput(frame, context, owner.completion),
                childTraversalBasis: childTraversalBasis(runtime),
                parentClock: {
                    eventTime: runtime.eventTime,
                    correlationId: runtime.correlationId,
                },
                application,
                completion: owner.completion,
                graphEntryInput: frame.graphEntryInput,
                graphEntryInputDigest: frame.graphEntryInputDigest,
                leafOrdinal: frame.ordinal,
            });
            return Effect.succeed(recursion.kind === "recursion_child_request"
                ? {
                    ...recursion,
                    outputValueKind: owner.outputValueKind,
                    outputContractRef: owner.outputContractRef,
                }
                : {
                    kind: "locus_evaluation",
                    evaluation: {
                        completion: recursion.completion,
                        outputValueKind: owner.outputValueKind,
                        outputContractRef: owner.outputContractRef,
                    },
                });
        });
    });
}
function nextFromEvaluation(frame, evaluation, returns) {
    const runtime = frame.runtime;
    const completion = evaluation.completion;
    if (completion.disposition !== "advanced") {
        return Object.freeze({
            stateKind: "return",
            completion,
            returns: Object.freeze([...returns]),
        });
    }
    const selected = completion.nextCursor === null ? null : projectTraversalInputAtPrefix(projectOwnedRuntimeEventPrefixAtDurablePrefix(completion.successorPrefix), runtime.graph, runtime.executionBasis, completion.nextCursor);
    const targetTerm = completion.nextCursor === null ? null : resolveCProgramTermAtSourcePath(runtime.graph.template, completion.nextCursor.currentNodeRef, completion.nextCursor.termPath);
    if (completion.nextCursor === null ||
        completion.continuationKind === null ||
        completion.nextInputContractRef === null ||
        evaluation.outputValueKind === null ||
        evaluation.outputContractRef === null ||
        selected === null || typeof selected.value !== "object" || selected.value === null || Array.isArray(selected.value) ||
        targetTerm === null || targetTerm.kind === "c_source_path_refusal" ||
        !runtime.leafPort.validateContractValueByRef(targetTerm.inputCarrierRef, selected.value)) {
        return failFrame(frame, completion.successorPrefix, `advanced-result-${frame.ordinal}`, "diagnostic://abiogenesis/hog/advanced-result-basis-absent@5", {
            leafOrdinal: frame.ordinal,
            completionDisposition: completion.disposition,
        });
    }
    return Object.freeze({
        stateKind: "evaluate",
        frame: Object.freeze({
            ...frame,
            runtime: Object.freeze({
                ...runtime,
                predecessorPrefix: completion.successorPrefix,
            }),
            cursor: completion.nextCursor,
            input: selected.value,
            ordinal: frame.ordinal + 1,
            structuralOrdinal: 0,
        }),
        returns: Object.freeze([...returns]),
    });
}
function liftGraphTraversalFailure(program) {
    return Effect.catchAllCause(program, (cause) => {
        const failure = Cause.failureOption(cause);
        if (Option.isSome(failure) &&
            failure.value instanceof GraphTraversalFailure) {
            return Effect.fail(failure.value);
        }
        const defect = Cause.dieOption(cause);
        return Option.isSome(defect) &&
            defect.value instanceof GraphTraversalFailure
            ? Effect.fail(defect.value)
            : Effect.failCause(cause);
    });
}
function evaluateTraversalProgram(initial) {
    const program = Effect.iterate(Object.freeze(initial), {
        while: (state) => state.stateKind !== "done",
        body: (state) => {
            const returnOwner = state.stateKind === "return"
                ? state.returns.at(-1)
                : null;
            if (state.stateKind === "return" && returnOwner === undefined) {
                return Effect.succeed(Object.freeze({
                    stateKind: "done",
                    completion: state.completion,
                }));
            }
            return liftGraphTraversalFailure(Effect.suspend(() => {
                if (state.stateKind === "return") {
                    const owner = returnOwner;
                    const evaluation = owner.kind === "workflow_return"
                        ? completeWorkflowLocus(owner.workflow, state.completion)
                        : {
                            completion: completeRecursionChild(owner.recursion, state.completion),
                            outputValueKind: owner.outputValueKind,
                            outputContractRef: owner.outputContractRef,
                        };
                    return Effect.succeed(nextFromEvaluation(Object.freeze({
                        ...owner.parent,
                        runtime: Object.freeze({
                            ...owner.parent.runtime,
                            predecessorPrefix: state.completion.successorPrefix,
                        }),
                    }), evaluation, state.returns.slice(0, -1)));
                }
                const frame = state.frame;
                const term = termFor(frame);
                if (term.kind !== "c_of" && term.kind !== "c_workflow") {
                    const advanced = advanceStructuralTransition({
                        store: frame.runtime.store,
                        predecessorPrefix: frame.runtime.predecessorPrefix,
                        executionBasis: frame.runtime.executionBasis,
                        openedTraversalScope: frame.runtime.openedTraversalScope,
                        graph: frame.runtime.graph,
                        graphFunction: frame.runtime.graphFunction,
                        leafPort: frame.runtime.leafPort,
                        cursor: frame.cursor,
                        input: frame.input,
                        term,
                        ordinal: frame.ordinal,
                        structuralOrdinal: frame.structuralOrdinal,
                        eventTime: frame.runtime.eventTime,
                        correlationId: frame.runtime.correlationId,
                    });
                    const selected = projectTraversalInputAtPrefix(projectOwnedRuntimeEventPrefixAtDurablePrefix(advanced.successorPrefix), frame.runtime.graph, frame.runtime.executionBasis, advanced.cursor);
                    if (selected === null || selected.value === null || typeof selected.value !== "object" || Array.isArray(selected.value))
                        return Effect.sync(() => failFrame(frame, advanced.successorPrefix, `structural-input-${frame.ordinal}`, "diagnostic://abiogenesis/hog/advanced-result-basis-absent@5", advanced.cursor));
                    return Effect.succeed(Object.freeze({
                        stateKind: "evaluate",
                        frame: Object.freeze({
                            ...frame,
                            runtime: Object.freeze({
                                ...frame.runtime,
                                predecessorPrefix: advanced.successorPrefix,
                            }),
                            cursor: advanced.cursor,
                            input: selected.value,
                            structuralOrdinal: frame.structuralOrdinal + 1,
                        }),
                        returns: Object.freeze([...state.returns]),
                    }));
                }
                return Effect.flatMap(evaluateLocus(frame, term), (owner) => Effect.promise(async () => {
                    if (owner.kind === "retry_request") {
                        return Object.freeze({
                            stateKind: "evaluate",
                            frame: enterTraversal({
                                ...frame.runtime,
                                predecessorPrefix: owner.resume.successorPrefix,
                                correlationId: owner.correlationId,
                                projectedRetryResume: owner.resume,
                            }),
                            returns: Object.freeze([...state.returns]),
                        });
                    }
                    if (owner.kind === "workflow_child_request" ||
                        owner.kind === "recursion_child_request") {
                        const prepared = owner.prepared;
                        const deferFailedRunStop = owner.kind === "workflow_child_request"
                            ? owner.deferFailedRunStop
                            : frame.runtime.deferFailedRunStop === true;
                        const childLeafPort = await frame.runtime.leafPort.forGraphFunction(prepared.graphFunction.name);
                        if (childLeafPort === null)
                            return failFrame(frame, prepared.successorPrefix, "child-semantics", "diagnostic://abiogenesis/hog/child-semantics-owner-absent@5", { graphFunctionRef: prepared.graphFunction.name });
                        const child = enterTraversal({
                            ...frame.runtime,
                            ...prepared,
                            leafPort: childLeafPort,
                            predecessorPrefix: prepared.successorPrefix,
                            ...(frame.runtime.continuationProductBasis === undefined
                                ? {}
                                : {
                                    continuationProductBasis: {
                                        ...frame.runtime.continuationProductBasis,
                                        programValidation: prepared.programValidation,
                                        graphValidation: prepared.graphValidation,
                                    },
                                }),
                            ...(deferFailedRunStop ? { deferFailedRunStop: true } : {}),
                            correlationId: owner.correlationId,
                        });
                        const returnFrame = owner.kind === "workflow_child_request"
                            ? {
                                kind: "workflow_return",
                                parent: frame,
                                workflow: owner.frame,
                            }
                            : {
                                kind: "recursion_return",
                                parent: frame,
                                recursion: owner.frame,
                                outputValueKind: owner.outputValueKind,
                                outputContractRef: owner.outputContractRef,
                            };
                        return Object.freeze({
                            stateKind: "evaluate",
                            frame: child,
                            returns: Object.freeze([...state.returns, returnFrame]),
                        });
                    }
                    return nextFromEvaluation(frame, owner.evaluation, state.returns);
                }));
            }));
        },
    });
    return Effect.map(program, (state) => {
        if (state.stateKind !== "done") {
            throw new TypeError("diagnostic://abiogenesis/hog/fold-final-state-mismatch@5");
        }
        return state.completion;
    });
}
function machineRuntimeFromRehydrated(base, frame, predecessorPrefix, ordinal) {
    return Object.freeze({
        store: base.store,
        predecessorPrefix,
        executionBasis: frame.traversal.executionBasis,
        openedTraversalScope: frame.traversal.openedTraversalScope,
        program: frame.traversal.program,
        ...(base.programPublication === undefined ? {} : { programPublication: base.programPublication }),
        graphFunction: frame.traversal.graphFunction,
        graph: frame.traversal.graph,
        graphValidation: frame.traversal.graphValidation,
        programValidation: base.programValidation,
        implementationSet: frame.implementationSet,
        interactionSet: base.interactionSet,
        ...(base.continuationProductBasis === undefined
            ? {}
            : {
                continuationProductBasis: {
                    ...base.continuationProductBasis,
                    graphValidation: frame.traversal.graphValidation,
                },
            }),
        leafPort: frame.leafPort,
        closureContract: frame.closureContract,
        actorRuntimeBinding: base.actorRuntimeBinding,
        ...(base.deferFailedRunStop === true
            ? { deferFailedRunStop: true }
            : {}),
        eventTime: base.eventTime,
        correlationId: `${base.correlationId}/parent/${ordinal}`,
    });
}
function machineFrameFromRehydrated(base, frame, predecessorPrefix, ordinal) {
    const runtime = machineRuntimeFromRehydrated(base, frame, predecessorPrefix, ordinal);
    const scopeClass = projectOpenedTraversalScopeClassAtDurablePrefix(predecessorPrefix, runtime.openedTraversalScope);
    const evidenceClass = frame.terminalMode === "close_run" ? "root" : "child";
    if (scopeClass === null || scopeClass !== evidenceClass) {
        return failTraversal({
            store: runtime.store,
            predecessorPrefix,
            executionBasis: runtime.executionBasis,
            openedTraversalScope: runtime.openedTraversalScope,
            eventTime: runtime.eventTime,
            correlationId: runtime.correlationId,
            stage: "parent-scope-class",
            diagnosticRef: "diagnostic://abiogenesis/hog/parent-scope-class-mismatch@5",
            candidate: { scopeRef: runtime.openedTraversalScope.scopeRef },
        });
    }
    return Object.freeze({
        runtime,
        scopeClass,
        graphEntryInput: frame.graphEntryInput,
        graphEntryInputDigest: frame.graphEntryInputDigest,
        cursor: frame.cursor,
        input: frame.input,
        ordinal: frame.cursor.taskOrdinal ?? 0,
        structuralOrdinal: 0,
    });
}
function machineWorkflowReturn(base, frame, predecessorPrefix, ordinal) {
    const parent = machineFrameFromRehydrated(base, frame.parent, predecessorPrefix, ordinal);
    const term = resolveTraversalTerm(parent.runtime.graph, parent.cursor);
    if (term.kind !== "c_workflow") {
        return failFrame(parent, predecessorPrefix, "workflow-resume-child", "diagnostic://abiogenesis/hog/workflow-resume-child-mismatch@5", term);
    }
    return Object.freeze({
        kind: "workflow_return",
        parent,
        workflow: Object.freeze({
            kind: "workflow_child_fold_frame",
            authority: workflowAuthority(parent.runtime, parent.scopeClass),
            cursor: parent.cursor,
            value: parent.input,
            graphEntryInput: parent.graphEntryInput,
            graphEntryInputDigest: parent.graphEntryInputDigest,
            ordinal: parent.ordinal,
            workflowTerm: term,
            parentCCall: frame.parentCall,
            application: frame.application,
            childExecutionBasis: frame.childExecutionBasis,
            childTraversalScope: frame.childTraversalScope,
            childInput: frame.childInput,
            childInputDigest: frame.childInputDigest,
            foldbackCorrelationId: `${parent.runtime.correlationId}/workflow/resume-foldback`,
        }),
    });
}
function machineRecursionReturn(base, frame, predecessorPrefix, ordinal) {
    const parent = machineFrameFromRehydrated(base, frame.parent, predecessorPrefix, ordinal);
    const stop = traverseFromCursor(frame.parent.traversal, parent.cursor);
    if (stop.kind !== "traversal_stop_ref" ||
        stop.stopClass !== "executable") {
        return failFrame(parent, predecessorPrefix, "recursion-resume-stop", "diagnostic://abiogenesis/hog/recursion-resume-stop-mismatch@5", stop);
    }
    const resolution = selectAdmittedImplementationResolution(frame.parent.implementationSet, {
        graphFunctionRef: frame.parent.traversal.graph.graphFunctionRef,
        nodeRef: stop.nodeRef,
        programLocusRef: stop.programLocusRef,
        implementationBindingRef: stop.implementationBindingRef,
    });
    const outputValueKind = frame.parent.leafPort.contractValueKind(stop.outputContractRef, "output");
    if (resolution === null || outputValueKind === null) {
        return failFrame(parent, predecessorPrefix, "recursion-resume-resolution", "diagnostic://abiogenesis/hog/recursion-resume-resolution-absent@5", stop);
    }
    const traversalInput = Object.freeze({
        store: parent.runtime.store,
        predecessorPrefix,
        executionBasis: parent.runtime.executionBasis,
        openedTraversalScope: parent.runtime.openedTraversalScope,
        program: parent.runtime.program,
        graphFunction: parent.runtime.graphFunction,
        graph: parent.runtime.graph,
        traversalStop: stop,
        implementationSet: parent.runtime.implementationSet,
        implementationResolution: resolution,
        leafPort: parent.runtime.leafPort,
        input: parent.input,
        inputDigest: parent.cursor.inputDigest,
        closureContract: parent.runtime.closureContract,
        actorRuntimeBinding: parent.runtime.actorRuntimeBinding,
        ...(parent.runtime.deferFailedRunStop === true
            ? { deferFailedRunStop: true }
            : {}),
        deferToApplication: true,
        completionScopeClass: parent.scopeClass,
        clock: {
            eventTime: parent.runtime.eventTime,
            correlationId: `${parent.runtime.correlationId}/recursion/restore`,
        },
    });
    const admitted = frame.parentOutcome.admitted;
    const restoration = {
        traversalInput,
        application: frame.application,
        cCallRef: admitted.cCall.cCallRef,
        resultRef: admitted.result.resultRef,
        judgmentRef: admitted.judgment.judgmentRef,
    };
    const restored = restoreDeferredRecursion(restoration);
    if (restored === null) {
        return failFrame(parent, predecessorPrefix, "recursion-resume-deferred", "diagnostic://abiogenesis/hog/recursion-resume-deferred-mismatch@5", frame.application);
    }
    return Object.freeze({
        kind: "recursion_return",
        parent,
        recursion: Object.freeze({
            kind: "recursion_child_fold_frame",
            parentClock: {
                eventTime: parent.runtime.eventTime,
                correlationId: parent.runtime.correlationId,
            },
            parentScopeClass: parent.scopeClass,
            traversalInput,
            application: frame.application,
            restored,
            restoration,
            graphEntryInput: parent.graphEntryInput,
            graphEntryInputDigest: parent.graphEntryInputDigest,
            leafOrdinal: parent.ordinal,
            childExecutionBasis: frame.childExecutionBasis,
            childTraversalScope: frame.childTraversalScope,
            childInput: frame.childInput,
            childInputDigest: frame.childInputDigest,
        }),
        outputValueKind,
        outputContractRef: stop.outputContractRef,
    });
}
function resumeEntryRefusal(code, message, diagnosticRef, candidate, priorAdmission = null) {
    return refuseTraversalEntry({
        code,
        message,
        diagnosticRef,
        candidate,
        priorAdmission,
    });
}
function preflightParentReturns(input, current) {
    const exact = rehydrateParentReturnFrames({
        predecessorPrefix: current.predecessorPrefix,
        program: current.program,
        programValidation: current.programValidation,
        implementationSet: current.implementationSet,
        leafPort: current.leafPort,
        currentChildExecutionBasis: current.executionBasis,
        currentChildTraversalScope: current.openedTraversalScope,
        suspensions: input.parentSuspensions,
    });
    if (exact.kind === "parent_rehydration_refusal") {
        return resumeEntryRefusal("owner_refusal", `continued run parent lineage could not be rehydrated: ${exact.stage}`, exact.diagnosticRef, {
            stage: exact.stage,
            suspensionCount: input.parentSuspensions.length,
        });
    }
    return Object.freeze({
        kind: "parent_returns_preflight",
        frames: exact.frames,
    });
}
function exactParentReturns(current, frames, successorPrefix) {
    return Object.freeze(frames.map((frame, ordinal) => frame.relation === "workflow"
        ? machineWorkflowReturn(current, frame, successorPrefix, ordinal)
        : machineRecursionReturn(current, frame, successorPrefix, ordinal)));
}
function prepareHeldInteractionResume(input) {
    const held = prepareInteractionResumeTraversalEntry(input.current);
    if (isGraphTraversalEntryRefusal(held))
        return held;
    const parentPreflight = preflightParentReturns(input, held);
    if (parentPreflight.kind === "graph_traversal_entry_refusal") {
        return parentPreflight;
    }
    const authority = input.interactionResume;
    const heldCursor = rehydrateHeldInteractionCursor(authority.preparedOperation.projectedPrefix, authority.heldInteraction.cursor);
    if (heldCursor === null) {
        return resumeEntryRefusal("owner_refusal", "run continuation could not rehydrate its exact HoG cursor", "diagnostic://abiogenesis/hog/interaction-resume-held-cursor@5", authority.heldInteraction.cursor);
    }
    let successorInputContractRef;
    try {
        successorInputContractRef = deriveInteractionSuccessorInputCarrierRef(held.graph, heldCursor);
    }
    catch (error) {
        return resumeEntryRefusal("owner_refusal", `run continuation successor carrier derivation failed: ${String(error)}`, "diagnostic://abiogenesis/hog/interaction-resume-successor-carrier@5", { error: String(error) });
    }
    const successorInputValueKind = successorInputContractRef === null
        ? null
        : held.leafPort.contractValueKindByRef(successorInputContractRef);
    const continuation = authority.continuation;
    if ((successorInputContractRef === null) !==
        (successorInputValueKind === null) ||
        (continuation.constructionIntentRef !== null &&
            (successorInputContractRef === null ||
                successorInputValueKind !== "action_evaluation_basis")) ||
        (continuation.constructionIntentRef === null &&
            successorInputContractRef !== null &&
            (successorInputContractRef !== continuation.responseContractRef ||
                typeof continuation.responseValue !== "object" ||
                continuation.responseValue === null ||
                Array.isArray(continuation.responseValue) ||
                !held.leafPort.validateContractValueByRef(successorInputContractRef, continuation.responseValue)))) {
        return resumeEntryRefusal("target_mismatch", "run continuation target carrier, response contract, or admitted value kind differs", "diagnostic://abiogenesis/hog/interaction-resume-successor-contract@5", {
            successorInputContractRef,
            successorInputValueKind,
        });
    }
    let successorInput;
    try {
        successorInput = deriveFhResumeSuccessorInputAtPrefix(authority.preparedOperation.projectedPrefix, continuation, authority.preparedOperation.operation, held.executionBasis, held.closureContract, {
            inputContractRef: successorInputContractRef,
            inputValueKind: successorInputValueKind,
        });
    }
    catch (error) {
        return resumeEntryRefusal("owner_refusal", `run continuation successor input derivation failed: ${String(error)}`, "diagnostic://abiogenesis/hog/interaction-resume-successor-input@5", { error: String(error) });
    }
    if (successorInputContractRef !== null &&
        !held.leafPort.validateContractValueByRef(successorInputContractRef, successorInput.inputValue)) {
        return resumeEntryRefusal("target_mismatch", "run continuation successor value fails its exact admitted contract", "diagnostic://abiogenesis/hog/interaction-resume-successor-value@5", successorInput.inputValue);
    }
    const successorCursor = deriveInteractionResumeCursor(heldCursor, {
        inputRef: successorInput.inputRef,
        inputDigest: successorInput.inputDigest,
    });
    if (successorCursor.kind !== "traversal_cursor") {
        return resumeEntryRefusal("owner_refusal", `interaction resume cursor refused: ${successorCursor.message}`, "diagnostic://abiogenesis/hog/interaction-resume-successor-cursor@5", successorCursor);
    }
    let committed;
    try {
        committed = commitFhInteractionResumeAtExpectedPrefix(held.store, held.predecessorPrefix, authority.rootInvocation, continuation, authority.variant, authority.actorRef, authority.capabilityRef, authority.operationBasis, held.executionBasis, held.closureContract, successorInput, successorCursor, authority.resumeBasis);
    }
    catch (error) {
        return resumeEntryRefusal("owner_refusal", `interaction resume admission failed: ${String(error)}`, "diagnostic://abiogenesis/hog/interaction-resume-admission@5", { error: String(error) });
    }
    if (!("resume" in committed)) {
        if (committed.disposition === "duplicate") {
            return resumeEntryRefusal("duplicate_invocation", `effectful Public invocation ${committed.invocationRef} already has one owning admission`, "diagnostic://abiogenesis/hog/interaction-resume-duplicate@5", committed, committed.priorAdmission);
        }
        return resumeEntryRefusal("owner_refusal", `effectful invocation truth refused: ${committed.code}`, "diagnostic://abiogenesis/hog/interaction-resume-invalid-history@5", committed);
    }
    const current = Object.freeze({
        ...held,
        predecessorPrefix: committed.successorPrefix,
    });
    return Object.freeze({
        current,
        interaction: Object.freeze({
            store: current.store,
            predecessorPrefix: current.predecessorPrefix,
            executionBasis: current.executionBasis,
            openedTraversalScope: current.openedTraversalScope,
            graphFunction: current.graphFunction,
            graph: current.graph,
            heldInteraction: Object.freeze({
                ...authority.heldInteraction,
                cursor: heldCursor,
            }),
            successorCursor,
            resume: committed.resume,
            closureContract: current.closureContract,
            clock: Object.freeze({
                eventTime: current.eventTime,
                correlationId: `${current.correlationId}/interaction`,
            }),
        }),
        parentFrames: parentPreflight.frames,
    });
}
function seedParentContinuation(parent, completion, returns) {
    if (completion.disposition !== "advanced") {
        return Object.freeze({
            stateKind: "return",
            completion,
            returns,
        });
    }
    if (completion.nextCursor === null ||
        completion.resultValue === null ||
        typeof completion.resultValue !== "object" ||
        Array.isArray(completion.resultValue)) {
        return failTraversal({
            store: parent.store,
            predecessorPrefix: completion.successorPrefix,
            executionBasis: parent.executionBasis,
            openedTraversalScope: parent.openedTraversalScope,
            eventTime: parent.eventTime,
            correlationId: parent.correlationId,
            stage: "interaction-resume-advance",
            diagnosticRef: "diagnostic://abiogenesis/hog/interaction-resume-advance-incomplete@5",
            candidate: { faultClass: "interaction_resume_advance_incomplete" },
        });
    }
    const input = completion.resultValue;
    const inputDigest = sha256Canonical(input);
    if (completion.nextCursor.inputDigest !== inputDigest) {
        return failTraversal({
            store: parent.store,
            predecessorPrefix: completion.successorPrefix,
            executionBasis: parent.executionBasis,
            openedTraversalScope: parent.openedTraversalScope,
            eventTime: parent.eventTime,
            correlationId: parent.correlationId,
            stage: "interaction-resume-advance-digest",
            diagnosticRef: "diagnostic://abiogenesis/hog/interaction-resume-advance-digest-mismatch@5",
            candidate: { faultClass: "interaction_resume_advance_digest_mismatch" },
        });
    }
    return Object.freeze({
        stateKind: "evaluate",
        frame: enterTraversal({
            ...parent,
            predecessorPrefix: completion.successorPrefix,
            input: parent.input,
            inputDigest: parent.inputDigest,
            resume: {
                cursor: completion.nextCursor,
                input,
                inputDigest,
            },
        }),
        returns,
    });
}
function traversalProgram(input) {
    return liftGraphTraversalFailure(Effect.suspend(() => {
        if ("constructionResume" in input) {
            const parents = preflightParentReturns(input, input.current);
            if (parents.kind === "graph_traversal_entry_refusal")
                return Effect.succeed(parents);
            return evaluateTraversalProgram(Object.freeze({ stateKind: "evaluate",
                frame: enterTraversal(input.current),
                returns: exactParentReturns(input.current, parents.frames, input.current.predecessorPrefix) }));
        }
        if ("interactionResume" in input) {
            const prepared = prepareHeldInteractionResume(input);
            if (isGraphTraversalEntryRefusal(prepared)) {
                return Effect.succeed(prepared);
            }
            const resumed = resumeInteractionOwner(prepared.interaction);
            return evaluateTraversalProgram(seedParentContinuation(prepared.current, resumed, exactParentReturns(prepared.current, prepared.parentFrames, resumed.successorPrefix)));
        }
        return evaluateTraversalProgram(Object.freeze({
            stateKind: "evaluate",
            frame: enterTraversal(input),
            returns: Object.freeze([]),
        }));
    }));
}
/** Effect-native HoG entry used by definition programs before the host membrane. */
/** @internal Ordinary Run execution retains no complete historical replay vector. */
export function executeOwnedGraphTraversalEffect(input) {
    return Effect.catchAll(traversalProgram(input), (failure) => Effect.succeed(projectGraphTraversalFailure(failure))).pipe(Effect.map(result => {
        if (!("successorPrefix" in result))
            return result;
        const current = "current" in input ? input.current : input;
        const successorPrefix = admitPendingConstructionIntentContinuation(current.store, result.successorPrefix, current.openedTraversalScope.runId, current.eventTime, `${current.correlationId}/pending-construction`);
        return successorPrefix === result.successorPrefix ? result : Object.freeze({ ...result, successorPrefix });
    }));
}
export function executeGraphTraversalEffect(input) {
    return Effect.map(executeOwnedGraphTraversalEffect(input), result => completePublicOutcome(result));
}
export async function executeGraphTraversal(input) {
    const exit = await runEffectProgram(executeGraphTraversalEffect(input));
    if (Exit.isSuccess(exit))
        return exit.value;
    const defect = Cause.dieOption(exit.cause);
    if (Option.isSome(defect))
        throw defect.value;
    throw exit.cause;
}
