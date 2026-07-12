// Validates: T-195/T-250 constitutional docs version roles and rc3 integrity.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { typecheckGtlProgram } from "../../build/semantic/code/src/abg/m03/contracts/gtl_program_conformance.js";

const TENANT_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  ".."
);
const REPO_ROOT = path.resolve(TENANT_ROOT, "..", "..", "..");
const RC3 = "4.6.0-rc.3";
const SOURCE_VERSION = "5.0.0-dev.0";
const SOURCE_SUBJECT = Object.freeze({
  kind: "source_project",
  subjectRef: "source-project://abiogenesis/typescript/main"
});
const RC3_SUBJECT = Object.freeze({
  kind: "published_rc_cut",
  subjectRef: "published-rc-cut://abiogenesis/typescript/4.6.0-rc.3"
});
const SEMVER_CLAIM = /\b\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?\b/g;
const EXPECTED_DOC_CLAIMS = Object.freeze({
  "README.md": Object.freeze([
    { version: RC3, role: "published_rc_cut" }
  ]),
  "docs/README.md": Object.freeze([
    { version: RC3, role: "published_rc_cut" },
    { version: RC3, role: "published_rc_cut" }
  ]),
  "docs/USER_GUIDE.md": Object.freeze([
    { version: RC3, role: "published_rc_cut" },
    { version: RC3, role: "published_rc_cut" },
    { version: RC3, role: "published_rc_cut" }
  ]),
  "docs/LLM_GTL_APP_BUILDER_GUIDE.md": Object.freeze([
    { version: RC3, role: "published_rc_cut" },
    { version: SOURCE_VERSION, role: "source_project" },
    { version: SOURCE_VERSION, role: "source_project" },
    { version: SOURCE_VERSION, role: "source_project" },
    { version: SOURCE_VERSION, role: "source_project" },
    { version: SOURCE_VERSION, role: "source_project" }
  ])
});

function sha256(text) {
  return createHash("sha256").update(text).digest("hex");
}

function git(...args) {
  return execFileSync("git", args, { cwd: REPO_ROOT, encoding: "utf8" }).trim();
}

function gitFile(ref, relativePath) {
  return execFileSync("git", ["show", `${ref}:${relativePath}`], {
    cwd: REPO_ROOT,
    encoding: "utf8"
  });
}

function versionClaims(text) {
  return [...text.replaceAll(".tgz", "").matchAll(SEMVER_CLAIM)].map((match) => ({
    version: match[0],
    index: match.index
  }));
}

test("T-195: every release-facing SemVer claim has one explicit source or published-RC role", () => {
  const packageJson = JSON.parse(
    readFileSync(path.join(TENANT_ROOT, "package.json"), "utf8")
  );
  assert.equal(packageJson.version, SOURCE_VERSION);
  const rows = [];
  const bindings = [];
  for (const [relativePath, expectedClaims] of Object.entries(
    EXPECTED_DOC_CLAIMS
  )) {
    const text = readFileSync(path.join(REPO_ROOT, relativePath), "utf8");
    const observed = versionClaims(text);
    assert.deepEqual(
      observed.map((claim, index) => ({
        version: claim.version,
        role: expectedClaims[index]?.role ?? "unclassified"
      })),
      expectedClaims,
      `${relativePath} gained, lost, reordered, or changed a version claim without a role`
    );
    observed.forEach((claim, index) => {
      const expected = expectedClaims[index];
      const surfaceRef = `workspace://${relativePath}#semver-${index + 1}`;
      const bindingRef = `binding://abiogenesis/docs/${relativePath}/semver-${index + 1}`;
      const subject =
        expected.role === "source_project" ? SOURCE_SUBJECT : RC3_SUBJECT;
      rows.push({
        surfaceRef,
        digest: `sha256:${sha256(text)}`,
        versionDisposition: "versioned",
        declaredVersion: claim.version,
        versionBindingRef: bindingRef,
        citedTicketRefs: []
      });
      bindings.push({
        bindingRef,
        surfaceRef,
        subject,
        authorityRef:
          expected.role === "source_project"
            ? "workspace://build_tenants/abiogenesis/typescript/package.json"
            : "git-tag://v4.6.0-rc.3"
      });
    });
  }
  assert.equal(rows.length, 12, "the reviewed guides plus root role census is exact");
  for (const relativePath of Object.keys(EXPECTED_DOC_CLAIMS)) {
    assert.doesNotMatch(
      readFileSync(path.join(REPO_ROOT, relativePath), "utf8"),
      /\b4\.1\b/,
      `${relativePath} retains an unclassified abbreviated current-line claim`
    );
  }
  const report = typecheckGtlProgram({
    constitutionalSurfaceRows: rows,
    constitutionalLiveFacts: {
      surfaceVersionBindings: bindings,
      versionFacts: [
        {
          subject: SOURCE_SUBJECT,
          version: packageJson.version,
          authorityRef:
            "workspace://build_tenants/abiogenesis/typescript/package.json"
        },
        {
          subject: RC3_SUBJECT,
          version: RC3,
          authorityRef: "git-tag://v4.6.0-rc.3"
        }
      ],
      activeTicketRefs: [],
      passthroughKeys: [],
      seamKeySets: []
    }
  });
  assert.deepEqual(
    report.issues.filter(
      (issue) => issue.surfaceKind === "constitutional_surface"
    ),
    []
  );
});

test("T-195: the docs census recognizes final and prerelease SemVer claims", () => {
  assert.deepEqual(
    versionClaims("final 4.5.1, rc 4.6.0-rc.3, source 5.0.0-dev.0").map(
      (claim) => claim.version
    ),
    ["4.5.1", "4.6.0-rc.3", "5.0.0-dev.0"]
  );
});

test("T-195: the current rc3 note is the immutable snapshot and tag note", () => {
  const snapshotRoot = path.join(
    REPO_ROOT,
    "release_snapshots",
    "abiogenesis-typescript-tenant",
    RC3
  );
  const noteText = readFileSync(
    path.join(REPO_ROOT, "docs", "ABIOGENESIS_RC_RELEASE_NOTE.md"),
    "utf8"
  );
  const snapshotNote = readFileSync(path.join(snapshotRoot, "release-note.md"), "utf8");
  const manifestText = readFileSync(
    path.join(snapshotRoot, "release-snapshot-manifest.json"),
    "utf8"
  );
  const manifest = JSON.parse(manifestText);
  const checksums = readFileSync(path.join(snapshotRoot, "checksums.sha256"), "utf8");
  const titleVersion = noteText.match(
    /^# abiogenesis (\S+) Release Candidate Note$/m
  )?.[1];
  const predecessor = noteText.match(/It\s+follows\s+`(\S+?)`/)?.[1];

  assert.equal(titleVersion, RC3);
  assert.equal(predecessor, "4.6.0-rc.2");
  assert.equal(noteText, snapshotNote);
  assert.equal(noteText, gitFile(`v${RC3}`, "docs/ABIOGENESIS_RC_RELEASE_NOTE.md"));
  assert.equal(
    snapshotNote,
    gitFile(
      `v${RC3}`,
      `release_snapshots/abiogenesis-typescript-tenant/${RC3}/release-note.md`
    )
  );
  assert.equal(
    manifestText,
    gitFile(
      `v${RC3}`,
      `release_snapshots/abiogenesis-typescript-tenant/${RC3}/release-snapshot-manifest.json`
    )
  );
  assert.equal(
    checksums,
    gitFile(
      `v${RC3}`,
      `release_snapshots/abiogenesis-typescript-tenant/${RC3}/checksums.sha256`
    )
  );
  assert.equal(manifest.releaseIdentity, RC3);
  assert.equal(manifest.package.packageVersion, RC3);
  assert.equal(manifest.sourceRef, "rc/4.6.0");
  assert.equal(manifest.rcBranch, "rc/4.6.0");
  assert.equal(manifest.sourceDirty, false);
  assert.equal(manifest.releaseNote.sha256, sha256(noteText));
  assert.match(
    checksums,
    new RegExp(`^${sha256(noteText)}  release-note\\.md$`, "m")
  );
  assert.match(
    checksums,
    new RegExp(
      `^${sha256(manifestText)}  release-snapshot-manifest\\.json$`,
      "m"
    )
  );

  assert.equal(git("cat-file", "-t", `v${RC3}`), "tag");
  const publicationCommit = git("rev-parse", `v${RC3}^{commit}`);
  assert.equal(manifest.sourceCommit, git("rev-parse", `${publicationCommit}^`));
  const taggedPackage = JSON.parse(
    git("show", `v${RC3}:build_tenants/abiogenesis/typescript/package.json`)
  );
  assert.equal(taggedPackage.version, RC3);

  const predecessorManifest = JSON.parse(
    readFileSync(
      path.join(
        REPO_ROOT,
        "release_snapshots",
        "abiogenesis-typescript-tenant",
        predecessor,
        "release-snapshot-manifest.json"
      ),
      "utf8"
    )
  );
  assert.equal(predecessorManifest.releaseIdentity, predecessor);
  assert.notEqual(predecessor, titleVersion);
});
