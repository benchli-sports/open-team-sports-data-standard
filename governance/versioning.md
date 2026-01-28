# Versioning Policy

OTSD uses semantic versioning:
- **0.x**: breaking changes allowed; goal is rapid iteration.
- **1.0**: export package format, core IDs model, and core entities become stable.

## Compatibility promises
- Within a minor version (e.g., 0.1), schemas may add optional fields.
- Breaking changes require a new minor version (e.g., 0.2) and a decision record.

## Deprecation
When practical, fields should be deprecated (documented) before removal.
