export function projectParentSuspensions(returns) {
    return Object.freeze([...returns].reverse().map((frame) => {
        const parent = frame.parent;
        if (frame.relation === "workflow") {
            const suspension = Object.freeze({
                kind: "held_workflow_suspension",
                schemaVersion: "5.0.0",
                parentExecutionBasisRef: parent.traversal.executionBasis.basisRef,
                parentTraversalScope: parent.traversal.openedTraversalScope,
                parentGraph: parent.traversal.graph,
                parentClosureContract: parent.closureContract,
                parentCCall: frame.parentCall,
                application: frame.application,
                sourceCursor: parent.cursor,
                parentGraphInput: parent.graphEntryInput,
                parentGraphInputDigest: parent.graphEntryInputDigest,
                parentInput: parent.input,
                parentInputDigest: parent.cursor.inputDigest,
                childExecutionBasisRef: frame.childExecutionBasis.basisRef,
                childTraversalScopeRef: frame.childTraversalScope.scopeRef,
                childInput: frame.childInput,
                childInputDigest: frame.childInputDigest,
                terminalMode: parent.terminalMode,
            });
            return suspension;
        }
        const admitted = frame.parentOutcome.admitted;
        const suspension = Object.freeze({
            kind: "held_recursion_suspension",
            schemaVersion: "5.0.0",
            parentExecutionBasisRef: parent.traversal.executionBasis.basisRef,
            parentTraversalScope: parent.traversal.openedTraversalScope,
            parentGraph: parent.traversal.graph,
            parentClosureContract: parent.closureContract,
            parentGraphInput: parent.graphEntryInput,
            parentGraphInputDigest: parent.graphEntryInputDigest,
            application: frame.application,
            evaluatorCCall: admitted.cCall,
            evaluatorResult: admitted.result,
            evaluatorJudgment: admitted.judgment,
            sourceCursor: parent.cursor,
            evaluatorInput: parent.input,
            evaluatorInputDigest: parent.cursor.inputDigest,
            childExecutionBasisRef: frame.childExecutionBasis.basisRef,
            childTraversalScopeRef: frame.childTraversalScope.scopeRef,
            childInput: frame.childInput,
            childInputDigest: frame.childInputDigest,
            terminalMode: parent.terminalMode,
        });
        return suspension;
    }));
}
