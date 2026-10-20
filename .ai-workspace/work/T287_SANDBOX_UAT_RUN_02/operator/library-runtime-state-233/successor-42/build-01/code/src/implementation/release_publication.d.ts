import type { ReferenceDigest } from "../shared/public_invocation.js";
import { type JsonValue } from "../shared/canonical_json.js";
import { type ExactCandidateQualification } from "../validator/qualification_contracts.js";
import { type ReleaseOwnerRuling } from "../product/release_acceptance.js";
import { type PublishedRcSnapshotRequest, type ReleasePublicationGrant, type ReleasePhysicalObservation, type ReleaseOperationArtifact, type PublishedReleaseOperationArtifact, type TappedReleaseSnapshotRequest, type ReleaseAcceptanceGrant } from "../product/release_snapshot_operations.js";
import { type DurablePrefixCoordinate } from "../abg/event_store.js";
import { type QualificationProofResource, type QualificationEvidenceSelection } from "../validator/qualification_contracts.js";
/** Output-only field selection shared by the physical snapshot and its bounded
 * copy check. It does not authenticate or reevaluate qualification. */
export declare function releaseVerificationSnapshotFields(qualification: ExactCandidateQualification<"verdict">): {
    verificationFacts: {
        kind: "exact_candidate_qualification";
        projection: "verdict";
        schemaVersion: "5.0.0";
        subjectKind: "pre_rc_candidate" | "installed_rc";
        verdictRef: string;
        verdictDigest: string;
        subjectBasis: {
            ref: string;
            digest: string;
        };
        lawBasis: {
            ref: string;
            digest: string;
        };
        coverageCatalog: {
            ref: string;
            digest: string;
        };
        selfConformance: {
            subjectBasis: {
                ref: string;
                digest: string;
            };
            lawBasis: {
                ref: string;
                digest: string;
            };
            assessment: {
                ref: string;
                digest: string;
            };
            disposition: "blocked" | "green" | "red";
            bypassRefs: string[];
            verification?: {
                subjectBasis: {
                    ref: string;
                    digest: string;
                };
                lawBasis: {
                    ref: string;
                    digest: string;
                };
                recipe: {
                    ref: string;
                    digest: string;
                };
                executionSelectionRef: string;
                execution: {
                    ref: string;
                    digest: string;
                };
                cCall: {
                    ref: string;
                    digest: string;
                };
                observation: {
                    ref: string;
                    digest: string;
                };
                commandOutcomes: {
                    commandId: string;
                    role: "setup" | "build" | "lint" | "test" | "compare";
                    observation: {
                        ref: string;
                        digest: string;
                    };
                    executable: string;
                    args: string[];
                    relativeCwd: string;
                    environment: JsonValue;
                    timeoutMs: number;
                    terminationGraceMs: number;
                    exitStatus: number;
                    timedOut: boolean;
                    processSignal: string | null;
                    signalSequence: string[];
                    terminationConfirmed: boolean;
                    stdout: {
                        digest: string;
                        byteLength: number;
                    };
                    stderr: {
                        digest: string;
                        byteLength: number;
                    };
                    reports: JsonValue;
                }[];
                lintOutcome: JsonValue;
                predicateOutcomes: {
                    declaration: JsonValue;
                    observation: JsonValue;
                    disposition: "passed" | "failed" | "blocked_incomplete";
                    diagnostics: string[];
                }[];
                testSummaries: {
                    commandId: string;
                    streamDigest: string;
                    format: "node-test-events-jsonl@1";
                    disposition: "passed" | "failed" | "blocked_incomplete";
                    diagnostics: string[];
                    tests: number;
                    passed: number;
                    failed: number;
                    cancelled: number;
                    skipped: number;
                    todo: number;
                    suites: number;
                    files: string[];
                    cases: JsonValue[];
                    summaries: JsonValue[];
                    complete: boolean;
                }[];
                disposition: "passed" | "failed" | "blocked_incomplete";
                diagnostics: string[];
            } | null | undefined;
        };
        disposition: "blocked" | "green" | "red";
        bypassRefs: string[];
        slotRef: string;
        nativeBasis: {
            cCallRef: string;
            predecessorPrefix: {
                kind: "durable_prefix_coordinate";
                schemaVersion: "5.0.0";
                eventLogRef: string;
                prefixLength: number;
                prefixDigest: string;
                storeIdentity: {
                    device: number;
                    inode: number;
                    eventContractDigest: string;
                };
                coordinateDigest: string;
            };
        };
    };
    verificationMaterial: {
        subjectBasis: {
            ref: string;
            digest: string;
        };
        lawBasis: {
            ref: string;
            digest: string;
        };
        recipe: {
            ref: string;
            digest: string;
        };
        executionSelectionRef: string;
        execution: {
            ref: string;
            digest: string;
        };
        cCall: {
            ref: string;
            digest: string;
        };
        observation: {
            ref: string;
            digest: string;
        };
        commandOutcomes: {
            commandId: string;
            role: "setup" | "build" | "lint" | "test" | "compare";
            observation: {
                ref: string;
                digest: string;
            };
            executable: string;
            args: string[];
            relativeCwd: string;
            environment: JsonValue;
            timeoutMs: number;
            terminationGraceMs: number;
            exitStatus: number;
            timedOut: boolean;
            processSignal: string | null;
            signalSequence: string[];
            terminationConfirmed: boolean;
            stdout: {
                digest: string;
                byteLength: number;
            };
            stderr: {
                digest: string;
                byteLength: number;
            };
            reports: JsonValue;
        }[];
        lintOutcome: JsonValue;
        predicateOutcomes: {
            declaration: JsonValue;
            observation: JsonValue;
            disposition: "passed" | "failed" | "blocked_incomplete";
            diagnostics: string[];
        }[];
        testSummaries: {
            commandId: string;
            streamDigest: string;
            format: "node-test-events-jsonl@1";
            disposition: "passed" | "failed" | "blocked_incomplete";
            diagnostics: string[];
            tests: number;
            passed: number;
            failed: number;
            cancelled: number;
            skipped: number;
            todo: number;
            suites: number;
            files: string[];
            cases: JsonValue[];
            summaries: JsonValue[];
            complete: boolean;
        }[];
        disposition: "passed" | "failed" | "blocked_incomplete";
        diagnostics: string[];
    };
    assessmentCitation: {
        subjectBasis: {
            ref: string;
            digest: string;
        };
        lawBasis: {
            ref: string;
            digest: string;
        };
        assessment: {
            ref: string;
            digest: string;
        };
        disposition: "blocked" | "green" | "red";
        bypassRefs: string[];
        verification?: {
            subjectBasis: {
                ref: string;
                digest: string;
            };
            lawBasis: {
                ref: string;
                digest: string;
            };
            recipe: {
                ref: string;
                digest: string;
            };
            executionSelectionRef: string;
            execution: {
                ref: string;
                digest: string;
            };
            cCall: {
                ref: string;
                digest: string;
            };
            observation: {
                ref: string;
                digest: string;
            };
            commandOutcomes: {
                commandId: string;
                role: "setup" | "build" | "lint" | "test" | "compare";
                observation: {
                    ref: string;
                    digest: string;
                };
                executable: string;
                args: string[];
                relativeCwd: string;
                environment: JsonValue;
                timeoutMs: number;
                terminationGraceMs: number;
                exitStatus: number;
                timedOut: boolean;
                processSignal: string | null;
                signalSequence: string[];
                terminationConfirmed: boolean;
                stdout: {
                    digest: string;
                    byteLength: number;
                };
                stderr: {
                    digest: string;
                    byteLength: number;
                };
                reports: JsonValue;
            }[];
            lintOutcome: JsonValue;
            predicateOutcomes: {
                declaration: JsonValue;
                observation: JsonValue;
                disposition: "passed" | "failed" | "blocked_incomplete";
                diagnostics: string[];
            }[];
            testSummaries: {
                commandId: string;
                streamDigest: string;
                format: "node-test-events-jsonl@1";
                disposition: "passed" | "failed" | "blocked_incomplete";
                diagnostics: string[];
                tests: number;
                passed: number;
                failed: number;
                cancelled: number;
                skipped: number;
                todo: number;
                suites: number;
                files: string[];
                cases: JsonValue[];
                summaries: JsonValue[];
                complete: boolean;
            }[];
            disposition: "passed" | "failed" | "blocked_incomplete";
            diagnostics: string[];
        } | null | undefined;
    };
};
/** Physical owner only. Caller supplies an exact authorized, qualification-bound
 * selection. This function never evaluates gates, admits events or accepts an RC. */
export declare function publishReleaseSnapshot(request: PublishedRcSnapshotRequest, grant: ReleasePublicationGrant, qualification: ExactCandidateQualification<"verdict">): Promise<ReleasePhysicalObservation>;
/** One release-domain join. D5 alone authenticates/reduces native qualification. */
export declare function projectReleaseQualification(request: PublishedRcSnapshotRequest, proof: QualificationProofResource, selection: QualificationEvidenceSelection, current: DurablePrefixCoordinate, member?: "published_rc" | "tapped_release"): Readonly<{
    kind: "exact_candidate_qualification";
    projection: "verdict";
    schemaVersion: "5.0.0";
    subjectKind: "pre_rc_candidate" | "installed_rc";
    verdictRef: string;
    verdictDigest: string;
    subjectBasis: {
        ref: string;
        digest: string;
    };
    lawBasis: {
        ref: string;
        digest: string;
    };
    coverageCatalog: {
        ref: string;
        digest: string;
    };
    selfConformance: {
        subjectBasis: {
            ref: string;
            digest: string;
        };
        lawBasis: {
            ref: string;
            digest: string;
        };
        assessment: {
            ref: string;
            digest: string;
        };
        disposition: "blocked" | "green" | "red";
        bypassRefs: string[];
        verification?: {
            subjectBasis: {
                ref: string;
                digest: string;
            };
            lawBasis: {
                ref: string;
                digest: string;
            };
            recipe: {
                ref: string;
                digest: string;
            };
            executionSelectionRef: string;
            execution: {
                ref: string;
                digest: string;
            };
            cCall: {
                ref: string;
                digest: string;
            };
            observation: {
                ref: string;
                digest: string;
            };
            commandOutcomes: {
                commandId: string;
                role: "setup" | "build" | "lint" | "test" | "compare";
                observation: {
                    ref: string;
                    digest: string;
                };
                executable: string;
                args: string[];
                relativeCwd: string;
                environment: JsonValue;
                timeoutMs: number;
                terminationGraceMs: number;
                exitStatus: number;
                timedOut: boolean;
                processSignal: string | null;
                signalSequence: string[];
                terminationConfirmed: boolean;
                stdout: {
                    digest: string;
                    byteLength: number;
                };
                stderr: {
                    digest: string;
                    byteLength: number;
                };
                reports: JsonValue;
            }[];
            lintOutcome: JsonValue;
            predicateOutcomes: {
                declaration: JsonValue;
                observation: JsonValue;
                disposition: "passed" | "failed" | "blocked_incomplete";
                diagnostics: string[];
            }[];
            testSummaries: {
                commandId: string;
                streamDigest: string;
                format: "node-test-events-jsonl@1";
                disposition: "passed" | "failed" | "blocked_incomplete";
                diagnostics: string[];
                tests: number;
                passed: number;
                failed: number;
                cancelled: number;
                skipped: number;
                todo: number;
                suites: number;
                files: string[];
                cases: JsonValue[];
                summaries: JsonValue[];
                complete: boolean;
            }[];
            disposition: "passed" | "failed" | "blocked_incomplete";
            diagnostics: string[];
        } | null | undefined;
    };
    disposition: "blocked" | "green" | "red";
    bypassRefs: string[];
    slotRef: string;
    nativeBasis: {
        cCallRef: string;
        predecessorPrefix: {
            kind: "durable_prefix_coordinate";
            schemaVersion: "5.0.0";
            eventLogRef: string;
            prefixLength: number;
            prefixDigest: string;
            storeIdentity: {
                device: number;
                inode: number;
                eventContractDigest: string;
            };
            coordinateDigest: string;
        };
    };
}> | null;
/** Closed observation validity, not an assertion that publication is complete. */
export declare function isReleaseOperationArtifact(value: unknown): value is ReleaseOperationArtifact;
export declare function readReleaseArtifactBytes(path: string, coordinate: ReferenceDigest): ReleaseOperationArtifact | null;
/** The resource body is conserved once across live admission and historical reads. */
export declare function releaseArtifactResources(a: ReleaseOperationArtifact): {
    kind: string;
    schemaVersion: string;
    eventResource: JsonValue;
    proof: {
        kind: "qualification_proof_resource";
        schemaVersion: "5.0.0";
        prefix: {
            kind: "durable_prefix_coordinate";
            schemaVersion: "5.0.0";
            eventLogRef: string;
            prefixLength: number;
            prefixDigest: string;
            storeIdentity: {
                device: number;
                inode: number;
                eventContractDigest: string;
            };
            coordinateDigest: string;
        };
        declarations: import("../index.js").AbgHistoricalDeclarationProof[];
        selections: ({
            kind: "judgment_selection";
            selectionRef: string;
            slotRef: string;
            task: {
                ref: string;
                digest: string;
            };
            programRef: string;
            invocationAdmissionRef: string;
            result: {
                ref: string;
                digest: string;
            };
        } | {
            kind: "ruling_selection";
            selectionRef: string;
            slotRef: string;
            request: {
                ref: string;
                digest: string;
            };
            continuationRef: string;
        } | {
            kind: "execution_selection";
            selectionRef: string;
            slotRef: string;
            programRef: string;
            invocationAdmissionRef: string;
            result: {
                ref: string;
                digest: string;
            };
            source?: {
                sourceRef: string;
                cCall: {
                    ref: string;
                    digest: string;
                };
                executionBasis: {
                    ref: string;
                    digest: string;
                };
                graphFunction: {
                    ref: string;
                    digest: string;
                };
            } | undefined;
        } | {
            kind: "self_conformance_selection";
            selectionRef: string;
            slotRef: string;
            programRef: string;
            invocationAdmissionRef: string;
            result: {
                ref: string;
                digest: string;
            };
        } | {
            kind: "verdict_selection";
            selectionRef: string;
            slotRef: string;
            programRef: string;
            invocationAdmissionRef: string;
            result: {
                ref: string;
                digest: string;
            };
        })[];
        executionSources?: {
            sourceRef: string;
            basis: {
                kind: "exact_candidate_qualification";
                projection: "basis";
                schemaVersion: "5.0.0";
                subjectKind: "pre_rc_candidate" | "installed_rc";
                basisRef: string;
                basisDigest: string;
                productId: string;
                productVersion: string;
                sourceInventory: {
                    ref: string;
                    digest: string;
                };
                artifact: {
                    ref: string;
                    digest: string;
                };
                productManifest: {
                    ref: string;
                    digest: string;
                };
                productContentDigest: string;
                toolchain: {
                    ref: string;
                    digest: string;
                };
                installedProduct: {
                    ref: string;
                    digest: string;
                } | null;
                workspaceBinding: {
                    ref: string;
                    digest: string;
                } | null;
                prospectiveRelease: {
                    productId: string;
                    namespace: string;
                    profile: "one_project_unqualified";
                    projectSubtree: string;
                    versionLine: string;
                    ordinal: number;
                    version: string;
                    releaseClaim: {
                        ref: string;
                        digest: string;
                    };
                } | null;
                tenantManifest: {
                    ref: string;
                    digest: string;
                } | null;
                coverageCatalog: {
                    ref: string;
                    digest: string;
                } | null;
                lawBasis: {
                    ref: string;
                    digest: string;
                };
            };
            prefix: {
                kind: "durable_prefix_coordinate";
                schemaVersion: "5.0.0";
                eventLogRef: string;
                prefixLength: number;
                prefixDigest: string;
                storeIdentity: {
                    device: number;
                    inode: number;
                    eventContractDigest: string;
                };
                coordinateDigest: string;
            };
            declarations: import("../index.js").AbgHistoricalDeclarationProof[];
        }[] | undefined;
    } | {
        representation: "resource_refs_v1";
        resource: {
            ref: string;
            digest: string;
        };
        declarations: {
            catalogBasisDigest: string;
            readinessBasisDigest: string;
            viewDigest: string;
            proofDigest: string;
        }[];
        executionSources?: {
            sourceRef: string;
            basis: {
                kind: "exact_candidate_qualification";
                projection: "basis";
                schemaVersion: "5.0.0";
                subjectKind: "pre_rc_candidate" | "installed_rc";
                basisRef: string;
                basisDigest: string;
                productId: string;
                productVersion: string;
                sourceInventory: {
                    ref: string;
                    digest: string;
                };
                artifact: {
                    ref: string;
                    digest: string;
                };
                productManifest: {
                    ref: string;
                    digest: string;
                };
                productContentDigest: string;
                toolchain: {
                    ref: string;
                    digest: string;
                };
                installedProduct: {
                    ref: string;
                    digest: string;
                } | null;
                workspaceBinding: {
                    ref: string;
                    digest: string;
                } | null;
                prospectiveRelease: {
                    productId: string;
                    namespace: string;
                    profile: "one_project_unqualified";
                    projectSubtree: string;
                    versionLine: string;
                    ordinal: number;
                    version: string;
                    releaseClaim: {
                        ref: string;
                        digest: string;
                    };
                } | null;
                tenantManifest: {
                    ref: string;
                    digest: string;
                } | null;
                coverageCatalog: {
                    ref: string;
                    digest: string;
                } | null;
                lawBasis: {
                    ref: string;
                    digest: string;
                };
            };
            prefix: {
                kind: "durable_prefix_coordinate";
                schemaVersion: "5.0.0";
                eventLogRef: string;
                prefixLength: number;
                prefixDigest: string;
                storeIdentity: {
                    device: number;
                    inode: number;
                    eventContractDigest: string;
                };
                coordinateDigest: string;
            };
            declarations: {
                catalogBasisDigest: string;
                readinessBasisDigest: string;
                viewDigest: string;
                proofDigest: string;
            }[];
        }[] | undefined;
        kind: "qualification_proof_resource";
        schemaVersion: "5.0.0";
        prefix: {
            kind: "durable_prefix_coordinate";
            schemaVersion: "5.0.0";
            eventLogRef: string;
            prefixLength: number;
            prefixDigest: string;
            storeIdentity: {
                device: number;
                inode: number;
                eventContractDigest: string;
            };
            coordinateDigest: string;
        };
        selections: ({
            kind: "judgment_selection";
            selectionRef: string;
            slotRef: string;
            task: {
                ref: string;
                digest: string;
            };
            programRef: string;
            invocationAdmissionRef: string;
            result: {
                ref: string;
                digest: string;
            };
        } | {
            kind: "ruling_selection";
            selectionRef: string;
            slotRef: string;
            request: {
                ref: string;
                digest: string;
            };
            continuationRef: string;
        } | {
            kind: "execution_selection";
            selectionRef: string;
            slotRef: string;
            programRef: string;
            invocationAdmissionRef: string;
            result: {
                ref: string;
                digest: string;
            };
            source?: {
                sourceRef: string;
                cCall: {
                    ref: string;
                    digest: string;
                };
                executionBasis: {
                    ref: string;
                    digest: string;
                };
                graphFunction: {
                    ref: string;
                    digest: string;
                };
            } | undefined;
        } | {
            kind: "self_conformance_selection";
            selectionRef: string;
            slotRef: string;
            programRef: string;
            invocationAdmissionRef: string;
            result: {
                ref: string;
                digest: string;
            };
        } | {
            kind: "verdict_selection";
            selectionRef: string;
            slotRef: string;
            programRef: string;
            invocationAdmissionRef: string;
            result: {
                ref: string;
                digest: string;
            };
        })[];
    };
    selection: {
        kind: "judgment_selection";
        selectionRef: string;
        slotRef: string;
        task: {
            ref: string;
            digest: string;
        };
        programRef: string;
        invocationAdmissionRef: string;
        result: {
            ref: string;
            digest: string;
        };
    } | {
        kind: "ruling_selection";
        selectionRef: string;
        slotRef: string;
        request: {
            ref: string;
            digest: string;
        };
        continuationRef: string;
    } | {
        kind: "execution_selection";
        selectionRef: string;
        slotRef: string;
        programRef: string;
        invocationAdmissionRef: string;
        result: {
            ref: string;
            digest: string;
        };
        source?: {
            sourceRef: string;
            cCall: {
                ref: string;
                digest: string;
            };
            executionBasis: {
                ref: string;
                digest: string;
            };
            graphFunction: {
                ref: string;
                digest: string;
            };
        } | undefined;
    } | {
        kind: "self_conformance_selection";
        selectionRef: string;
        slotRef: string;
        programRef: string;
        invocationAdmissionRef: string;
        result: {
            ref: string;
            digest: string;
        };
    } | {
        kind: "verdict_selection";
        selectionRef: string;
        slotRef: string;
        programRef: string;
        invocationAdmissionRef: string;
        result: {
            ref: string;
            digest: string;
        };
    };
    effectGrant: {
        kind: "release_publication_grant";
        sourceRoot: string;
        sourceCommit: string;
        sourceTree: string;
        sourceInventory: {
            kind: "qualification_subject_inventory";
            inventoryRef: string;
            inventoryDigest: string;
            selectedRoots: string[];
            coverage: "complete_claim" | "incomplete";
            members: {
                surfaceRoles: ("code" | "proof" | "manifest" | "constitutional" | "design" | "execution_contract" | "public_contract" | "qualification" | "release_claim")[];
                classificationEvidenceRefs: string[];
                ref: string;
                path: string;
                digest: string;
                byteCount: number;
            }[];
        };
        artifact: {
            path: string;
            ref: string;
            digest: `sha256:${string}`;
            snapshotName: string;
            packageName: string;
        };
        manifestPath: string;
        releaseClaimPath: string;
        remote: string;
        pushMode: "atomic";
        expectedRemoteRefs: {
            ref: string;
            object: string;
        }[];
        expectedLocalRefs: {
            ref: string;
            object: string;
        }[];
        carrierRefs: {
            ref: string;
            expectedObject: string | null;
        }[];
        snapshotRoot: string;
        artifactOutputRoot: string;
        tagger: {
            name: string;
            email: string;
            date: string;
        };
        tagMessage: string;
        buildCommand: string;
        packCommand: string;
    };
    publication?: never;
    ruling?: never;
} | {
    kind: string;
    schemaVersion: string;
    eventResource: JsonValue;
    proof: {
        kind: "qualification_proof_resource";
        schemaVersion: "5.0.0";
        prefix: {
            kind: "durable_prefix_coordinate";
            schemaVersion: "5.0.0";
            eventLogRef: string;
            prefixLength: number;
            prefixDigest: string;
            storeIdentity: {
                device: number;
                inode: number;
                eventContractDigest: string;
            };
            coordinateDigest: string;
        };
        declarations: import("../index.js").AbgHistoricalDeclarationProof[];
        selections: ({
            kind: "judgment_selection";
            selectionRef: string;
            slotRef: string;
            task: {
                ref: string;
                digest: string;
            };
            programRef: string;
            invocationAdmissionRef: string;
            result: {
                ref: string;
                digest: string;
            };
        } | {
            kind: "ruling_selection";
            selectionRef: string;
            slotRef: string;
            request: {
                ref: string;
                digest: string;
            };
            continuationRef: string;
        } | {
            kind: "execution_selection";
            selectionRef: string;
            slotRef: string;
            programRef: string;
            invocationAdmissionRef: string;
            result: {
                ref: string;
                digest: string;
            };
            source?: {
                sourceRef: string;
                cCall: {
                    ref: string;
                    digest: string;
                };
                executionBasis: {
                    ref: string;
                    digest: string;
                };
                graphFunction: {
                    ref: string;
                    digest: string;
                };
            } | undefined;
        } | {
            kind: "self_conformance_selection";
            selectionRef: string;
            slotRef: string;
            programRef: string;
            invocationAdmissionRef: string;
            result: {
                ref: string;
                digest: string;
            };
        } | {
            kind: "verdict_selection";
            selectionRef: string;
            slotRef: string;
            programRef: string;
            invocationAdmissionRef: string;
            result: {
                ref: string;
                digest: string;
            };
        })[];
        executionSources?: {
            sourceRef: string;
            basis: {
                kind: "exact_candidate_qualification";
                projection: "basis";
                schemaVersion: "5.0.0";
                subjectKind: "pre_rc_candidate" | "installed_rc";
                basisRef: string;
                basisDigest: string;
                productId: string;
                productVersion: string;
                sourceInventory: {
                    ref: string;
                    digest: string;
                };
                artifact: {
                    ref: string;
                    digest: string;
                };
                productManifest: {
                    ref: string;
                    digest: string;
                };
                productContentDigest: string;
                toolchain: {
                    ref: string;
                    digest: string;
                };
                installedProduct: {
                    ref: string;
                    digest: string;
                } | null;
                workspaceBinding: {
                    ref: string;
                    digest: string;
                } | null;
                prospectiveRelease: {
                    productId: string;
                    namespace: string;
                    profile: "one_project_unqualified";
                    projectSubtree: string;
                    versionLine: string;
                    ordinal: number;
                    version: string;
                    releaseClaim: {
                        ref: string;
                        digest: string;
                    };
                } | null;
                tenantManifest: {
                    ref: string;
                    digest: string;
                } | null;
                coverageCatalog: {
                    ref: string;
                    digest: string;
                } | null;
                lawBasis: {
                    ref: string;
                    digest: string;
                };
            };
            prefix: {
                kind: "durable_prefix_coordinate";
                schemaVersion: "5.0.0";
                eventLogRef: string;
                prefixLength: number;
                prefixDigest: string;
                storeIdentity: {
                    device: number;
                    inode: number;
                    eventContractDigest: string;
                };
                coordinateDigest: string;
            };
            declarations: import("../index.js").AbgHistoricalDeclarationProof[];
        }[] | undefined;
    } | {
        representation: "resource_refs_v1";
        resource: {
            ref: string;
            digest: string;
        };
        declarations: {
            catalogBasisDigest: string;
            readinessBasisDigest: string;
            viewDigest: string;
            proofDigest: string;
        }[];
        executionSources?: {
            sourceRef: string;
            basis: {
                kind: "exact_candidate_qualification";
                projection: "basis";
                schemaVersion: "5.0.0";
                subjectKind: "pre_rc_candidate" | "installed_rc";
                basisRef: string;
                basisDigest: string;
                productId: string;
                productVersion: string;
                sourceInventory: {
                    ref: string;
                    digest: string;
                };
                artifact: {
                    ref: string;
                    digest: string;
                };
                productManifest: {
                    ref: string;
                    digest: string;
                };
                productContentDigest: string;
                toolchain: {
                    ref: string;
                    digest: string;
                };
                installedProduct: {
                    ref: string;
                    digest: string;
                } | null;
                workspaceBinding: {
                    ref: string;
                    digest: string;
                } | null;
                prospectiveRelease: {
                    productId: string;
                    namespace: string;
                    profile: "one_project_unqualified";
                    projectSubtree: string;
                    versionLine: string;
                    ordinal: number;
                    version: string;
                    releaseClaim: {
                        ref: string;
                        digest: string;
                    };
                } | null;
                tenantManifest: {
                    ref: string;
                    digest: string;
                } | null;
                coverageCatalog: {
                    ref: string;
                    digest: string;
                } | null;
                lawBasis: {
                    ref: string;
                    digest: string;
                };
            };
            prefix: {
                kind: "durable_prefix_coordinate";
                schemaVersion: "5.0.0";
                eventLogRef: string;
                prefixLength: number;
                prefixDigest: string;
                storeIdentity: {
                    device: number;
                    inode: number;
                    eventContractDigest: string;
                };
                coordinateDigest: string;
            };
            declarations: {
                catalogBasisDigest: string;
                readinessBasisDigest: string;
                viewDigest: string;
                proofDigest: string;
            }[];
        }[] | undefined;
        kind: "qualification_proof_resource";
        schemaVersion: "5.0.0";
        prefix: {
            kind: "durable_prefix_coordinate";
            schemaVersion: "5.0.0";
            eventLogRef: string;
            prefixLength: number;
            prefixDigest: string;
            storeIdentity: {
                device: number;
                inode: number;
                eventContractDigest: string;
            };
            coordinateDigest: string;
        };
        selections: ({
            kind: "judgment_selection";
            selectionRef: string;
            slotRef: string;
            task: {
                ref: string;
                digest: string;
            };
            programRef: string;
            invocationAdmissionRef: string;
            result: {
                ref: string;
                digest: string;
            };
        } | {
            kind: "ruling_selection";
            selectionRef: string;
            slotRef: string;
            request: {
                ref: string;
                digest: string;
            };
            continuationRef: string;
        } | {
            kind: "execution_selection";
            selectionRef: string;
            slotRef: string;
            programRef: string;
            invocationAdmissionRef: string;
            result: {
                ref: string;
                digest: string;
            };
            source?: {
                sourceRef: string;
                cCall: {
                    ref: string;
                    digest: string;
                };
                executionBasis: {
                    ref: string;
                    digest: string;
                };
                graphFunction: {
                    ref: string;
                    digest: string;
                };
            } | undefined;
        } | {
            kind: "self_conformance_selection";
            selectionRef: string;
            slotRef: string;
            programRef: string;
            invocationAdmissionRef: string;
            result: {
                ref: string;
                digest: string;
            };
        } | {
            kind: "verdict_selection";
            selectionRef: string;
            slotRef: string;
            programRef: string;
            invocationAdmissionRef: string;
            result: {
                ref: string;
                digest: string;
            };
        })[];
    };
    selection: {
        kind: "judgment_selection";
        selectionRef: string;
        slotRef: string;
        task: {
            ref: string;
            digest: string;
        };
        programRef: string;
        invocationAdmissionRef: string;
        result: {
            ref: string;
            digest: string;
        };
    } | {
        kind: "ruling_selection";
        selectionRef: string;
        slotRef: string;
        request: {
            ref: string;
            digest: string;
        };
        continuationRef: string;
    } | {
        kind: "execution_selection";
        selectionRef: string;
        slotRef: string;
        programRef: string;
        invocationAdmissionRef: string;
        result: {
            ref: string;
            digest: string;
        };
        source?: {
            sourceRef: string;
            cCall: {
                ref: string;
                digest: string;
            };
            executionBasis: {
                ref: string;
                digest: string;
            };
            graphFunction: {
                ref: string;
                digest: string;
            };
        } | undefined;
    } | {
        kind: "self_conformance_selection";
        selectionRef: string;
        slotRef: string;
        programRef: string;
        invocationAdmissionRef: string;
        result: {
            ref: string;
            digest: string;
        };
    } | {
        kind: "verdict_selection";
        selectionRef: string;
        slotRef: string;
        programRef: string;
        invocationAdmissionRef: string;
        result: {
            ref: string;
            digest: string;
        };
    };
    effectGrant: {
        kind: "release_acceptance_grant";
        humanAuthority: {
            ref: string;
            digest: `sha256:${string}`;
        };
        sourceAuthority: {
            ref: string;
            digest: `sha256:${string}`;
        };
        sourceApproval: {
            kind: "trusted_operator_ruling_source";
            schemaVersion: "5.0.0";
            authority: {
                ref: string;
                digest: `sha256:${string}`;
            };
            owner: {
                ref: string;
                digest: `sha256:${string}`;
            };
            channel: {
                ref: string;
                digest: `sha256:${string}`;
            };
            request: {
                ref: string;
                digest: `sha256:${string}`;
            };
            ruling: {
                ref: string;
                digest: `sha256:${string}`;
            };
            presentation: {
                ref: string;
                digest: `sha256:${string}`;
            };
            response: {
                ref: string;
                digest: `sha256:${string}`;
            };
        } | null;
        requiredEvidence: {
            ref: string;
            digest: `sha256:${string}`;
        }[];
        addendumRoot: string;
        artifactOutputRoot: string;
    };
    publication: {
        kind: "release_operation_observation";
        schemaVersion: "5.0.0";
        memberKey: "published_rc";
        scope: {
            ref: string;
            digest: `sha256:${string}`;
        };
        invocation: {
            operationId: "abg.operation.release.snapshot";
            memberKey: "published_rc";
            definitionDigest: `sha256:${string}`;
            invocationRef: string;
            invocationPayloadDigest: `sha256:${string}`;
            invocationDigest: `sha256:${string}`;
        };
        entryPrefix: {
            kind: "durable_prefix_coordinate";
            schemaVersion: "5.0.0";
            eventLogRef: string;
            prefixLength: number;
            prefixDigest: string;
            storeIdentity: {
                device: number;
                inode: number;
                eventContractDigest: string;
            };
            coordinateDigest: string;
        };
        grants: JsonValue[];
        admissionAuthority: JsonValue;
        eventResource: JsonValue;
        publicInvocation: JsonValue;
        resourceDigest: `sha256:${string}`;
        actorRef: string;
        capabilityGrants: JsonValue;
        workspaceBinding: {
            ref: string;
            digest: `sha256:${string}`;
        };
        productSet: JsonValue;
        dependencyLock: {
            ref: string;
            digest: `sha256:${string}`;
        };
        request: {
            qualificationBasis: {
                kind: "exact_candidate_qualification";
                projection: "basis";
                schemaVersion: "5.0.0";
                subjectKind: "pre_rc_candidate" | "installed_rc";
                basisRef: string;
                basisDigest: string;
                productId: string;
                productVersion: string;
                sourceInventory: {
                    ref: string;
                    digest: string;
                };
                artifact: {
                    ref: string;
                    digest: string;
                };
                productManifest: {
                    ref: string;
                    digest: string;
                };
                productContentDigest: string;
                toolchain: {
                    ref: string;
                    digest: string;
                };
                installedProduct: {
                    ref: string;
                    digest: string;
                } | null;
                workspaceBinding: {
                    ref: string;
                    digest: string;
                } | null;
                prospectiveRelease: {
                    productId: string;
                    namespace: string;
                    profile: "one_project_unqualified";
                    projectSubtree: string;
                    versionLine: string;
                    ordinal: number;
                    version: string;
                    releaseClaim: {
                        ref: string;
                        digest: string;
                    };
                } | null;
                tenantManifest: {
                    ref: string;
                    digest: string;
                } | null;
                coverageCatalog: {
                    ref: string;
                    digest: string;
                } | null;
                lawBasis: {
                    ref: string;
                    digest: string;
                };
            };
            lawBasis: {
                ref: string;
                digest: `sha256:${string}`;
            };
            verdict: {
                ref: string;
                digest: `sha256:${string}`;
            };
            requestedIdentity: {
                productId: string;
                namespace: "abiogenesis";
                profile: "one_project_unqualified";
                projectSubtree: ".";
                versionLine: "5.0.0";
                ordinal: number;
                version: string;
                releaseClaim: {
                    ref: string;
                    digest: `sha256:${string}`;
                };
            };
        };
        proof: {
            kind: "qualification_proof_resource";
            schemaVersion: "5.0.0";
            prefix: {
                kind: "durable_prefix_coordinate";
                schemaVersion: "5.0.0";
                eventLogRef: string;
                prefixLength: number;
                prefixDigest: string;
                storeIdentity: {
                    device: number;
                    inode: number;
                    eventContractDigest: string;
                };
                coordinateDigest: string;
            };
            declarations: import("../index.js").AbgHistoricalDeclarationProof[];
            selections: ({
                kind: "judgment_selection";
                selectionRef: string;
                slotRef: string;
                task: {
                    ref: string;
                    digest: string;
                };
                programRef: string;
                invocationAdmissionRef: string;
                result: {
                    ref: string;
                    digest: string;
                };
            } | {
                kind: "ruling_selection";
                selectionRef: string;
                slotRef: string;
                request: {
                    ref: string;
                    digest: string;
                };
                continuationRef: string;
            } | {
                kind: "execution_selection";
                selectionRef: string;
                slotRef: string;
                programRef: string;
                invocationAdmissionRef: string;
                result: {
                    ref: string;
                    digest: string;
                };
                source?: {
                    sourceRef: string;
                    cCall: {
                        ref: string;
                        digest: string;
                    };
                    executionBasis: {
                        ref: string;
                        digest: string;
                    };
                    graphFunction: {
                        ref: string;
                        digest: string;
                    };
                } | undefined;
            } | {
                kind: "self_conformance_selection";
                selectionRef: string;
                slotRef: string;
                programRef: string;
                invocationAdmissionRef: string;
                result: {
                    ref: string;
                    digest: string;
                };
            } | {
                kind: "verdict_selection";
                selectionRef: string;
                slotRef: string;
                programRef: string;
                invocationAdmissionRef: string;
                result: {
                    ref: string;
                    digest: string;
                };
            })[];
            executionSources?: {
                sourceRef: string;
                basis: {
                    kind: "exact_candidate_qualification";
                    projection: "basis";
                    schemaVersion: "5.0.0";
                    subjectKind: "pre_rc_candidate" | "installed_rc";
                    basisRef: string;
                    basisDigest: string;
                    productId: string;
                    productVersion: string;
                    sourceInventory: {
                        ref: string;
                        digest: string;
                    };
                    artifact: {
                        ref: string;
                        digest: string;
                    };
                    productManifest: {
                        ref: string;
                        digest: string;
                    };
                    productContentDigest: string;
                    toolchain: {
                        ref: string;
                        digest: string;
                    };
                    installedProduct: {
                        ref: string;
                        digest: string;
                    } | null;
                    workspaceBinding: {
                        ref: string;
                        digest: string;
                    } | null;
                    prospectiveRelease: {
                        productId: string;
                        namespace: string;
                        profile: "one_project_unqualified";
                        projectSubtree: string;
                        versionLine: string;
                        ordinal: number;
                        version: string;
                        releaseClaim: {
                            ref: string;
                            digest: string;
                        };
                    } | null;
                    tenantManifest: {
                        ref: string;
                        digest: string;
                    } | null;
                    coverageCatalog: {
                        ref: string;
                        digest: string;
                    } | null;
                    lawBasis: {
                        ref: string;
                        digest: string;
                    };
                };
                prefix: {
                    kind: "durable_prefix_coordinate";
                    schemaVersion: "5.0.0";
                    eventLogRef: string;
                    prefixLength: number;
                    prefixDigest: string;
                    storeIdentity: {
                        device: number;
                        inode: number;
                        eventContractDigest: string;
                    };
                    coordinateDigest: string;
                };
                declarations: import("../index.js").AbgHistoricalDeclarationProof[];
            }[] | undefined;
        } | {
            representation: "resource_refs_v1";
            resource: {
                ref: string;
                digest: string;
            };
            declarations: {
                catalogBasisDigest: string;
                readinessBasisDigest: string;
                viewDigest: string;
                proofDigest: string;
            }[];
            executionSources?: {
                sourceRef: string;
                basis: {
                    kind: "exact_candidate_qualification";
                    projection: "basis";
                    schemaVersion: "5.0.0";
                    subjectKind: "pre_rc_candidate" | "installed_rc";
                    basisRef: string;
                    basisDigest: string;
                    productId: string;
                    productVersion: string;
                    sourceInventory: {
                        ref: string;
                        digest: string;
                    };
                    artifact: {
                        ref: string;
                        digest: string;
                    };
                    productManifest: {
                        ref: string;
                        digest: string;
                    };
                    productContentDigest: string;
                    toolchain: {
                        ref: string;
                        digest: string;
                    };
                    installedProduct: {
                        ref: string;
                        digest: string;
                    } | null;
                    workspaceBinding: {
                        ref: string;
                        digest: string;
                    } | null;
                    prospectiveRelease: {
                        productId: string;
                        namespace: string;
                        profile: "one_project_unqualified";
                        projectSubtree: string;
                        versionLine: string;
                        ordinal: number;
                        version: string;
                        releaseClaim: {
                            ref: string;
                            digest: string;
                        };
                    } | null;
                    tenantManifest: {
                        ref: string;
                        digest: string;
                    } | null;
                    coverageCatalog: {
                        ref: string;
                        digest: string;
                    } | null;
                    lawBasis: {
                        ref: string;
                        digest: string;
                    };
                };
                prefix: {
                    kind: "durable_prefix_coordinate";
                    schemaVersion: "5.0.0";
                    eventLogRef: string;
                    prefixLength: number;
                    prefixDigest: string;
                    storeIdentity: {
                        device: number;
                        inode: number;
                        eventContractDigest: string;
                    };
                    coordinateDigest: string;
                };
                declarations: {
                    catalogBasisDigest: string;
                    readinessBasisDigest: string;
                    viewDigest: string;
                    proofDigest: string;
                }[];
            }[] | undefined;
            kind: "qualification_proof_resource";
            schemaVersion: "5.0.0";
            prefix: {
                kind: "durable_prefix_coordinate";
                schemaVersion: "5.0.0";
                eventLogRef: string;
                prefixLength: number;
                prefixDigest: string;
                storeIdentity: {
                    device: number;
                    inode: number;
                    eventContractDigest: string;
                };
                coordinateDigest: string;
            };
            selections: ({
                kind: "judgment_selection";
                selectionRef: string;
                slotRef: string;
                task: {
                    ref: string;
                    digest: string;
                };
                programRef: string;
                invocationAdmissionRef: string;
                result: {
                    ref: string;
                    digest: string;
                };
            } | {
                kind: "ruling_selection";
                selectionRef: string;
                slotRef: string;
                request: {
                    ref: string;
                    digest: string;
                };
                continuationRef: string;
            } | {
                kind: "execution_selection";
                selectionRef: string;
                slotRef: string;
                programRef: string;
                invocationAdmissionRef: string;
                result: {
                    ref: string;
                    digest: string;
                };
                source?: {
                    sourceRef: string;
                    cCall: {
                        ref: string;
                        digest: string;
                    };
                    executionBasis: {
                        ref: string;
                        digest: string;
                    };
                    graphFunction: {
                        ref: string;
                        digest: string;
                    };
                } | undefined;
            } | {
                kind: "self_conformance_selection";
                selectionRef: string;
                slotRef: string;
                programRef: string;
                invocationAdmissionRef: string;
                result: {
                    ref: string;
                    digest: string;
                };
            } | {
                kind: "verdict_selection";
                selectionRef: string;
                slotRef: string;
                programRef: string;
                invocationAdmissionRef: string;
                result: {
                    ref: string;
                    digest: string;
                };
            })[];
        };
        selection: {
            kind: "judgment_selection";
            selectionRef: string;
            slotRef: string;
            task: {
                ref: string;
                digest: string;
            };
            programRef: string;
            invocationAdmissionRef: string;
            result: {
                ref: string;
                digest: string;
            };
        } | {
            kind: "ruling_selection";
            selectionRef: string;
            slotRef: string;
            request: {
                ref: string;
                digest: string;
            };
            continuationRef: string;
        } | {
            kind: "execution_selection";
            selectionRef: string;
            slotRef: string;
            programRef: string;
            invocationAdmissionRef: string;
            result: {
                ref: string;
                digest: string;
            };
            source?: {
                sourceRef: string;
                cCall: {
                    ref: string;
                    digest: string;
                };
                executionBasis: {
                    ref: string;
                    digest: string;
                };
                graphFunction: {
                    ref: string;
                    digest: string;
                };
            } | undefined;
        } | {
            kind: "self_conformance_selection";
            selectionRef: string;
            slotRef: string;
            programRef: string;
            invocationAdmissionRef: string;
            result: {
                ref: string;
                digest: string;
            };
        } | {
            kind: "verdict_selection";
            selectionRef: string;
            slotRef: string;
            programRef: string;
            invocationAdmissionRef: string;
            result: {
                ref: string;
                digest: string;
            };
        };
        effectGrant: {
            kind: "release_publication_grant";
            sourceRoot: string;
            sourceCommit: string;
            sourceTree: string;
            sourceInventory: {
                kind: "qualification_subject_inventory";
                inventoryRef: string;
                inventoryDigest: string;
                selectedRoots: string[];
                coverage: "complete_claim" | "incomplete";
                members: {
                    surfaceRoles: ("code" | "proof" | "manifest" | "constitutional" | "design" | "execution_contract" | "public_contract" | "qualification" | "release_claim")[];
                    classificationEvidenceRefs: string[];
                    ref: string;
                    path: string;
                    digest: string;
                    byteCount: number;
                }[];
            };
            artifact: {
                path: string;
                ref: string;
                digest: `sha256:${string}`;
                snapshotName: string;
                packageName: string;
            };
            manifestPath: string;
            releaseClaimPath: string;
            remote: string;
            pushMode: "atomic";
            expectedRemoteRefs: {
                ref: string;
                object: string;
            }[];
            expectedLocalRefs: {
                ref: string;
                object: string;
            }[];
            carrierRefs: {
                ref: string;
                expectedObject: string | null;
            }[];
            snapshotRoot: string;
            artifactOutputRoot: string;
            tagger: {
                name: string;
                email: string;
                date: string;
            };
            tagMessage: string;
            buildCommand: string;
            packCommand: string;
        };
        observation: {
            disposition: "refused" | "complete" | "incomplete_effect";
            phase: string;
            message: string;
            effects: {
                kind: string;
                ref: string;
                digest: string | null;
            }[];
            unknownEffects: string[];
            sourceCommit: string | null;
            sourceTree: string | null;
            refs: {
                ref: string;
                object: string;
                peeled: string;
            }[];
            snapshotManifest: {
                ref: string;
                digest: `sha256:${string}`;
            } | null;
            snapshotFiles: {
                path: string;
                digest: `sha256:${string}`;
            }[];
        };
    };
    ruling: {
        kind: "external_release_owner_ruling";
        schemaVersion: "5.0.0";
        owner: {
            ref: string;
            digest: `sha256:${string}`;
        };
        channel: {
            ref: string;
            digest: `sha256:${string}`;
        };
        request: {
            ref: string;
            digest: `sha256:${string}`;
        };
        presentation: {
            ref: string;
            digest: `sha256:${string}`;
            byteCount: number;
            contentBase64: string;
        };
        response: {
            ref: string;
            digest: `sha256:${string}`;
            byteCount: number;
            contentBase64: string;
        };
        inReplyTo: string;
    } | null;
};
export declare function releaseRulingDecision(request: TappedReleaseSnapshotRequest, publication: PublishedReleaseOperationArtifact, ruling: ReleaseOwnerRuling | null, grant: ReleaseAcceptanceGrant): "accept" | "withhold" | null;
export interface ReleaseArtifactPremise {
    readonly operationId: string;
    readonly memberKey: string;
    readonly artifactRef: string;
    readonly artifactDigest: string;
    readonly artifact: JsonValue;
}
/** Existing native artifact owner supplies ordered admitted rows. No extra
 * prefix/history interpreter and no claimed publication packet supplies truth. */
export declare function releaseAcceptancePublicationMatches(request: TappedReleaseSnapshotRequest, publication: PublishedReleaseOperationArtifact, rows: readonly ReleaseArtifactPremise[]): boolean;
export declare function projectReleaseAcceptance(request: TappedReleaseSnapshotRequest, proof: QualificationProofResource, selection: QualificationEvidenceSelection, publication: PublishedReleaseOperationArtifact, ruling: ReleaseOwnerRuling | null, grant: ReleaseAcceptanceGrant, current: DurablePrefixCoordinate, rows: readonly ReleaseArtifactPremise[]): {
    qualification: Readonly<{
        kind: "exact_candidate_qualification";
        projection: "verdict";
        schemaVersion: "5.0.0";
        subjectKind: "pre_rc_candidate" | "installed_rc";
        verdictRef: string;
        verdictDigest: string;
        subjectBasis: {
            ref: string;
            digest: string;
        };
        lawBasis: {
            ref: string;
            digest: string;
        };
        coverageCatalog: {
            ref: string;
            digest: string;
        };
        selfConformance: {
            subjectBasis: {
                ref: string;
                digest: string;
            };
            lawBasis: {
                ref: string;
                digest: string;
            };
            assessment: {
                ref: string;
                digest: string;
            };
            disposition: "blocked" | "green" | "red";
            bypassRefs: string[];
            verification?: {
                subjectBasis: {
                    ref: string;
                    digest: string;
                };
                lawBasis: {
                    ref: string;
                    digest: string;
                };
                recipe: {
                    ref: string;
                    digest: string;
                };
                executionSelectionRef: string;
                execution: {
                    ref: string;
                    digest: string;
                };
                cCall: {
                    ref: string;
                    digest: string;
                };
                observation: {
                    ref: string;
                    digest: string;
                };
                commandOutcomes: {
                    commandId: string;
                    role: "setup" | "build" | "lint" | "test" | "compare";
                    observation: {
                        ref: string;
                        digest: string;
                    };
                    executable: string;
                    args: string[];
                    relativeCwd: string;
                    environment: JsonValue;
                    timeoutMs: number;
                    terminationGraceMs: number;
                    exitStatus: number;
                    timedOut: boolean;
                    processSignal: string | null;
                    signalSequence: string[];
                    terminationConfirmed: boolean;
                    stdout: {
                        digest: string;
                        byteLength: number;
                    };
                    stderr: {
                        digest: string;
                        byteLength: number;
                    };
                    reports: JsonValue;
                }[];
                lintOutcome: JsonValue;
                predicateOutcomes: {
                    declaration: JsonValue;
                    observation: JsonValue;
                    disposition: "passed" | "failed" | "blocked_incomplete";
                    diagnostics: string[];
                }[];
                testSummaries: {
                    commandId: string;
                    streamDigest: string;
                    format: "node-test-events-jsonl@1";
                    disposition: "passed" | "failed" | "blocked_incomplete";
                    diagnostics: string[];
                    tests: number;
                    passed: number;
                    failed: number;
                    cancelled: number;
                    skipped: number;
                    todo: number;
                    suites: number;
                    files: string[];
                    cases: JsonValue[];
                    summaries: JsonValue[];
                    complete: boolean;
                }[];
                disposition: "passed" | "failed" | "blocked_incomplete";
                diagnostics: string[];
            } | null | undefined;
        };
        disposition: "blocked" | "green" | "red";
        bypassRefs: string[];
        slotRef: string;
        nativeBasis: {
            cCallRef: string;
            predecessorPrefix: {
                kind: "durable_prefix_coordinate";
                schemaVersion: "5.0.0";
                eventLogRef: string;
                prefixLength: number;
                prefixDigest: string;
                storeIdentity: {
                    device: number;
                    inode: number;
                    eventContractDigest: string;
                };
                coordinateDigest: string;
            };
        };
    }>;
    decision: "accept" | "withhold";
} | null;
/** Physical consequence only. The binding supplies authenticated publication,
 * installed qualification and original O/source; this leaf cannot mint them. */
export declare function recordReleaseAcceptance(request: TappedReleaseSnapshotRequest, publication: PublishedReleaseOperationArtifact, ruling: ReleaseOwnerRuling, grant: ReleaseAcceptanceGrant, decision: "accept" | "withhold"): Promise<{
    observation: ReleasePhysicalObservation;
    addendum: ReferenceDigest | null;
}>;
