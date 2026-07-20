import assert from "node:assert/strict";
import test from "node:test";

test("T-018 negative proof: the retired live-status package subpath is not exported", async () => {
  await assert.rejects(
    import("@abiogenesis/typescript-tenant/app/m04/live-status"),
    (error) => error?.code === "ERR_PACKAGE_PATH_NOT_EXPORTED"
  );
});
