import { tmpdir } from "node:os";
import path from "node:path";

export const DEFAULT_LIVE_TEST_RUN_ROOT = path.join(
  tmpdir(),
  "odd-sdlc-ts-live-test-runs"
);

export function liveTestArchiveRoot(laneName, timestamp, pid) {
  const root =
    process.env["ODD_SDLC_TS_LIVE_TEST_RUN_ROOT"] ??
    process.env["ODD_SDLC_TS_TEST_RUN_ROOT"] ??
    DEFAULT_LIVE_TEST_RUN_ROOT;
  return path.join(root, laneName, `${timestamp}_pid${pid}`);
}
