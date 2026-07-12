// Validates: T-193/T-250 / REQ-L-GTL3-LAWS-028.
import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  typecheckGtlProgram,
  assertRatifiedGtlProgramDiagnosticId,
  GTL_PROGRAM_DEFAULT_ADMISSIBLE_REPAIRS
} from "../../build/semantic/code/src/abg/m03/contracts/gtl_program_conformance.js";
import { ENGINE_START_PASSTHROUGH_KEYS } from "../../build/semantic/code/src/abg/m03/index.js";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const TENANT_ROOT = path.resolve(HERE, "..", "..");
const REPO_ROOT = path.resolve(TENANT_ROOT, "..", "..", "..");
const SOURCE_SUBJECT = Object.freeze({
  kind: "source_project",
  subjectRef: "source-project://abiogenesis/typescript/main"
});
const RC3_SUBJECT = Object.freeze({
  kind: "published_rc_cut",
  subjectRef: "published-rc-cut://abiogenesis/typescript/4.6.0-rc.3"
});

function sha256(text) {
  return `sha256:${createHash("sha256").update(text).digest("hex")}`;
}

function versionedSurface(surfaceRef, version, bindingRef, citedTicketRefs = []) {
  return {
    surfaceRef,
    digest: `sha256:${surfaceRef}`,
    versionDisposition: "versioned",
    declaredVersion: version,
    versionBindingRef: bindingRef,
    citedTicketRefs
  };
}

function unversionedSurface(surfaceRef, citedTicketRefs = []) {
  return {
    surfaceRef,
    digest: `sha256:${surfaceRef}`,
    versionDisposition: "unversioned",
    declaredVersion: null,
    versionBindingRef: null,
    citedTicketRefs
  };
}

function versionBinding(bindingRef, surfaceRef, subject, authorityRef = "authority://test") {
  return { bindingRef, surfaceRef, subject, authorityRef };
}

function versionFact(subject, version, authorityRef = "authority://test") {
  return { subject, version, authorityRef };
}

function liveFacts(overrides = {}) {
  return {
    surfaceVersionBindings: [],
    versionFacts: [],
    activeTicketRefs: [],
    passthroughKeys: [],
    seamKeySets: [],
    ...overrides
  };
}

function driftIssues(report) {
  return report.issues.filter(
    (row) => row.surfaceKind === "constitutional_surface"
  );
}

function basisIssues(report) {
  return driftIssues(report).filter(
    (row) =>
      row.ruleRef ===
      "abg://gtl-program/constitution/version-basis-unresolved"
  );
}

test("T-250: all five version subjects compare only through an exact separate binding", () => {
  const subjects = [
    SOURCE_SUBJECT,
    RC3_SUBJECT,
    {
      kind: "release_cut",
      subjectRef: "release-cut://abiogenesis/typescript/5.0.0"
    },
    { kind: "product", subjectRef: "product://abiogenesis/typescript/5.0.0" },
    {
      kind: "installed_product",
      subjectRef: "installed-product://workspace/demo/abiogenesis/5.0.0"
    }
  ];
  const rows = subjects.map((subject, index) =>
    versionedSurface(
      `workspace://surface-${index}`,
      `${index + 1}.0.0`,
      `binding://surface-${index}`
    )
  );
  const report = typecheckGtlProgram({
    constitutionalSurfaceRows: rows,
    constitutionalLiveFacts: liveFacts({
      surfaceVersionBindings: rows.map((row, index) =>
        versionBinding(row.versionBindingRef, row.surfaceRef, subjects[index])
      ),
      versionFacts: subjects.map((subject, index) =>
        versionFact(subject, `${index + 1}.0.0`)
      )
    })
  });
  assert.deepEqual(driftIssues(report), []);
});

test("T-250: same-subject version drift accumulates with ticket and seam drift", () => {
  const surfaceRef = "workspace://CLAUDE.md";
  const report = typecheckGtlProgram({
    constitutionalSurfaceRows: [
      versionedSurface(surfaceRef, "4.0.0-rc.6", "binding://claude", ["T-188"])
    ],
    constitutionalLiveFacts: liveFacts({
      surfaceVersionBindings: [
        versionBinding("binding://claude", surfaceRef, RC3_SUBJECT)
      ],
      versionFacts: [versionFact(RC3_SUBJECT, "4.2.0-rc.7")],
      activeTicketRefs: ["T-188"],
      passthroughKeys: ["a", "b"],
      seamKeySets: [{ seamRef: "seam://cli", keys: ["a"] }]
    })
  });
  const ids = driftIssues(report).map((row) => row.ruleRef);
  assert.deepEqual(ids, [
    "abg://gtl-program/constitution/version-line-drift",
    "abg://gtl-program/constitution/release-claim-cites-active-ticket",
    "abg://gtl-program/constitution/seam-parity-drift"
  ]);
  assertRatifiedGtlProgramDiagnosticId(ids[0]);
  assert.equal(
    GTL_PROGRAM_DEFAULT_ADMISSIBLE_REPAIRS[ids[0]],
    "align_digest_or_version"
  );
});

test("T-250: every unresolved basis reason maps to its exact existing repair", () => {
  const surfaceRef = "workspace://versioned";
  const row = versionedSurface(surfaceRef, "1.0.0", "binding://versioned");
  const cases = [
    {
      reason: "surface_binding_missing",
      repair: "add_missing_declaration",
      facts: liveFacts({ versionFacts: [versionFact(SOURCE_SUBJECT, "1.0.0")] })
    },
    {
      reason: "surface_binding_ambiguous",
      repair: "remove_duplicate_declaration",
      facts: liveFacts({
        surfaceVersionBindings: [
          versionBinding(row.versionBindingRef, surfaceRef, SOURCE_SUBJECT),
          versionBinding(row.versionBindingRef, surfaceRef, SOURCE_SUBJECT)
        ],
        versionFacts: [versionFact(SOURCE_SUBJECT, "1.0.0")]
      })
    },
    {
      reason: "version_fact_missing",
      repair: "add_missing_declaration",
      facts: liveFacts({
        surfaceVersionBindings: [
          versionBinding(row.versionBindingRef, surfaceRef, SOURCE_SUBJECT)
        ]
      })
    },
    {
      reason: "version_fact_ambiguous",
      repair: "remove_duplicate_declaration",
      facts: liveFacts({
        surfaceVersionBindings: [
          versionBinding(row.versionBindingRef, surfaceRef, SOURCE_SUBJECT)
        ],
        versionFacts: [
          versionFact(SOURCE_SUBJECT, "1.0.0"),
          versionFact(SOURCE_SUBJECT, "1.0.0")
        ]
      })
    }
  ];
  for (const fixture of cases) {
    const report = typecheckGtlProgram({
      constitutionalSurfaceRows: [row],
      constitutionalLiveFacts: fixture.facts
    });
    const hit = basisIssues(report).find((issue) =>
      issue.message.includes(`(${fixture.reason})`)
    );
    assert.notEqual(hit, undefined, fixture.reason);
    assertRatifiedGtlProgramDiagnosticId(hit.ruleRef);
    assert.equal(
      GTL_PROGRAM_DEFAULT_ADMISSIBLE_REPAIRS[hit.ruleRef],
      undefined,
      "basis repairs are reason-specific, not one misleading default"
    );
    assert.equal(hit.admissibleRepairs.length, 1);
    assert.equal(hit.admissibleRepairs[0].editClass, fixture.repair);
  }
});

test("T-250: kind/ref incoherence is retained and cannot fabricate a binding", () => {
  const surfaceRef = "workspace://kind-mismatch";
  const report = typecheckGtlProgram({
    constitutionalSurfaceRows: [
      versionedSurface(surfaceRef, "1.0.0", "binding://kind-mismatch")
    ],
    constitutionalLiveFacts: liveFacts({
      surfaceVersionBindings: [
        versionBinding(
          "binding://kind-mismatch",
          surfaceRef,
          {
            kind: "product",
            subjectRef: "source-project://abiogenesis/typescript/main"
          }
        )
      ],
      versionFacts: [versionFact(SOURCE_SUBJECT, "1.0.0")]
    })
  });
  const incoherent = basisIssues(report).find((issue) =>
    issue.message.includes("(subject_kind_ref_incoherent)")
  );
  assert.notEqual(incoherent, undefined);
  assert.equal(incoherent.admissibleRepairs[0].editClass, "correct_reference");
  assert.equal(
    basisIssues(report).some((issue) =>
      issue.message.includes("(surface_binding_missing)")
    ),
    true,
    "the rejected row must not become an authority binding"
  );
});

test("T-250: missing live facts fails a versioned row and preserves unversioned ticket checks", () => {
  const versioned = typecheckGtlProgram({
    constitutionalSurfaceRows: [
      versionedSurface("workspace://versioned", "1.0.0", "binding://missing")
    ]
  });
  assert.equal(
    basisIssues(versioned).some((row) =>
      row.message.includes("(surface_binding_missing)")
    ),
    true
  );

  const conserved = typecheckGtlProgram({
    constitutionalSurfaceRows: [
      versionedSurface(
        "workspace://conserved",
        "1.0.0",
        "binding://missing",
        ["T-250"]
      )
    ],
    constitutionalLiveFacts: liveFacts({
      activeTicketRefs: ["T-250"],
      passthroughKeys: ["a", "b"],
      seamKeySets: [{ seamRef: "seam://conserved", keys: ["a"] }]
    })
  });
  assert.deepEqual(
    driftIssues(conserved).map((row) => row.ruleRef),
    [
      "abg://gtl-program/constitution/version-basis-unresolved",
      "abg://gtl-program/constitution/release-claim-cites-active-ticket",
      "abg://gtl-program/constitution/seam-parity-drift"
    ]
  );

  const unversioned = typecheckGtlProgram({
    constitutionalSurfaceRows: [
      unversionedSurface("workspace://GOALS.md", ["T-250"])
    ],
    constitutionalLiveFacts: liveFacts({ activeTicketRefs: ["T-250"] })
  });
  assert.equal(basisIssues(unversioned).length, 0);
  assert.equal(
    driftIssues(unversioned).some(
      (row) =>
        row.ruleRef ===
        "abg://gtl-program/constitution/release-claim-cites-active-ticket"
    ),
    true
  );
});

test("T-250: stale surface plus matching stale fact fails without separate authority", () => {
  const report = typecheckGtlProgram({
    constitutionalSurfaceRows: [
      versionedSurface("workspace://stale", "4.5.1", "binding://not-admitted")
    ],
    constitutionalLiveFacts: liveFacts({
      versionFacts: [versionFact(RC3_SUBJECT, "4.5.1")]
    })
  });
  assert.equal(basisIssues(report).length, 1);
  assert.match(basisIssues(report)[0].message, /surface_binding_missing/);
});

test("T-250: closed raw admission rejects legacy and malformed live facts", () => {
  for (const constitutionalLiveFacts of [
    {
      packageVersion: "5.0.0-dev.0",
      surfaceVersionBindings: [],
      versionFacts: [],
      activeTicketRefs: [],
      passthroughKeys: [],
      seamKeySets: []
    },
    liveFacts({ activeTicketRefs: [17] }),
    liveFacts({ seamKeySets: [{ seamRef: "seam://x", keys: [], extra: true }] }),
    liveFacts({
      surfaceVersionBindings: [
        {
          ...versionBinding(
            "binding://extra",
            "workspace://extra",
            SOURCE_SUBJECT
          ),
          extra: true
        }
      ]
    }),
    liveFacts({
      surfaceVersionBindings: [
        {
          bindingRef: "binding://missing-authority",
          surfaceRef: "workspace://missing-authority",
          subject: SOURCE_SUBJECT
        }
      ]
    }),
    liveFacts({
      versionFacts: [{ ...versionFact(SOURCE_SUBJECT, "1.0.0"), extra: true }]
    }),
    liveFacts({
      versionFacts: [
        { subject: SOURCE_SUBJECT, version: 100, authorityRef: "authority://test" }
      ]
    })
  ]) {
    const report = typecheckGtlProgram({ constitutionalLiveFacts });
    assert.equal(
      driftIssues(report).some(
        (row) =>
          row.ruleRef ===
          "abg://gtl-program/input/constitutional-surface-row"
      ),
      true
    );
  }
});

test("T-250: malformed basis input cannot hide valid ticket or seam drift", () => {
  const surfaceRef = "workspace://malformed-basis-conservation";
  const report = typecheckGtlProgram({
    constitutionalSurfaceRows: [
      versionedSurface(
        surfaceRef,
        "1.0.0",
        "binding://malformed-basis",
        ["T-250"]
      )
    ],
    constitutionalLiveFacts: {
      ...liveFacts({
        surfaceVersionBindings: [
          versionBinding(
            "binding://malformed-basis",
            surfaceRef,
            SOURCE_SUBJECT
          )
        ],
        versionFacts: [
          versionFact(
            {
              kind: "product",
              subjectRef: "source-project://abiogenesis/typescript/main"
            },
            "1.0.0"
          )
        ],
        activeTicketRefs: ["T-250"],
        passthroughKeys: ["a", "b"],
        seamKeySets: [{ seamRef: "seam://malformed-basis", keys: ["a"] }]
      }),
      unknownLegacyField: true
    }
  });
  const ids = driftIssues(report).map((row) => row.ruleRef);
  assert.equal(
    ids.includes("abg://gtl-program/constitution/version-basis-unresolved"),
    true
  );
  assert.equal(
    ids.includes(
      "abg://gtl-program/constitution/release-claim-cites-active-ticket"
    ),
    true
  );
  assert.equal(
    ids.includes("abg://gtl-program/constitution/seam-parity-drift"),
    true
  );
});

test("T-193: digestless and malformed surface rows fail closed; inventory is identity-covered", () => {
  const bad = typecheckGtlProgram({
    constitutionalSurfaceRows: [
      { ...unversionedSurface("workspace://x"), digest: "" },
      {
        surfaceRef: "workspace://legacy",
        digest: "sha256:x",
        declaredVersion: null,
        citedTicketRefs: []
      }
    ]
  });
  assert.equal(
    driftIssues(bad).some(
      (row) =>
        row.ruleRef ===
        "abg://gtl-program/constitution/surface-digest-missing"
    ),
    true
  );
  assert.equal(
    driftIssues(bad).some(
      (row) =>
        row.ruleRef ===
        "abg://gtl-program/input/constitutional-surface-row"
    ),
    true
  );
  const a = typecheckGtlProgram({
    constitutionalSurfaceRows: [unversionedSurface("workspace://a")]
  });
  const b = typecheckGtlProgram({
    constitutionalSurfaceRows: [unversionedSurface("workspace://b")]
  });
  assert.notEqual(a.inventoryDigest, b.inventoryDigest);

  const surface = versionedSurface(
    "workspace://identity-covered",
    "1.0.0",
    "binding://identity-covered"
  );
  const exactFacts = liveFacts({
    surfaceVersionBindings: [
      versionBinding(
        surface.versionBindingRef,
        surface.surfaceRef,
        SOURCE_SUBJECT,
        "authority://binding/a"
      )
    ],
    versionFacts: [versionFact(SOURCE_SUBJECT, "1.0.0", "authority://fact/a")]
  });
  const base = typecheckGtlProgram({
    constitutionalSurfaceRows: [surface],
    constitutionalLiveFacts: exactFacts
  });
  const bindingMutation = typecheckGtlProgram({
    constitutionalSurfaceRows: [surface],
    constitutionalLiveFacts: {
      ...exactFacts,
      surfaceVersionBindings: [
        { ...exactFacts.surfaceVersionBindings[0], authorityRef: "authority://binding/b" }
      ]
    }
  });
  const factMutation = typecheckGtlProgram({
    constitutionalSurfaceRows: [surface],
    constitutionalLiveFacts: {
      ...exactFacts,
      versionFacts: [
        { ...exactFacts.versionFacts[0], authorityRef: "authority://fact/b" }
      ]
    }
  });
  for (const mutation of [bindingMutation, factMutation]) {
    assert.notEqual(
      base.inventoryDigests.constitutionalLiveFacts,
      mutation.inventoryDigests.constitutionalLiveFacts
    );
    assert.notEqual(base.inventoryDigest, mutation.inventoryDigest);
  }
});

function gitFile(ref, relativePath) {
  return execFileSync("git", ["show", `${ref}:${relativePath}`], {
    cwd: REPO_ROOT,
    encoding: "utf8"
  });
}

function realTreeReport() {
  const packageText = readFileSync(path.join(TENANT_ROOT, "package.json"), "utf8");
  const packageJson = JSON.parse(packageText);
  const claude = readFileSync(path.join(REPO_ROOT, "CLAUDE.md"), "utf8");
  const agents = readFileSync(path.join(REPO_ROOT, "AGENTS.md"), "utf8");
  assert.equal(claude, gitFile("v4.6.0-rc.3", "CLAUDE.md"));
  assert.equal(agents, gitFile("v4.6.0-rc.3", "AGENTS.md"));
  const surfaces = [
    versionedSurface(
      "workspace://build_tenants/abiogenesis/typescript/package.json#version",
      packageJson.version,
      "binding://abiogenesis/source-package"
    ),
    versionedSurface(
      "workspace://CLAUDE.md#bootstrap-version",
      claude.match(/\*\*Version\*\*: ([^\n]+)/)?.[1].trim(),
      "binding://abiogenesis/claude-rc3"
    ),
    versionedSurface(
      "workspace://AGENTS.md#bootstrap-version",
      agents.match(/\*\*Version\*\*: ([^\n]+)/)?.[1].trim(),
      "binding://abiogenesis/agents-rc3"
    )
  ];
  surfaces[0].digest = sha256(packageText);
  surfaces[1].digest = sha256(claude);
  surfaces[2].digest = sha256(agents);
  return typecheckGtlProgram({
    constitutionalSurfaceRows: surfaces,
    constitutionalLiveFacts: liveFacts({
      surfaceVersionBindings: [
        versionBinding(
          surfaces[0].versionBindingRef,
          surfaces[0].surfaceRef,
          SOURCE_SUBJECT,
          "workspace://build_tenants/abiogenesis/typescript/package.json"
        ),
        versionBinding(
          surfaces[1].versionBindingRef,
          surfaces[1].surfaceRef,
          RC3_SUBJECT,
          "git-tag://v4.6.0-rc.3/CLAUDE.md"
        ),
        versionBinding(
          surfaces[2].versionBindingRef,
          surfaces[2].surfaceRef,
          RC3_SUBJECT,
          "git-tag://v4.6.0-rc.3/AGENTS.md"
        )
      ],
      versionFacts: [
        versionFact(
          SOURCE_SUBJECT,
          packageJson.version,
          "workspace://build_tenants/abiogenesis/typescript/package.json"
        ),
        versionFact(RC3_SUBJECT, "4.6.0-rc.3", "git-tag://v4.6.0-rc.3")
      ],
      passthroughKeys: [...ENGINE_START_PASSTHROUGH_KEYS]
    })
  });
}

test("T-250: real source and immutable rc3 surfaces coexist without false drift", () => {
  const report = realTreeReport();
  assert.deepEqual(
    driftIssues(report).map((row) => `${row.ruleRef} @ ${row.surfaceRef}`),
    []
  );
});
