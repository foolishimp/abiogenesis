import { RELEASE_OWNER_RULING_SCHEMA, RELEASE_RULING_SOURCE_APPROVAL_SCHEMA } from "./release_acceptance.js";
import * as v from "valibot";
import { capabilityRefsForDefinition } from "../shared/capability_contracts.js";
import { canonicalJson } from "../shared/canonical_json.js";
import { sha256Canonical, sha256Bytes } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import { isRecord } from "../shared/admission_predicates.js";
import { absolutePathSchema, digestSchema, jsonValueSchema, nonblankSchema, refDigestSchema, ownerAuthorityDigest, ownerContractPacket, ownerMetadata, TERMINAL_ONLY_ADAPTER_EXIT_MAP } from "../shared/public_function_contracts.js";
import { isExactOperationInvocationCoordinate } from "../shared/operation_definition_coordinate.js";
import { EXACT_CANDIDATE_QUALIFICATION_BASIS_SCHEMA, QUALIFICATION_PROOF_RESOURCE_SCHEMA, QUALIFICATION_SELECTION_SCHEMA, QUALIFICATION_INVENTORY_SCHEMA, QUALIFICATION_PREFIX_SCHEMA } from "../validator/qualification_contracts.js";
const integer = v.pipe(v.number(), v.integer(), v.minValue(0));
const gitObject = v.pipe(v.string(), v.regex(/^(?:[a-f0-9]{40}|[a-f0-9]{64})$/));
export const RELEASE_IDENTITY_SCHEMA = v.strictObject({ productId: nonblankSchema, namespace: v.literal("abiogenesis"),
    profile: v.literal("one_project_unqualified"), projectSubtree: v.literal("."), versionLine: v.literal("5.0.0"),
    ordinal: v.pipe(integer, v.minValue(1)), version: nonblankSchema, releaseClaim: refDigestSchema });
const requestSchema = v.strictObject({ qualificationBasis: EXACT_CANDIDATE_QUALIFICATION_BASIS_SCHEMA,
    lawBasis: refDigestSchema, verdict: refDigestSchema, requestedIdentity: RELEASE_IDENTITY_SCHEMA });
const tappedRequestSchema = v.strictObject({ ...requestSchema.entries, acceptedRc: refDigestSchema, acceptance: v.nullable(refDigestSchema), predecessor: v.nullable(refDigestSchema) });
export const RELEASE_PUBLICATION_GRANT_SCHEMA = v.strictObject({
    kind: v.literal("release_publication_grant"), sourceRoot: absolutePathSchema, sourceCommit: gitObject, sourceTree: gitObject,
    sourceInventory: QUALIFICATION_INVENTORY_SCHEMA,
    artifact: v.strictObject({ path: absolutePathSchema, ref: nonblankSchema, digest: digestSchema, snapshotName: nonblankSchema, packageName: nonblankSchema }),
    manifestPath: absolutePathSchema, releaseClaimPath: absolutePathSchema,
    remote: nonblankSchema, pushMode: v.literal("atomic"), expectedRemoteRefs: v.array(v.strictObject({ ref: nonblankSchema, object: gitObject })),
    expectedLocalRefs: v.array(v.strictObject({ ref: nonblankSchema, object: gitObject })),
    carrierRefs: v.array(v.strictObject({ ref: nonblankSchema, expectedObject: v.nullable(gitObject) })),
    snapshotRoot: absolutePathSchema, artifactOutputRoot: absolutePathSchema,
    tagger: v.strictObject({ name: nonblankSchema, email: nonblankSchema, date: nonblankSchema }),
    tagMessage: nonblankSchema, buildCommand: nonblankSchema, packCommand: nonblankSchema,
});
const refObservation = v.strictObject({ ref: nonblankSchema, object: gitObject, peeled: gitObject });
export const RELEASE_PHYSICAL_OBSERVATION_SCHEMA = v.strictObject({
    disposition: v.picklist(["complete", "refused", "incomplete_effect"]), phase: nonblankSchema, message: nonblankSchema,
    effects: v.array(v.strictObject({ kind: nonblankSchema, ref: nonblankSchema, digest: v.nullable(nonblankSchema) })), unknownEffects: v.array(nonblankSchema),
    sourceCommit: v.nullable(gitObject), sourceTree: v.nullable(gitObject), refs: v.array(refObservation),
    snapshotManifest: v.nullable(refDigestSchema), snapshotFiles: v.array(v.strictObject({ path: nonblankSchema, digest: digestSchema })),
});
const coordinateSchema = v.strictObject({ operationId: v.literal("abg.operation.release.snapshot"), memberKey: v.literal("published_rc"),
    definitionDigest: digestSchema, invocationRef: nonblankSchema, invocationPayloadDigest: digestSchema, invocationDigest: digestSchema });
export const PUBLISHED_RELEASE_OPERATION_ARTIFACT_SCHEMA = v.strictObject({ kind: v.literal("release_operation_observation"), schemaVersion: v.literal("5.0.0"),
    memberKey: v.literal("published_rc"), scope: refDigestSchema, invocation: coordinateSchema,
    entryPrefix: QUALIFICATION_PREFIX_SCHEMA, grants: v.array(jsonValueSchema), admissionAuthority: jsonValueSchema, eventResource: jsonValueSchema,
    publicInvocation: jsonValueSchema, resourceDigest: digestSchema, actorRef: nonblankSchema, capabilityGrants: jsonValueSchema,
    workspaceBinding: refDigestSchema, productSet: jsonValueSchema, dependencyLock: refDigestSchema,
    request: requestSchema, proof: QUALIFICATION_PROOF_RESOURCE_SCHEMA, selection: QUALIFICATION_SELECTION_SCHEMA,
    effectGrant: RELEASE_PUBLICATION_GRANT_SCHEMA, observation: RELEASE_PHYSICAL_OBSERVATION_SCHEMA,
});
export const RELEASE_ACCEPTANCE_GRANT_SCHEMA = v.strictObject({ kind: v.literal("release_acceptance_grant"),
    humanAuthority: refDigestSchema, sourceAuthority: refDigestSchema, sourceApproval: v.nullable(RELEASE_RULING_SOURCE_APPROVAL_SCHEMA),
    requiredEvidence: v.pipe(v.array(refDigestSchema), v.minLength(1)),
    addendumRoot: absolutePathSchema, artifactOutputRoot: absolutePathSchema });
const tappedArtifactSchema = v.strictObject({ ...PUBLISHED_RELEASE_OPERATION_ARTIFACT_SCHEMA.entries,
    memberKey: v.literal("tapped_release"), invocation: v.strictObject({ ...coordinateSchema.entries, memberKey: v.literal("tapped_release") }),
    request: tappedRequestSchema, effectGrant: RELEASE_ACCEPTANCE_GRANT_SCHEMA,
    publication: PUBLISHED_RELEASE_OPERATION_ARTIFACT_SCHEMA, ruling: v.nullable(RELEASE_OWNER_RULING_SCHEMA),
    decision: v.picklist(["accept", "withhold"]), addendum: v.nullable(refDigestSchema) });
export const RELEASE_OPERATION_ARTIFACT_SCHEMA = v.variant("memberKey", [PUBLISHED_RELEASE_OPERATION_ARTIFACT_SCHEMA, tappedArtifactSchema]);
const completeSchema = v.strictObject({ kind: v.literal("release_snapshot_result"), schemaVersion: v.literal("5.0.0"), memberKey: v.literal("published_rc"),
    disposition: v.literal("complete"), identity: RELEASE_IDENTITY_SCHEMA, artifact: refDigestSchema, observation: RELEASE_PHYSICAL_OBSERVATION_SCHEMA });
const tappedCompleteSchema = v.strictObject({ ...completeSchema.entries, memberKey: v.literal("tapped_release"), decision: v.literal("accept"),
    publication: refDigestSchema, acceptance: refDigestSchema, addendum: refDigestSchema });
const refusalSchema = v.strictObject({ kind: v.literal("release_snapshot_refusal"), schemaVersion: v.literal("5.0.0"),
    memberKey: v.picklist(["published_rc", "tapped_release"]), disposition: v.picklist(["refused", "incomplete_effect"]),
    code: v.picklist(["wrong_subject_kind", "basis_mismatch", "law_basis_mismatch", "verdict_not_green", "bypass_nonempty", "identity_mismatch", "publication_failure", "not_implemented", "duplicate_invocation", "artifact_conflict", "acceptance_unavailable", "acceptance_withheld"]),
    message: nonblankSchema, artifact: v.nullable(refDigestSchema), observation: v.nullable(RELEASE_PHYSICAL_OBSERVATION_SCHEMA) });
function metadata(member) {
    return ownerMetadata({ authorityClass: "write", effectClass: "immutable_release_publication",
        eventAdmission: "immutable_artifact_boundary", actorRequirement: "required", workspaceBindingRequirement: "exactly_one",
        authoritySlotRequirements: ["capability_grants", "workspace_binding", "product_set", "dependency_lock", "actor"],
        capabilityRefs: capabilityRefsForDefinition({ operationId: "abg.operation.release.snapshot", memberKey: member }), defaults: {}, closedDomains: { snapshotKind: [member] },
        sdkCoordinate: "sdk.release.snapshot", cliCoordinate: `release snapshot ${member}`, adapterExitMap: TERMINAL_ONLY_ADAPTER_EXIT_MAP });
}
const authority = "authority://abiogenesis/product/release-snapshot@5";
const owner = (member) => ({ abstractModule: "Product.ReleaseSnapshot", exportName: "RELEASE_OPERATION_CONTRACTS", memberPath: ["snapshot", member], authorityRef: authority, authorityDigest: ownerAuthorityDigest(authority) });
export const RELEASE_OPERATION_CONTRACTS = Object.freeze({ snapshot: Object.freeze({
        published_rc: ownerContractPacket({ operationId: "abg.operation.release.snapshot", memberKey: "published_rc" }, requestSchema, completeSchema, refusalSchema, null, owner("published_rc"), metadata("published_rc")),
        tapped_release: ownerContractPacket({ operationId: "abg.operation.release.snapshot", memberKey: "tapped_release" }, tappedRequestSchema, tappedCompleteSchema, refusalSchema, null, owner("tapped_release"), metadata("tapped_release")),
    }) });
export const releaseHash = (value) => sha256Canonical(value);
const same = (a, b) => canonicalJson(a) === canonicalJson(b);
export function releaseRefusal(memberKey, code, message, observation = null, artifact = null) {
    return deepFreeze({ kind: "release_snapshot_refusal", schemaVersion: "5.0.0", memberKey, disposition: observation?.disposition === "incomplete_effect" ? "incomplete_effect" : "refused", code, message, artifact, observation });
}
export function releaseAuthorityScope(request, proof, selection, effectGrant) {
    const identity = request.requestedIdentity;
    const ref = `release-scope://abiogenesis/${identity.namespace}/${identity.versionLine}/rc.${identity.ordinal}/published_rc`;
    return { ref, digest: releaseHash({ request, proof, selection, effectGrant }) };
}
export function releaseArtifactCoordinate(a) { const digest = releaseHash(a); return { ref: `release-observation://abiogenesis/${digest.slice(7)}`, digest }; }
export function releaseAcceptanceScope(request, proof, selection, effectGrant) {
    const identity = request.requestedIdentity;
    return { ref: `release-scope://abiogenesis/${identity.namespace}/${identity.versionLine}/rc.${identity.ordinal}/tapped_release${request.predecessor === null ? "" : `/after/${request.predecessor.digest.slice(7)}`}`,
        digest: releaseHash({ request, proof, selection, effectGrant }) };
}
