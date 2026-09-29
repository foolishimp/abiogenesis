The two support forms are generated from the existing Valibot union using the
already installed @valibot/to-json-schema 1.7.1, target draft-2020-12. The nested
subschema contains `anyOf` with two closed objects, required fields, role enum or
const, strings and null. The artifact roles require a nonempty artifactPath and
null commandId; verifier_execution requires null artifactPath and a nonempty
commandId. Field descriptions explain applicability. No if/then/else, new schema
engine, dynamic identity enum, new root response or provider setting is added.

Anthropic's official structured-output documentation, checked 2026-09-29, lists
basic types including null, enum, const, anyOf, required and closed object fields
as supported: https://platform.claude.com/docs/en/build-with-claude/structured-outputs#json-schema-limitations
The newly introduced coupling uses those constructions. This does not claim a
live provider test. Existing minimum-length and other unchanged consumer schema
constraints remain validated by the existing native assessment parser/binder;
no provider interface transformation is introduced in this correction.

Six focused checks passed. One exercises the full existing component preparation
route with the generated fulfillment subschema embedded in a closed fixture
response: exact fixture-owned schema bytes -> installed-byte resolver -> owned
instruction assembly -> prompt and native leaf request -> actor preparation ->
local transport --json-schema argument. It intercepts before provider dispatch.
Lower occurrence/environment/role admission is supplied by the existing fixture;
the owners between that frontier and local transport preparation run unchanged.
The generic generated subschema is byte-conserved throughout. The separate
actual live04 fold check authenticates its actual admitted input and keeps the
old schema/task/answer untouched. Its prospective nonempty responses and child
occurrences are expressly controlled premises, never a repair of the old answer.
