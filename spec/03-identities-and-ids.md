# Identities and IDs

OTSD avoids mandating a global identity system.

## ID model
Every entity MUST include:
- `id`: provider-local stable identifier (string)
- `source`: identifier for the system minting the `id` (string)
- `external_ids`: optional array of known identifiers in other systems

### ID Format Flexibility
Identifiers MAY be:
- **Opaque IDs**: `"venue_123"`, `"ply_a1b2c3d4"`
- **URNs**: `"urn:venue:ch/zurich/hallenstadion"`, `"urn:player:benchli:12345"`
- **Structured slugs**: `"ch/zurich/hallenstadion"`, `"team/hc-davos"`

OTSD does not require a shared ID namespace. This flexibility:
- Enables federation without central registries
- Aligns with patterns from OpenStreetMap, DNS, and URN systems
- Improves human debugging and cross-system reconciliation

### External ID format
`external_ids[]` items:
- `system`: e.g., "benchli", "teamsnap", "playhq", "email"
- `id`: the identifier value

## Referential integrity
Exports MUST either:
- include all referenced entities in the package, OR
- declare missing references in the manifest.

## Import mapping
Importers should create and persist an ID mapping table:
- (source, id) -> local_id
while preserving original identifiers in `external_ids`.
