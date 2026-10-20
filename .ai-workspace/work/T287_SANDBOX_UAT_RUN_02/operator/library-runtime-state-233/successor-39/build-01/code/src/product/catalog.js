import { canonicalizeAuthoredGtlCarrier } from "../gtl/canonicalization.js";
import { canonicalJson, compareUnicodeCodeUnits, } from "../shared/canonical_json.js";
import { sha256Canonical } from "../shared/digests.js";
import { deepFreeze, isDeeplyFrozen } from "../shared/immutable.js";
import { constructProductSet, isResolvedProductLock } from "./environment.js";
import { modulePublicationSemanticDigest } from "./publication.js";
import { isVerifiedProductArtifact } from "./verify_product.js";
function refusal(code, message) {
    return deepFreeze({
        kind: "catalog_construction_refusal",
        schemaVersion: "5.0.0",
        disposition: "refused",
        code,
        message,
    });
}
function orderedUniqueStrings(values) {
    return Object.freeze([...new Set(values)].sort(compareUnicodeCodeUnits));
}
function orderedStrings(values) {
    return Object.freeze([...values].sort(compareUnicodeCodeUnits));
}
function frozenCanonicalStrings(values) {
    return Object.freeze([...values]);
}
const CONTRIBUTION_INVENTORY_FIELDS = [
    "programMembershipRefs",
    "readinessPrerequisiteRefs",
    "compatibilityRefs",
    "provenanceRefs",
];
function duplicateContributionReference(publications) {
    for (const publication of publications) {
        for (const contribution of publication.contributions) {
            for (const field of CONTRIBUTION_INVENTORY_FIELDS) {
                const seen = new Set();
                for (const value of contribution[field]) {
                    if (seen.has(value)) {
                        return {
                            moduleRef: publication.moduleRef,
                            handle: contribution.handle,
                            field,
                            value,
                        };
                    }
                    seen.add(value);
                }
            }
        }
    }
    return null;
}
function duplicateContributionRefusal(duplicate) {
    return refusal("duplicate_contribution_reference", `module ${duplicate.moduleRef} catalog handle ${duplicate.handle} has duplicate ${duplicate.field} value ${duplicate.value}`);
}
function frozenIndex(entries) {
    return deepFreeze(Object.fromEntries(entries.map((entry) => [entry.handle, entry])));
}
function exactDefinition(publication, contribution) {
    const matches = publication.graphFunctions.filter((definition) => definition.name === contribution.declarationOrContractRef);
    return matches.length === 1 ? matches[0] : null;
}
function graphFunctionEntry(publication, publicationDigest, contribution, definition) {
    const body = {
        handle: contribution.handle,
        definitionRef: contribution.declarationOrContractRef,
        definitionDigest: sha256Canonical(definition),
        definition,
        owningProductId: contribution.owningProductId,
        moduleRef: publication.moduleRef,
        publicationDigest,
        programMembershipRefs: frozenCanonicalStrings(contribution.programMembershipRefs),
        compatibilityRefs: frozenCanonicalStrings(contribution.compatibilityRefs),
        provenanceRefs: frozenCanonicalStrings(contribution.provenanceRefs),
    };
    return deepFreeze({
        kind: "graph_function_catalog_entry",
        ...body,
        entryDigest: sha256Canonical(body),
    });
}
function declarationEntry(publication, publicationDigest, contribution) {
    const body = {
        handle: contribution.handle,
        declarationKind: contribution.kind,
        declarationOrContractRef: contribution.declarationOrContractRef,
        owningProductId: contribution.owningProductId,
        moduleRef: publication.moduleRef,
        publicationDigest,
        programMembershipRefs: frozenCanonicalStrings(contribution.programMembershipRefs),
        compatibilityRefs: frozenCanonicalStrings(contribution.compatibilityRefs),
        provenanceRefs: frozenCanonicalStrings(contribution.provenanceRefs),
    };
    return deepFreeze({
        kind: "declaration_catalog_entry",
        ...body,
        entryDigest: sha256Canonical(body),
    });
}
function lockComparableProduct(value) {
    return {
        productId: value.productId,
        packageName: value.packageName,
        packageVersion: value.packageVersion,
        artifactDigest: value.artifactDigest,
        productContentDigest: value.productContentDigest,
        manifestDigest: value.manifestDigest,
        descriptorRef: value.descriptorRef,
        publisherNamespace: value.publisherNamespace,
        catalogId: value.catalogId,
        catalogDigest: value.catalogDigest,
        contributionManifestRef: value.contributionManifestRef,
        contributionManifestDigest: value.contributionManifestDigest,
        contributionManifest: value.contributionManifest,
        compatibilityRefs: value.compatibilityRefs,
        declaredDependencies: value.declaredDependencies,
        provenanceRef: value.provenanceRef,
        declaredCapabilityRefs: value.declaredCapabilityRefs,
        capabilityDefinitionGraph: value.capabilityDefinitionGraph,
        capabilityDefinitionGraphAsset: value.capabilityDefinitionGraphAsset,
        publicContracts: value.publicContracts,
        publicContractRefs: value.publicContractRefs,
        publicCapabilityRefs: value.publicCapabilityRefs,
    };
}
export function directSatisfiedDependencyRefs(lock, publishingProductId) {
    const satisfied = new Set();
    for (const edge of lock.dependencyEdges) {
        if (edge.fromProductId !== publishingProductId)
            continue;
        const targets = lock.rows.filter((row) => row.productId === edge.toProductId);
        if (targets.length !== 1)
            continue;
        const target = targets[0];
        if (target.packageVersion !== edge.packageVersion ||
            !target.compatibilityRefs.includes(edge.compatibilityRef) ||
            edge.requiredContractRefs.some((contractRef) => !target.publicContractRefs.includes(contractRef)) ||
            edge.requiredCapabilityRefs.some((capabilityRef) => !target.publicCapabilityRefs.includes(capabilityRef)))
            continue;
        edge.requiredContractRefs.forEach((ref) => satisfied.add(ref));
        edge.requiredCapabilityRefs.forEach((ref) => satisfied.add(ref));
    }
    return satisfied;
}
const readyCatalogs = new WeakMap();
const ownedCatalogs = new WeakSet();
const canonicalPublications = new WeakMap();
const catalogViews = new WeakMap();
function canonicalPublication(publication) {
    const retained = canonicalPublications.get(publication);
    if (retained !== undefined)
        return retained;
    const canonical = canonicalizeAuthoredGtlCarrier(publication, "module_publication");
    canonicalPublications.set(canonical, canonical);
    if (isDeeplyFrozen(publication))
        canonicalPublications.set(publication, canonical);
    return canonical;
}
export function admitGraphFunctionCatalog(basis) {
    const retained = readyCatalogs.get(basis);
    if (retained !== undefined)
        return retained;
    const canonicalBasis = {
        workspaceBinding: basis.workspaceBinding,
        resolvedLock: basis.resolvedLock,
        verifiedProducts: [...basis.verifiedProducts].sort((left, right) => compareUnicodeCodeUnits(left.productId, right.productId)),
        // ProductSet order belongs to the selected lock, not catalog row ordering.
        installedProducts: [...basis.installedProducts],
        publications: basis.publications
            .map(canonicalPublication)
            .sort((left, right) => compareUnicodeCodeUnits(modulePublicationSemanticDigest(left), modulePublicationSemanticDigest(right))),
    };
    const { workspaceBinding, resolvedLock, verifiedProducts, installedProducts, publications } = canonicalBasis;
    const workspaceBindingBody = {
        workspaceId: workspaceBinding.workspaceId,
        authorityBasisId: workspaceBinding.authorityBasisId,
        authorityBasisDigest: workspaceBinding.authorityBasisDigest,
        authorizedActorRef: workspaceBinding.authorizedActorRef,
        productSetId: workspaceBinding.productSetId,
        productSetDigest: workspaceBinding.productSetDigest,
        lockId: workspaceBinding.lockId,
        lockDigest: workspaceBinding.lockDigest,
        roots: workspaceBinding.roots,
    };
    const expectedWorkspaceBindingDigest = sha256Canonical(workspaceBindingBody);
    if (!isResolvedProductLock(resolvedLock) ||
        workspaceBinding.kind !== "workspace_binding_candidate" ||
        workspaceBinding.schemaVersion !== "5.0.0" ||
        workspaceBinding.bindingDigest !== expectedWorkspaceBindingDigest ||
        workspaceBinding.bindingId !==
            `workspace-binding://abiogenesis/${expectedWorkspaceBindingDigest.slice("sha256:".length)}` ||
        workspaceBinding.lockId !== resolvedLock.lockId ||
        workspaceBinding.lockDigest !== resolvedLock.lockDigest) {
        return refusal("binding_lock_mismatch", "catalog readiness workspace binding and resolved lock disagree");
    }
    if (verifiedProducts.length !== resolvedLock.rows.length ||
        verifiedProducts.some((verified) => {
            if (!isVerifiedProductArtifact(verified))
                return true;
            const rows = resolvedLock.rows.filter((row) => row.productId === verified.productId);
            return rows.length !== 1 || canonicalJson(lockComparableProduct(verified)) !== canonicalJson(rows[0]);
        })) {
        return refusal("verified_product_mismatch", "catalog readiness verified Products differ from the exact resolved lock");
    }
    if (installedProducts.length !== verifiedProducts.length ||
        installedProducts.some((install) => {
            const verified = verifiedProducts.filter((candidate) => candidate.productId === install.productId);
            return install.kind !== "product_install_candidate" ||
                install.disposition !== "materialized" ||
                install.resolvedLockId !== resolvedLock.lockId ||
                install.resolvedLockDigest !== resolvedLock.lockDigest ||
                verified.length !== 1 ||
                canonicalJson(lockComparableProduct(install)) !==
                    canonicalJson(lockComparableProduct(verified[0]));
        })) {
        return refusal("installed_product_mismatch", "catalog readiness installed Products differ from verified Product truth");
    }
    const productSet = constructProductSet(installedProducts, resolvedLock);
    if (productSet.kind !== "product_set" ||
        workspaceBinding.productSetId !== productSet.productSetId ||
        workspaceBinding.productSetDigest !== productSet.productSetDigest) {
        return refusal("binding_lock_mismatch", "catalog readiness workspace is unrelated to the exact installed Product set");
    }
    const duplicateContribution = duplicateContributionReference(publications);
    if (duplicateContribution !== null) {
        return duplicateContributionRefusal(duplicateContribution);
    }
    const rowDispositions = [];
    const admittedPublications = [];
    const boundPublications = [];
    const submittedContributions = publications.flatMap((publication) => publication.contributions.map((contribution) => ({ publication, contribution })));
    const pushDisposition = (publication, contribution, disposition, reason) => {
        const rowBody = {
            handle: contribution.handle,
            owningProductId: contribution.owningProductId,
            moduleRef: publication.moduleRef,
            disposition,
            readiness: disposition === "admitted" ? "ready" : "not_ready",
            reason,
            readinessPrerequisiteRefs: [...contribution.readinessPrerequisiteRefs],
        };
        rowDispositions.push({
            ...rowBody,
            rowDigest: sha256Canonical(rowBody),
        });
    };
    for (const publication of publications) {
        const lockRows = resolvedLock.rows.filter((row) => row.productId === publication.owningProductId);
        if (lockRows.length !== 1) {
            publication.contributions.forEach((contribution) => pushDisposition(publication, contribution, "unresolved", "publication_owner_unresolved"));
            continue;
        }
        const lockRow = lockRows[0];
        const publicationBindings = lockRow.contributionManifest.publicationBindings.filter((binding) => binding.moduleRef === publication.moduleRef);
        const declaredRows = lockRow.contributionManifest.rows.filter((row) => row.moduleRef === publication.moduleRef);
        const publicationIdentityMismatch = publication.artifactDigest !== lockRow.artifactDigest ||
            publication.productContentDigest !== lockRow.productContentDigest ||
            publication.productManifestDigest !== lockRow.manifestDigest ||
            publication.descriptorRef !== lockRow.descriptorRef ||
            publication.contributionManifestRef !== lockRow.contributionManifestRef ||
            publicationBindings.length !== 1 ||
            publicationBindings[0]?.publicationDigest !==
                modulePublicationSemanticDigest(publication);
        const admittedReadinessRefs = new Set([
            publication.moduleRef,
            lockRow.artifactDigest,
            lockRow.productContentDigest,
            lockRow.manifestDigest,
            lockRow.descriptorRef,
            lockRow.contributionManifestRef,
            lockRow.contributionManifestDigest,
            lockRow.provenanceRef,
            ...lockRow.compatibilityRefs,
            ...lockRow.publicContractRefs,
            ...lockRow.publicCapabilityRefs,
            ...publication.programs.map((program) => program.programRef),
            ...directSatisfiedDependencyRefs(resolvedLock, publication.owningProductId),
        ]);
        const admittedContributions = [];
        for (const contribution of publication.contributions) {
            if (publicationIdentityMismatch) {
                pushDisposition(publication, contribution, "rejected", "publication_identity_mismatch");
                continue;
            }
            const collisions = submittedContributions.filter((candidate) => candidate.contribution.handle === contribution.handle);
            if (collisions.length > 1 &&
                new Set(collisions.map((candidate) => canonicalJson(candidate.contribution))).size > 1) {
                pushDisposition(publication, contribution, "conflicting", "canonical_handle_conflict");
                continue;
            }
            const matches = declaredRows.filter((row) => row.handle === contribution.handle);
            if (matches.length !== 1) {
                pushDisposition(publication, contribution, matches.length === 0 ? "rejected" : "conflicting", matches.length === 0 ? "manifest_row_absent" : "manifest_row_ambiguous");
                continue;
            }
            const declared = matches[0];
            if (declared.kind !== contribution.kind ||
                declared.declarationOrContractRef !== contribution.declarationOrContractRef ||
                declared.owningProductId !== contribution.owningProductId ||
                declared.provenanceRef !== lockRow.provenanceRef ||
                canonicalJson(orderedStrings(declared.programMembershipRefs)) !==
                    canonicalJson(contribution.programMembershipRefs) ||
                canonicalJson(contribution.provenanceRefs) !==
                    canonicalJson(orderedStrings([
                        lockRow.artifactDigest,
                        lockRow.manifestDigest,
                    ]))) {
                pushDisposition(publication, contribution, "rejected", "manifest_or_provenance_mismatch");
                continue;
            }
            if (canonicalJson(orderedStrings(declared.compatibilityRefs)) !==
                canonicalJson(contribution.compatibilityRefs) ||
                declared.compatibilityRefs.some((ref) => !lockRow.compatibilityRefs.includes(ref))) {
                pushDisposition(publication, contribution, "incompatible", "compatibility_mismatch");
                continue;
            }
            if (canonicalJson(orderedStrings(declared.readinessPrerequisiteRefs)) !==
                canonicalJson(contribution.readinessPrerequisiteRefs)) {
                pushDisposition(publication, contribution, "unready", "readiness_declaration_mismatch");
                continue;
            }
            const unresolved = contribution.readinessPrerequisiteRefs.find((ref) => !admittedReadinessRefs.has(ref));
            if (unresolved !== undefined) {
                pushDisposition(publication, contribution, "unready", `missing_readiness_prerequisite:${unresolved}`);
                continue;
            }
            pushDisposition(publication, contribution, "admitted", null);
            admittedContributions.push(contribution);
        }
        if (!publicationIdentityMismatch) {
            boundPublications.push(publication);
            admittedPublications.push({ ...publication, contributions: admittedContributions });
        }
    }
    const catalog = buildGraphFunctionCatalog(admittedPublications);
    if (catalog.kind !== "graph_function_catalog")
        return catalog;
    const readinessBasisDigest = sha256Canonical(canonicalBasis);
    const ready = deepFreeze({
        ...catalog,
        basisDigest: readinessBasisDigest,
        readinessBasisDigest,
        workspaceBindingId: workspaceBinding.bindingId,
        workspaceBindingDigest: workspaceBinding.bindingDigest,
        lockId: resolvedLock.lockId,
        lockDigest: resolvedLock.lockDigest,
        productSetId: productSet.productSetId,
        productSetDigest: productSet.productSetDigest,
        readinessBasis: canonicalBasis,
        boundPublications,
        rowDispositions: rowDispositions.sort((left, right) => compareUnicodeCodeUnits(left.handle, right.handle) ||
            compareUnicodeCodeUnits(left.rowDigest, right.rowDigest)),
    });
    if (isDeeplyFrozen(ready)) {
        readyCatalogs.set(canonicalBasis, ready);
        if (isDeeplyFrozen(basis))
            readyCatalogs.set(basis, ready);
        ownedCatalogs.add(ready);
    }
    return ready;
}
export function buildGraphFunctionCatalog(exactPublications) {
    const publications = exactPublications.map((authoredPublication) => {
        const publication = canonicalPublication(authoredPublication);
        return {
            publication,
            digest: modulePublicationSemanticDigest(publication),
        };
    }).sort((left, right) => compareUnicodeCodeUnits(left.publication.moduleRef, right.publication.moduleRef) ||
        compareUnicodeCodeUnits(left.digest, right.digest));
    const duplicateContribution = duplicateContributionReference(publications.map((row) => row.publication));
    if (duplicateContribution !== null) {
        return duplicateContributionRefusal(duplicateContribution);
    }
    const publicationByModule = new Map();
    const callableByHandle = new Map();
    const declarationByHandle = new Map();
    for (const { publication, digest } of publications) {
        const priorDigest = publicationByModule.get(publication.moduleRef);
        if (priorDigest !== undefined) {
            if (priorDigest === digest)
                continue;
            return refusal("publication_identity_collision", `module ${publication.moduleRef} has unequal exact publications`);
        }
        publicationByModule.set(publication.moduleRef, digest);
        for (const contribution of publication.contributions) {
            if (contribution.owningProductId !== publication.owningProductId) {
                return refusal("publication_owner_mismatch", `catalog handle ${contribution.handle} differs from its publication owner`);
            }
            if (contribution.kind === "graph_function") {
                const definition = exactDefinition(publication, contribution);
                if (definition === null) {
                    return refusal("graph_function_definition_missing", `catalog handle ${contribution.handle} has no exact published GraphFunction`);
                }
                const membershipIsExact = contribution.programMembershipRefs.every((programRef) => publication.programs.some((program) => program.programRef === programRef &&
                    program.callableMembership.includes(definition.name)));
                if (!membershipIsExact) {
                    return refusal("invalid_program_membership", `catalog handle ${contribution.handle} claims absent Program membership`);
                }
                const entry = graphFunctionEntry(publication, digest, contribution, definition);
                if (declarationByHandle.has(entry.handle)) {
                    return refusal("canonical_handle_collision", `catalog handle ${entry.handle} names callable and non-callable declarations`);
                }
                const prior = callableByHandle.get(entry.handle);
                if (prior !== undefined && prior.entryDigest !== entry.entryDigest) {
                    return refusal("canonical_handle_collision", `catalog handle ${entry.handle} names unequal GraphFunctions`);
                }
                callableByHandle.set(entry.handle, prior ?? entry);
                continue;
            }
            const entry = declarationEntry(publication, digest, contribution);
            if (callableByHandle.has(entry.handle)) {
                return refusal("canonical_handle_collision", `catalog handle ${entry.handle} names callable and non-callable declarations`);
            }
            const prior = declarationByHandle.get(entry.handle);
            if (prior !== undefined && prior.entryDigest !== entry.entryDigest) {
                return refusal("canonical_handle_collision", `catalog handle ${entry.handle} names unequal declarations`);
            }
            declarationByHandle.set(entry.handle, prior ?? entry);
        }
    }
    const entries = [...callableByHandle.values()].sort((left, right) => compareUnicodeCodeUnits(left.handle, right.handle));
    const declarationEntries = [...declarationByHandle.values()].sort((left, right) => compareUnicodeCodeUnits(left.handle, right.handle));
    const publicationDigests = orderedUniqueStrings([...publicationByModule.entries()].map(([moduleRef, digest]) => `${moduleRef}\u0000${digest}`)).map((row) => row.slice(row.indexOf("\u0000") + 1));
    const basisDigest = sha256Canonical({
        publicationDigests,
        entries: entries.map((entry) => entry.entryDigest),
        declarationEntries: declarationEntries.map((entry) => entry.entryDigest),
    });
    const catalog = deepFreeze({
        kind: "graph_function_catalog",
        schemaVersion: "5.0.0",
        basisDigest,
        publicationDigests,
        entries,
        byHandle: frozenIndex(entries),
        declarationEntries,
        declarationsByHandle: frozenIndex(declarationEntries),
    });
    ownedCatalogs.add(catalog);
    return catalog;
}
export function refreshGraphFunctionCatalog(exactPublications) {
    return buildGraphFunctionCatalog(exactPublications);
}
export function lookupGraphFunction(catalog, handle) {
    return Object.hasOwn(catalog.byHandle, handle)
        ? catalog.byHandle[handle] ?? null
        : null;
}
export function lookupGraphFunctionDefinition(catalog, definitionRef, programRef) {
    const matches = catalog.entries.filter((entry) => entry.definitionRef === definitionRef &&
        entry.programMembershipRefs.includes(programRef));
    if (matches.length === 0) {
        return deepFreeze({
            kind: "graph_function_definition_lookup_absent",
            definitionRef,
            programRef,
        });
    }
    if (matches.length === 1) {
        return deepFreeze({
            kind: "graph_function_definition_lookup_exact",
            definitionRef,
            programRef,
            entry: matches[0],
        });
    }
    return deepFreeze({
        kind: "graph_function_definition_lookup_ambiguous",
        definitionRef,
        programRef,
        entries: matches,
    });
}
export function narrowGraphFunctionCatalog(catalog, allowlist) {
    if (new Set(allowlist).size !== allowlist.length) {
        return refusal("duplicate_allowlist_entry", "catalog allowlist cannot contain duplicate handles");
    }
    const orderedAllowlist = [...allowlist].sort(compareUnicodeCodeUnits);
    const unknown = orderedAllowlist.find((handle) => !Object.hasOwn(catalog.byHandle, handle) &&
        !Object.hasOwn(catalog.declarationsByHandle, handle));
    if (unknown !== undefined) {
        return refusal("unknown_allowlist_entry", `unknown catalog allowlist handle ${unknown}`);
    }
    const allowlistKey = canonicalJson(orderedAllowlist);
    const retained = ownedCatalogs.has(catalog) ? catalogViews.get(catalog) : undefined;
    if (retained?.allowlist === allowlistKey)
        return retained.view;
    const entries = orderedAllowlist.flatMap((handle) => {
        const entry = catalog.byHandle[handle];
        return entry === undefined ? [] : [entry];
    });
    const declarationEntries = orderedAllowlist.flatMap((handle) => {
        const entry = catalog.declarationsByHandle[handle];
        return entry === undefined ? [] : [entry];
    });
    const body = {
        catalogBasisDigest: catalog.basisDigest,
        allowlist: orderedAllowlist,
        entries: entries.map((entry) => entry.entryDigest),
        declarationEntries: declarationEntries.map((entry) => entry.entryDigest),
    };
    const view = deepFreeze({
        kind: "graph_function_catalog_view",
        catalogBasisDigest: catalog.basisDigest,
        allowlist: orderedAllowlist,
        entries,
        byHandle: frozenIndex(entries),
        declarationEntries,
        declarationsByHandle: frozenIndex(declarationEntries),
        viewDigest: sha256Canonical(body),
    });
    if (ownedCatalogs.has(catalog))
        catalogViews.set(catalog, { allowlist: allowlistKey, view });
    return view;
}
export function applyCatalogDeclaration(view, input) {
    const declaration = view.declarationsByHandle[input.handle];
    if (declaration === undefined) {
        return deepFreeze({
            kind: "declaration_application_refusal",
            code: "outside_view",
            message: `declaration ${input.handle} is absent from the catalog view`,
        });
    }
    if (declaration.declarationKind !== input.applicationKind) {
        return deepFreeze({
            kind: "declaration_application_refusal",
            code: "kind_mismatch",
            message: `declaration ${input.handle} is not ${input.applicationKind}`,
        });
    }
    const body = {
        catalogBasisDigest: view.catalogBasisDigest,
        viewDigest: view.viewDigest,
        declarationDigest: declaration.entryDigest,
        targetRef: input.targetRef,
        targetDigest: input.targetDigest,
        appliedValueRef: input.appliedValueRef,
        appliedValueDigest: input.appliedValueDigest,
    };
    const applicationDigest = sha256Canonical(body);
    return deepFreeze({
        kind: "declaration_application",
        catalogBasisDigest: view.catalogBasisDigest,
        viewDigest: view.viewDigest,
        declaration,
        targetRef: input.targetRef,
        targetDigest: input.targetDigest,
        appliedValueRef: input.appliedValueRef,
        appliedValueDigest: input.appliedValueDigest,
        applicationRef: `catalog-application://abiogenesis/${applicationDigest.slice("sha256:".length)}`,
        applicationDigest,
    });
}
export function graphFunctionCatalogCanonicalSnapshot(catalog) {
    return canonicalJson({
        kind: catalog.kind,
        schemaVersion: catalog.schemaVersion,
        basisDigest: catalog.basisDigest,
        publicationDigests: catalog.publicationDigests,
        entries: catalog.entries,
        declarationEntries: catalog.declarationEntries,
    });
}
