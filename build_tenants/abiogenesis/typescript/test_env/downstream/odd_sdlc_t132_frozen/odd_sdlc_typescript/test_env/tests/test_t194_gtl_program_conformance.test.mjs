// Validates: T-194
// SDLC supplies its production inventory; ABG owns GTL program conformance law.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  formatGtlProgramConformanceIssues
} from "@abiogenesis/typescript-tenant";
import {
  STALE_ABG_IDENTITY_PATTERN,
  activeSdlcSourceIdentitySurfaces,
  constructCurrentSdlcGtlProgramConformanceInput,
  typecheckCurrentSdlcGtlProgram
} from "../../build/semantic/code/src/index.js";

function assertConformancePassed(report) {
  assert.equal(
    report.passed,
    true,
    formatGtlProgramConformanceIssues(report.issues)
  );
  assert.equal(report.issueCount, 0);
}

function assertTraversalUnitProjection({ input, report }) {
  const projection = report.traversalUnitProjection;
  assert.equal(
    projection.kind,
    "gtl_program_traversal_unit_projection"
  );
  assert.equal(
    projection.units.length,
    input.expectedCoverage.graphVectorCount
  );
  assert.equal(
    projection.entryUnits.length,
    input.expectedCoverage.publicStartTargetCount
  );

  const unitRefs = new Set(projection.units.map((unit) => unit.unitRef));
  assert.equal(unitRefs.size, projection.units.length);
  for (const unit of projection.units) {
    assert.equal(unit.kind, "gtl_program_traversal_unit_projection_row");
    assert.match(unit.unitRef, /^abg:\/\/gtl-program\/traversal-unit\/sha256:/u);
    assert.equal(unit.targetCarrierContractRefs.length, 1);
    assert.equal(unit.edgeClosureRefs.length, 1);
    assert.ok(unit.computeCompositionRefs.length > 0);
    assert.ok(unit.computeStageBindingRefs.length > 0);
    assert.ok(unit.pluginResultInterfaceRefs.length > 0);
    assert.ok(unit.consequencePluginResultInterfaceRefs.length > 0);
  }

  const entryByPublicStart = new Map(
    projection.entryUnits.map((entry) => [entry.publicStartRef, entry])
  );
  for (const entry of projection.entryUnits) {
    assert.equal(
      entry.kind,
      "gtl_program_traversal_entry_unit_projection_row"
    );
    assert.ok(entry.overlayRefs.length > 0);
    assert.ok(entry.entryUnitRefs.length > 0);
    for (const unitRef of entry.entryUnitRefs) {
      assert.equal(
        unitRefs.has(unitRef),
        true,
        `${entry.publicStartRef} resolves unknown traversal unit ${unitRef}`
      );
    }
  }

  for (const publicStartRef of [
    "bootstrap_release_self_test",
    "route_ticket_work_item"
  ]) {
    const entry = entryByPublicStart.get(publicStartRef);
    assert.notEqual(entry, undefined);
    assert.ok(entry.entryUnitRefs.length > 0);
  }
}

test("T-194 typechecks the current production SDLC GTL inventory", () => {
  const input = constructCurrentSdlcGtlProgramConformanceInput();
  const report = typecheckCurrentSdlcGtlProgram();

  assertConformancePassed(report);
  assertTraversalUnitProjection({ input, report });
  assert.equal(
    input.expectedCoverage.graphVectorCount,
    input.expectedCoverage.targetCarrierContractCount
  );
  assert.equal(
    input.expectedCoverage.graphVectorCount,
    input.expectedCoverage.edgeClosureContractCount
  );
  assert.equal(input.expectedCoverage.promptAssetCount, 3);
  assert.equal(input.expectedCoverage.pluginContractCount, 6);
  assert.ok(input.expectedCoverage.sourceIdentitySurfaceCount > 0);
  assert.ok(input.featureCoverageManifest.rows.length >= 26);
});

test("T-194 active SDLC source surfaces contain no stale ABG 3.x identities", () => {
  for (const sample of [
    "abg-3.7 policy carrier",
    "ABIogenesis 3.7.1-rc.1",
    "runtime://abg/3.8/saga-frontier",
    "@abiogenesis/typescript-tenant@3.9.0-rc.13",
    "old rc13 package alias"
  ]) {
    assert.match(sample, STALE_ABG_IDENTITY_PATTERN);
  }

  const staleHits = activeSdlcSourceIdentitySurfaces()
    .filter((row) => STALE_ABG_IDENTITY_PATTERN.test(row.text))
    .map((row) => row.surfaceRef);

  assert.deepEqual(staleHits, []);
});

test("T-194 GTL adapter binds traversal rows by graph/vector identity", () => {
  const source = readFileSync(
    new URL("../../code/src/gtl_conformance/program.ts", import.meta.url),
    "utf8"
  );

  assert.match(source, /function graphVectorRowIdentityKey/u);
  assert.doesNotMatch(source, /input\.targetCarrierContracts\[index\]/u);
  assert.match(source, /\(row\) => `\$\{row\.hostRef\}:\$\{row\.compositionRef\}`/u);
});
