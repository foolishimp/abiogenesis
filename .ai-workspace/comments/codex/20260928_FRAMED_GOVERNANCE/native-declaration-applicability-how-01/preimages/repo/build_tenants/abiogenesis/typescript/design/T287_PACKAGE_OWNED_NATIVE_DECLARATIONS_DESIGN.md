# Package-Owned Bundled Native Declarations

## Boundary

ABIogenesis publishes exact, source-independent native contracts under one
immutable Product content identity. Product verification owns local admission;
Product resolution owns cross-Product linking and the resolved lock. The
compiler supplies TypeScript meaning, not Product or runtime authority.

This amendment refines NCC-F01/NCC-F02 under `EnvironmentBasis`. It changes the
inherited `M05_S06_NATIVE_CONTRACT_CLOSURE_DESIGN.md` section 2.1 rule that every
non-platform bare reference is external, and section 7.1's single-level export
restriction, only for declarations demonstrably bundled inside the same Product.
The successor `M05_S06_PUBLIC_FUNCTION_AND_NATIVE_OCCURRENCE_CLOSURE_DESIGN.md`
names accepted parent `4f80f84a826de86b4cfb4d9fec3baff428dcb44a` and retains its
other decisions. Public native locators, direct cross-Product contract binding,
compiler basis, exact identity and all other affected-owner boundaries remain.

## Complete existing-owner function

NCC-F01 consumes one immutable Product payload,
its content-bound package/bundle/export metadata and declaration sources,
exact public native proposals, and the existing pinned TypeScript basis. It
derives the package-owned declaration closure and checker-visible native
symbols, plus source-contract-indexed genuinely external pending selectors,
or the existing typed refusal. It neither constructs a lock nor installs or
executes anything.

Its shared `resolveNativeDeclarationClosures` derives the local closure and
checker symbols; existing contract-indexed analysis joins exact native
proposals to that result. These factors remain one Product-owned function,
not newly exposed operations or alternative analyzers.

The publisher supplies proposals from that payload. `verify_product`
independently reconstructs the same relation from verified archive bytes.
`linkNativeContractSet` consumes the resulting verified private evidence and
uses the same package-owned classification in its linked checker host. It
retains existing external occurrence/binding and lock construction. A lexical
change to `externalRelations` alone does not implement this function.

### Same-Product ownership

1. A bundled declaration is local only when the Product's inventoried root
   package metadata explicitly selects the bundle, directly or through its
   finite bundled dependency closure, and the selected package metadata and
   declaration files are members of that same immutable payload. A bare name,
   a `node_modules` path, installed presence or publisher assertion alone is
   insufficient. Actual package name/version/type and export metadata bind to
   exact Product-relative bytes and digests.
2. Resolution starts from the containing declaration's package scope, including
   its self-package identity and inventoried intervening module-format metadata.
   The Product root's name/type does not overwrite every bundled file's scope.
   All such packages retain the enclosing Product as semantic owner; they gain
   no Product identity, native public contract or capability of their own.
3. The existing closed TypeScript host resolves only inventoried declarations
   and the admitted compiler/platform basis. Selected paths are contained,
   ordinary declaration members; escape, symlink-dependent, absent, conflicting
   or ambiguous metadata/targets refuse. Claimed bundled ownership that fails
   these checks does not fall through to an ambient or external substitute.
4. Every reachable bundled declaration joins the existing canonical native
   declaration inventory exactly once. Package metadata remains exact-byte,
   content-bound subordinate input carried in verified private evidence for
   both checker stages. It creates no separate registry, admission entity or
   public contract. Changed metadata or declaration bytes invalidate affected
   prior evidence; existing Product/contract digest and supersession laws apply.

### Closed declaration-target profile

The selected bundle profile supports explicit root or exact-subpath exports
with one `types` target, and the existing `import`/`require` branches with one
`types` target in the branch selected by the pinned checker's use-site module
mode. A root `types`/`typings` target applies only when exports are absent and
the target is unique. Resolution never selects the first available file or
substitutes a runtime `default` JavaScript target for a declaration.

This includes the existing Valibot 1.4.2 metadata shape without a package-name
or alias whitelist. It also preserves inventoried package-format boundaries
such as an internal ESM directory. Inactive conditions remain metadata, not
enabled paths. Arbitrary deeper conditions, custom-condition activation,
wildcards, target arrays, `typesVersions`/path aliases, JavaScript type
inference and nested dependency-version shadowing are unsupported here;
selecting one refuses rather than inventing broader resolution semantics.

### Genuine external meaning

A reference with no proven same-Product bundle or existing self/platform
resolution remains external. NCC-F01 records its exact pending selector; it
does not infer its final meaning. NCC-F02 still requires the containing
Product's direct declared dependency and exactly matching required native
contract, with the existing namespace/alias/occurrence checks. A bundled
declaration's reference beyond its owning Product obeys that same law.
Transitive package presence does not create cross-Product authority. No host
filesystem search, ambient compiler/configuration, network or automatic type
acquisition completes a missing relation.

## Requirement, function and realization mapping

| Requirement | Function and existing owner |
| --- | --- |
| REQ-P-PUBLIC-CONTRACTS-002A | NCC-F01 derives complete native declaration inventories and exact identities from the immutable payload; generator proposes, verifier checks. |
| REQ-P-PUBLIC-CONTRACTS-003/-004 | Advertised contract ID, native locator and named symbol remain; type/schema and capability meaning stay unchanged. Existing digest/supersession law governs new bytes; no frozen identity is restamped, vocabulary downgrade or duplicate DTO/schema substitutes. |
| REQ-P-POLICY-049 | Product verification admits only locally decidable same-Product meaning and preserves genuine external pending evidence. |
| REQ-P-POLICY-050 | Product resolution admits linked meaning or returns its existing typed refusal; installation and binding remain subsequent owners. |

The production territory is `product/declaration_exports.ts`,
`product/verify_product.ts` and `scripts/generate-product-manifest.mjs` in the
TypeScript tenant. Direct interface propagation stays within their existing
`NativeDeclarationClosureRequest`, private `NativeProductDeclarationEvidence`,
metadata-source validation, packed `PackageJsonView` and shared caller inputs.
Both local and linked hosts, evidence reconstruction and subordinate declaration
helpers consume that one metadata relation. No new checker, public operation,
resolver service, engine, Valibot Product or qualification-contract rewrite is
part of this function. A necessary production change beyond this territory
returns its owner seam before implementation.

## Native discriminator and proof boundary

Native01 supplies frozen red evidence: installed Public verification exposes
the catalog's Valibot selector; Public resolution refuses `unresolved` with a
null lock. The sunny discriminator is a newly identified exact ABI archive
that retains `abg.asset.qualification.rule-catalog` and its native
`./validator/QualificationRuleCatalog` locator, passes ordinary installed
Public verify and resolves the singleton ABI Product to a real non-null lock.
That package-owned reference is locally checked, not silently dropped.

A genuinely missing or unbound external reference still refuses resolution;
missing or substituted claimed bundle bytes cannot become local truth.
Focused source/structural checks cover the changed ownership seam, followed
by this installed composition. Broad namespace, conditional-form and
conservation qualification remains at D5. Tests arrange inputs and observe
actual owners; neither assertions nor a constructed lock substitute for the
Public results. This discriminator does not establish D1 application/UAT,
runtime liveness, integrated qualification or release acceptance.
