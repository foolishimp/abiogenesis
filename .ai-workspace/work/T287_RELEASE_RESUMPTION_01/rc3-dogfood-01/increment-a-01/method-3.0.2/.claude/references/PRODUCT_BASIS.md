# Product Basis Selection

Use this read-only procedure before every STDO workflow skill. It selects and
verifies one Product basis; it grants no mutation, execution, review,
disposition, installation, or continuation authority.

## Procedure

1. State the requested Product scope from the exact request and Product-owned
   identities or claims. If the request does not distinguish the Product, keep
   the scope unresolved.
2. Discover candidate `stdo_<label>.json` definitions within the authorized
   workspace search boundary. A filename, current directory, nearest file, or
   directory nesting is discovery evidence only and cannot select a Product or
   imply composition.
3. Determine applicability from each definition's Product-definition identity
   and its Product-owned `what`, `how`, `ticketing`, bounded-context, and
   explicit composition bindings. A path is selecting evidence only when the
   definition itself binds it to the requested Product scope.
4. Require exactly one applicable definition. For zero applicable definitions,
   return the unresolved scope. For multiple applicable definitions, return
   every remaining definition identity and path and request Product-scope
   disambiguation. Do not choose by proximity, familiarity, recency, or label.
5. Verify the selected definition read-only:

   ```sh
   stdo status --definition <selected-definition> --verify
   ```

   Require the reported definition path and identity, immutable basis URI, and
   manifest SHA-256 to match the selected definition, with `installed: true`,
   `valid: true`, and no failures. Do not sync, adopt, install, fall back to
   mutable source, or select a nearby Product during this procedure.
6. Return the requested Product scope, definition identity and path, immutable
   basis URI or cut, manifest SHA-256, and verification result. Only then may
   the calling skill continue under its own effect and authority boundary.

Zero definitions, multiple applicable definitions, failed verification, or any
identity, path, basis, manifest, installation, or validity mismatch stops the
calling skill before effects. Report the exact candidates or mismatch and the
required re-entry; do not repair it implicitly.

## Read A Member From That Basis

After the selected basis has verified, resolve each required member through
that same immutable basis. A route consists of the member's package-relative
path and, where needed, a heading anchor within it. For example:

```sh
STDO_BASIS_URI='stdo://releases/<selected-immutable-cut>/'
stdo resolve "${STDO_BASIS_URI}manifest.json"
stdo resolve "${STDO_BASIS_URI}standards/ACTIVATION.md"
```

Use the basis URI returned by the verified Product Definition. Read the
manifest whose digest equals that definition's `manifest_sha256`. Require
`ACTIVATION.md` in its standards inventory and require the resolved file's
SHA-256 to equal that member's declared digest. Apply the same check to every
other selected member. The resolver's returned URI must equal the requested
URI, and its path must be in that verified installation. A path alone proves
neither membership nor content identity.

Resolve the member without its fragment, then locate the exact anchor in
those verified bytes; for example, `#7-closed-result-and-reuse` selects
ACTIVATION's reuse owner. A missing member, anchor, manifest mismatch or
content mismatch leaves the route unresolved. Acquire no replacement from a
checkout, moving selector, later cut or neighbouring Product. A frame is a
member too: verify its own bytes and the local sources and section digests
listed in `standards/frames/FRAME_INPUTS.json` before treating it as current.
This identity check does not establish semantic fidelity or task sufficiency.

Return the exact basis URI and manifest digest with each acquired member,
its member digest, selected anchor and any unresolved dependency. The
calling skill retains its own authority and effect boundary.
