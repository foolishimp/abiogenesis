# T-286 R3 Workspace Binding Complete

## Result

`ABI5-ROOT-001` obligation `R3 workspace bound to exact product set` is
satisfied by implementation commit
`e7908cdea438c0c315ab08c129e41550228e8a96` while preserving R1-R2.

The Product boundary constructs one exact resolved lock, ordered ProductSet,
stable WorkspaceAuthorityBasis, and immutable WorkspaceBinding candidate. ABG
alone admits the ProductInstall and WorkspaceBinding through the generic
`public_operation_artifact_admitted` boundary and assigns monotonically
increasing store ordinals.

## Boundary Evidence

| Identity | Value |
|---|---|
| artifact SHA-256 | `sha256:4a2fadf6e4297f07e346ab9e3b5c6371837fa17dec48db1069069a40cc5244fb` |
| lock digest | `sha256:93ceef570105063d87ff235d36c4fa625b351bcf0d608d07e65fb752ae295089` |
| ProductSet digest | `sha256:52d24200c25ff5fd1a0abfe5d4249e90c3f347afec13db2f652c5a60f9908bf9` |
| admitted environment events | `2` |
| admission ordinals | `1, 2` |

Workspace authority and declared roots are stable binding inputs. Observation,
replay cursor, readiness, and worksite content do not enter the binding.
Repeating construction over the same inputs yields the same authority and
binding identities.

The package exports `AbgEventStore` as a read surface but exposes no append
method. The package export map refuses a deep import of the internal event-store
module. Only package-internal ABG admission functions can append events.

## Negative Proof

- a lock row retaining the install ID but changing the manifest digest refuses
  with `lock_mismatch`;
- a workspace admission carrying another authority-scope ref refuses with
  `scope_mismatch`;
- that refusal leaves the event count unchanged;
- no full runtime-event roster is claimed: the published contract is the
  bounded environment-admission family, not `abg.contract.abg.m03`.

## Verification

```text
npm ci --ignore-scripts
npm run test:r3
```

R1-R3 pass from the packed and installed product. The root remains red at
`R4 catalog admitted and narrowed`.
