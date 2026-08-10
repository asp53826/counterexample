# Constrained counterexample submission protocol

## Purpose

The protocol makes external failures reviewable without turning public intake into remote code execution or an evidence-free suggestion box.

## Stage A — public candidate

The issue form collects only bounded text and URLs:

- public source repository;
- exact 40-character commit;
- smallest trigger;
- observed witness;
- falsified invariant;
- deterministic reproduction steps;
- expected response and known boundary;
- confirmation that the report contains no secret or undisclosed exploit.

No attachment is executed. No arbitrary workflow dispatch is exposed.

## Stage B — trust review

If the engine is not allowlisted, maintainers independently review ownership, license, revision stability, dependency surface, command determinism, runtime cost, and network behavior. The engine manifest is changed separately from the evidence capsule so the trust-boundary change is visible in review.

## Stage C — invited capsule

The candidate becomes a data-only JSON capsule. Automated gates enforce:

- JSON Schema 2020-12 with no undeclared properties;
- maximum 64 KiB file size;
- fixed enums for engine, fault class, invariant, disposition, and severity;
- exact revision equality with the engine manifest;
- allowlisted command IDs only;
- safe relative evidence paths;
- a causal tape beginning with a trigger and containing a witness;
- recursive rejection of executable, secret, and webhook fields.

## Stage D — reproduction and admission

A maintainer runs the trusted verification command in the source engine, inspects the cited evidence at the exact commit, and checks that all numerical claims are present in the source. Once merged, CI generates the receipt from canonicalized capsule data.

## Receipt semantics

The capsule digest binds the declarative failure record. The receipt digest binds the capsule, source identity, command identity, and evidence links. The release artifact attestation binds the receipt bundle to its GitHub Actions build identity. These are provenance claims—not universal proofs of correctness.

## Rejection reasons

A candidate is declined if it is irreproducible, primarily promotional, depends on private evidence, contains invented measurements, requests execution of unreviewed code, exposes a live secret, or cannot state a falsifiable invariant.
