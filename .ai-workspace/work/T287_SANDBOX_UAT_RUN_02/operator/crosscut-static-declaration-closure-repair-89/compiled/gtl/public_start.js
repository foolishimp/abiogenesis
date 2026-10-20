function refusal(code, message) {
    return {
        kind: "program_start_refusal",
        code,
        message,
    };
}
export function resolveProgramStart(program, request) {
    if (request.scope !== "program") {
        return refusal("unsupported_control", "public start scope must name the admitted Program");
    }
    if (request.until === "converged" &&
        request.rootMode === "supervised" &&
        request.startRef !== undefined &&
        request.target === request.startRef &&
        program.policies["abg.root_mode"] === "supervised") {
        const matches = program.starts.filter((start) => start.startRef === request.startRef);
        return matches.length === 1
            ? {
                kind: "resolved_program_start",
                targetKind: "declared_start",
                start: matches[0],
                assetRef: null,
            }
            : refusal(matches.length === 0 ? "missing_target" : "ambiguous_target", "supervised start must resolve one exact declared Program start");
    }
    if (request.until !== "converged" ||
        request.rootMode !== "direct" ||
        request.startRef !== undefined ||
        program.policies["abg.root_mode"] !== "direct") {
        return refusal("unsupported_control", "direct public control requires next or asset target with until converged and no caller-selected start");
    }
    if (request.target === "next") {
        const defaultStartRef = program.policies["abg.default_start_ref"];
        const matches = program.starts.filter((start) => start.startRef === defaultStartRef);
        return matches.length === 1
            ? {
                kind: "resolved_program_start",
                targetKind: "next",
                start: matches[0],
                assetRef: null,
            }
            : refusal(matches.length === 0 ? "missing_target" : "ambiguous_target", "next requires one Product-declared default Program start");
    }
    if (request.target.startsWith("asset:")) {
        const handle = request.target.slice("asset:".length);
        const matches = (program.publicAssetTargets ?? []).filter((target) => target.handle === handle);
        if (matches.length !== 1) {
            return refusal(matches.length === 0 ? "missing_target" : "ambiguous_target", "asset target must resolve exactly once in the Product-published Program registry");
        }
        const [target] = matches;
        const starts = program.starts.filter((start) => start.startRef === target.startRef);
        return starts.length === 1
            ? {
                kind: "resolved_program_start",
                targetKind: "asset",
                start: starts[0],
                assetRef: target.assetRef,
            }
            : refusal(starts.length === 0 ? "missing_target" : "ambiguous_target", "asset target owner must be one exact declared Program start");
    }
    return refusal("missing_target", "public start target is neither next nor a published asset handle");
}
