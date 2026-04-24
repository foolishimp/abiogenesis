# M05 Installed Sandbox Structural Carrier Diagram

**Status**: Completed
**Date**: 2026-04-24
**Derived from**: [M05_INSTALLED_SANDBOX_DERIVATION.md](./M05_INSTALLED_SANDBOX_DERIVATION.md), [M05_INSTALLED_SANDBOX_FIRST_SLICE_IACS.md](./M05_INSTALLED_SANDBOX_FIRST_SLICE_IACS.md), [T-022](../../.ai-workspace/tickets/completed/T-022-realize-typescript-m05-installed-sandbox-live-lane-and-archive-proof-under-explicit-installed-runtime-qualification-law.md)

## Purpose

Render the installed-line `M05` slice as one module-bounded Mermaid UML
carrier topology so Prime Rule, visibility, and deferred-family discipline are
inspectable before implementation starts.

## Diagram

```mermaid
classDiagram

class PublicInstallBootstrapOutcome {
  <<prime>>
  <<authoritative upstream>>
}

class PublicBootloaderOutcome {
  <<prime>>
  <<authoritative upstream>>
}

class InstalledSandboxQualificationRequest {
  <<prime>>
  <<authoritative>>
}

class InstalledSandboxQualificationOutcome {
  <<prime>>
  <<authoritative>>
}

class InstalledRootObservation {
  <<subordinate>>
  +rootPath: string
  +packageBinding: boolean
  +bootstrapImportPassed: boolean
  +liveScenarioPassed: boolean
}

class InstalledSandboxStepRef {
  <<subordinate>>
  +kind: string
  +valid: boolean
  +detail: string
}

class RunArchiveQualificationRequest {
  <<prime>>
  <<authoritative>>
}

class RunArchiveQualificationOutcome {
  <<prime>>
  <<authoritative>>
}

class RunArchiveFileRef {
  <<subordinate>>
  +path: string
  +kind: string
  +exists: boolean
}

class RunArchiveGapRef {
  <<subordinate>>
  +kind: string
  +ref: string
}

class ExternalLiveTransport {
  <<deferred>>
}

InstalledSandboxQualificationRequest --> PublicInstallBootstrapOutcome : consumes admitted
InstalledSandboxQualificationRequest --> PublicBootloaderOutcome : consumes admitted
InstalledSandboxQualificationRequest *-- InstalledRootObservation
InstalledSandboxQualificationOutcome *-- InstalledSandboxStepRef

RunArchiveQualificationRequest *-- RunArchiveFileRef
RunArchiveQualificationOutcome *-- RunArchiveGapRef

InstalledSandboxQualificationOutcome ..> ExternalLiveTransport : deferred later
RunArchiveQualificationOutcome ..> ExternalLiveTransport : deferred later
```

## Reading Rules

- `InstalledSandboxQualificationRequest` / `Outcome` and
  `RunArchiveQualificationRequest` / `Outcome` are the only prime outer
  carriers in this slice.
- completed `M04` delivery outcomes remain upstream authoritative truth.
- installed-root observations, installed step refs, archive file refs, and
  archive gap refs stay subordinate.
- external live-agent transport remains deferred so this slice does not
  silently absorb a later live qualification doctrine.

## Sign-Off Claim

This installed-line qualification diagram is lawful only if the future
TypeScript code:

- admits one closed installed proof request family,
- admits one closed archive proof request family,
- evaluates installed and archive proof over already observed delivery truth,
  and
- keeps external live-agent transport deferred until a successor ticket opens
  it.
