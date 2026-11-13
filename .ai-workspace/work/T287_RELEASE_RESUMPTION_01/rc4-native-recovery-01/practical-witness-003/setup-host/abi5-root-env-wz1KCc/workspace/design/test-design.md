# Test design

Both tests execute the actual generated/hello-world.mjs entry from project root
using process.execPath and spawnSync. The component test checks the concrete
process contract: status zero and stdout exactly Hello, world! followed by a
newline. The UAT test checks that a user invoking the CLI sees that exact greeting.

Run the two files together through node --test. At least two tests must pass,
with no failures. Independently invoke the CLI to retain its direct stdout/status.
Compare current command observations and the actual test bodies with the original
source. A historical pass, a count without execution, or an author's claim does
not establish this result.
