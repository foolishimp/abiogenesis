// Validates: T-277 project-wide Prime contraction design governance.

import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

import {
  inspectPrimeContractionGovernance,
  inspectPrimeContractionReview
} from "../gates/prime_contraction_gate.mjs";

function validReview(overrides = {}) {
  return {
    schemaVersion: 1,
    iacs: ["PrimeCarrier"],
    authoritativeCarriers: ["PrimeCarrier"],
    subordinatePayloads: ["Payload"],
    promotionTests: [
      {
        candidate: "PrimeCarrier",
        verdict: "promote",
        reason: "It owns one admitted boundary."
      }
    ],
    recurrenceReview: {
      status: "none_found",
      ref: "evidence://fixture/recurrence"
    },
    authoritySourceCount: { before: 1, after: 1 },
    authoringSourceCount: { before: 1, after: 1 },
    disposition: "retain_prime",
    ownerTicket: "T-900",
    ...overrides
  };
}

function designSource(review = validReview(), status = "Accepted") {
  return `# Fixture design

**Status**: ${status}

## Prime Contraction Review

\`\`\`json prime-contraction
${JSON.stringify(review, null, 2)}
\`\`\`
`;
}

test("T-277 governs the current Prime ticket and design inventory", () => {
  const result = inspectPrimeContractionGovernance();
  assert.equal(result.status, "passed", result.failures.join("\n"));
  assert.equal(result.checkedTickets, 7);
  assert.equal(result.acceptedDesigns, 1);
  assert.equal(result.pendingDesigns, 6);
  assert.equal(result.checkedCandidateRefs, 8);
  assert.equal(result.candidateCount, 13);
});

test("T-277 rejects a missing IACS", () => {
  const result = inspectPrimeContractionReview({
    source: designSource(validReview({
      iacs: [],
      authoritativeCarriers: []
    })),
    expectedOwnerTicket: "T-900"
  });
  assert.equal(result.status, "failed");
  assert.equal(result.failures.some((failure) => failure.includes("iacs")), true);
});

test("T-277 rejects an annotation-only Prime claim", () => {
  const result = inspectPrimeContractionReview({
    source: designSource(validReview({ promotionTests: [] })),
    expectedOwnerTicket: "T-900"
  });
  assert.equal(result.status, "failed");
  assert.equal(
    result.failures.some((failure) => failure.includes("annotation-only")),
    true
  );
});

test("T-277 rejects unowned recurrence", () => {
  const result = inspectPrimeContractionReview({
    source: designSource(validReview({
      recurrenceReview: { status: "commonize_tenant", ref: "" },
      ownerTicket: ""
    })),
    expectedOwnerTicket: "T-900"
  });
  assert.equal(result.status, "failed");
  assert.equal(
    result.failures.some((failure) => failure.includes("owning evidence ref")),
    true
  );
  assert.equal(
    result.failures.some((failure) => failure.includes("owner is required")),
    true
  );
});

test("T-277 rejects a contraction with no measured reduction", () => {
  const result = inspectPrimeContractionReview({
    source: designSource(validReview({
      disposition: "migrate_authority",
      authoritySourceCount: { before: 2, after: 2 },
      authoringSourceCount: { before: 2, after: 2 }
    })),
    expectedOwnerTicket: "T-900"
  });
  assert.equal(result.status, "failed");
  assert.equal(
    result.failures.some((failure) => failure.includes("does not reduce")),
    true
  );
});

test("T-277 rejects requirement reprice as accepted implementation design", () => {
  const result = inspectPrimeContractionReview({
    source: designSource(validReview({ disposition: "requirement_reprice" })),
    expectedOwnerTicket: "T-900"
  });
  assert.equal(result.status, "failed");
  assert.equal(
    result.failures.some((failure) => failure.includes("cannot be accepted")),
    true
  );
});

test("T-277 rejects an accepted design without an acceptance record", async (t) => {
  const root = await mkdtemp(path.join(tmpdir(), "abg-t277-prime-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const activeRoot = path.join(root, ".ai-workspace/tickets/active");
  const completedRoot = path.join(root, ".ai-workspace/tickets/completed");
  const designRoot = path.join(root, "build_tenants/abiogenesis/typescript/design");
  const adrRoot = path.join(designRoot, "adrs");
  await mkdir(activeRoot, { recursive: true });
  await mkdir(completedRoot, { recursive: true });
  await mkdir(adrRoot, { recursive: true });
  await writeFile(
    path.join(designRoot, "A5_PRIME_CONTRACTION_CENSUS.md"),
    "# Census\n\n### PC-001 - Fixture\n",
    "utf8"
  );
  await writeFile(
    path.join(adrRoot, "ADR-044-prime-contraction-is-a-cross-boundary-design-gate.md"),
    "# Governing ADR\n",
    "utf8"
  );
  await writeFile(
    path.join(designRoot, "FIXTURE_DESIGN.md"),
    designSource(),
    "utf8"
  );
  await writeFile(
    path.join(activeRoot, "T-900-fixture.md"),
    `# Fixture

- id: T-900
- status: active
- governing_prime_design_ref: build_tenants/abiogenesis/typescript/design/adrs/ADR-044-prime-contraction-is-a-cross-boundary-design-gate.md
- prime_contraction_refs:
  - PC-001
- design_ref: build_tenants/abiogenesis/typescript/design/FIXTURE_DESIGN.md

## Boundary
`,
    "utf8"
  );

  const result = inspectPrimeContractionGovernance({ projectRoot: root });
  assert.equal(result.status, "failed");
  assert.equal(
    result.failures.some((failure) =>
      failure.includes("accepted design has no acceptance reference")
    ),
    true
  );
});

test("T-277 inspects every accepted design_refs entry", async (t) => {
  const root = await mkdtemp(path.join(tmpdir(), "abg-t277-prime-multi-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const activeRoot = path.join(root, ".ai-workspace/tickets/active");
  const completedRoot = path.join(root, ".ai-workspace/tickets/completed");
  const commentsRoot = path.join(root, ".ai-workspace/comments/codex");
  const designRoot = path.join(root, "build_tenants/abiogenesis/typescript/design");
  const adrRoot = path.join(designRoot, "adrs");
  await mkdir(activeRoot, { recursive: true });
  await mkdir(completedRoot, { recursive: true });
  await mkdir(commentsRoot, { recursive: true });
  await mkdir(adrRoot, { recursive: true });
  await writeFile(
    path.join(designRoot, "A5_PRIME_CONTRACTION_CENSUS.md"),
    "# Census\n\n### PC-001 - Fixture\n",
    "utf8"
  );
  await writeFile(
    path.join(adrRoot, "ADR-044-prime-contraction-is-a-cross-boundary-design-gate.md"),
    designSource(validReview({ ownerTicket: "T-900" })),
    "utf8"
  );
  await writeFile(
    path.join(designRoot, "SECOND_DESIGN.md"),
    designSource(validReview({
      iacs: [],
      authoritativeCarriers: [],
      ownerTicket: "T-900"
    })),
    "utf8"
  );
  await writeFile(
    path.join(commentsRoot, "accept.md"),
    "# Explicit acceptance\n",
    "utf8"
  );
  await writeFile(
    path.join(activeRoot, "T-900-fixture.md"),
    `# Fixture

- id: T-900
- status: active
- governing_prime_design_ref: build_tenants/abiogenesis/typescript/design/adrs/ADR-044-prime-contraction-is-a-cross-boundary-design-gate.md
- prime_contraction_refs:
  - PC-001
- design_acceptance_ref: .ai-workspace/comments/codex/accept.md
- design_refs:
  - build_tenants/abiogenesis/typescript/design/adrs/ADR-044-prime-contraction-is-a-cross-boundary-design-gate.md
  - build_tenants/abiogenesis/typescript/design/SECOND_DESIGN.md

## Boundary
`,
    "utf8"
  );

  const result = inspectPrimeContractionGovernance({ projectRoot: root });
  assert.equal(result.status, "failed");
  assert.equal(
    result.failures.some((failure) => failure.includes("SECOND_DESIGN.md") && failure.includes("iacs")),
    true
  );
});
