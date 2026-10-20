import { isRecord, hasObjectUnicodeNulJoinedKeys as hasExactKeys } from "../shared/admission_predicates.js";
import { mkdir, readFile, writeFile, } from "node:fs/promises";
import { dirname, isAbsolute, join } from "node:path";
import { canonicalJson, compareUnicodeCodeUnits, } from "../shared/canonical_json.js";
import { isSha256Digest, sha256Canonical, } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import { parseProductPublicContract } from "./verify_product.js";
function digestJson(value) {
    try {
        return sha256Canonical(value);
    }
    catch {
        return null;
    }
}
function refusal(memberKey, code, message, packet) {
    const workspaceRef = isRecord(packet) &&
        isRecord(packet.workspace) &&
        typeof packet.workspace.workspaceRef === "string"
        ? packet.workspace.workspaceRef
        : null;
    const bindingRef = isRecord(packet) &&
        isRecord(packet.binding) &&
        typeof packet.binding.bindingId === "string"
        ? packet.binding.bindingId
        : null;
    return deepFreeze({
        kind: "product_materialization_refusal",
        schemaVersion: "5.0.0",
        disposition: "refused",
        memberKey,
        code,
        message,
        workspaceRef,
        bindingRef,
    });
}
function bindingBodyDigest(binding) {
    if (!isRecord(binding) ||
        binding.kind !== "workspace_binding" ||
        binding.schemaVersion !== "5.0.0" ||
        typeof binding.bindingId !== "string" ||
        !isSha256Digest(binding.bindingDigest) ||
        typeof binding.admissionEventRef !== "string" ||
        binding.admissionEventRef.length === 0 ||
        !isRecord(binding.roots) ||
        Object.values(binding.roots).some((root) => typeof root !== "string" || !isAbsolute(root)))
        return null;
    return sha256Canonical({
        workspaceId: binding.workspaceId,
        authorityBasisId: binding.authorityBasisId,
        authorityBasisDigest: binding.authorityBasisDigest,
        authorizedActorRef: binding.authorizedActorRef,
        productSetId: binding.productSetId,
        productSetDigest: binding.productSetDigest,
        lockId: binding.lockId,
        lockDigest: binding.lockDigest,
        roots: binding.roots,
    });
}
function validWorkspaceAndBinding(workspace, binding) {
    if (!isRecord(workspace) ||
        !hasExactKeys(workspace, [
            "authorityDigest",
            "authorityRef",
            "workspaceDigest",
            "workspaceRef",
        ]) ||
        typeof workspace.workspaceRef !== "string" ||
        workspace.workspaceRef.length === 0 ||
        typeof workspace.authorityRef !== "string" ||
        workspace.authorityRef.length === 0 ||
        !isSha256Digest(workspace.workspaceDigest) ||
        !isSha256Digest(workspace.authorityDigest) ||
        !isRecord(binding) ||
        binding.kind !== "workspace_binding" ||
        binding.workspaceId !== workspace.workspaceRef ||
        binding.authorityBasisId !== workspace.authorityRef ||
        binding.authorityBasisDigest !== workspace.authorityDigest)
        return false;
    const typedBinding = binding;
    const digest = bindingBodyDigest(typedBinding);
    if (digest === null ||
        digest !== typedBinding.bindingDigest ||
        typedBinding.bindingId !==
            `workspace-binding://abiogenesis/${digest.slice("sha256:".length)}`)
        return false;
    return true;
}
function validEnvelope(packet, memberKey, extraKeys) {
    return isRecord(packet) &&
        hasExactKeys(packet, [
            "binding",
            "kind",
            "memberKey",
            "schemaVersion",
            "workspace",
            ...extraKeys,
        ]) &&
        packet.kind === "product_materialize_packet" &&
        packet.schemaVersion === "5.0.0" &&
        packet.memberKey === memberKey;
}
async function persistExactFile(path, bytes) {
    await mkdir(dirname(path), { recursive: true });
    try {
        await writeFile(path, bytes, { encoding: "utf8", flag: "wx" });
        return "created";
    }
    catch (error) {
        if (error.code !== "EEXIST")
            throw error;
        return await readFile(path, "utf8") === bytes ? "preserved" : "collision";
    }
}
function assetRoot(binding, memberKey) {
    return join(binding.roots.projectionRoot, "product-materializations", memberKey);
}
function sortedProvenance(rows) {
    return [...rows].sort((left, right) => compareUnicodeCodeUnits(left.provenanceRef, right.provenanceRef));
}
async function persistManifest(memberKey, packet, rows, content, provenance) {
    const manifestBody = {
        kind: "product_materialization_manifest",
        schemaVersion: "5.0.0",
        materializationKind: memberKey,
        workspaceRef: packet.workspace.workspaceRef,
        workspaceDigest: packet.workspace.workspaceDigest,
        bindingRef: packet.binding.bindingId,
        bindingDigest: packet.binding.bindingDigest,
        contentRef: content.contentRef,
        contentDigest: content.contentDigest,
        rows,
        validationDisposition: "admitted",
        residuals: [],
        provenance,
    };
    const manifestDigest = sha256Canonical(manifestBody);
    const manifestRef = `product-materialization-manifest://abiogenesis/${manifestDigest.slice("sha256:".length)}`;
    const manifestPath = join(assetRoot(packet.binding, memberKey), "manifests", `${manifestDigest.slice("sha256:".length)}.json`);
    const manifestBytes = `${canonicalJson({
        ...manifestBody,
        manifestRef,
        manifestDigest,
    })}\n`;
    try {
        const disposition = await persistExactFile(manifestPath, manifestBytes);
        if (disposition === "collision") {
            return refusal(memberKey, "authority_overwrite_forbidden", "materialization manifest path contains unequal existing authority", packet);
        }
    }
    catch (error) {
        return refusal(memberKey, "filesystem_failure", `materialization manifest write failed: ${String(error)}`, packet);
    }
    return deepFreeze({
        kind: "product_materialization_result",
        schemaVersion: "5.0.0",
        disposition: "materialized",
        materializationKind: memberKey,
        subject: {
            workspaceRef: packet.workspace.workspaceRef,
            workspaceDigest: packet.workspace.workspaceDigest,
            bindingRef: packet.binding.bindingId,
            bindingDigest: packet.binding.bindingDigest,
        },
        content,
        manifest: {
            manifestRef,
            manifestDigest,
            manifestPath,
        },
        rows,
        validationDisposition: "admitted",
        residuals: [],
        provenance,
    });
}
export async function materializeContextBootstrap(packet) {
    if (!validEnvelope(packet, "context_bootstrap", ["contextInputs"])) {
        return refusal("context_bootstrap", "input_invalid", "context bootstrap requires one closed materialization packet", packet);
    }
    if (!validWorkspaceAndBinding(packet.workspace, packet.binding)) {
        return refusal("context_bootstrap", "binding_mismatch", "context bootstrap workspace and selected binding differ", packet);
    }
    if (!Array.isArray(packet.contextInputs) ||
        packet.contextInputs.length === 0 ||
        packet.contextInputs.some((input) => !isRecord(input) ||
            !hasExactKeys(input, ["content", "inputDigest", "inputRef", "kind"]) ||
            input.kind !== "declared_context_input" ||
            typeof input.inputRef !== "string" ||
            input.inputRef.length === 0 ||
            !isSha256Digest(input.inputDigest) ||
            digestJson(input.content) !== input.inputDigest) ||
        new Set(packet.contextInputs.map((input) => input.inputRef)).size !==
            packet.contextInputs.length ||
        new Set(packet.contextInputs.map((input) => input.inputDigest)).size !==
            packet.contextInputs.length) {
        return refusal("context_bootstrap", "input_invalid", "context bootstrap inputs must be non-empty, unique, and content-addressed", packet);
    }
    const rows = [];
    const orderedInputs = [...packet.contextInputs].sort((left, right) => compareUnicodeCodeUnits(left.inputRef, right.inputRef));
    try {
        for (const input of orderedInputs) {
            const assetBody = {
                kind: "generated_product_asset",
                schemaVersion: "5.0.0",
                materializationKind: "context_bootstrap",
                workspaceRef: packet.workspace.workspaceRef,
                workspaceDigest: packet.workspace.workspaceDigest,
                bindingRef: packet.binding.bindingId,
                bindingDigest: packet.binding.bindingDigest,
                inputRef: input.inputRef,
                inputDigest: input.inputDigest,
                content: input.content,
            };
            const assetDigest = sha256Canonical(assetBody);
            const assetRef = `generated-product-asset://abiogenesis/${assetDigest.slice("sha256:".length)}`;
            const assetPath = join(assetRoot(packet.binding, "context_bootstrap"), "content", `${assetDigest.slice("sha256:".length)}.json`);
            const bytes = `${canonicalJson({
                ...assetBody,
                assetRef,
                assetDigest,
            })}\n`;
            const disposition = await persistExactFile(assetPath, bytes);
            if (disposition === "collision") {
                return refusal("context_bootstrap", "authority_overwrite_forbidden", "context asset path contains unequal existing authority", packet);
            }
            rows.push({
                inputRef: input.inputRef,
                inputDigest: input.inputDigest,
                assetRef,
                assetDigest,
                assetPath,
                disposition,
            });
        }
    }
    catch (error) {
        return refusal("context_bootstrap", "filesystem_failure", `context asset write failed: ${String(error)}`, packet);
    }
    const contentDigest = sha256Canonical(rows.map((row) => row.assetDigest));
    const content = {
        contentRef: `context-bootstrap-content://abiogenesis/${contentDigest.slice("sha256:".length)}`,
        contentDigest,
        contentPath: assetRoot(packet.binding, "context_bootstrap"),
    };
    const provenance = sortedProvenance([
        {
            provenanceRef: packet.workspace.workspaceRef,
            provenanceDigest: packet.workspace.workspaceDigest,
        },
        {
            provenanceRef: packet.binding.bindingId,
            provenanceDigest: packet.binding.bindingDigest,
        },
        ...orderedInputs.map((input) => ({
            provenanceRef: input.inputRef,
            provenanceDigest: input.inputDigest,
        })),
    ]);
    return persistManifest("context_bootstrap", packet, rows, content, provenance);
}
export async function materializeConfiguration(packet) {
    if (!validEnvelope(packet, "configuration", [
        "configurationContract",
        "inputs",
    ])) {
        return refusal("configuration", "input_invalid", "configuration requires one closed materialization packet", packet);
    }
    if (!validWorkspaceAndBinding(packet.workspace, packet.binding)) {
        return refusal("configuration", "binding_mismatch", "configuration workspace and selected binding differ", packet);
    }
    if (!isRecord(packet.configurationContract) ||
        typeof packet.configurationContract.owningProduct !== "string" ||
        parseProductPublicContract(packet.configurationContract, packet.configurationContract.owningProduct) === null) {
        return refusal("configuration", "contract_invalid", "configuration contract is not one exact admitted Product contract", packet);
    }
    const inputsDigest = digestJson(packet.inputs);
    if (inputsDigest === null) {
        return refusal("configuration", "input_invalid", "configuration inputs must be canonical JSON", packet);
    }
    const contentBody = {
        kind: "generated_product_asset",
        schemaVersion: "5.0.0",
        materializationKind: "configuration",
        workspaceRef: packet.workspace.workspaceRef,
        workspaceDigest: packet.workspace.workspaceDigest,
        bindingRef: packet.binding.bindingId,
        bindingDigest: packet.binding.bindingDigest,
        configurationContract: packet.configurationContract,
        inputsDigest,
        inputs: packet.inputs,
    };
    const contentDigest = sha256Canonical(contentBody);
    const contentRef = `configuration-content://abiogenesis/${contentDigest.slice("sha256:".length)}`;
    const contentPath = join(assetRoot(packet.binding, "configuration"), "content", `${contentDigest.slice("sha256:".length)}.json`);
    const bytes = `${canonicalJson({
        ...contentBody,
        contentRef,
        contentDigest,
    })}\n`;
    let rowDisposition;
    try {
        const disposition = await persistExactFile(contentPath, bytes);
        if (disposition === "collision") {
            return refusal("configuration", "authority_overwrite_forbidden", "configuration path contains unequal existing authority", packet);
        }
        rowDisposition = disposition;
    }
    catch (error) {
        return refusal("configuration", "filesystem_failure", `configuration write failed: ${String(error)}`, packet);
    }
    const row = {
        inputRef: packet.configurationContract.contractId,
        inputDigest: inputsDigest,
        assetRef: contentRef,
        assetDigest: contentDigest,
        assetPath: contentPath,
        disposition: rowDisposition,
    };
    const provenance = sortedProvenance([
        {
            provenanceRef: packet.workspace.workspaceRef,
            provenanceDigest: packet.workspace.workspaceDigest,
        },
        {
            provenanceRef: packet.binding.bindingId,
            provenanceDigest: packet.binding.bindingDigest,
        },
        {
            provenanceRef: packet.configurationContract.contractId,
            provenanceDigest: packet.configurationContract.contractDigest,
        },
    ]);
    return persistManifest("configuration", packet, [row], { contentRef, contentDigest, contentPath }, provenance);
}
export const ProductMaterializationPort = Object.freeze({
    context_bootstrap: materializeContextBootstrap,
    configuration: materializeConfiguration,
});
export const MATERIALIZATION_OPERATION_CONTRACTS = Object.freeze({
    context_bootstrap: ProductMaterializationPort.context_bootstrap,
    configuration: ProductMaterializationPort.configuration,
});
