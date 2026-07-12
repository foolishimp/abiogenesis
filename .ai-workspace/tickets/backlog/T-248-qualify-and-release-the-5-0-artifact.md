# T-248 - Qualify And Release Stable ABIogenesis 5.0

- id: T-248
- title: Qualify and release stable ABIogenesis 5.0
- type: release
- ticket_category: release_qualification
- status: backlog
- goal: GOAL-035 stable ABIogenesis 5.0 baseline
- owner: abiogenesis
- priority: high
- governance_scope: RELEASE_METHOD, STDO Method
- change_class: realization_refactor
- re_entry_point: release_candidate
- created_at: 2026-07-12
- updated_at: 2026-07-13 (direct stable-release reprice)
- source_ticket: T-242
- admission_condition: >-
    T-249 is complete, every T-244 row admitted to 5.0 has closure evidence,
    and T-247 supplies one green exact-candidate compliance result
- dependencies:
  - completed T-244 exact 5.0 feature register
  - closure evidence for every retained T-244 row
  - completed T-247 self-conformance and qualification result
  - completed T-249 stable-baseline constitutional reprice

## Purpose

Own the immutable RC window, qualification, and direct final tap for the
feature-complete stable ABIogenesis 5.0 product.

The mutable 5.0 source project is authored and realized under STDO, accepted
three-view designs, GTL admission, the ABG semantic compiler, and the retained
T-244 feature gates. Release does not require ABIogenesis or odd_glc to build
5.0. Dogfooding begins only after stable 5.0 and belongs to the 5.0.1 wave.

## Scope

- Freeze one exact candidate whose source, package, public-contract catalog,
  schemas, generated assets, conformance manifest, proof inventory, and release
  metadata identify the same content.
- Run the T-244 row gates and T-247 compliance gate against those exact bytes.
- Pack and fresh-install without mutable-source imports or rebuild fallback.
- Prove the retained installed public paths, including Hello World, declared C
  execution, malformed GTL and F_P differentials, the complete operator loop,
  Consensus, result/replay, native operation, and the bounded Codex projection
  exactly as their constitutional requirements and accepted designs define
  them, with closure traced by T-244.
- Publish at least one immutable versioned RC, hold a bounded mutable RC window,
  and publish a new RC after any product-significant fix.
- Tap final `5.0.0` only through the reconciled version/release-asset delta
  allowed by RELEASE_METHOD, then rerun every affected deterministic, install,
  identity, and bounded behavior gate.

T-244 is the sole derived feature/gate traceability inventory over
constitutional scope. This ticket may aggregate or rerun owning evidence; it
may not reinterpret a missing row, create a second checker, or waive a
definition-bearing claim.

## No Second Rung

The following are expressly not dependencies of the 5.0 final tap:

- T-243 or any new 4.6 release;
- T-245/T-246 campaign evidence;
- odd_glc 1.0 maturation or release;
- a data-mapper campaign;
- released-over-released ABG/GLC pair evidence; or
- a self-host, self-build, or 5.0.0-as-odd_glc-project run.

Downstream compatibility required by an admitted T-244 row may use a bounded
fixture or currently released catalog evidence. It does not create a
cross-repository release dependency. Installed stable 5.0 plus later released
odd_glc 1.0 becomes the development product for 5.0.1 only after this ticket
closes.

## Closure Condition

One exact immutable ABIogenesis `5.0.0` release exists after a passed RC window.
Its Git ref, remote tag, tarball, manifest, checksums, public contracts,
installed identity, qualification snapshot, and cited row evidence identify
the same cut; a source-blind fresh install succeeds without rebuild; all
retained T-244 and T-247 gates are green; and the final release record is
pushed and independently addressable. Alternatively, F_H records one explicit
terminal release-window disposition under T-221's honesty standard.
