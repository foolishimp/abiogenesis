import type { ModulePublication } from "../gtl/contracts.js";
import type { JsonValue } from "../shared/canonical_json.js";
import { sha256Canonical, type Sha256Digest } from "../shared/digests.js";

export function modulePublicationSemanticDigest(
  publication: Readonly<ModulePublication>,
): Sha256Digest {
  const {
    artifactDigest: _artifactDigest,
    productManifestDigest: _productManifestDigest,
    contributions,
    ...semanticBody
  } = publication;
  return sha256Canonical({
    ...semanticBody,
    contributions: contributions.map(({
      provenanceRefs: _provenanceRefs,
      ...contribution
    }) => contribution),
  } as unknown as JsonValue);
}
