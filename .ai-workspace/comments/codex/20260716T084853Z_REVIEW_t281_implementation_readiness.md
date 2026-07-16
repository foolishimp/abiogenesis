# T-281 Implementation-Readiness Review

- review seat: independent Codex subagent `/root/t281_implementation_surface_audit`
- reviewed design digest: `2b5153aedb06dc5c814bf356de45b1ec5bc3b91a766d107002d0f2b3176e6f6e`
- verdict: retain the 19-operation target; supersede P1 implementation authorization pending bounded repair

## Findings

1. `InvocationAuthority<K>`, `PublicInvocation<K>`, and `PublicOutcome<K>` are
   named but do not close their exact packets. Implementing them now would make
   code the source of contract law.
2. The proposed value algebra does not put branded scalar/ref identity or
   omitted/defaulted field semantics into its canonical value and digest.
3. `contract_ref` lacks one admitted resolver packet. Consensus must consume
   the existing `ConsensusContractFamily` through T-274's addressable schema
   row rather than duplicate its Valibot family.
4. Many operation-result and `project.read` rows remain prose rather than exact
   field graphs or stable contract refs.
5. P1 permits a private candidate family while the hard-break scan appears to
   forbid any transient frozen 4.6 migration input. That makes P1 internally
   contradictory unless the product/public boundary is stated explicitly.

## Bounded Repair

- Keep one small closed serializable contract algebra only if native inference,
  raw admission, canonical digest, and schema projection all consume it.
- Reuse existing scalar, canonical-JSON, digest, Valibot/Ajv, and publication
  primitives as subordinate executors. Add no callbacks, plugins, open schema
  fragments, operation-specific validator branches, or second schema registry.
- Define the three common public packets, scalar/ref identity, defaults, and
  exact `contract_ref` resolver before the 19-row tuple.
- Run the T-274 schema-family projection first for the one real external
  Consensus dependency.
- Prove the algebra through a non-exported source-only
  `workspace.create(clean)` semantic fixture. Production handler binding stays
  P2.
- During P1, frozen 4.6 code may exist only as migration input and may not
  generate, validate, or appear in a 5.0 candidate projection. P2 atomically
  switches exports/publication/handlers and deletes the legacy roster.
- Stop if the algebra becomes a general validation framework, requires
  unchecked casts, or cannot delete more authored truth than it adds.

No implementation file was changed by this review. Runtime remains frozen.
