import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const GATE_DIR = path.dirname(fileURLToPath(import.meta.url));
const TENANT_ROOT = path.resolve(GATE_DIR, "../..");
const PROJECT_ROOT = path.resolve(TENANT_ROOT, "../../..");
const TICKET_STATES = Object.freeze(["active", "completed"]);
const GOVERNING_ADR =
  "build_tenants/abiogenesis/typescript/design/adrs/" +
  "ADR-044-prime-contraction-is-a-cross-boundary-design-gate.md";
const CENSUS_PATH = path.join(
  TENANT_ROOT,
  "design",
  "A5_PRIME_CONTRACTION_CENSUS.md"
);
const ACCEPTANCE_FIELDS = Object.freeze([
  "design_acceptance_ref",
  "design_decision_ref",
  "accepted_design_decision_ref"
]);
const DESIGN_FIELDS = Object.freeze([
  "design_ref",
  "design_refs",
  "accepted_design"
]);
const REVIEW_KEYS = Object.freeze([
  "schemaVersion",
  "iacs",
  "authoritativeCarriers",
  "subordinatePayloads",
  "promotionTests",
  "recurrenceReview",
  "authoritySourceCount",
  "authoringSourceCount",
  "disposition",
  "ownerTicket"
]);
const PROMOTION_TEST_KEYS = Object.freeze([
  "candidate",
  "verdict",
  "reason"
]);
const RECURRENCE_KEYS = Object.freeze(["status", "ref"]);
const COUNT_KEYS = Object.freeze(["before", "after"]);
const DISPOSITIONS = Object.freeze([
  "retain_prime",
  "derive_projection",
  "commonize_tenant",
  "consume_existing",
  "retire_duplicate",
  "migrate_authority",
  "requirement_reprice",
  "not_a_candidate"
]);
const RECURRENCE_STATUSES = Object.freeze([
  "none_found",
  "consume_existing",
  "extend_existing",
  "commonize_tenant",
  "retain_specific"
]);
const CONTRACTING_DISPOSITIONS = new Set([
  "derive_projection",
  "commonize_tenant",
  "retire_duplicate",
  "migrate_authority"
]);

function toPosix(value) {
  return value.split(path.sep).join("/");
}

function ticketMetadata(source) {
  const firstHeading = source.search(/^##\s/mu);
  const header = firstHeading === -1 ? source : source.slice(0, firstHeading);
  const values = new Map();
  const duplicateKeys = new Set();
  let activeKey = null;
  for (const line of header.split(/\r?\n/u)) {
    const field = /^- ([a-z_]+):(?:\s*(.*))?$/u.exec(line);
    if (field !== null) {
      activeKey = field[1];
      if (values.has(activeKey)) duplicateKeys.add(activeKey);
      const inline = field[2]?.trim() ?? "";
      values.set(activeKey, inline === "|-" || inline === ">-" ? [] : [inline]);
      continue;
    }
    if (activeKey !== null && /^ {2,}/u.test(line)) {
      const value = line.trim().replace(/^-\s+/u, "");
      if (value !== "") values.get(activeKey)?.push(value);
      continue;
    }
    activeKey = null;
  }
  return Object.freeze({
    values,
    duplicateKeys: Object.freeze([...duplicateKeys].sort())
  });
}

function metadataText(metadata, key) {
  return (metadata.values.get(key) ?? [])
    .join(" ")
    .replace(/\/\s+/gu, "/")
    .trim();
}

function metadataRefs(metadata, key, pattern) {
  const source = (metadata.values.get(key) ?? [])
    .join("\n")
    .replace(/\/\s+/gu, "/");
  return [...source.matchAll(pattern)].map((match) => match[0]);
}

function exactKeys(value, expected, label, failures) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    failures.push(`${label}: expected a closed object`);
    return false;
  }
  const actual = Object.keys(value).sort();
  const required = [...expected].sort();
  if (actual.length !== required.length ||
      !actual.every((key, index) => key === required[index])) {
    failures.push(
      `${label}: expected exact keys ${required.join(", ")}; found ${actual.join(", ")}`
    );
    return false;
  }
  return true;
}

function nonEmptyString(value) {
  return typeof value === "string" && value.trim() !== "";
}

function uniqueNonEmptyStrings(value, label, failures, { allowEmpty = false } = {}) {
  if (!Array.isArray(value) || (!allowEmpty && value.length === 0)) {
    failures.push(`${label}: expected ${allowEmpty ? "an" : "a non-empty"} array`);
    return [];
  }
  if (!value.every(nonEmptyString)) {
    failures.push(`${label}: entries must be non-empty strings`);
    return [];
  }
  if (new Set(value).size !== value.length) {
    failures.push(`${label}: entries must be unique`);
  }
  return value;
}

function nonNegativeCount(value, label, failures) {
  if (!Number.isInteger(value) || value < 0) {
    failures.push(`${label}: expected a non-negative integer`);
    return null;
  }
  return value;
}

function parseReviewBlock(source, label, failures) {
  const blocks = [...source.matchAll(
    /^```json prime-contraction\s*\r?\n([\s\S]*?)^```\s*$/gmu
  )];
  if (blocks.length !== 1) {
    failures.push(`${label}: expected exactly one json prime-contraction block`);
    return null;
  }
  try {
    return JSON.parse(blocks[0][1]);
  } catch (error) {
    failures.push(`${label}: invalid prime-contraction JSON: ${error.message}`);
    return null;
  }
}

export function inspectPrimeContractionReview({
  source,
  label = "design",
  expectedOwnerTicket = null
}) {
  const failures = [];
  const review = parseReviewBlock(source, label, failures);
  if (review === null || !exactKeys(review, REVIEW_KEYS, `${label}.review`, failures)) {
    return Object.freeze({ status: "failed", failures: Object.freeze(failures) });
  }

  if (review.schemaVersion !== 1) {
    failures.push(`${label}.schemaVersion: expected 1`);
  }
  const iacs = uniqueNonEmptyStrings(review.iacs, `${label}.iacs`, failures);
  const authoritative = uniqueNonEmptyStrings(
    review.authoritativeCarriers,
    `${label}.authoritativeCarriers`,
    failures
  );
  const subordinate = uniqueNonEmptyStrings(
    review.subordinatePayloads,
    `${label}.subordinatePayloads`,
    failures,
    { allowEmpty: true }
  );
  for (const carrier of authoritative) {
    if (!iacs.includes(carrier)) {
      failures.push(`${label}: authoritative carrier ${carrier} is absent from IACS`);
    }
  }
  for (const payload of subordinate) {
    if (iacs.includes(payload)) {
      failures.push(`${label}: ${payload} cannot be both IACS and subordinate`);
    }
  }

  if (!Array.isArray(review.promotionTests) || review.promotionTests.length === 0) {
    failures.push(`${label}.promotionTests: annotation-only Prime claims are forbidden`);
  } else {
    const promoted = new Set();
    review.promotionTests.forEach((test, index) => {
      const testLabel = `${label}.promotionTests[${index}]`;
      if (!exactKeys(test, PROMOTION_TEST_KEYS, testLabel, failures)) return;
      if (!nonEmptyString(test.candidate) || !nonEmptyString(test.reason)) {
        failures.push(`${testLabel}: candidate and reason must be non-empty`);
      }
      if (test.verdict !== "promote" && test.verdict !== "remain_subordinate") {
        failures.push(`${testLabel}: invalid verdict ${String(test.verdict)}`);
      }
      if (test.verdict === "promote" && nonEmptyString(test.candidate)) {
        promoted.add(test.candidate);
      }
    });
    for (const carrier of iacs) {
      if (!promoted.has(carrier)) {
        failures.push(`${label}: IACS carrier ${carrier} lacks a passing Promotion Test`);
      }
    }
  }

  if (exactKeys(review.recurrenceReview, RECURRENCE_KEYS,
    `${label}.recurrenceReview`, failures)) {
    if (!RECURRENCE_STATUSES.includes(review.recurrenceReview.status)) {
      failures.push(`${label}.recurrenceReview: invalid status`);
    }
    if (!nonEmptyString(review.recurrenceReview.ref)) {
      failures.push(`${label}.recurrenceReview: an owning evidence ref is required`);
    }
  }

  let authorityBefore = null;
  let authorityAfter = null;
  let authoringBefore = null;
  let authoringAfter = null;
  if (exactKeys(review.authoritySourceCount, COUNT_KEYS,
    `${label}.authoritySourceCount`, failures)) {
    authorityBefore = nonNegativeCount(
      review.authoritySourceCount.before,
      `${label}.authoritySourceCount.before`,
      failures
    );
    authorityAfter = nonNegativeCount(
      review.authoritySourceCount.after,
      `${label}.authoritySourceCount.after`,
      failures
    );
  }
  if (exactKeys(review.authoringSourceCount, COUNT_KEYS,
    `${label}.authoringSourceCount`, failures)) {
    authoringBefore = nonNegativeCount(
      review.authoringSourceCount.before,
      `${label}.authoringSourceCount.before`,
      failures
    );
    authoringAfter = nonNegativeCount(
      review.authoringSourceCount.after,
      `${label}.authoringSourceCount.after`,
      failures
    );
  }

  if (!DISPOSITIONS.includes(review.disposition)) {
    failures.push(`${label}.disposition: invalid disposition`);
  } else if (review.disposition === "requirement_reprice") {
    failures.push(`${label}: requirement_reprice cannot be accepted for implementation`);
  } else if (
    CONTRACTING_DISPOSITIONS.has(review.disposition) &&
    authorityBefore !== null && authorityAfter !== null &&
    authoringBefore !== null && authoringAfter !== null &&
    authorityAfter >= authorityBefore && authoringAfter >= authoringBefore
  ) {
    failures.push(`${label}: contraction disposition does not reduce a measured source count`);
  } else if (
    review.disposition === "consume_existing" &&
    authorityBefore !== null && authorityAfter !== null &&
    authoringBefore !== null && authoringAfter !== null &&
    (authorityAfter > authorityBefore || authoringAfter > authoringBefore)
  ) {
    failures.push(`${label}: consume_existing cannot increase source counts`);
  }

  if (!nonEmptyString(review.ownerTicket)) {
    failures.push(`${label}.ownerTicket: owner is required`);
  } else if (expectedOwnerTicket !== null && review.ownerTicket !== expectedOwnerTicket) {
    failures.push(
      `${label}.ownerTicket: expected ${expectedOwnerTicket}, found ${review.ownerTicket}`
    );
  }

  return Object.freeze({
    status: failures.length === 0 ? "passed" : "failed",
    failures: Object.freeze(failures),
    review: failures.length === 0 ? Object.freeze(review) : null
  });
}

function ticketFiles(projectRoot) {
  const ticketRoot = path.join(projectRoot, ".ai-workspace", "tickets");
  return TICKET_STATES.flatMap((state) => {
    const root = path.join(ticketRoot, state);
    if (!existsSync(root)) return [];
    return readdirSync(root)
      .filter((name) => /^T-\d+-.+\.md$/u.test(name))
      .sort()
      .map((name) => path.join(root, name));
  });
}

function candidateIds(censusPath) {
  if (!existsSync(censusPath)) return new Set();
  const source = readFileSync(censusPath, "utf8");
  return new Set([...source.matchAll(/^### (PC-\d{3})\b/gmu)].map((match) => match[1]));
}

function localPath(projectRoot, ref, label, failures) {
  const resolved = path.resolve(projectRoot, ref);
  const relative = path.relative(projectRoot, resolved);
  if (relative === "" || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) {
    failures.push(`${label}: reference escapes project root: ${ref}`);
    return null;
  }
  if (!existsSync(resolved)) {
    failures.push(`${label}: missing reference ${ref}`);
    return null;
  }
  return resolved;
}

export function inspectPrimeContractionGovernance({
  projectRoot = PROJECT_ROOT,
  censusPath = path.join(
    projectRoot,
    "build_tenants/abiogenesis/typescript/design/A5_PRIME_CONTRACTION_CENSUS.md"
  )
} = {}) {
  const failures = [];
  const candidates = candidateIds(censusPath);
  if (candidates.size === 0) {
    failures.push("prime census: no PC candidate identities found");
  }
  let checkedTickets = 0;
  let acceptedDesigns = 0;
  let pendingDesigns = 0;
  let checkedCandidateRefs = 0;

  for (const ticketPath of ticketFiles(projectRoot)) {
    const source = readFileSync(ticketPath, "utf8");
    const metadata = ticketMetadata(source);
    const governingRef = metadataText(metadata, "governing_prime_design_ref");
    if (governingRef === "") continue;
    checkedTickets += 1;
    const label = toPosix(path.relative(projectRoot, ticketPath));
    for (const duplicate of metadata.duplicateKeys) {
      failures.push(`${label}: duplicate ${duplicate}`);
    }
    if (governingRef !== GOVERNING_ADR) {
      failures.push(`${label}: unexpected governing Prime design ${governingRef}`);
    }
    localPath(projectRoot, governingRef, label, failures);

    const ticketId = metadataText(metadata, "id");
    if (!nonEmptyString(ticketId)) failures.push(`${label}: id is required`);
    const refs = (metadata.values.get("prime_contraction_refs") ?? [])
      .filter(nonEmptyString);
    if (ticketId !== "T-277" && refs.length === 0) {
      failures.push(`${label}: prime_contraction_refs are required`);
    }
    for (const ref of refs) {
      checkedCandidateRefs += 1;
      if (!candidates.has(ref)) failures.push(`${label}: unknown contraction row ${ref}`);
    }
    if (new Set(refs).size !== refs.length) {
      failures.push(`${label}: prime_contraction_refs must be unique`);
    }

    const acceptanceRefs = ACCEPTANCE_FIELDS.flatMap((key) =>
      metadataRefs(metadata, key, /\.ai-workspace\/comments\/[A-Za-z0-9_.\/-]+\.md/gu)
    );
    const designRefs = DESIGN_FIELDS.flatMap((key) =>
      metadataRefs(
        metadata,
        key,
        /build_tenants\/abiogenesis\/typescript\/design\/[A-Za-z0-9_.\/-]+\.md/gu
      )
    );
    if (new Set(designRefs).size !== designRefs.length) {
      failures.push(`${label}: design references must be unique`);
    }
    for (const acceptanceRef of acceptanceRefs) {
      localPath(projectRoot, acceptanceRef, label, failures);
    }

    if (acceptanceRefs.length === 0) {
      pendingDesigns += 1;
      for (const designRef of designRefs) {
        const designPath = localPath(projectRoot, designRef, label, failures);
        if (designPath !== null && /^\*\*Status\*\*:\s*(?:Accepted|F_H-authorized)/mu.test(
          readFileSync(designPath, "utf8")
        )) {
          failures.push(`${label}: accepted design has no acceptance reference`);
        }
      }
      continue;
    }

    acceptedDesigns += 1;
    if (designRefs.length === 0) {
      failures.push(`${label}: accepted Prime-governed ticket has no design reference`);
      continue;
    }
    for (const designRef of designRefs) {
      const designPath = localPath(projectRoot, designRef, label, failures);
      if (designPath === null) continue;
      const designSource = readFileSync(designPath, "utf8");
      if (!/^\*\*Status\*\*:\s*(?:Accepted|F_H-authorized)/mu.test(designSource)) {
        failures.push(
          `${toPosix(path.relative(projectRoot, designPath))}: accepted ticket names a non-accepted design`
        );
      }
      const review = inspectPrimeContractionReview({
        source: designSource,
        label: toPosix(path.relative(projectRoot, designPath)),
        expectedOwnerTicket: ticketId
      });
      failures.push(...review.failures);
    }
  }

  if (checkedTickets === 0) {
    failures.push("prime governance: no governed tickets found");
  }
  return Object.freeze({
    status: failures.length === 0 ? "passed" : "failed",
    checkedTickets,
    acceptedDesigns,
    pendingDesigns,
    checkedCandidateRefs,
    candidateCount: candidates.size,
    failures: Object.freeze(failures)
  });
}

if (
  process.argv[1] !== undefined &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const result = inspectPrimeContractionGovernance();
  process.stdout.write(`${JSON.stringify(result)}\n`);
  if (result.status !== "passed") process.exitCode = 1;
}
