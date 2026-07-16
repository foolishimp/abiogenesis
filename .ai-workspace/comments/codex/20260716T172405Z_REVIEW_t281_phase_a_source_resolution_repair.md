# T-281 Phase A Source-Resolution Repair Review

- reviewed span: `eeb286bcd74f5a38aa43317ce9065eaf9baf0366..c129ec385ad8bbda6d4d08c7505113c394050337`
- verdict: accept
- P0/P1 findings: none

The fixed-root resolver is the sole mint for the opaque typed native schema
source. It admits only normalized `semantic_build` paths, own data members, an
exact recursively frozen Valibot schema object, and the compiled owner-module
byte basis. `defineNativeContract` consumes that carrier without widening its
schema type. Public schema identity remains a projection of the schema bytes;
owner-source changes alter the private witness basis rather than falsifying
public identity.

Focused type/runtime proofs, the full semantic and GTL suites, source-blind
publication, schemas, publication assets, lint, design, Prime, governance, and
package gates pass. M03 imports no M04 surface and no public operation,
runtime, export, or package subpath was added.

One P2 wording defect was corrected: publication verification reports `1142`
immutable payload files and the package dry run reports `1143` total tarball
entries. This did not affect code acceptance.
