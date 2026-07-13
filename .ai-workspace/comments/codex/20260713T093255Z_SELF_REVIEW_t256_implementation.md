# T-256 Implementation Self-Review

**Date**: 2026-07-13
**Ticket**: T-256
**Decision authority**: `20260713T083400Z_DECISION_fh_accept_t256_repaired_design.md`
**Verdict**: implementation complete; no confirmed closure blocker; independent review required

## Realized Boundary

T-256 now publishes one generic declared execution-context join. It compiles
strict GTL `Rule` profiles from replay-bound declaration Modules, derives
source schema/type/regime truth from the selected C program, binds admitted
carrier fields, and projects either:

- an F_P request over the canonical T-183 rule, plan, startup-admission, and
  envelope carriers;
- a distinct F_H interaction request; or
- a typed invalid or exact T-268 capability-blocked outcome.

The Consensus instruction declarations are product data in a non-invoking
companion Module. The generic compiler contains no Consensus branch, transport,
plugin, event, runner, or prompt-default dependency. The T-252 canonical body
is unchanged.

## Self-Review Repairs

| Finding | Disposition |
|---|---|
| active field slots could be declared optional | repaired: every active slot must carry `required: true`; focused negative proof added |
| set-valued target compatibility refs rejected lawful duplicate identity | repaired: refs now canonicalize and deduplicate |
| selected source closure checked count but not exact order | repaired: ordered Node contract keys must equal the selected program binding |
| legacy catalog rows with no declaration sources reached the profile-aware closure guard | repaired: empty legacy source closure is classified as not profile-aware; profile-aware rows still fail closed |
| T-217 proofs assumed exactly three subsumed catalog rows | repaired: proofs now distinguish the three callable families from the fourth non-invoking declaration carrier |

No base algebra, C-program syntax, Consensus body, traversal controller,
transport path, or capability authority was widened to repair these findings.

## Proof Results

| Gate | Result |
|---|---|
| strict TypeScript host build | pass |
| GTL law and type surface | `82/82` pass |
| T-256 integrated T-183/T-223/T-255 lane | `51/51` pass |
| packed public API consumer | `1/1` pass |
| complete semantic suite | `1613/1613` pass |
| T-223 package/publication lane | `70/70` pass |
| T-252 body/probe | `11/11` pass; body digest `sha256:e4555c21cdb4292b64f7f4d5a625c2a520195aa8d6e9c759498eed4bf28d0ea0`; 10 successor gap families remain |
| generated public contracts | 63 schemas exact |
| generated product publication | 33 assets exact over 1041 immutable payload files |
| diff whitespace | `git diff --check` pass |
| generic-compiler dependency scan | no Consensus, prompt-default, runner, transport, plugin, or runtime-event reference |

## Retained Downstream Boundaries

- T-267 still owns traversal result-interface and bind conservation. Every
  T-256 request preserves the startup block and authorizes no effect.
- T-268 still owns the ABG 5.0 tenant-conformance manifest. Missing capability
  truth produces no request.
- T-258 still owns F_H act, hold, and resume.
- T-259 still owns stage sequencing. T-256 validates a supplied stage basis and
  never selects the next stage.
- The current canonical T-183 role vocabulary is narrower than the domain role
  names in the Consensus body. Consensus is capability-blocked in this slice;
  T-267/T-268 integration must resolve that role-admission bridge before any
  Consensus effect path opens. T-256 does not broaden T-183 or rewrite T-252.

## Closure Request

Review the realization against the accepted three-view design and required
proof matrix. If the independent review confirms the boundary and evidence,
T-256 can receive explicit F_H closure without further implementation work.

The pre-existing untracked `node_modules` symlink is excluded from the change
set and must not be committed.
