# Installed Public DefinitionCall construction

T-287 PUBLICCALL01 refines the existing S06/native SDK realization. Product
`SDK And CLI` and `ABG5-S06`, and REQ-P-PUBLIC-CONTRACTS-009/010 retain semantic
authority. The fifteen Product families and exact operation/definition family
are unchanged.

`@abiogenesis/typescript-tenant/public` exports
`constructInstalledPublicDefinitionCall` and its typed explicit input. It is
deterministic construction of an invocation candidate, not runtime admission
or execution. The implementation moves from test support into the Public owner;
test support re-exports that function by the public package specifier.

The caller supplies the installed Product canonical JSON/hash functions,
installed Public family/projections, verified definition coordinates, exact
contract catalog, operation/member selection, request, authority slots,
resource assertion, refs, event time and provenance. There are no implicit
selection defaults. Product verification remains the source of coordinates;
this helper is not a substitute for verification.

The constructor selects one exact definition/operation/member, checks slot
catalog, operation, version, selector, key, slot and definition ref against the
installed owner projection, then preserves the supplied coordinates. It hashes
the same authority, request and invocation preimages as the predecessor helper
and derives the same invocation ref. Request, slots and resources retain their
identity. Provenance is copied and frozen; construction does not deep-freeze
caller values or acquire resources.

Transport and the exact selected owners retain complete raw contract and
semantic admission. Construction does not admit capabilities, request meaning,
resource assertions, runtime events or outcomes. GTL declares; HoG traverses;
ABG admits. Existing transport and CLI receive the same DefinitionCall envelope.
No Public operation, schema, event, binding, controller or family is introduced.

Compatibility evidence compares the predecessor and exported constructor on
the same existing ordinary envelopes and malformed coordinate cases. It proves
only construction equality and preserved refusal boundaries. Installed native
execution, downstream lifecycle usability and release qualification remain
separate Executive-owned compositions.

For the shared native Run/GraphCall reads, the invocation's catalog and
request/result/refusal coordinates name the current executing Product. The
owner binds that catalog and operation row to its own package-relative
manifest using existing Product parsing and canonical identity. This bounded
immutable metadata read is not package re-verification or a new authority.

The authority slots instead select the historical source WorkspaceBinding,
ProductSet, lock and read grants. The owner reconstructs and validates them
from the authenticated prefix, and requires the selected source to have that
exact binding. Its original Program/GraphFunction and historical declaration
proof remain unchanged. The source grant's historical catalog need not equal
the current reader's catalog; neither catalog substitutes for the other.
Current exact ingress, supported event/profile/language admission, source
digest/currentness, typed absence/refusal and no-append closure remain binding.
