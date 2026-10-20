import { canonicalJson, compareUnicodeCodeUnits, } from "../shared/canonical_json.js";
import { sha256Canonical } from "../shared/digests.js";
import { isDeeplyFrozen } from "../shared/immutable.js";
import { requireRef } from "../shared/references.js";
import { cCarrier, cIdentity, cTermResultCardinality, } from "./c_algebra.js";
import { canonicalizeAuthoredGtlCarrier } from "./canonicalization.js";
import { composeApplication, graphEdge, graphFunctionApplicationRef, identityApplication, promoteApplication, substituteApplication, } from "./graph_applications.js";
function stableUnion(values) {
    return [...new Set(values.flat())].sort(compareUnicodeCodeUnits);
}
function mergeDeclarations(left, right, relation) {
    const merged = { ...left };
    for (const [key, value] of Object.entries(right)) {
        if (merged[key] !== undefined && merged[key] !== value) {
            if (key === "abg.compute_regime" &&
                ["F_D", "F_P", "F_H", "mixed"].includes(merged[key]) &&
                ["F_D", "F_P", "F_H", "mixed"].includes(value)) {
                merged[key] = "mixed";
                continue;
            }
            throw new TypeError(`${relation} GraphFunction declaration conflict at ${key}`);
        }
        merged[key] = value;
    }
    return merged;
}
/** Internal original-GTL law; these helpers are not facade exports. */
export function graphNodeIdentityFailure(template) {
    return new Set(template.nodes.map((node) => node.nodeRef)).size ===
        template.nodes.length
        ? null
        : "GraphFunction has duplicate node identities";
}
export function ordinaryGraphBoundaryFailure(template, nodeRef, outgoing = template.edges.filter((edge) => edge.fromNodeRef === nodeRef)) {
    if (template.terminalNodeRefs.includes(nodeRef)) {
        return outgoing.length === 0
            ? null
            : "terminal GTL node cannot declare an outgoing graph edge";
    }
    return outgoing.length === 1
        ? null
        : "non-terminal GTL node requires exactly one declared graph edge";
}
const validImmutableTemplates = new WeakSet();
/** Local structure only; evaluator, policy and callable law remain whole checks. */
export function graphTemplateDiagnostics(template, path = "$.template") {
    if (validImmutableTemplates.has(template))
        return [];
    const diagnostics = [];
    const duplicateNodes = graphNodeIdentityFailure(template);
    if (duplicateNodes !== null) {
        diagnostics.push({ code: "duplicate_identity", path: `${path}/nodes`, message: duplicateNodes });
    }
    const nodeRefs = new Set(template.nodes.map((node) => node.nodeRef));
    if (!nodeRefs.has(template.startNodeRef) ||
        template.terminalNodeRefs.length === 0 ||
        new Set(template.terminalNodeRefs).size !== template.terminalNodeRefs.length ||
        template.terminalNodeRefs.some((ref) => !nodeRefs.has(ref))) {
        diagnostics.push({ code: "topology_mismatch", path,
            message: "GraphFunction requires exact start and terminal nodes" });
    }
    if (template.edges.some((edge) => !nodeRefs.has(edge.fromNodeRef) || !nodeRefs.has(edge.toNodeRef))) {
        diagnostics.push({ code: "topology_mismatch", path: `${path}/edges`,
            message: "edge endpoint is absent from graph template" });
    }
    if (new Set(template.edges.map((edge) => edge.edgeRef)).size !== template.edges.length) {
        diagnostics.push({ code: "duplicate_identity", path: `${path}/edges`,
            message: "GraphFunction has duplicate edge identities" });
    }
    const outgoingByNode = new Map();
    for (const edge of template.edges) {
        const outgoing = outgoingByNode.get(edge.fromNodeRef) ?? [];
        outgoing.push(edge);
        outgoingByNode.set(edge.fromNodeRef, outgoing);
    }
    for (const node of template.nodes) {
        const outgoing = outgoingByNode.get(node.nodeRef) ?? [];
        // Selection owns its fixed outgoing workflow domain, not ordinary choice.
        // The whole validator still checks its evaluator, policy and candidates.
        const term = node.term;
        const selections = term.kind === "c_of"
            ? template.applications.filter((application) => application.relationKind === "registered_selection" &&
                application.sourceProgramLocusRef === term.programLocusRef)
            : [];
        if (!template.terminalNodeRefs.includes(node.nodeRef) &&
            selections.length === 1 && outgoing.length > 0)
            continue;
        const failure = ordinaryGraphBoundaryFailure(template, node.nodeRef, outgoing);
        if (failure !== null)
            diagnostics.push({ code: "topology_mismatch",
                path: `${path}/edges`, message: failure });
    }
    if (diagnostics.length === 0 && isDeeplyFrozen(template))
        validImmutableTemplates.add(template);
    return diagnostics;
}
function graphNodeRefs(graphFunction, label, relation) {
    requireRef(graphFunction.name, `${label} GraphFunction name`);
    const issue = graphTemplateDiagnostics(graphFunction.template)[0];
    if (issue !== undefined)
        throw new TypeError(`${relation} ${label} ${issue.message}`);
    return new Set(graphFunction.template.nodes.map((node) => node.nodeRef));
}
function rewriteCompositionTerm(term, compositionRef, demoteResult) {
    switch (term.kind) {
        case "c_of":
            return {
                ...term,
                compositionRef,
                resultBearing: demoteResult ? false : term.resultBearing,
            };
        case "c_identity":
            return { ...term };
        case "c_compose":
            return {
                ...term,
                terms: term.terms.map((child) => rewriteCompositionTerm(child, compositionRef, demoteResult)),
            };
        case "c_edge":
            return {
                ...term,
                transform: rewriteCompositionTerm(term.transform, compositionRef, demoteResult),
                evaluate: rewriteCompositionTerm(term.evaluate, compositionRef, demoteResult),
                consequence: rewriteCompositionTerm(term.consequence, compositionRef, demoteResult),
            };
        case "c_workflow":
            if (demoteResult) {
                throw new TypeError("compose cannot demote an opaque workflow.C result; author an explicit result boundary");
            }
            return { ...term };
        case "c_batch":
            return {
                ...term,
                tasks: term.tasks.map((child) => rewriteCompositionTerm(child, compositionRef, demoteResult)),
            };
        case "c_retry":
            return {
                ...term,
                term: rewriteCompositionTerm(term.term, compositionRef, demoteResult),
            };
    }
}
function rewriteNodes(graphFunction, compositionRef, demoteTerminalResults) {
    const terminalRefs = new Set(graphFunction.template.terminalNodeRefs);
    return graphFunction.template.nodes.map((node) => {
        const demoteResult = demoteTerminalResults && terminalRefs.has(node.nodeRef);
        if (demoteResult && cTermResultCardinality(node.term) !== "one") {
            throw new TypeError(`compose left terminal ${node.nodeRef} must declare exactly one result`);
        }
        if (!demoteTerminalResults && terminalRefs.has(node.nodeRef) &&
            cTermResultCardinality(node.term) !== "one") {
            throw new TypeError(`compose right terminal ${node.nodeRef} must declare exactly one result`);
        }
        const rewritten = rewriteCompositionTerm(node.term, compositionRef, demoteResult);
        if (demoteResult && cTermResultCardinality(rewritten) !== "zero") {
            throw new TypeError(`compose left terminal ${node.nodeRef} did not become an intermediate result`);
        }
        return {
            ...node,
            term: rewritten,
        };
    });
}
function mergeApplications(application, sources, relation) {
    const merged = [
        ...sources.flatMap((source) => source.template.applications),
        application,
    ];
    const byRef = new Map();
    for (const candidate of merged) {
        const existing = byRef.get(candidate.applicationRef);
        if (existing !== undefined &&
            canonicalJson(existing) !==
                canonicalJson(candidate)) {
            throw new TypeError(`${relation} application identity conflict at ${candidate.applicationRef}`);
        }
        byRef.set(candidate.applicationRef, candidate);
    }
    return [...byRef.values()];
}
function isIdentityGraphFunction(graphFunction) {
    if (graphFunction.inputs.length !== 1 ||
        graphFunction.outputs.length !== 1 ||
        graphFunction.inputs[0] !== graphFunction.outputs[0] ||
        graphFunction.environment.requires.length !== 0 ||
        graphFunction.environment.provides.length !== 0 ||
        graphFunction.environment.carries.length !== 0 ||
        graphFunction.effects.length !== 0 ||
        graphFunction.template.nodes.length !== 1 ||
        graphFunction.template.edges.length !== 0 ||
        graphFunction.template.terminalNodeRefs.length !== 1 ||
        graphFunction.template.startNodeRef !== graphFunction.template.terminalNodeRefs[0])
        return false;
    const node = graphFunction.template.nodes[0];
    const contractRef = graphFunction.inputs[0];
    if (node.nodeRef !== graphFunction.template.startNodeRef ||
        node.term.kind !== "c_identity" ||
        node.term.inputCarrierRef !== contractRef ||
        node.term.outputCarrierRef !== contractRef)
        return false;
    return graphFunction.template.applications.some((application) => application.relationKind === "identity" &&
        application.targetRef === graphFunction.name &&
        application.inputContractRef === contractRef &&
        application.outputContractRef === contractRef &&
        application.applicationRef === graphFunctionApplicationRef(application));
}
export function identityGraphFunction(input) {
    const name = requireRef(input.name, "identity GraphFunction name");
    const contractRef = requireRef(input.contractRef, "identity contractRef");
    const application = identityApplication({
        inputContractRef: contractRef,
        outputContractRef: contractRef,
        targetRef: name,
    });
    const identity = {
        name,
        contractRef,
        applicationRef: application.applicationRef,
    };
    const digest = sha256Canonical(identity);
    const nodeRef = `node://abiogenesis/identity/${digest.slice("sha256:".length)}`;
    return canonicalizeAuthoredGtlCarrier({
        kind: "graph_function",
        name,
        version: "5.0.0",
        environment: { requires: [], provides: [], carries: [] },
        inputs: [contractRef],
        outputs: [contractRef],
        template: {
            kind: "inline_graph",
            graphRef: `graph://abiogenesis/identity/${digest.slice("sha256:".length)}`,
            startNodeRef: nodeRef,
            terminalNodeRefs: [nodeRef],
            nodes: [{
                    nodeRef,
                    nodeKind: "c_locus",
                    term: cIdentity(cCarrier(contractRef)),
                }],
            edges: [],
            applications: [application],
        },
        effects: [],
        declarations: {},
        tags: [],
    }, "graph_function");
}
export function promoteGraphFunction(input) {
    const name = requireRef(input.name, "promoted GraphFunction name");
    const sourceRef = requireRef(input.sourceRef, "promotion sourceRef");
    const targetRef = requireRef(input.targetRef, "promotion targetRef");
    const { source } = input;
    if (name === source.name) {
        throw new TypeError("promoted GraphFunction requires a distinct identity");
    }
    graphNodeRefs(source, "source", "promote");
    if (source.inputs.length !== 1 ||
        source.outputs.length !== 1 ||
        source.inputs[0] !== sourceRef ||
        source.outputs[0] !== targetRef) {
        throw new TypeError("promote must bind the exact source GraphFunction input and output contracts");
    }
    const application = promoteApplication({
        inputContractRef: sourceRef,
        outputContractRef: targetRef,
        sourceRef,
        targetRef,
    });
    const graphDigest = sha256Canonical({
        name,
        sourceGraphRef: source.template.graphRef,
        applicationRef: application.applicationRef,
    });
    return canonicalizeAuthoredGtlCarrier({
        kind: "graph_function",
        name,
        version: "5.0.0",
        environment: {
            requires: [...source.environment.requires],
            provides: [...source.environment.provides],
            carries: [...source.environment.carries],
        },
        inputs: [sourceRef],
        outputs: [targetRef],
        template: {
            kind: "inline_graph",
            graphRef: `graph://abiogenesis/promoted/${graphDigest.slice("sha256:".length)}`,
            startNodeRef: source.template.startNodeRef,
            terminalNodeRefs: [...source.template.terminalNodeRefs],
            nodes: [...source.template.nodes],
            edges: [...source.template.edges],
            applications: mergeApplications(application, [source], "promote"),
        },
        effects: [...source.effects],
        declarations: { ...source.declarations },
        tags: [...source.tags],
    }, "graph_function");
}
export function composeGraphFunctions(input) {
    const name = requireRef(input.name, "composed GraphFunction name");
    const { left, right } = input;
    if (name === left.name || name === right.name) {
        throw new TypeError("composed GraphFunction requires a distinct identity");
    }
    const leftNodeRefs = graphNodeRefs(left, "left", "compose");
    graphNodeRefs(right, "right", "compose");
    if (left.inputs.length !== 1 ||
        left.outputs.length !== 1 ||
        right.inputs.length !== 1 ||
        right.outputs.length !== 1 ||
        left.outputs[0] !== right.inputs[0]) {
        throw new TypeError("compose currently requires one exact left-output to right-input contract join");
    }
    const available = new Set([
        ...left.environment.provides,
        ...left.environment.carries,
        ...left.outputs,
    ]);
    if (right.environment.requires.some((ref) => !available.has(ref))) {
        throw new TypeError("compose right environment requires a binding absent from the left cumulative environment");
    }
    if (right.template.nodes.some((node) => leftNodeRefs.has(node.nodeRef))) {
        throw new TypeError("compose operands contain a duplicate graph node identity");
    }
    const leftIsIdentity = isIdentityGraphFunction(left);
    const rightIsIdentity = isIdentityGraphFunction(right);
    const application = composeApplication({
        inputContractRef: left.inputs[0],
        outputContractRef: right.outputs[0],
        leftGraphFunctionRef: left.name,
        rightGraphFunctionRef: right.name,
    });
    const bridgeEdges = leftIsIdentity || rightIsIdentity
        ? []
        : left.template.terminalNodeRefs.map((fromNodeRef) => graphEdge({ fromNodeRef, toNodeRef: right.template.startNodeRef }));
    const edges = [
        ...(leftIsIdentity ? [] : left.template.edges),
        ...bridgeEdges,
        ...(rightIsIdentity ? [] : right.template.edges),
    ];
    if (new Set(edges.map((edge) => edge.edgeRef)).size !== edges.length) {
        throw new TypeError("compose operands produce a duplicate graph edge identity");
    }
    const graphIdentity = {
        name,
        leftGraphRef: left.template.graphRef,
        rightGraphRef: right.template.graphRef,
        applicationRef: application.applicationRef,
    };
    const graphDigest = sha256Canonical(graphIdentity);
    if (leftIsIdentity && rightIsIdentity) {
        const base = identityGraphFunction({ name, contractRef: left.inputs[0] });
        return canonicalizeAuthoredGtlCarrier({
            ...base,
            template: {
                ...base.template,
                graphRef: `graph://abiogenesis/composed/${graphDigest.slice("sha256:".length)}`,
                applications: mergeApplications(application, [left, right, base], "compose"),
            },
        }, "graph_function");
    }
    const graphFunction = {
        kind: "graph_function",
        name,
        version: "5.0.0",
        environment: {
            requires: [...left.environment.requires],
            provides: stableUnion([
                left.environment.provides,
                right.environment.provides,
            ]),
            carries: stableUnion([
                left.environment.carries,
                right.environment.carries,
            ]),
        },
        inputs: [...left.inputs],
        outputs: [...right.outputs],
        template: {
            kind: "inline_graph",
            graphRef: `graph://abiogenesis/composed/${graphDigest.slice("sha256:".length)}`,
            startNodeRef: leftIsIdentity
                ? right.template.startNodeRef
                : left.template.startNodeRef,
            terminalNodeRefs: [
                ...(rightIsIdentity
                    ? left.template.terminalNodeRefs
                    : right.template.terminalNodeRefs),
            ],
            nodes: [
                ...(leftIsIdentity
                    ? []
                    : rewriteNodes(left, application.applicationRef, !rightIsIdentity)),
                ...(rightIsIdentity
                    ? []
                    : rewriteNodes(right, application.applicationRef, false)),
            ],
            edges,
            applications: mergeApplications(application, [left, right], "compose"),
        },
        effects: stableUnion([left.effects, right.effects]),
        declarations: mergeDeclarations(left.declarations, right.declarations, "compose"),
        tags: stableUnion([left.tags, right.tags]),
    };
    return canonicalizeAuthoredGtlCarrier(graphFunction, "graph_function");
}
export function substituteGraphFunction(input) {
    const name = requireRef(input.name, "substituted GraphFunction name");
    const targetVectorRef = requireRef(input.targetVectorRef, "targetVectorRef");
    const { outer, inner } = input;
    if (name === outer.name || name === inner.name) {
        throw new TypeError("substituted GraphFunction requires a distinct identity");
    }
    const outerNodeRefs = graphNodeRefs(outer, "outer", "substitute");
    graphNodeRefs(inner, "inner", "substitute");
    if (outer.inputs.length !== 1 ||
        outer.outputs.length !== 1 ||
        inner.inputs.length !== 1 ||
        inner.outputs.length !== 1) {
        throw new TypeError("substitute currently requires one exact outer and inner interface");
    }
    const targetEdges = outer.template.edges.filter((edge) => edge.edgeRef === targetVectorRef);
    if (targetEdges.length !== 1) {
        throw new TypeError("substitute target vector must identify exactly one outer graph edge");
    }
    const targetEdge = targetEdges[0];
    const sourceNode = outer.template.nodes.find((node) => node.nodeRef === targetEdge.fromNodeRef);
    const targetNode = outer.template.nodes.find((node) => node.nodeRef === targetEdge.toNodeRef);
    if (sourceNode === undefined || targetNode === undefined) {
        throw new TypeError("substitute target vector endpoints must resolve in the outer graph");
    }
    if (targetEdge.edgeRef !== graphEdge({
        fromNodeRef: targetEdge.fromNodeRef,
        toNodeRef: targetEdge.toNodeRef,
    }).edgeRef) {
        throw new TypeError("substitute target vector must have one canonical graph identity");
    }
    if (sourceNode.term.outputCarrierRef !== inner.inputs[0] ||
        inner.outputs[0] !== targetNode.term.inputCarrierRef) {
        throw new TypeError("substitute inner interface must exactly join the target vector endpoints");
    }
    const availableAtTarget = new Set([
        ...outer.environment.requires,
        ...outer.environment.provides,
        ...outer.environment.carries,
        sourceNode.term.outputCarrierRef,
    ]);
    if (inner.environment.requires.some((ref) => !availableAtTarget.has(ref))) {
        throw new TypeError("substitute inner environment requires a binding absent from the outer graph");
    }
    if (inner.template.nodes.some((node) => outerNodeRefs.has(node.nodeRef))) {
        throw new TypeError("substitute operands contain a duplicate graph node identity");
    }
    const application = substituteApplication({
        inputContractRef: outer.inputs[0],
        outputContractRef: outer.outputs[0],
        outerGraphFunctionRef: outer.name,
        targetVectorRef,
        innerGraphFunctionRef: inner.name,
    });
    const replacementEdges = [
        graphEdge({
            fromNodeRef: targetEdge.fromNodeRef,
            toNodeRef: inner.template.startNodeRef,
        }),
        ...inner.template.terminalNodeRefs.map((fromNodeRef) => graphEdge({ fromNodeRef, toNodeRef: targetEdge.toNodeRef })),
    ];
    const edges = [
        ...outer.template.edges.filter((edge) => edge.edgeRef !== targetVectorRef),
        ...inner.template.edges,
        ...replacementEdges,
    ];
    if (new Set(edges.map((edge) => edge.edgeRef)).size !== edges.length) {
        throw new TypeError("substitute operands produce a duplicate graph edge identity");
    }
    const graphIdentity = {
        name,
        outerGraphRef: outer.template.graphRef,
        targetVectorRef,
        innerGraphRef: inner.template.graphRef,
        applicationRef: application.applicationRef,
    };
    const graphDigest = sha256Canonical(graphIdentity);
    const graphFunction = {
        kind: "graph_function",
        name,
        version: "5.0.0",
        environment: {
            requires: [...outer.environment.requires],
            provides: stableUnion([
                outer.environment.provides,
                inner.environment.provides,
            ]),
            carries: stableUnion([
                outer.environment.carries,
                inner.environment.carries,
            ]),
        },
        inputs: [...outer.inputs],
        outputs: [...outer.outputs],
        template: {
            kind: "inline_graph",
            graphRef: `graph://abiogenesis/substituted/${graphDigest.slice("sha256:".length)}`,
            startNodeRef: outer.template.startNodeRef,
            terminalNodeRefs: [...outer.template.terminalNodeRefs],
            nodes: [
                ...outer.template.nodes,
                ...rewriteNodes(inner, application.applicationRef, true),
            ],
            edges,
            applications: mergeApplications(application, [outer, inner], "substitute"),
        },
        effects: stableUnion([outer.effects, inner.effects]),
        declarations: mergeDeclarations(outer.declarations, inner.declarations, "substitute"),
        tags: stableUnion([outer.tags, inner.tags]),
    };
    return canonicalizeAuthoredGtlCarrier(graphFunction, "graph_function");
}
