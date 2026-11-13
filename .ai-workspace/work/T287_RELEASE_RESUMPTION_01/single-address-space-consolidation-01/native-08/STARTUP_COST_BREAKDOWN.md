# RC5 startup: native08 measured boundaries

The builder is immutable RC5 f49e7533e. Dispatch to coding Worker is **13m46.600s**: **1m20.183s** in the selector actor and **12m26.417s** elsewhere. Host preparation adds50.784s; earlier SDK setup is reused.

| Measured phase | Wall time |
|---|---:|
| Before first Public operation admission |5m32.197s|
| Admitted workflow and selector preparation |54.308s|
| Selector actor |1m20.183s|
| Selector return to selected construction call |44.571s|
| Construction call to native Worker basis |3m20.006s|
| Native basis to selected native-work call |11.098s|
| Native-work call to admitted actor transport |1m44.192s|
| Transport to Worker process |0.045s|

The pre-admission interval includes1.218s before the CLI command marker, then5m30.979s through the cold CLI path to first admission. Host-launch-to-Worker is14m37.384s. The earlier setup28.939s, including artifact verification19.749s, was not repeated. Root's34m36.770s between predecessor close and dispatch is separate operator work.

RC5's runtime_liveness, native_work_reacquisition, calculus/liveness and execution_basis source files are byte-identical to RC4. In RC5, runtime_liveness still calls selectValidatedRuntimeEventPrefix(store.readAll()). Native reacquisition calls an adapter that authenticates through the existing owned owner, then materializes the complete history and constructs another prefix. The held successor adopts the existing owned functions and removes that expanding adapter. RC5 delivered retained-route physical-carriage reduction and method/input changes; it did not deliver these later caller migrations.

Functionally, real boundary checks establish actual code/input/workspace identity, current state, lawful effects and replay/resumption. Repeating the same internal reconstruction over unchanged already-owned values adds no semantic capability. The selector supplies a next-step choice. A simpler fixed workflow can have a different selection requirement, but no alternative path was executed here.

These timestamps locate work; they do not divide all intervals into hashing, history reconstruction, serialization, disk I/O or GC. The full12m26s must not be presented as either necessary verification or proven removable waste. The JSON companion retains exact event/command/source pins. This is a passive diagnostic, with no runtime or source changes.
