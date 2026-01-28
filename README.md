# Open Team Sports Data Standard (OTSD)

OTSD is an open specification for **portable team sports operational data**, focused on:
- Teams and rosters
- Players who play (appearances)
- Games and events
- Stats (portable, multi-sport extensible)
- Data portability via a standardized export package

## What OTSD is (v0.1)
- **Data model + JSON Schemas** for validation
- **Portability export package**: ZIP + `manifest.json` + NDJSON records
- **API profile** (OpenAPI) for export/import/read patterns
- **Extensions mechanism** for sport-specific fields

## What OTSD is not
- A broadcast/live-feed spec
- A scoring rules engine
- A mandated identity system
- A payment processor spec

## Versions
- Current: **v0.1** (pre-1.0, breaking changes allowed)

## Quick start
- Read the spec: `spec/`
- Validate payloads: `schemas/v0.1/`
- Use portability package: `spec/04-portability-export-package.md`
- API profile: `api/v0.1/openapi.yaml`

## Reference Implementation
Benchli intends to provide a reference implementation:
- OTSD export endpoint producing OTSD ZIP packages
- OTSD import tooling supporting ID mapping and partial imports
