import { isRecord } from "../shared/admission_predicates.js";
import { constructCatalogProgramValidationInput, constructProgramValidationInputFromResolvedClosure } from "../product/catalog_operations.js";
import { sha256Canonical } from "../shared/digests.js";
import { admitIJsonValue } from "../shared/i_json.js";
import { deepFreeze } from "../shared/immutable.js";
import { rawAdmitValue, } from "./raw_admission.js";
import { validateProgram, } from "./validation.js";
function hasExactDataFields(value, fields) {
    const keys = Reflect.ownKeys(value);
    if (keys.some((key) => typeof key !== "string"))
        return false;
    const actual = keys.sort();
    const expected = [...fields].sort();
    if (actual.length !== expected.length ||
        actual.some((field, index) => field !== expected[index]))
        return false;
    return actual.every((field) => {
        const descriptor = Object.getOwnPropertyDescriptor(value, field);
        return descriptor !== undefined &&
            Object.hasOwn(descriptor, "value") &&
            !Object.hasOwn(descriptor, "get") &&
            !Object.hasOwn(descriptor, "set") &&
            descriptor.enumerable === true;
    });
}
function refusal(code, programRef, programDigest, diagnostics, violatedContractRefs = [], evidenceRefs = []) {
    return deepFreeze({
        kind: "gtl_program_conformance_refusal",
        schemaVersion: "5.0.0",
        disposition: "failed",
        programRef,
        programDigest,
        code,
        diagnosticRef: `diagnostic://abiogenesis/conformance/${code}@5`,
        diagnostics,
        violatedContractRefs: Object.freeze([...violatedContractRefs]),
        evidenceRefs: Object.freeze([...evidenceRefs]),
        repairAffordances: Object.freeze([]),
    });
}
function rawInput(publication, program) {
    const publicationAdmission = rawAdmitValue(publication, "module_publication", "contract://abiogenesis/gtl/module-publication@5");
    if (publicationAdmission.kind !== "raw_admitted_value") {
        return publicationAdmission;
    }
    const programAdmission = rawAdmitValue(program, "gtl_program", "contract://abiogenesis/gtl/program@5");
    if (programAdmission.kind !== "raw_admitted_value")
        return programAdmission;
    const graphFunctions = publication.graphFunctions
        .filter((value) => program.callableMembership.includes(value.name))
        .map((value) => rawAdmitValue(value, "graph_function", "contract://abiogenesis/gtl/graph-function@5"));
    const contracts = publication.contracts.map((value) => rawAdmitValue(value, "contract_declaration", "contract://abiogenesis/gtl/contract-declaration@5"));
    const implementationBindings = publication.implementationBindings.map((value) => rawAdmitValue(value, "implementation_binding", "contract://abiogenesis/gtl/implementation-binding@5"));
    const closureContracts = publication.closureContracts.map((value) => rawAdmitValue(value, "closure_contract", "contract://abiogenesis/gtl/closure-contract@5"));
    const rawRefusal = [
        ...graphFunctions,
        ...contracts,
        ...implementationBindings,
        ...closureContracts,
    ].find((value) => value.kind === "raw_admission_refusal");
    if (rawRefusal !== undefined)
        return rawRefusal;
    return {
        declarationBasisDigest: publicationAdmission.subjectDigest,
        programPublication: publicationAdmission,
        program: programAdmission,
        graphFunctions: graphFunctions,
        contracts: contracts,
        evaluators: publication.evaluators,
        rules: publication.rules,
        implementationBindings: implementationBindings,
        closureContracts: closureContracts,
    };
}
function isRawAdmissionRefusal(value) {
    return "kind" in value && value.kind === "raw_admission_refusal";
}
export function evaluateGtlProgramConformance(supplied, declarationBasis) {
    return evaluateWithValidationInput(supplied, declarationBasis, (packet) => declarationBasis === undefined
        ? rawInput(packet.publication, packet.program)
        : constructCatalogProgramValidationInput(declarationBasis.catalog, declarationBasis.catalogView, declarationBasis.declarationClosure, packet.program));
}
/** Internal continuation after this conformance owner resolves the exact
 * declaration closure. This is not exposed on the raw ConformancePort. */
export function evaluateGtlProgramConformanceFromResolvedClosure(supplied, declarationClosure) {
    return evaluateWithValidationInput(supplied, { declarationClosure }, (packet) => constructProgramValidationInputFromResolvedClosure(declarationClosure, packet.program));
}
function evaluateWithValidationInput(supplied, declarationBasis, inputForPacket) {
    let admitted;
    try {
        admitted = admitIJsonValue(supplied, "GTL Program conformance packet");
    }
    catch {
        return refusal("invalid_packet", null, null, [{
                code: "invalid_packet",
                path: "$",
                message: "GTL Program conformance requires one exact I-JSON packet",
            }]);
    }
    if (!isRecord(admitted) ||
        !hasExactDataFields(admitted, [
            "kind",
            "memberKey",
            "program",
            "publication",
            "schemaVersion",
        ]) ||
        admitted.kind !== "conformance_evaluate_packet" ||
        admitted.schemaVersion !== "5.0.0" ||
        admitted.memberKey !== "gtl_program" ||
        !isRecord(admitted.program) ||
        !isRecord(admitted.publication)) {
        return refusal("invalid_packet", null, null, [{
                code: "invalid_packet",
                path: "$",
                message: "GTL Program conformance packet differs from its exact owner contract",
            }]);
    }
    const packet = admitted;
    const programRef = typeof packet.program.programRef === "string"
        ? packet.program.programRef
        : null;
    const programDigest = sha256Canonical(packet.program);
    if (declarationBasis !== undefined &&
        sha256Canonical(declarationBasis.declarationClosure.programPublication) !==
            sha256Canonical(packet.publication)) {
        return refusal("invalid_packet", programRef, programDigest, [{
                code: "invalid_packet", path: "$.publication", message: "conformance closure differs from the original Program publication",
            }]);
    }
    const input = inputForPacket(packet);
    if (isRawAdmissionRefusal(input)) {
        return refusal("raw_admission_refused", programRef, programDigest, [{ code: input.code, path: "$", message: input.message }]);
    }
    const validation = validateProgram(input);
    if (validation.kind !== "program_validation") {
        const failed = validation;
        return refusal("validation_failed", programRef, programDigest, failed.diagnostics, [...new Set([
                ...input.contracts.map((row) => row.value.contractRef),
                ...input.closureContracts.map((row) => row.value.closureContractRef),
            ])].sort(), [input.program.admissionRef, input.programPublication.admissionRef]);
    }
    const evidenceBody = {
        programRef: validation.programRef,
        programDigest: validation.programDigest,
        validationRef: validation.validationRef,
        sourceDigest: validation.sourceDigest,
        publicationDigest: validation.publicationDigest,
    };
    const evidenceDigest = sha256Canonical(evidenceBody);
    return deepFreeze({
        kind: "gtl_program_conformance_result",
        schemaVersion: "5.0.0",
        disposition: "passed",
        programRef: validation.programRef,
        programDigest: validation.programDigest,
        evidenceRef: `evidence://abiogenesis/conformance/${evidenceDigest.slice("sha256:".length)}`,
        evidenceDigest,
        validation,
        diagnostics: Object.freeze([]),
        violatedContractRefs: Object.freeze([]),
        repairAffordances: Object.freeze([]),
    });
}
export const ConformancePort = Object.freeze({
    evaluateGtlProgram: evaluateGtlProgramConformance,
});
export const CONFORMANCE_CONTRACTS = Object.freeze({
    gtl_program: ConformancePort.evaluateGtlProgram,
});
