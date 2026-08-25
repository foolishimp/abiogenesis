# ABIogenesis Documentation

**Status**: Current supporting documentation for the frozen ABIogenesis 5.0
GTL 3 language boundary
**Projection basis**: ABIogenesis 5.0 Product and requirement law accepted by
T-283 `F_H` closure, including accepted amendments present in the active
constitutional tree

This directory contains explanatory and operator-facing read models. It does
not contain a second GTL specification.

The GTL language is frozen. ABIogenesis 5.0 realization and qualification are
still active, so a development package, command, or implementation surface may
remain incomplete without changing the language described here.

## Authority

Resolve disagreement in this order:

1. [`specification/PRODUCT.md`](https://github.com/foolishimp/abiogenesis/blob/8d7f965a3fae7d1acea6a9db298798480fd4cc2f/specification/PRODUCT.md)
   is the sole complete ABIogenesis 5.0 Product definition.
2. [`specification/INTENT.md`](https://github.com/foolishimp/abiogenesis/blob/8d7f965a3fae7d1acea6a9db298798480fd4cc2f/specification/INTENT.md)
   owns direction and the stable authority split.
3. [`specification/requirements/gtl/`](https://github.com/foolishimp/abiogenesis/tree/8d7f965a3fae7d1acea6a9db298798480fd4cc2f/specification/requirements/gtl)
   owns detailed GTL language law. Start with
   [`REQ-L-GTL3-CONTRACT-LAW-API.md`](https://github.com/foolishimp/abiogenesis/blob/8d7f965a3fae7d1acea6a9db298798480fd4cc2f/specification/requirements/gtl/REQ-L-GTL3-CONTRACT-LAW-API.md).
4. [`REQ-M-GTL3-PROGRAM-TRAVERSAL.md`](https://github.com/foolishimp/abiogenesis/blob/8d7f965a3fae7d1acea6a9db298798480fd4cc2f/specification/requirements/mapping/REQ-M-GTL3-PROGRAM-TRAVERSAL.md)
   owns the Program, GraphFunction, workspace, HoG, and ABG mapping.
5. Accepted design and build tenants realize that law. They do not redefine it.
6. The files in this directory explain the law and must be repaired when they
   drift from it.

## Frozen Language Spine

```text
GTL.TypeScript source
  -> native TypeScript checking
  -> raw admission after type erasure
  -> non-lowering GTL whole-Program validation
  -> Module and catalog admission
  -> admitted Program start or admitted GraphFunction call
  -> direct HoG traversal of the original admitted GTL
  -> declared F_D | F_P | F_H implementation seam
  -> ABG event admission and replay-derived runtime truth
```

The identities in that path are not interchangeable:

- a GTL composition is a `Program`;
- `GraphFunction` is the sole named callable work contract and graph-template
  carrier, not the whole Program;
- a workspace supplies mutable instance material and is not Program authority;
- HoG traverses admitted GTL directly;
- ABG owns runtime admission, events, replay, lineage, continuation,
  correction, and closure; and
- SDKs, CLIs, workers, tools, and plugins remain thin shells or declared
  implementation seams.

## Live Guides

- [`USER_GUIDE.md`](./USER_GUIDE.md) is the human guide to the frozen language,
  validation, execution, and runtime-truth boundaries.
- [`LLM_GTL_APP_BUILDER_GUIDE.md`](./LLM_GTL_APP_BUILDER_GUIDE.md) is the
  compressed bootstrap for LLM agents. It contains stable language rules and
  tells agents where to inspect moving implementation details.
- [`ABG_GTL_SCHEMATICS.md`](./ABG_GTL_SCHEMATICS.md) renders the same authority
  relations as diagrams.
- [`GTL_HELLO_WORLD_EXAMPLES.md`](./GTL_HELLO_WORLD_EXAMPLES.md) walks through
  the accepted odd_glc Hello World GraphFunction and then shows bounded
  multi-GraphFunction and root/child overlay forms.

The installer also publishes a compressed `GTL_BOOTLOADER.md`. It is a derived
projection over the same frozen language and must never assign Program or
traversal authority to GraphFunction, a workspace, ABG, an adapter, or a
generated plan.

## Implementation Status

Do not infer the frozen language from a development package version or an old
command example. For exact current TypeScript exports, package identity, CLI
commands, or implementation readiness, inspect the
[selected build tenant](https://github.com/foolishimp/abiogenesis/tree/main/build_tenants/abiogenesis/typescript)
and its accepted design.

Those are moving HOW surfaces. This documentation deliberately avoids pinning
the frozen language explanation to a transient `5.0.0-dev.*` package.

## Historical Release Material

- [`ABIOGENESIS_RC_RELEASE_NOTE.md`](https://github.com/foolishimp/abiogenesis/blob/8d7f965a3fae7d1acea6a9db298798480fd4cc2f/docs/ABIOGENESIS_RC_RELEASE_NOTE.md)
  records a historical 4.6 release-candidate boundary.
- [`ABIOGENESIS_RC_NOTES.md`](https://github.com/foolishimp/abiogenesis/blob/8d7f965a3fae7d1acea6a9db298798480fd4cc2f/docs/ABIOGENESIS_RC_NOTES.md)
  records historical release-candidate behavior and caveats.
- [`old/`](https://github.com/foolishimp/abiogenesis/tree/8d7f965a3fae7d1acea6a9db298798480fd4cc2f/docs/old)
  contains superseded drafts and generated renders. Nothing in that directory
  is current language authority.

## Methodology

- [Public methodology repository](https://github.com/foolishimp/specification_methodology)
- [Selected STDO v2.2.2 standards](https://github.com/foolishimp/specification_methodology/tree/0519129d63de10822ae6353fa0c5ce05d56f13e9/specification/standards)
- [T-283 frozen-language acceptance](https://github.com/foolishimp/abiogenesis/commit/c84d60f035004cdd7d2a99792091688a5e9aa993)
