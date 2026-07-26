# T-276 Governor / T-281 Owner Registry Checkpoint

## Current product frontier

The accepted T-276 installed driver now runs from a packed candidate in a
source-blind temporary install. It derives the required 19-operation roster
from `REQ-P-PUBLIC-CONTRACTS-008`, checks the packed operation family, and
stops before invocation when that family is incomplete.

Against the current candidate it reports exactly:

- 16 target operation identities missing;
- 16 retired operation identities still present;
- zero target-operation invocations;
- zero workspace-operation invocations.

This is an early red product witness, not T-276 closure. Every DS-2/DS-4
checkpoint must preserve or reduce this same source-blind frontier.

## T-281 P1 checkpoint

Owner-native schema sources now also identify any same-module named-check
registry. The canonical projector resolves and hashes the schema and registry
from that one owner module, preventing callers or an operation switch from
selecting a second relational authority. The independently reviewed
implementation is commit `296ba699`.

The remaining 27 `project.read` result coordinates are being authored by their
existing semantic owners. No partial P1 operation family can admit or publish;
central family admission follows only after the exact owner-source census is
complete.

