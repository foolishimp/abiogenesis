# M05 Attached F_P Local Live Sandbox Structural Carrier Diagram

**Status**: Active
**Date**: 2026-04-27
**Derived from**: [M05_ATTACHED_FP_LOCAL_LIVE_SANDBOX_DERIVATION.md](./M05_ATTACHED_FP_LOCAL_LIVE_SANDBOX_DERIVATION.md), [M05_ATTACHED_FP_LOCAL_LIVE_SANDBOX_FIRST_SLICE_IACS.md](./M05_ATTACHED_FP_LOCAL_LIVE_SANDBOX_FIRST_SLICE_IACS.md), [T-085](../../../../.ai-workspace/tickets/backlog/T-085-prove-attached-fp-loop-through-local-live-installed-sandbox.md)

## Diagram

```mermaid
classDiagram

class InstalledTargetRoot {
  <<installed substrate>>
}

class InstalledPackageImport {
  <<package surface>>
}

class PublicStart {
  <<M04 entry>>
}

class AttachedWorkerPlugin {
  <<effect plugin>>
}

class RuntimeEvent {
  <<M03 truth>>
}

class SandboxArchive {
  <<M05 proof artifact>>
}

InstalledTargetRoot --> InstalledPackageImport : node_modules binding
InstalledPackageImport --> PublicStart : imports
PublicStart --> AttachedWorkerPlugin : effect call
AttachedWorkerPlugin --> PublicStart : attached artifact candidate
PublicStart --> RuntimeEvent : ABG emits assessed and retry truth
RuntimeEvent --> PublicStart : replay-derived re-entry
RuntimeEvent --> SandboxArchive : proof capture
InstalledTargetRoot --> SandboxArchive : install evidence
```

## Reading Rules

- The plugin is an effect boundary only.
- Runtime authority remains in ABG events and projection.
- The archive is evidence for qualification; it is not a second runtime truth
  source.

