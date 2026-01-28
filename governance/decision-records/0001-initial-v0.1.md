# 0001 - Initial OTSD v0.1

## Status
Accepted

## Context
There is no open, portability-first standard for team sports operational data.

## Decision
Publish OTSD v0.1 with:
- ZIP export package (manifest + NDJSON records)
- Core entities: Player, Team, Membership, Event, Game, RosterSnapshot, Appearance, StatLine
- Extension mechanism for sport-specific fields
- OpenAPI profile for export/import/read patterns

## Consequences
- v0.1 is opinionated and minimal; community feedback will inform v0.2+
