import { compareUnicodeCodeUnits } from "../shared/canonical_json.js";
function ordered(values) {
    return Object.freeze([...new Set(values)].sort(compareUnicodeCodeUnits));
}
export function projectCProgramNodeDeclarationReferences(term) {
    const graphFunctionRefs = new Set();
    const contractRefs = new Set();
    const implementationBindingRefs = new Set();
    const visit = (node) => {
        switch (node.kind) {
            case "c_of":
                if (node.requirement.kind === "executable_leaf_requirement") {
                    implementationBindingRefs.add(node.requirement.implementationBindingRef);
                    contractRefs.add(node.requirement.inputContractRef);
                    contractRefs.add(node.requirement.outputContractRef);
                    contractRefs.add(node.requirement.evidenceContractRef);
                    contractRefs.add(node.requirement.failureContractRef);
                    contractRefs.add(node.requirement.refusalContractRef);
                    contractRefs.add(node.requirement.judgmentContractRef);
                }
                else {
                    contractRefs.add(node.requirement.requestContractRef);
                    contractRefs.add(node.requirement.responseContractRef);
                    contractRefs.add(node.requirement.continuationContractRef);
                }
                return;
            case "c_workflow":
                graphFunctionRefs.add(node.graphFunctionRef);
                return;
            case "c_compose":
                node.terms.forEach(visit);
                return;
            case "c_edge":
                visit(node.transform);
                visit(node.evaluate);
                visit(node.consequence);
                return;
            case "c_batch":
                node.tasks.forEach(visit);
                return;
            case "c_retry":
                visit(node.term);
                return;
            case "c_identity":
                return;
        }
    };
    visit(term);
    return Object.freeze({
        graphFunctionRefs: ordered(graphFunctionRefs),
        contractRefs: ordered(contractRefs),
        evaluatorRefs: [],
        ruleRefs: [],
        implementationBindingRefs: ordered(implementationBindingRefs),
    });
}
export function projectGraphFunctionApplicationDeclarationReferences(application) {
    const graphFunctionRefs = [];
    const contractRefs = [
        application.inputContractRef,
        application.outputContractRef,
    ];
    const evaluatorRefs = [];
    const ruleRefs = [];
    switch (application.relationKind) {
        case "compose":
            graphFunctionRefs.push(application.leftGraphFunctionRef, application.rightGraphFunctionRef);
            break;
        case "substitute":
            graphFunctionRefs.push(application.outerGraphFunctionRef, application.innerGraphFunctionRef);
            break;
        case "recurse":
            graphFunctionRefs.push(application.graphFunctionRef);
            evaluatorRefs.push(...application.terminationEvaluatorRefs);
            ruleRefs.push(application.terminationRuleRef);
            break;
        case "fan_out":
            graphFunctionRefs.push(application.elementGraphFunctionRef);
            contractRefs.push(application.inputMemberContractRef, application.outputMemberContractRef);
            break;
        case "fan_in":
            graphFunctionRefs.push(application.reducerGraphFunctionRef);
            break;
        case "gate":
            graphFunctionRefs.push(application.targetRef);
            evaluatorRefs.push(...application.evaluatorRefs);
            ruleRefs.push(application.ruleRef);
            break;
        case "registered_selection":
            evaluatorRefs.push(application.evaluatorRef);
            ruleRefs.push(application.ruleRef);
            break;
        case "re_enter":
            graphFunctionRefs.push(application.graphFunctionRef);
            break;
        case "identity":
        case "promote":
        case "same_object":
            break;
    }
    return Object.freeze({
        graphFunctionRefs: ordered(graphFunctionRefs),
        contractRefs: ordered(contractRefs),
        evaluatorRefs: ordered(evaluatorRefs),
        ruleRefs: ordered(ruleRefs),
        implementationBindingRefs: [],
    });
}
