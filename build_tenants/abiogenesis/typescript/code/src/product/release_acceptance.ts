import * as v from "valibot";
import { canonicalJson, type JsonValue } from "../shared/canonical_json.js";
import { sha256Bytes, sha256Canonical } from "../shared/digests.js";
import { digestSchema, nonblankSchema, refDigestSchema } from "../shared/public_function_contracts.js";
import type { PublishedReleaseOperationArtifact, TappedReleaseSnapshotRequest } from "./release_snapshot_operations.js";

const rawRecord = v.strictObject({ ref: nonblankSchema, digest: digestSchema,
  byteCount: v.pipe(v.number(), v.integer(), v.minValue(1)), contentBase64: nonblankSchema });
/** Original O/source, never an agent interpretation or a runtime F_H response. */
export const RELEASE_OWNER_RULING_SCHEMA = v.strictObject({
  kind: v.literal("external_release_owner_ruling"), schemaVersion: v.literal("5.0.0"),
  owner: refDigestSchema, channel: refDigestSchema, request: refDigestSchema,
  presentation: rawRecord, response: rawRecord, inReplyTo: nonblankSchema,
});
export type ReleaseOwnerRuling = v.InferOutput<typeof RELEASE_OWNER_RULING_SCHEMA>;
/** External origin/attribution premise, selected independently by the operator
 * and covered by the existing exact admission approval. Its hash proves only
 * correspondence. The Product neither manufactures nor authenticates humanity. */
export const RELEASE_RULING_SOURCE_APPROVAL_SCHEMA = v.strictObject({
  kind: v.literal("trusted_operator_ruling_source"), schemaVersion: v.literal("5.0.0"),
  authority: refDigestSchema, owner: refDigestSchema, channel: refDigestSchema,
  request: refDigestSchema, ruling: refDigestSchema,
  presentation: refDigestSchema, response: refDigestSchema,
});
export type ReleaseRulingSourceApproval = v.InferOutput<typeof RELEASE_RULING_SOURCE_APPROVAL_SCHEMA>;
const hash = (value: unknown) => sha256Canonical(value as JsonValue);
const same = (a: unknown, b: unknown) => canonicalJson(a as JsonValue) === canonicalJson(b as JsonValue);
export function releaseOwnerRulingCoordinate(ruling: ReleaseOwnerRuling) {
  const digest = hash(ruling); return { ref: `release-owner-ruling://abiogenesis/${digest.slice(7)}`, digest };
}
export function releaseAcceptanceRequest(request: TappedReleaseSnapshotRequest, publication: PublishedReleaseOperationArtifact,
  owner: ReleaseOwnerRuling["owner"], evidence: readonly ReleaseOwnerRuling["owner"][]) {
  const value = { kind: "same_rc_acceptance_request", schemaVersion: "5.0.0", owner,
    scope: "accept_or_withhold_same_unchanged_rc", conditions: [] as string[],
    identity: request.requestedIdentity, publication: request.acceptedRc, predecessor: request.predecessor,
    publishedCut: { sourceCommit: publication.observation.sourceCommit, sourceTree: publication.observation.sourceTree,
      refs: publication.observation.refs, snapshotManifest: publication.observation.snapshotManifest,
      snapshotFiles: publication.observation.snapshotFiles },
    qualificationBasis: request.qualificationBasis, verdict: request.verdict, lawBasis: request.lawBasis, evidence };
  const digest = hash(value), coordinate = { ref: `release-acceptance-request://abiogenesis/${digest.slice(7)}`, digest };
  const presentation = `Same unchanged RC Product-owner ruling request\n${canonicalJson(value as unknown as JsonValue)}\nRequest: ${digest}\nReply exactly "accept ${digest}" or "withhold ${digest}". Other wording or conditions require owner clarification; this request grants no effect.\n`;
  return { value, coordinate, presentation };
}
function rawText(record: ReleaseOwnerRuling["response"]): string | null {
  try { const bytes = Buffer.from(record.contentBase64, "base64");
    return bytes.toString("base64") === record.contentBase64 && bytes.length === record.byteCount && sha256Bytes(bytes) === record.digest
      ? new TextDecoder("utf-8", { fatal: true }).decode(bytes) : null;
  } catch { return null; }
}
/** C checks the retained O against its original context. No natural-language J
 * can turn ambiguous/conditional wording into the owner's unconditional grant. */
export function resolveReleaseOwnerRuling(request: ReturnType<typeof releaseAcceptanceRequest>,
  ruling: ReleaseOwnerRuling | null, source: ReleaseRulingSourceApproval | null): "accept" | "withhold" | null {
  if (!v.is(RELEASE_OWNER_RULING_SCHEMA, ruling) || !v.is(RELEASE_RULING_SOURCE_APPROVAL_SCHEMA, source) ||
      !same(ruling.owner, request.value.owner) || !same(ruling.request, request.coordinate) ||
      !same(source.request, request.coordinate) || !same(source.owner, ruling.owner) || !same(source.channel, ruling.channel) ||
      !same(source.ruling, releaseOwnerRulingCoordinate(ruling)) ||
      !same(source.presentation, { ref: ruling.presentation.ref, digest: ruling.presentation.digest }) ||
      !same(source.response, { ref: ruling.response.ref, digest: ruling.response.digest }) ||
      ruling.inReplyTo !== ruling.presentation.ref || ruling.response.ref === ruling.presentation.ref ||
      rawText(ruling.presentation) !== request.presentation) return null;
  const original = rawText(ruling.response);
  if (original === null) return null;
  const wording = original.trim();
  return wording === `accept ${request.coordinate.digest}` ? "accept"
    : wording === `withhold ${request.coordinate.digest}` ? "withhold" : null;
}
