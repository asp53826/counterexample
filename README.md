# COUNTEREXAMPLE

**A public engineering failure museum.** Twelve minimized failure regimes, eight public source engines, exact commit identities, constrained external intake, and downloadable receipts with verifiable build provenance.

[Operate the museum](https://asp53826.github.io/counterexample/) · [Download the stable release](https://github.com/asp53826/counterexample/releases/tag/v1.0.0) · [Submit a counterexample](https://github.com/asp53826/counterexample/issues/new?template=counterexample.yml)

[![CI](https://github.com/asp53826/counterexample/actions/workflows/ci.yml/badge.svg)](https://github.com/asp53826/counterexample/actions/workflows/ci.yml)
[![OpenSSF Scorecard](https://api.scorecard.dev/projects/github.com/asp53826/counterexample/badge)](https://scorecard.dev/viewer/?uri=github.com/asp53826/counterexample)
[![CodeQL](https://github.com/asp53826/counterexample/actions/workflows/codeql.yml/badge.svg)](https://github.com/asp53826/counterexample/actions/workflows/codeql.yml)
[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.PENDING.svg)](https://doi.org/10.5281/zenodo.PENDING)

> The DOI badge remains intentionally marked `PENDING` until Zenodo mints the identifier. It is not a decorative or invented DOI.

## What is admitted

| Register | Failure regime | Source engine | Disposition |
|---|---|---|---|
| CX-001 | Minority append cannot commit | `raft-mvcc` | guarded |
| CX-002 | Stale candidate solicits leadership | `raft-mvcc` | guarded |
| CX-003 | Stale read violates real time | `raft-mvcc` | guarded |
| CX-004 | IMM bank misses a turn regime | `track-fusion` | bounded |
| CX-005 | Clutter confirms ghost tracks | `track-fusion` | repaired |
| CX-006 | Hover provides no depth baseline | `vio-nav` | bounded |
| CX-007 | Pathwise AAD returns zero on a digital | `aad-greeks` | bounded |
| CX-008 | Profit conceals inventory risk | `lob-market-making` | bounded |
| CX-009 | Incompatible tensor shapes reach lowering | `tensorforge-webgpu` | guarded |
| CX-010 | Low HNSW search budget hides recall loss | `annlite` | bounded |
| CX-011 | High-order phase exceeds autofocus model | `sar-focus` | bounded |
| CX-012 | Autofocus degrades a clean image | `sar-focus` | repaired |

Every capsule binds:

- a public repository and exact 40-character commit;
- a trigger, observed failure, invariant, response, and honest boundary;
- an allowlisted verification command and source witness;
- measured broken/constrained values where the source exposes them;
- a self-contained JSON receipt with capsule and canonical receipt SHA-256 digests;
- a release manifest with separate SHA-256 digests for the serialized download bytes.

The receipts prove what is actually claimed. The content digest detects modification. The GitHub artifact attestation establishes which repository workflow built the release bundle. Neither mechanism independently proves that a scientific conclusion is universally true.

## Verify the stable receipts

```bash
gh release download v1.0.0 --repo asp53826/counterexample \
  --pattern counterexample-v1.0.0-receipts.tar.gz

gh attestation verify counterexample-v1.0.0-receipts.tar.gz \
  --repo asp53826/counterexample
```

Verify an extracted receipt's internal content binding:

```bash
tar -xzf counterexample-v1.0.0-receipts.tar.gz
node bin/counterexample.mjs verify vio-hover-no-parallax.receipt.json
```

## Run the museum

Requires Node.js 22 or newer.

```bash
npm ci
npm run check
npm run dev
```

`npm run check` performs schema validation, allowlist enforcement, forbidden-field scanning, receipt integrity tests, and TypeScript checking. `npm run build` also creates the deployable Vite site.

## Submission boundary

External intake begins with the [constrained issue form](https://github.com/asp53826/counterexample/issues/new?template=counterexample.yml), not executable code. The form requires an exact public revision, minimal trigger, invariant, observed witness, deterministic reproduction, and a declared boundary.

Only after triage may a contributor open a capsule PR. Capsules are data-only JSON, capped at 64 KiB, validated with JSON Schema 2020-12, and forbidden from containing scripts, shell commands, HTML, JavaScript, webhooks, tokens, or secrets. Verification commands live in a maintainer-controlled allowlist. See [the protocol](docs/SUBMISSION-PROTOCOL.md) and [contributing guide](CONTRIBUTING.md).

## Release and archive

`v1.0.0` is the first stable register. The release workflow rebuilds the receipts, generates an SPDX SBOM, creates GitHub artifact attestations, and publishes the immutable assets. `CITATION.cff` is included for software citation. The Zenodo DOI is added only after the actual archive record exists.

## Scope

COUNTEREXAMPLE is not a vulnerability marketplace, a benchmark leaderboard, or proof of general correctness. It preserves bounded, reproducible examples of where engineering claims fail—and the evidence used to narrow those claims.

MIT licensed. Security disclosures follow [SECURITY.md](SECURITY.md).
