#!/usr/bin/env node
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

function canonical(value) {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (value && typeof value === "object") return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonical(value[key])}`).join(",")}}`;
  return JSON.stringify(value);
}

function digest(value) {
  return createHash("sha256").update(canonical(value)).digest("hex");
}

const [, , action, filename] = process.argv;
if (action !== "verify" || !filename) {
  console.error("Usage: node bin/counterexample.mjs verify <receipt.json>");
  process.exit(2);
}

try {
  const receipt = JSON.parse(await readFile(filename, "utf8"));
  if (receipt.format !== "counterexample-receipt/v1") throw new Error("unsupported receipt format");
  const { receiptSha256, ...unsigned } = receipt;
  if (digest(unsigned) !== receiptSha256) throw new Error("receipt digest mismatch");
  if (digest(receipt.capsule) !== receipt.integrity.capsuleSha256) throw new Error("capsule digest mismatch");
  if (receipt.subject.commit !== receipt.capsule.commit) throw new Error("subject commit does not match capsule");
  console.log(`VERIFIED ${receipt.subject.caseNumber} ${receipt.subject.id}`);
  console.log(`receipt sha256 ${receiptSha256}`);
  console.log(`capsule sha256 ${receipt.integrity.capsuleSha256}`);
  console.log(`release signature: ${receipt.integrity.verifyAttestation}`);
} catch (error) {
  console.error(`INVALID ${error instanceof Error ? error.message : error}`);
  process.exit(1);
}
