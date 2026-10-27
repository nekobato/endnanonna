import assert from "node:assert/strict";
import test from "node:test";
import { requiredAt } from "../utils/requiredAt.ts";

test("preserves the first and last configured letter values, including zero", () => {
  const values = [0, 70, 72, 54, 54, 64, 72];
  assert.equal(requiredAt(values, 0), 0);
  assert.equal(requiredAt(values, 6), 72);
  assert.equal(requiredAt("のんのんびより", 6), "り");
});

test("reads RGBA alpha from a typed pixel buffer", () => {
  assert.equal(requiredAt(new Uint8ClampedArray([12, 24, 36, 255]), 3), 255);
});

test("rejects invalid indices and missing configuration entries", () => {
  for (const index of [-1, 2, 0.5, NaN, Infinity]) {
    assert.throws(() => requiredAt([10, 20], index), RangeError);
  }
  assert.throws(() => requiredAt(new Array<number>(2), 0), RangeError);
});
