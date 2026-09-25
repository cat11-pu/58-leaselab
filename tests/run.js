import assert from "node:assert";
import { acquire } from "../lease.js";
import { sweep } from "../reclaim.js";
import { render } from "../app.js";

let failed = 0;
function check(name, fn) {
  try { fn(); console.log("ok " + name); } catch (e) { failed += 1; console.log("FAIL " + name + " :: " + e.message); }
}

check("acquire grants a lease", () => {
  assert.strictEqual(acquire({}, "h0", "t0", 0, 5).granted, true);
});

check("acquire returns leases map", () => {
  assert.strictEqual(typeof acquire({}, "h0", "t0", 0, 5).leases, "object");
});

check("sweep reports reclaimed list", () => {
  assert.ok(Array.isArray(sweep({}, 10, {}).reclaimed));
});

check("sweep reports replayed count", () => {
  assert.strictEqual(typeof sweep({}, 10, {}).replayed, "number");
});

check("render exposes epochs", () => {
  assert.ok(Array.isArray(render({ steps: [], now: 0, ttl: 5, progress: {} }).epochs));
});

console.log("5 cases, " + failed + " failed");
process.exit(failed === 0 ? 0 : 1);
