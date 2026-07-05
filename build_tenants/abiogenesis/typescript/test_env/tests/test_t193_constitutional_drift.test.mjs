// Validates: T-193 / REQ-L-GTL3-LAWS-028 (constitutional drift as typed
// conformance failure). Constructed differentials + the REAL-TREE witness.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import {
  typecheckGtlProgram,
  assertRatifiedGtlProgramDiagnosticId,
  GTL_PROGRAM_DEFAULT_ADMISSIBLE_REPAIRS
} from "../../build/semantic/code/src/abg/m03/contracts/gtl_program_conformance.js";
import { ENGINE_START_PASSTHROUGH_KEYS } from "../../build/semantic/code/src/abg/m03/index.js";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const TENANT_ROOT = path.resolve(HERE, "..", "..");
const REPO_ROOT = path.resolve(TENANT_ROOT, "..", "..", "..");

function sha256(text) {
  return `sha256:${createHash("sha256").update(text).digest("hex")}`;
}

function driftIssues(report) {
  return report.issues.filter((row) => row.surfaceKind === "constitutional_surface");
}

test("T-193 P3: version-line drift is a typed diagnostic with a repair affordance", () => {
  const report = typecheckGtlProgram({
    constitutionalSurfaceRows: [
      {
        surfaceRef: "workspace://CLAUDE.md",
        digest: "sha256:x",
        declaredVersion: "4.0.0-rc.6",
        citedTicketRefs: []
      }
    ],
    constitutionalLiveFacts: {
      packageVersion: "4.2.0-rc.7",
      activeTicketRefs: [],
      passthroughKeys: [],
      seamKeySets: []
    }
  });
  const hits = driftIssues(report).filter(
    (row) => row.ruleRef === "abg://gtl-program/constitution/version-line-drift"
  );
  assert.equal(hits.length, 1);
  assertRatifiedGtlProgramDiagnosticId(hits[0].ruleRef);
  assert.equal(
    GTL_PROGRAM_DEFAULT_ADMISSIBLE_REPAIRS[hits[0].ruleRef],
    "align_digest_or_version"
  );
  // clean when versions agree
  const clean = typecheckGtlProgram({
    constitutionalSurfaceRows: [
      { surfaceRef: "workspace://CLAUDE.md", digest: "sha256:x", declaredVersion: "4.2.0-rc.7", citedTicketRefs: [] }
    ],
    constitutionalLiveFacts: { packageVersion: "4.2.0-rc.7", activeTicketRefs: [], passthroughKeys: [], seamKeySets: [] }
  });
  assert.equal(
    driftIssues(clean).filter((r) => r.ruleRef.includes("version-line-drift")).length,
    0
  );
});

test("T-193 P3: the RC4 class — a release claim citing an ACTIVE ticket — is mechanically detected", () => {
  const report = typecheckGtlProgram({
    constitutionalSurfaceRows: [
      {
        surfaceRef: "workspace://specification/GOALS.md#release-rc4",
        digest: "sha256:y",
        declaredVersion: null,
        citedTicketRefs: ["T-188"]
      }
    ],
    constitutionalLiveFacts: {
      packageVersion: "4.2.0-rc.7",
      activeTicketRefs: ["T-188"],
      passthroughKeys: [],
      seamKeySets: []
    }
  });
  const hits = driftIssues(report).filter(
    (row) => row.ruleRef === "abg://gtl-program/constitution/release-claim-cites-active-ticket"
  );
  assert.equal(hits.length, 1);
  assert.equal(hits[0].message.includes("T-188"), true);
  assert.equal(GTL_PROGRAM_DEFAULT_ADMISSIBLE_REPAIRS[hits[0].ruleRef], "constitutional_reprice");
});

test("T-193 P3: seam parity drift (the F1 class) is a typed diagnostic", () => {
  const report = typecheckGtlProgram({
    constitutionalSurfaceRows: [],
    constitutionalLiveFacts: {
      packageVersion: "4.2.0-rc.7",
      activeTicketRefs: [],
      passthroughKeys: ["a", "b", "c"],
      seamKeySets: [
        { seamRef: "seam://cli/runtime-binding", keys: ["a", "b"] },
        { seamRef: "seam://m04/start-context", keys: ["a", "b", "c"] }
      ]
    }
  });
  const hits = driftIssues(report).filter(
    (row) => row.ruleRef === "abg://gtl-program/constitution/seam-parity-drift"
  );
  assert.equal(hits.length, 1);
  assert.equal(hits[0].surfaceRef, "seam://cli/runtime-binding");
});

test("T-193 P3: digestless witness rows fail closed; identity coverage changes the inventory digest", () => {
  const bad = typecheckGtlProgram({
    constitutionalSurfaceRows: [
      { surfaceRef: "workspace://x", digest: "", declaredVersion: null, citedTicketRefs: [] }
    ]
  });
  assert.equal(
    driftIssues(bad).some((r) => r.ruleRef === "abg://gtl-program/constitution/surface-digest-missing"),
    true
  );
  const a = typecheckGtlProgram({
    constitutionalSurfaceRows: [
      { surfaceRef: "workspace://a", digest: "sha256:a", declaredVersion: null, citedTicketRefs: [] }
    ]
  });
  const b = typecheckGtlProgram({
    constitutionalSurfaceRows: [
      { surfaceRef: "workspace://b", digest: "sha256:b", declaredVersion: null, citedTicketRefs: [] }
    ]
  });
  assert.notEqual(a.inventoryDigest, b.inventoryDigest, "witness rows must be identity-covered");
});

// ─── P4: the REAL-TREE witness — loaders witness reality, the compiler judges ───

function realTreeReport() {
  const packageJson = JSON.parse(
    readFileSync(path.join(TENANT_ROOT, "package.json"), "utf8")
  );
  const bootstrap = readFileSync(path.join(REPO_ROOT, "CLAUDE.md"), "utf8");
  const versionLine = bootstrap.match(/\*\*Version\*\*: ([^\n]+)/);
  const activeTicketRefs = readdirSync(
    path.join(REPO_ROOT, ".ai-workspace", "tickets", "active")
  )
    .filter((name) => name.startsWith("T-"))
    .map((name) => name.split("-").slice(0, 2).join("-"));
  const goals = readFileSync(
    path.join(REPO_ROOT, "specification", "GOALS.md"),
    "utf8"
  );
  // witness the latest release record's cited tickets (rc.7 paragraph)
  const rc7Block = goals.slice(goals.lastIndexOf("4.2.0-rc.7`:"));
  const citedTicketRefs = [...new Set((rc7Block.match(/T-\d+/g) ?? []))];
  return typecheckGtlProgram({
    constitutionalSurfaceRows: [
      {
        surfaceRef: "workspace://CLAUDE.md#bootstrap-version",
        digest: sha256(bootstrap),
        declaredVersion: versionLine ? versionLine[1].trim() : null,
        citedTicketRefs: []
      },
      {
        surfaceRef: "workspace://specification/GOALS.md#release-rc7",
        digest: sha256(rc7Block),
        declaredVersion: null,
        citedTicketRefs
      }
    ],
    constitutionalLiveFacts: {
      packageVersion: packageJson.version,
      activeTicketRefs,
      passthroughKeys: [...ENGINE_START_PASSTHROUGH_KEYS],
      seamKeySets: []
    }
  });
}

test("T-193 P4: the real tree is judged clean (post-fix) — drift detection is a standing gate", () => {
  const report = realTreeReport();
  const drift = driftIssues(report);
  assert.deepEqual(
    drift.map((row) => `${row.ruleRef} @ ${row.surfaceRef}`),
    [],
    "the real tree must carry no constitutional drift"
  );
});
