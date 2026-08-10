# Security policy

## Supported version

Security fixes are applied to the latest stable release and `main`.

## Report privately

Do not place secrets, exploit payloads, personal data, or an unpatched vulnerability in the public counterexample form. Use [GitHub private vulnerability reporting](https://github.com/asp53826/counterexample/security/advisories/new) for a security issue in COUNTEREXAMPLE itself.

The counterexample intake is for already-public, safely reproducible engineering failures. A security report and a counterexample submission are separate processes.

## Submission execution boundary

Capsules are declarative JSON. They cannot embed executable commands. The trusted engine allowlist maps reviewed command IDs to fixed commands, and CI validates capsule size, schema, revision, paths, and forbidden fields before receipt generation.
