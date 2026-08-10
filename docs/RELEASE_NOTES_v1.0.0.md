# COUNTEREXAMPLE v1.0.0 — First stable register

The first stable release admits twelve minimized counterexamples from eight public source engines.

## Stable surface

- Interactive failure museum and causal-tape operator
- Twelve schema-validated, data-only capsules
- Self-contained JSON receipts with SHA-256 content binding
- Signed GitHub build-provenance attestation for the receipt bundle
- SPDX software bill of materials
- Constrained issue-form intake and two-stage engine trust review
- CodeQL, dependency updates, OpenSSF Scorecard publishing, and GitHub Pages deployment

## Verification

```bash
gh release download v1.0.0 --repo asp53826/counterexample \
  --pattern counterexample-v1.0.0-receipts.tar.gz
gh attestation verify counterexample-v1.0.0-receipts.tar.gz \
  --repo asp53826/counterexample
```

This release does not claim that the source engines are universally correct. It preserves exact, bounded failure evidence and the narrower claims that survive it.
