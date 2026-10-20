import { type AbgEventResourceInput, type AbgEventResourceOutcome } from "../abg/definition_event_resource.js";
import type { ReferenceDigest } from "../shared/public_invocation.js";
import type { ProductVerificationArtifactResource, VerifiedProductArtifact } from "./contracts.js";
import { type ResolvedProductLock } from "./environment.js";
export interface ProductInstallResourceAssertion {
    readonly kind: "product_install_resource_assertion";
    readonly schemaVersion: "5.0.0";
    readonly eventResource: AbgEventResourceInput;
    readonly packedArtifact: ProductVerificationArtifactResource;
    readonly verifiedArtifact: VerifiedProductArtifact;
    readonly resolvedLock: ResolvedProductLock;
}
export interface ProductInstallResourceReceipt {
    readonly kind: "product_install_resource_receipt";
    readonly schemaVersion: "5.0.0";
    readonly eventResource: AbgEventResourceOutcome;
    readonly packedArtifact: ReferenceDigest<"PackedProductArtifact">;
    readonly resolvedLock: ReferenceDigest<"ResolvedProductLock">;
    readonly targetRoot: string;
    readonly installCandidate: ReferenceDigest<"ProductInstallCandidate"> | null;
    readonly installedProduct: ReferenceDigest<"InstalledProduct"> | null;
    readonly installManifest: ReferenceDigest<"InstallManifest"> | null;
    readonly installerManifest: ReferenceDigest<"InstallerManifest"> | null;
}
export declare const PRODUCT_INSTALL_DEFINITION_BINDINGS: Readonly<{
    install: import("../shared/effect_definition.js").ExactDefinitionCallable<import("../shared/public_function_contracts.js").OwnerContractSourceDeclaration<{
        readonly operationId: "abg.operation.product.install";
        readonly memberKey: "install";
    }, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
        verifiedArtifact: {
            ref: string;
            digest: `sha256:${string}`;
        };
        descriptor: {
            ref: string;
            digest: `sha256:${string}`;
        };
        contributionManifest: {
            ref: string;
            digest: `sha256:${string}`;
        };
        resolvedLock: {
            ref: string;
            digest: `sha256:${string}`;
        };
        targetRoot: string;
        installPolicy: "clean" | "idempotent";
    }, {
        verifiedArtifact: {
            ref: string;
            digest: `sha256:${string}`;
        };
        descriptor: {
            ref: string;
            digest: `sha256:${string}`;
        };
        contributionManifest: {
            ref: string;
            digest: `sha256:${string}`;
        };
        resolvedLock: {
            ref: string;
            digest: `sha256:${string}`;
        };
        targetRoot: string;
        installPolicy: "clean" | "idempotent";
    }>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
        disposition: "materialized" | "idempotent";
        installedProduct: {
            ref: string;
            digest: `sha256:${string}`;
        };
        installManifest: {
            ref: string;
            digest: `sha256:${string}`;
        };
        installerManifest: {
            ref: string;
            digest: `sha256:${string}`;
        };
        resolvedLock: {
            ref: string;
            digest: `sha256:${string}`;
        };
        provenance: {
            ref: string;
            digest: `sha256:${string}`;
        }[];
    }, {
        disposition: "materialized" | "idempotent";
        installedProduct: {
            ref: string;
            digest: `sha256:${string}`;
        };
        installManifest: {
            ref: string;
            digest: `sha256:${string}`;
        };
        installerManifest: {
            ref: string;
            digest: `sha256:${string}`;
        };
        resolvedLock: {
            ref: string;
            digest: `sha256:${string}`;
        };
        provenance: {
            ref: string;
            digest: `sha256:${string}`;
        }[];
    }>, import("../shared/public_function_contracts.js").RuntimeContractSchema<{
        code: "identity_mismatch" | "contribution_mismatch" | "content_mismatch" | "lock_mismatch" | "verification_failure" | "target_failure" | "descriptor_mismatch" | "contract_mismatch" | "filesystem_failure";
        issuePaths: string[];
        evidenceRefs: string[];
    }, {
        code: "identity_mismatch" | "contribution_mismatch" | "content_mismatch" | "lock_mismatch" | "verification_failure" | "target_failure" | "descriptor_mismatch" | "contract_mismatch" | "filesystem_failure";
        issuePaths: string[];
        evidenceRefs: string[];
    }>, null>, import("./admission_authority.js").AdmissionAuthorizedResources<ProductInstallResourceAssertion>, ProductInstallResourceReceipt>;
}>;
