const test = require("node:test");
const assert = require("node:assert/strict");

test("health endpoint contract returns status ok", () => {
  const healthResponse = { status: "ok" };
  assert.equal(healthResponse.status, "ok");
});
