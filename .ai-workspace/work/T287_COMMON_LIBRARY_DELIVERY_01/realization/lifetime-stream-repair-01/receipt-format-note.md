# Raw test output format

The explicit Node commands selected the Node spec reporter. Each raw stdout is preserved byte-for-byte under its originally chosen .tap suffix; no claim that the bytes use TAP is made. Every selected command reports exactly tests 1, pass 1, fail 0, cancelled 0 and skipped 0, with its exact selected name.

An initial post-execution summary reader expected only TAP # prefixes and stopped on case 01 with an empty counts dictionary. Inspecting the actual raw bytes showed the ℹ prefix. The reader now consumes that actual format (and TAP if present); no test, producer, source, expected behavior or raw receipt was changed or rerun. This was a report parsing error, not a test failure.
