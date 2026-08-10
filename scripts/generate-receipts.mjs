import { execFile } from "node:child_process";
import { copyFile, mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { canonical, githubEvidenceUrl, root, sha256, validatedCapsules } from "./lib.mjs";
import { promisify } from "node:util";

const run = promisify(execFile);

const outputDirectory = path.join(root, "public", "receipts");
const releaseBundle = "counterexample-v1.0.0-receipts.tar.gz";

const { entries, engineManifest } = await validatedCapsules();
await rm(outputDirectory, { recursive: true, force: true });
await mkdir(outputDirectory, { recursive: true });

const manifest = {
  format: "counterexample-receipt-index/v1",
  release: "v1.0.0",
  count: entries.length,
  bundle: releaseBundle,
  verifyRelease: `gh attestation verify ${releaseBundle} --repo asp53826/counterexample`,
  receipts: [],
};

for (const { capsule } of entries) {
  const engine = engineManifest.engines[capsule.engine];
  const command = engine.commands[capsule.verification.commandId];
  const capsuleDigest = sha256(capsule);
  const receipt = {
    format: "counterexample-receipt/v1",
    issuedAt: `${capsule.verifiedAt}T00:00:00Z`,
    issuer: { name: "COUNTEREXAMPLE", repository: "asp53826/counterexample", release: "v1.0.0" },
    subject: {
      id: capsule.id,
      caseNumber: capsule.caseNumber,
      title: capsule.title,
      repository: engine.repository,
      commit: capsule.commit,
    },
    capsule,
    verification: {
      commandId: capsule.verification.commandId,
      command: command.display,
      expected: command.expected,
      observed: capsule.verification.result,
      test: githubEvidenceUrl(engine, capsule.commit, capsule.verification.testPath, capsule.verification.testLines),
      benchmark: capsule.verification.benchmarkPath ? githubEvidenceUrl(engine, capsule.commit, capsule.verification.benchmarkPath, capsule.verification.benchmarkLines) : null,
    },
    integrity: {
      capsuleSha256: capsuleDigest,
      releaseBundle,
      verifyReceipt: `node bin/counterexample.mjs verify receipts/${capsule.id}.receipt.json`,
      verifyAttestation: `gh attestation verify ${releaseBundle} --repo asp53826/counterexample`,
    },
  };
  const complete = { ...receipt, receiptSha256: sha256(receipt) };
  const filename = `${capsule.id}.receipt.json`;
  const serialized = `${JSON.stringify(complete, null, 2)}\n`;
  await writeFile(path.join(outputDirectory, filename), serialized);
  manifest.receipts.push({
    id: capsule.id,
    caseNumber: capsule.caseNumber,
    filename,
    receiptSha256: complete.receiptSha256,
    fileSha256: sha256(serialized),
  });
}

manifest.indexSha256 = sha256(manifest.receipts);
await writeFile(path.join(outputDirectory, "index.json"), `${JSON.stringify(manifest, null, 2)}\n`);
await writeFile(path.join(outputDirectory, "MANIFEST.sha256"), `${manifest.receipts.map((entry) => `${entry.fileSha256}  ${entry.filename}`).join("\n")}\n`);
await run("tar", ["-czf", releaseBundle, "MANIFEST.sha256", "index.json", ...manifest.receipts.map((entry) => entry.filename)], { cwd: outputDirectory });
await copyFile(path.join(root, "CITATION.cff"), path.join(root, "public", "CITATION.cff"));
console.log(`Generated ${manifest.receipts.length} self-contained receipts; index ${manifest.indexSha256.slice(0, 12)}`);
