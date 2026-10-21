import { canonicalizeAuthoredGtlCarrier } from "../gtl/canonicalization.js";
import type { ModulePublication } from "../gtl/contracts.js";
import type { JsonValue } from "../shared/canonical_json.js";
import { sha256Canonical, type Sha256Digest } from "../shared/digests.js";

export function modulePublicationSemanticDigest(
  publication: Readonly<ModulePublication>,
): Sha256Digest {
  const canonicalPublication = canonicalizeAuthoredGtlCarrier(
    publication,
    "module_publication",
  );
  const {
    artifactDigest: _artifactDigest,
    productManifestDigest: _productManifestDigest,
    contributions,
    ...semanticBody
  } = canonicalPublication;
  return sha256Canonical({
    ...semanticBody,
    contributions: contributions.map(({
      provenanceRefs: _provenanceRefs,
      ...contribution
    }) => contribution),
  } as unknown as JsonValue);
}
