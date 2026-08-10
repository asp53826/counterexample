import { validatedCapsules } from "./lib.mjs";

try {
  const { entries, engineManifest } = await validatedCapsules();
  const systems = new Set(entries.map(({ capsule }) => capsule.engine));
  const repaired = entries.filter(({ capsule }) => capsule.disposition === "repaired").length;
  const bounded = entries.filter(({ capsule }) => capsule.disposition === "bounded").length;
  const guarded = entries.filter(({ capsule }) => capsule.disposition === "guarded").length;
  console.log(`Validated ${entries.length} capsules across ${systems.size}/${Object.keys(engineManifest.engines).length} allowlisted engines`);
  console.log(`Disposition ledger: ${guarded} guarded, ${bounded} bounded, ${repaired} repaired`);
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
