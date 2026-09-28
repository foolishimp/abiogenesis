# Implementation design

The sole application entry is generated/hello-world.mjs, executed by Node.
It writes exactly the string Hello, world! and a newline to stdout and exits zero.
It reads no arguments, installs no packages, and makes no filesystem changes.

Component coverage is test/component/hello-cli.test.mjs. User-facing coverage is
test/uat/hello-cli.uat.test.mjs. Both invoke the actual CLI through a child Node
process and assert its status and exact stdout. The combined command is declared
by test-execution-plan.json. This design describes required behavior, not a
claim that the current implementation has already passed.
