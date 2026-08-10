import { createHash } from "node:crypto";
import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const capsuleDirectory = path.join(root, "capsules");
const schemaPath = path.join(root, "schemas", "counterexample.schema.json");
const enginePath = path.join(root, "config", "engines.json");
const forbiddenKeys = new Set(["script", "shell", "executable", "html", "javascript", "webhook", "token", "secret"]);

export function canonical(value) {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonical(value[key])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

export function sha256(value) {
  return createHash("sha256").update(typeof value === "string" ? value : canonical(value)).digest("hex");
}

function scanForbidden(value, trail = "capsule") {
  if (Array.isArray(value)) {
    value.forEach((entry, index) => scanForbidden(entry, `${trail}[${index}]`));
    return;
  }
  if (!value || typeof value !== "object") return;
  for (const [key, child] of Object.entries(value)) {
    if (forbiddenKeys.has(key.toLowerCase())) throw new Error(`${trail}.${key} is not permitted`);
    scanForbidden(child, `${trail}.${key}`);
  }
}

export async function loadContext() {
  const [schema, engineManifest] = await Promise.all([
    readFile(schemaPath, "utf8").then(JSON.parse),
    readFile(enginePath, "utf8").then(JSON.parse),
  ]);
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  return { schema, engineManifest, validateSchema: ajv.compile(schema) };
}

export async function loadCapsules() {
  const names = (await readdir(capsuleDirectory)).filter((name) => name.endsWith(".json")).sort();
  return Promise.all(names.map(async (name) => {
    const filename = path.join(capsuleDirectory, name);
    const metadata = await stat(filename);
    if (metadata.size > 64 * 1024) throw new Error(`${name} exceeds the 64 KiB capsule limit`);
    return { name, capsule: JSON.parse(await readFile(filename, "utf8")) };
  }));
}

export function validateCapsule(name, capsule, context) {
  scanForbidden(capsule);
  if (!context.validateSchema(capsule)) {
    const detail = context.validateSchema.errors?.map((error) => `${error.instancePath || "/"} ${error.message}`).join("; ");
    throw new Error(`${name}: schema validation failed: ${detail}`);
  }
  const engine = context.engineManifest.engines[capsule.engine];
  if (!engine) throw new Error(`${name}: engine is not allowlisted`);
  if (engine.commit !== capsule.commit) throw new Error(`${name}: commit does not match the allowlisted engine revision`);
  if (!engine.commands[capsule.verification.commandId]) throw new Error(`${name}: verification command is not allowlisted`);
  if (capsule.verification.testLines[0] > capsule.verification.testLines[1]) throw new Error(`${name}: test line range is reversed`);
  if (capsule.verification.benchmarkLines && capsule.verification.benchmarkLines[0] > capsule.verification.benchmarkLines[1]) throw new Error(`${name}: benchmark line range is reversed`);
  if (capsule.timeline[0]?.phase !== "trigger") throw new Error(`${name}: the causal tape must begin with a trigger`);
  if (!capsule.timeline.some((step) => step.phase === "witness")) throw new Error(`${name}: the causal tape requires a witness phase`);
  return engine;
}

export async function validatedCapsules() {
  const context = await loadContext();
  const entries = await loadCapsules();
  const ids = new Set();
  const numbers = new Set();
  for (const entry of entries) {
    validateCapsule(entry.name, entry.capsule, context);
    if (ids.has(entry.capsule.id)) throw new Error(`duplicate capsule id ${entry.capsule.id}`);
    if (numbers.has(entry.capsule.caseNumber)) throw new Error(`duplicate case number ${entry.capsule.caseNumber}`);
    ids.add(entry.capsule.id);
    numbers.add(entry.capsule.caseNumber);
  }
  return { ...context, entries };
}

export function githubEvidenceUrl(engine, commit, filePath, lines) {
  return `https://github.com/${engine.repository}/blob/${commit}/${filePath}#L${lines[0]}-L${lines[1]}`;
}
