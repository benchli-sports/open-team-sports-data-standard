# Contributing to OTSD

Thanks for contributing.

## How to contribute
1. Open an issue describing the change (bug, clarification, new entity, extension proposal).
2. Submit a PR referencing the issue.

## Guidelines
- Prefer backwards-compatible changes.
- For breaking changes, propose via a decision record in `governance/decision-records/`.
- Add/adjust JSON Schemas when changing the spec.
- Include examples in `examples/` for new fields/entities.

## Validation
- Any schema change should keep examples valid (or update examples alongside).
- Run `npm install` once, then `npm test` to validate every example payload and the
  example export package against the v0.1 JSON Schemas. CI runs the same check.
- Known schema defects are tracked as an xfail baseline in
  `scripts/known-failures.json`. When you fix a defect, delete its baseline entry;
  the validator will confirm the example now passes (and fail if it does not).
