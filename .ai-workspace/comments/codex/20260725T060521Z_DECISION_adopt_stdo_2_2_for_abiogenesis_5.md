# Direct F_H Decision: Adopt Released STDO 2.2 For ABIogenesis 5

- decision_time: 2026-07-25T06:05:21Z
- status: accepted
- authority_regime: direct F_H
- human_authority: ABIogenesis Product owner
- recorder: codex
- change_class: product_reprice
- re_entry_point: specification/PRODUCT.md
- amended_at: 2026-07-25
- amendment_reason: post-adoption qualification-basis and exhausted-owner reconciliation

## Source Decision

The Product owner instructed:

> v2.2 is released update abiogensis to use v2.2

This is direct human authority to replace the selected ABIogenesis method
basis. It is not a proxy grant or an agent-authored expansion.

## Exact Adopted Subject

| Field | Value |
|---|---|
| method Product | STDO `v2.2.0` |
| release tag | `v2.2.0` |
| release commit | `5326562f075d60052806d0d2c79d3db49671a8ea` |
| standards members | 41 |
| standards member-set digest | `ca6dc3d5094fc5473380df45d76da3c52263c5c21c52a3af62f542c97db2f86c` |
| local installed projection | `.genesis/docs/standards/` |

STDO `v2.0.0` remains immutable historical method provenance. It no longer
governs current ABIogenesis development, qualification, or release.

## Authorized Propagation

This decision authorizes:

- replacing the exact method identity in Product, Goals, bootstraps, and the
  existing T-270 and T-282 work owners;
- propagating that identity through the affected qualification requirements
  and the qualification annotation in the accepted direct-GTL design;
- refreshing the ignored local installed standards projection from the exact
  released tag; and
- replacing mutable-method links in live specification and design with links
  to that installed projection.

It does not change ABIogenesis Product semantics, the selected `ABG5-S03`
outcome, the direct-GTL architecture, or runtime implementation. It does change
the affected qualification-law identity and removes completed T-272 as a
current design or work owner. No new Product feature, design programme, ticket,
or implementation increment derives from this adoption alone.

## Post-Adoption Reconciliation

The original propagation left STDO `2.0` in active qualification requirements
and left completed T-272 projected as a current Section 12 owner. Those
statements are superseded by this amendment.

The accepted T-284 requirement aggregate
`c0dcdc264db854f5a4d4f429a35a96e8bd8b4f9481a05cdf532cdfee60722473`
and accepted M03 design SHA-256
`9faeb41ddac839edc9cd2ccb83ae11b05bb54d32168fc35e74a1a9cfb97e92f0`
remain immutable historical identities. They are not relabelled as the current
qualification carrier.

| Reconciled surface | SHA-256 |
|---|---|
| `M03_DIRECT_GTL_TRAVERSAL_BEHAVIOR_DESIGN.md` | `12334d2d814c47a954f55cd9664c006fd331fdafaa3fb043b95a35e8832e285f` |
| `M05_DIRECT_GTL_TRAVERSAL_EXPANSION_DESIGN.md` | `92af9ae820e50e49ba7f29d0b5e596b58d649462a03f3194a0c740d3ef7295e5` |
| `REQ-P-SCENARIOS.md` | `863681e90cd190fd0b54a94098f2a9fb7cd4d2e8d9c7d8aced82ab0180c616f0` |
| `REQ-P-SELF-CONFORMANCE.md` | `27c558084a17eae67df76a1ff7159e239148fffd37eabb8c9510525d21d8f520` |
| `REQ-P-QUAL.md` | `23eea313aef5161c45de623ef878b81da4b988a4f0e88eaf43db3461733830ac` |

This is identity and ownership propagation only. The current implementation
frontier remains the bounded S03 reconciliation selected by GOALS and T-270.
