import * as Effect from "effect/Effect";
import * as v from "valibot";
import { mkdir, writeFile } from "node:fs/promises";
import { join, resolve, relative, isAbsolute } from "node:path";
import { acquireAbgEventResource, closeAbgEventResource, abandonAbgEventResource, validateAbgEventResourceAssertion, validateAbgEventResourceReceipt } from "../abg/definition_event_resource.js";
import { admitArtifact, projectExactPrefixWorkspaceEnvironment } from "../abg/environment_admission.js";
import { projectEffectfulPublicInvocationTruthAtPrefix } from "../abg/effectful_invocation_truth.js";
import { projectExactPrefixArtifactTruth } from "../abg/artifact_truth.js";
import { canonicalJson } from "../shared/canonical_json.js";
import { deepFreeze } from "../shared/immutable.js";
import { constructExactOperationInvocationCoordinate } from "../shared/operation_definition_coordinate.js";
import { bindExactPrefixTransition } from "../shared/static_definition_bindings.js";
import { definitionFault, isDefinitionFault, sameJson } from "../shared/definition_binding_mechanics.js";
import { nonblankSchema, refDigestSchema } from "../shared/public_function_contracts.js";
import { QUALIFICATION_PROOF_RESOURCE_SCHEMA, QUALIFICATION_SELECTION_SCHEMA } from "../validator/qualification_contracts.js";
import { publishReleaseSnapshot, projectReleaseQualification, projectReleaseAcceptance, recordReleaseAcceptance } from "../implementation/release_publication.js";
import { withAdmissionAuthority } from "./admission_authority.js";
import { verifyProduct } from "./verify_product.js";
import { productInstallCoordinate } from "./environment.js";
import { RELEASE_OWNER_RULING_SCHEMA } from "./release_acceptance.js";
import { RELEASE_OPERATION_CONTRACTS, RELEASE_PUBLICATION_GRANT_SCHEMA, RELEASE_ACCEPTANCE_GRANT_SCHEMA, PUBLISHED_RELEASE_OPERATION_ARTIFACT_SCHEMA, releaseRefusal, releaseAuthorityScope, releaseAcceptanceScope, releaseArtifactCoordinate, releaseHash } from "./release_snapshot_operations.js";
export const RELEASE_PUBLICATION_RESOURCE_SCHEMA = v.strictObject({ kind: v.literal("release_publication_resources"), schemaVersion: v.literal("5.0.0"),
    eventResource: v.custom(validateAbgEventResourceAssertion, "ABG event resource"),
    proof: QUALIFICATION_PROOF_RESOURCE_SCHEMA, selection: QUALIFICATION_SELECTION_SCHEMA, effectGrant: RELEASE_PUBLICATION_GRANT_SCHEMA });
export const RELEASE_PUBLICATION_RECEIPT_SCHEMA = v.strictObject({ kind: v.literal("release_publication_receipt"), schemaVersion: v.literal("5.0.0"),
    eventResource: v.custom(validateAbgEventResourceReceipt, "ABG event receipt"),
    artifact: v.nullable(refDigestSchema), artifactPath: v.nullable(nonblankSchema), admissionEventRef: v.nullable(nonblankSchema) });
const within = (root, path) => { const rel = relative(resolve(root), resolve(path)); return rel === "" || (!isAbsolute(rel) && rel !== ".." && !rel.startsWith("../")); };
const owner = (call, approved, heldResource) => Effect.tryPromise({ try: async () => {
        let acquired, observation = null, artifact = null, artifactPath = null, admissionEventRef = null, phase = "resource_acquisition";
        try {
            const resources = call.resources, request = call.invocation.request, slots = call.invocation.invocationAuthority.slots;
            const result = heldResource === null ? acquireAbgEventResource(resources.eventResource) : { kind: "acquired_abg_event_resource", resource: heldResource };
            if (result.kind !== "acquired_abg_event_resource")
                throw definitionFault(call.invocation.definitionKey, phase, result.code, result.message);
            acquired = result.resource;
            const refuse = (code, message) => deepFreeze({ ownerOutput: { outcomeKind: "refusal", value: releaseRefusal("published_rc", code, message) }, resources: { kind: "release_publication_receipt", schemaVersion: "5.0.0", eventResource: closeAbgEventResource(acquired, acquired.entryPrefix), artifact: null, artifactPath: null, admissionEventRef: null } });
            phase = "qualification_join";
            const qualification = projectReleaseQualification(request, resources.proof, resources.selection, acquired.entryPrefix);
            if (qualification === null)
                return refuse("basis_mismatch", "one exact native same-subject green non-bypassed D5 verdict is required");
            const binding = slots.workspace_binding;
            if (binding === null)
                return refuse("identity_mismatch", "release requires its current admitted workspace");
            const environment = projectExactPrefixWorkspaceEnvironment(acquired.entryPrefix, binding);
            if (environment.kind !== "exact_prefix_workspace_environment" || !sameJson(slots.product_set, environment.productInstalls.map(productInstallCoordinate)) ||
                !sameJson(slots.dependency_lock, { ref: environment.resolvedProductLock.lockId, digest: environment.resolvedProductLock.lockDigest }))
                return refuse("identity_mismatch", "release Product set/lock differs from current native environment");
            if (environment.productInstalls.some(i => [resources.effectGrant.snapshotRoot, resources.effectGrant.artifactOutputRoot, resources.effectGrant.sourceRoot].some(p => within(i.installedRoot, p))))
                return refuse("identity_mismatch", "release effects may not target an installed Product");
            const scope = releaseAuthorityScope(request, resources.proof, resources.selection, resources.effectGrant), truth = projectExactPrefixArtifactTruth(acquired.entryPrefix);
            const prior = projectEffectfulPublicInvocationTruthAtPrefix(acquired.entryPrefix, call.invocation.invocationRef);
            if (prior.disposition !== "available")
                return refuse("duplicate_invocation", "invocation must be fresh in valid native history");
            if (truth.kind !== "exact_prefix_artifact_truth_projection" || truth.rows.some(row => row.authorityScopeRef === scope.ref))
                return refuse("artifact_conflict", "release scope already has native truth or history is invalid");
            phase = "qualified_artifact_verification";
            const grant = resources.effectGrant, basis = request.qualificationBasis;
            const verified = await verifyProduct({ artifactPath: grant.artifact.path, artifactRef: grant.artifact.ref, expectedArtifactDigest: basis.artifact.digest,
                expectedProductContentDigest: basis.productContentDigest, expectedManifestDigest: basis.productManifest.digest, expectedProductId: basis.productId, expectedPackageName: grant.artifact.packageName, expectedPackageVersion: basis.productVersion });
            if (verified.kind !== "verified_product_artifact")
                return refuse("identity_mismatch", "qualified release archive failed existing Product verification");
            phase = "physical_publication";
            observation = await publishReleaseSnapshot(request, grant, qualification);
            if (observation.disposition === "refused")
                return deepFreeze({ ownerOutput: { outcomeKind: "refusal", value: releaseRefusal("published_rc", "publication_failure", observation.message, observation) }, resources: { kind: "release_publication_receipt", schemaVersion: "5.0.0", eventResource: closeAbgEventResource(acquired, acquired.entryPrefix), artifact: null, artifactPath: null, admissionEventRef: null } });
            const invocation = constructExactOperationInvocationCoordinate({ operationId: "abg.operation.release.snapshot", memberKey: "published_rc", definitionDigest: call.invocation.definitionDigest }, call.invocation.invocationRef, call.invocation.requestDigest);
            const value = { kind: "release_operation_observation", schemaVersion: "5.0.0", memberKey: "published_rc", scope, invocation: { ...invocation, operationId: "abg.operation.release.snapshot", memberKey: "published_rc" },
                entryPrefix: acquired.entryPrefix, admissionAuthority: approved, eventResource: resources.eventResource, grants: [...approved.grants], publicInvocation: call.invocation, resourceDigest: releaseHash(resources), actorRef: slots.actor.actor.ref,
                capabilityGrants: slots.capability_grants, workspaceBinding: binding, productSet: slots.product_set, dependencyLock: slots.dependency_lock, request,
                proof: resources.proof, selection: resources.selection, effectGrant: grant, observation };
            const committed = await commitReleaseArtifact(acquired, value, call.invocation.correlationRef, call.invocation.eventTime, environment.workspaceBinding.admissionEventRef, grant.artifactOutputRoot);
            ({ artifact, artifactPath, admissionEventRef } = committed);
            const eventResource = committed.eventResource;
            const ownerOutput = observation.disposition === "complete" ? { outcomeKind: "result", value: { kind: "release_snapshot_result", schemaVersion: "5.0.0", memberKey: "published_rc", disposition: "complete", identity: request.requestedIdentity, artifact, observation } } :
                { outcomeKind: "refusal", value: releaseRefusal("published_rc", "publication_failure", observation.message, observation, artifact) };
            return deepFreeze({ ownerOutput, resources: { kind: "release_publication_receipt", schemaVersion: "5.0.0", eventResource, artifact, artifactPath, admissionEventRef } });
        }
        catch (error) {
            if (acquired !== undefined) {
                try {
                    abandonAbgEventResource(acquired);
                }
                catch { /* Keep original failure and known/unknown effects. */ }
            }
            const fault = isDefinitionFault(error) ? error : definitionFault(call.invocation.definitionKey, phase, "release_publication_failure", String(error));
            throw { ...fault, evidence: { phase, observation, artifact, artifactPath, admissionEventRef, ...(isRecordEvidence(fault.evidence) ? fault.evidence : {}) } };
        }
    }, catch: error => error });
const authorizedOwner = call => withAdmissionAuthority(RELEASE_OPERATION_CONTRACTS.snapshot.published_rc, (authorized, _environment, resource) => bindExactPrefixTransition(RELEASE_OPERATION_CONTRACTS.snapshot.published_rc, admitted => owner(admitted, call.resources.admissionAuthority, resource), RELEASE_PUBLICATION_RESOURCE_SCHEMA, RELEASE_PUBLICATION_RECEIPT_SCHEMA)(authorized))(call);
const published_rc = authorizedOwner;
export const RELEASE_ACCEPTANCE_RESOURCE_SCHEMA = v.strictObject({ kind: v.literal("release_acceptance_resources"), schemaVersion: v.literal("5.0.0"),
    eventResource: v.custom(validateAbgEventResourceAssertion, "ABG event resource"),
    proof: QUALIFICATION_PROOF_RESOURCE_SCHEMA, selection: QUALIFICATION_SELECTION_SCHEMA, effectGrant: RELEASE_ACCEPTANCE_GRANT_SCHEMA,
    publication: PUBLISHED_RELEASE_OPERATION_ARTIFACT_SCHEMA, ruling: v.nullable(RELEASE_OWNER_RULING_SCHEMA) });
function isRecordEvidence(value) { return typeof value === "object" && value !== null && !Array.isArray(value); }
/** Both release members use the existing single artifact/receipt protocol. */
async function commitReleaseArtifact(acquired, value, correlationId, eventTime, causationEventRef, outputRoot) {
    const artifact = releaseArtifactCoordinate(value), artifactPath = join(outputRoot, artifact.digest.slice(7) + ".json");
    let phase = "artifact_write", admissionEventRef = null;
    try {
        await mkdir(outputRoot, { recursive: true });
        await writeFile(artifactPath, canonicalJson(value), { flag: "wx" });
        phase = "artifact_admission";
        const coordinate = constructExactOperationInvocationCoordinate({ operationId: "abg.operation.release.snapshot", memberKey: value.memberKey, definitionDigest: value.invocation.definitionDigest }, value.invocation.invocationRef, value.invocation.invocationPayloadDigest);
        const admitted = admitArtifact(acquired.store, { ...coordinate, operationId: "abg.operation.release.snapshot", authorityScopeRef: value.scope.ref, authorityScopeDigest: value.scope.digest,
            correlationId, eventTime, causationEventRefs: [causationEventRef], predecessorPrefix: acquired.entryPrefix }, "abg.operation.release.snapshot", artifact.ref, artifact.digest, { artifact: value });
        if (admitted.disposition !== "admitted" && admitted.disposition !== "idempotent")
            throw new TypeError(`release artifact admission refused: ${JSON.stringify(admitted)}`);
        admissionEventRef = admitted.admissionEventRef;
        phase = "resource_close";
        return { artifact, artifactPath, admissionEventRef, eventResource: closeAbgEventResource(acquired, admitted.successorPrefix) };
    }
    catch (error) {
        throw { ...definitionFault({ operationId: "abg.operation.release.snapshot", memberKey: value.memberKey }, phase, "release_artifact_failure", String(error)),
            evidence: { phase, observation: value.observation, artifact, artifactPath, admissionEventRef } };
    }
}
const tappedOwner = (call, approved, heldResource) => Effect.tryPromise({ try: async () => {
        let acquired, phase = "resource_acquisition", observation = null;
        try {
            const resources = call.resources, request = call.invocation.request, slots = call.invocation.invocationAuthority.slots, grant = resources.effectGrant;
            const opened = heldResource === null ? acquireAbgEventResource(resources.eventResource) : { kind: "acquired_abg_event_resource", resource: heldResource };
            if (opened.kind !== "acquired_abg_event_resource")
                throw definitionFault(call.invocation.definitionKey, phase, opened.code, opened.message);
            acquired = opened.resource;
            const refuse = (code, message) => deepFreeze({ ownerOutput: { outcomeKind: "refusal", value: releaseRefusal("tapped_release", code, message, observation) }, resources: { kind: "release_publication_receipt", schemaVersion: "5.0.0", eventResource: closeAbgEventResource(acquired, acquired.entryPrefix), artifact: null, artifactPath: null, admissionEventRef: null } });
            phase = "acceptance_join";
            const binding = slots.workspace_binding;
            if (binding === null)
                return refuse("identity_mismatch", "acceptance requires its current admitted workspace");
            const environment = projectExactPrefixWorkspaceEnvironment(acquired.entryPrefix, binding);
            if (environment.kind !== "exact_prefix_workspace_environment" || !sameJson(slots.product_set, environment.productInstalls.map(productInstallCoordinate)) ||
                !sameJson(slots.dependency_lock, { ref: environment.resolvedProductLock.lockId, digest: environment.resolvedProductLock.lockDigest }) ||
                environment.productInstalls.some(i => [grant.addendumRoot, grant.artifactOutputRoot].some(p => within(i.installedRoot, p))))
                return refuse("identity_mismatch", "acceptance environment or effect territory differs from admitted scope");
            const truth = projectExactPrefixArtifactTruth(acquired.entryPrefix), scope = releaseAcceptanceScope(request, resources.proof, resources.selection, grant);
            const prior = projectEffectfulPublicInvocationTruthAtPrefix(acquired.entryPrefix, call.invocation.invocationRef);
            if (prior.disposition !== "available")
                return refuse("duplicate_invocation", "invocation must be fresh in valid native history");
            if (truth.kind !== "exact_prefix_artifact_truth_projection" || truth.rows.some(r => r.authorityScopeRef === scope.ref))
                return refuse("artifact_conflict", "acceptance scope already has native truth or history is invalid");
            const joined = projectReleaseAcceptance(request, resources.proof, resources.selection, resources.publication, resources.ruling, grant, acquired.entryPrefix, truth.rows);
            if (joined === null)
                return refuse("acceptance_unavailable", "exact admitted publication, installed-RC green verdict and original attributable owner ruling/source are required");
            phase = "qualified_artifact_verification";
            const published = resources.publication, basis = request.qualificationBasis;
            const verified = await verifyProduct({ artifactPath: join(published.effectGrant.snapshotRoot, published.effectGrant.artifact.snapshotName), artifactRef: basis.artifact.ref,
                expectedArtifactDigest: basis.artifact.digest, expectedProductContentDigest: basis.productContentDigest,
                expectedManifestDigest: basis.productManifest.digest, expectedProductId: basis.productId, expectedPackageName: published.effectGrant.artifact.packageName, expectedPackageVersion: basis.productVersion });
            if (verified.kind !== "verified_product_artifact")
                return refuse("identity_mismatch", "same-RC archived Product failed existing verification");
            phase = "acceptance_effect";
            const physical = await recordReleaseAcceptance(request, published, resources.ruling, grant, joined.decision);
            observation = physical.observation;
            if (observation.disposition === "refused")
                return refuse("publication_failure", observation.message);
            const invocation = constructExactOperationInvocationCoordinate({ operationId: "abg.operation.release.snapshot", memberKey: "tapped_release", definitionDigest: call.invocation.definitionDigest }, call.invocation.invocationRef, call.invocation.requestDigest);
            const value = { kind: "release_operation_observation", schemaVersion: "5.0.0", memberKey: "tapped_release", scope,
                invocation: { ...invocation, operationId: "abg.operation.release.snapshot", memberKey: "tapped_release" }, entryPrefix: acquired.entryPrefix,
                admissionAuthority: approved, eventResource: resources.eventResource, grants: [...approved.grants],
                publicInvocation: call.invocation, resourceDigest: releaseHash(resources), actorRef: slots.actor.actor.ref, capabilityGrants: slots.capability_grants,
                workspaceBinding: binding, productSet: slots.product_set, dependencyLock: slots.dependency_lock, request, proof: resources.proof, selection: resources.selection, effectGrant: grant,
                publication: published, ruling: resources.ruling, decision: joined.decision, addendum: physical.addendum, observation };
            const committed = await commitReleaseArtifact(acquired, value, call.invocation.correlationRef, call.invocation.eventTime, environment.workspaceBinding.admissionEventRef, grant.artifactOutputRoot);
            const ownerOutput = observation.disposition === "complete" && joined.decision === "accept" && physical.addendum !== null
                ? { outcomeKind: "result", value: { kind: "release_snapshot_result", schemaVersion: "5.0.0", memberKey: "tapped_release", disposition: "complete", identity: request.requestedIdentity,
                        artifact: committed.artifact, observation, decision: "accept", publication: request.acceptedRc, acceptance: request.acceptance, addendum: physical.addendum } }
                : { outcomeKind: "refusal", value: releaseRefusal("tapped_release", joined.decision === "withhold" ? "acceptance_withheld" : "publication_failure", observation.message, observation, committed.artifact) };
            return deepFreeze({ ownerOutput, resources: { kind: "release_publication_receipt", schemaVersion: "5.0.0", ...committed } });
        }
        catch (error) {
            if (acquired !== undefined) {
                try {
                    abandonAbgEventResource(acquired);
                }
                catch { /* Retain original failure. */ }
            }
            const fault = isDefinitionFault(error) ? error : definitionFault(call.invocation.definitionKey, phase, "release_acceptance_failure", String(error));
            throw { ...fault, evidence: { phase, observation, ...(isRecordEvidence(fault.evidence) ? fault.evidence : {}) } };
        }
    }, catch: error => error });
const tapped_release = call => withAdmissionAuthority(RELEASE_OPERATION_CONTRACTS.snapshot.tapped_release, (authorized, _environment, resource) => bindExactPrefixTransition(RELEASE_OPERATION_CONTRACTS.snapshot.tapped_release, admitted => tappedOwner(admitted, call.resources.admissionAuthority, resource), RELEASE_ACCEPTANCE_RESOURCE_SCHEMA, RELEASE_PUBLICATION_RECEIPT_SCHEMA)(authorized))(call);
export const RELEASE_SNAPSHOT_DEFINITION_BINDINGS = Object.freeze({ snapshot: Object.freeze({ published_rc, tapped_release }) });
