import assert from "node:assert/strict";
import test from "node:test";
import { validateIdParam } from "../middlewares/validateIdParam.js";

test("validateIdParam accepts a positive integer id", () => {
  const req = { params: { id: "42" } };
  const res = {};
  let nextError = null;

  validateIdParam(req, res, (error) => {
    nextError = error || null;
  });

  assert.equal(nextError, null);
  assert.equal(req.params.id, "42");
});

test("validateIdParam rejects invalid id values", () => {
  const req = { params: { id: "abc" } };
  const res = {};
  let nextError = null;

  validateIdParam(req, res, (error) => {
    nextError = error || null;
  });

  assert.ok(nextError);
  assert.equal(nextError.status, 400);
  assert.match(nextError.message, /id/i);
});
