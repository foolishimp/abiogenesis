import { canonicalizeAuthoredGtlCarrier } from "../gtl/canonicalization.js";
import { sha256Canonical } from "../shared/digests.js";
export function modulePublicationSemanticDigest(publication) {
    const canonicalPublication = canonicalizeAuthoredGtlCarrier(publication, "module_publication");
    const { artifactDigest: _artifactDigest, productManifestDigest: _productManifestDigest, contributions, ...semanticBody } = canonicalPublication;
    return sha256Canonical({
        ...semanticBody,
        contributions: contributions.map(({ provenanceRefs: _provenanceRefs, ...contribution }) => contribution),
    });
}
