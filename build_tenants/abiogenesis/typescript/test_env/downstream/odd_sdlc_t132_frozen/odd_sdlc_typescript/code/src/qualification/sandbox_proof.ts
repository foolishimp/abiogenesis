// Implements: REQ-F-ODDSDLC-040
// Implements: REQ-F-ODDSDLC-043
// Investigates: T-047

const ODD_SDLC_PRE_REFACTOR_SANDBOX_EVENTS = [
  "ingress_report_derived",
  "gtl_module_constructed",
  "query_domain_projected",
  "worker_attachment_admitted",
  "public_start_projected",
  "gap_dossier_derived",
  "hook_turn_completed",
  "requirement_closure_projected",
  "gap_route_bound",
  "ticket_route_projected",
  "operational_build_result_admitted",
  "runtime_return_observed"
] as const;

export type OddSdlcPreRefactorSandboxEvent =
  (typeof ODD_SDLC_PRE_REFACTOR_SANDBOX_EVENTS)[number];

export const ODD_SDLC_PRE_REFACTOR_SANDBOX_EVENT_SEQUENCE:
  readonly OddSdlcPreRefactorSandboxEvent[] = Object.freeze([
    ...ODD_SDLC_PRE_REFACTOR_SANDBOX_EVENTS
  ]);

export type OddSdlcSandboxVerdict = "passed" | "failed";
export type OddSdlcSandboxFixtureAuthority =
  | "portable_rc_lane"
  | "forensic_local_reference";

export interface OddSdlcSandboxObservedEvent {
  readonly event: OddSdlcPreRefactorSandboxEvent;
  readonly carrierKind: string;
  readonly graphFunctionName: string | null;
  readonly evidenceRef: string;
}

export interface OddSdlcSandboxScenarioAuthority {
  readonly ticket: "T-047";
  readonly requirements: readonly string[];
  readonly design: readonly string[];
  readonly testSurfaceMap: string;
}

export interface OddSdlcSandboxArchiveInput {
  readonly scenarioId: string;
  readonly scenarioAuthority: OddSdlcSandboxScenarioAuthority;
  readonly command: string;
  readonly packageRoot: string;
  readonly archiveRoot: string;
  readonly fixtureMode: string;
  readonly fixtureSource: string;
  readonly startedAt: string;
  readonly endedAt: string;
  readonly elapsedMs: number;
  readonly events: readonly OddSdlcSandboxObservedEvent[];
  readonly graphFunctionsExercised: readonly string[];
  readonly carriersAdmitted: readonly string[];
  readonly diagnostics: readonly string[];
  readonly residualGaps: readonly string[];
}

export interface OddSdlcSandboxSequenceEvaluation {
  readonly expectedEventSequence: readonly OddSdlcPreRefactorSandboxEvent[];
  readonly actualEventSequence: readonly OddSdlcPreRefactorSandboxEvent[];
  readonly sequenceMatches: boolean;
  readonly mismatchDiagnostics: readonly string[];
}

export interface OddSdlcSandboxRunArchive {
  readonly kind: "odd_sdlc_typescript_pre_refactor_sandbox_run_archive";
  readonly ticketId: "T-047";
  readonly scenarioId: string;
  readonly scenarioAuthority: OddSdlcSandboxScenarioAuthority;
  readonly command: string;
  readonly packageRoot: string;
  readonly archiveRoot: string;
  readonly fixtureMode: string;
  readonly fixtureSource: string;
  readonly fixtureAuthority: OddSdlcSandboxFixtureAuthority;
  readonly startedAt: string;
  readonly endedAt: string;
  readonly elapsedMs: number;
  readonly expectedEventSequence: readonly OddSdlcPreRefactorSandboxEvent[];
  readonly actualEventSequence: readonly OddSdlcPreRefactorSandboxEvent[];
  readonly sequenceMatches: boolean;
  readonly events: readonly OddSdlcSandboxObservedEvent[];
  readonly graphFunctionsExercised: readonly string[];
  readonly carriersAdmitted: readonly string[];
  readonly diagnostics: readonly string[];
  readonly residualGaps: readonly string[];
  readonly verdict: OddSdlcSandboxVerdict;
}

function fixtureAuthorityForMode(
  fixtureMode: string
): OddSdlcSandboxFixtureAuthority {
  return fixtureMode === "portable_data_mapper_minimal_derivative"
    ? "portable_rc_lane"
    : "forensic_local_reference";
}

export function evaluateOddSdlcSandboxEventSequence(
  events: readonly OddSdlcSandboxObservedEvent[]
): OddSdlcSandboxSequenceEvaluation {
  const expectedEventSequence = ODD_SDLC_PRE_REFACTOR_SANDBOX_EVENT_SEQUENCE;
  const actualEventSequence = Object.freeze(events.map((entry) => entry.event));
  const mismatchDiagnostics: string[] = [];
  const maxLength = Math.max(
    expectedEventSequence.length,
    actualEventSequence.length
  );

  for (let index = 0; index < maxLength; index += 1) {
    const expected = expectedEventSequence[index];
    const actual = actualEventSequence[index];
    if (expected !== actual) {
      mismatchDiagnostics.push(
        `event[${index}] expected ${expected ?? "<none>"} but observed ${
          actual ?? "<none>"
        }`
      );
    }
  }

  return Object.freeze({
    expectedEventSequence,
    actualEventSequence,
    sequenceMatches: mismatchDiagnostics.length === 0,
    mismatchDiagnostics: Object.freeze(mismatchDiagnostics)
  });
}

export function buildOddSdlcSandboxRunArchive(
  input: OddSdlcSandboxArchiveInput
): OddSdlcSandboxRunArchive {
  if (!Number.isFinite(input.elapsedMs) || input.elapsedMs < 0) {
    throw new Error("elapsedMs must be a finite non-negative number");
  }

  const sequence = evaluateOddSdlcSandboxEventSequence(input.events);
  const diagnostics = Object.freeze([
    ...input.diagnostics,
    ...sequence.mismatchDiagnostics
  ]);

  return Object.freeze({
    kind: "odd_sdlc_typescript_pre_refactor_sandbox_run_archive",
    ticketId: "T-047",
    scenarioId: input.scenarioId,
    scenarioAuthority: input.scenarioAuthority,
    command: input.command,
    packageRoot: input.packageRoot,
    archiveRoot: input.archiveRoot,
    fixtureMode: input.fixtureMode,
    fixtureSource: input.fixtureSource,
    fixtureAuthority: fixtureAuthorityForMode(input.fixtureMode),
    startedAt: input.startedAt,
    endedAt: input.endedAt,
    elapsedMs: input.elapsedMs,
    expectedEventSequence: sequence.expectedEventSequence,
    actualEventSequence: sequence.actualEventSequence,
    sequenceMatches: sequence.sequenceMatches,
    events: input.events,
    graphFunctionsExercised: input.graphFunctionsExercised,
    carriersAdmitted: input.carriersAdmitted,
    diagnostics,
    residualGaps: input.residualGaps,
    verdict:
      diagnostics.length === 0 && sequence.sequenceMatches ? "passed" : "failed"
  });
}

export function summarizeOddSdlcSandboxRunArchive(
  archive: OddSdlcSandboxRunArchive
): {
  readonly kind: "odd_sdlc_typescript_pre_refactor_sandbox_summary";
  readonly ticketId: "T-047";
  readonly scenarioId: string;
  readonly verdict: OddSdlcSandboxVerdict;
  readonly elapsedMs: number;
  readonly expectedEventCount: number;
  readonly actualEventCount: number;
  readonly sequenceMatches: boolean;
  readonly graphFunctionCount: number;
  readonly carrierCount: number;
  readonly residualGapCount: number;
} {
  return Object.freeze({
    kind: "odd_sdlc_typescript_pre_refactor_sandbox_summary",
    ticketId: "T-047",
    scenarioId: archive.scenarioId,
    verdict: archive.verdict,
    elapsedMs: archive.elapsedMs,
    expectedEventCount: archive.expectedEventSequence.length,
    actualEventCount: archive.actualEventSequence.length,
    sequenceMatches: archive.sequenceMatches,
    graphFunctionCount: archive.graphFunctionsExercised.length,
    carrierCount: archive.carriersAdmitted.length,
    residualGapCount: archive.residualGaps.length
  });
}

export function renderOddSdlcSandboxPostmortem(
  archive: OddSdlcSandboxRunArchive
): string {
  const eventRows = archive.events
    .map(
      (entry, index) =>
        `${index + 1}. ${entry.event} | carrier=${entry.carrierKind} | graph_function=${
          entry.graphFunctionName ?? "none"
        } | evidence=${entry.evidenceRef}`
    )
    .join("\n");
  const graphFunctions = archive.graphFunctionsExercised
    .map((entry) => `- ${entry}`)
    .join("\n");
  const carriers = archive.carriersAdmitted
    .map((entry) => `- ${entry}`)
    .join("\n");
  const diagnostics =
    archive.diagnostics.length === 0
      ? "- none"
      : archive.diagnostics.map((entry) => `- ${entry}`).join("\n");
  const residualGaps =
    archive.residualGaps.length === 0
      ? "- none"
      : archive.residualGaps.map((entry) => `- ${entry}`).join("\n");

  return [
    "# odd_sdlc.TS T-047 Sandbox Postmortem",
    "",
    `Verdict: ${archive.verdict}`,
    `Scenario: ${archive.scenarioId}`,
    `Command: \`${archive.command}\``,
    `Archive: \`${archive.archiveRoot}\``,
    `Fixture: ${archive.fixtureMode} — ${archive.fixtureSource}`,
    `Fixture authority: ${archive.fixtureAuthority}`,
    `Started: ${archive.startedAt}`,
    `Ended: ${archive.endedAt}`,
    `Elapsed: ${archive.elapsedMs.toFixed(3)} ms`,
    "",
    "## Expected Event Sequence",
    "",
    archive.expectedEventSequence
      .map((entry, index) => `${index + 1}. ${entry}`)
      .join("\n"),
    "",
    "## Actual Event Sequence",
    "",
    archive.actualEventSequence
      .map((entry, index) => `${index + 1}. ${entry}`)
      .join("\n"),
    "",
    "## Event Evidence",
    "",
    eventRows,
    "",
    "## Graph Functions Exercised",
    "",
    graphFunctions,
    "",
    "## Carriers Admitted",
    "",
    carriers,
    "",
    "## Diagnostics",
    "",
    diagnostics,
    "",
    "## Residual Gaps",
    "",
    residualGaps,
    ""
  ].join("\n");
}
