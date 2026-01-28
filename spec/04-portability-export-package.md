# Portability Export Package (ZIP)

## Package format
An OTSD export is a ZIP file containing:
- `manifest.json` (required)
- `records/*.ndjson` (required) newline-delimited JSON
- `media/` (optional) photos and assets
- `attachments/` (optional) documents

## NDJSON record envelope
Each line in an NDJSON file is a `Record` object:
- `type`: record type (e.g., "player", "team", "game")
- `schema_version`: e.g., "0.1"
- `data`: the entity payload

## Files
Recommended split:
- `records/core.ndjson`
- Optional additional NDJSON files for size/partitioning:
  - `records/games.ndjson`
  - `records/stats.ndjson`
  - etc.

## manifest.json requirements
Manifest MUST include:
- `otsd_version`
- `package_id`
- `created_at`
- `producer`
- `scope`
- `files` with sha256 hashes
- `counts` by record type
- `missing_references` if applicable

## Media references
Entities MAY reference media by relative path within `media/`:
- `media_ref.path`
- `media_ref.sha256`
