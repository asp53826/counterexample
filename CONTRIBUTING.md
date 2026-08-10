# Contributing counterexamples

COUNTEREXAMPLE welcomes rigorous failures. It does not accept unbounded executable submissions.

## Intake sequence

1. Open the **Counterexample candidate** issue form.
2. Provide the exact public repository and 40-character commit.
3. State one falsifiable invariant and the smallest deterministic trigger.
4. Link a public test, trace, fixture, or benchmark witness.
5. Describe the response and the boundary that remains.
6. Wait for triage before opening a capsule pull request.

Maintainer triage assigns one of four outcomes: `declined`, `needs-minimization`, `engine-trust-review`, or `capsule-invited`.

## Capsule pull requests

An invited capsule must:

- be a single data-only JSON file under `capsules/`;
- validate against `schemas/counterexample.schema.json`;
- stay below 64 KiB;
- bind an engine and revision already present in `config/engines.json`;
- reference an allowlisted command ID rather than embedding a command;
- contain no scripts, shell, executable fields, HTML, JavaScript, webhooks, tokens, or secrets;
- include at least one honest limitation.

Run:

```bash
npm ci
npm run check
```

Engine additions are separate trust-boundary changes. They require maintainer review of repository ownership, revision stability, license, test isolation, and the proposed command before a capsule is accepted.

## Review standard

A surprising result is not enough. Reviewers must be able to connect the trigger to an observed witness, the witness to a violated invariant, and the response to a narrower claim. Measurements must come from the linked evidence; do not estimate or decorate them.

By contributing, you agree that your contribution is licensed under the repository's MIT license.
