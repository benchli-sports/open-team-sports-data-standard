# Open Team Sports Data Standard (OTSD)

OTSD is an open specification for **portable team sports operational data**. It allows disparate systems (league management, team apps, scouting tools) to exchange core operational data without locking users into a single vendor.

## Core Capabilities (v0.1 Enhanced)

OTSD goes beyond simple game results to model the operational reality of team sports:

- **Global Competition Modeling**: Support for both **atomic** (Ice Hockey, Football) and **hierarchical** (Cricket, Baseball, Tennis) competitive structures.
- **Participation Lifecycle**: Distinguishes between **Intent** (RSVP summaries for efficiency) and **Actual** (Appearances for historical record).
- **Flexible Scoring**: Supports both absolute (`home_score`) and team-relative (`score_for`) perspectives.
- **Portable Stats**: Canonical `metrics` container with optional commentary and sport-specific extensions.
- **Identity Federation**: Flexible ID support (Opaque, URNs, Slugs) to enable cross-system reconciliation.

## What OTSD defines

- **Core Data Model**: Players, Teams, Games, Events, Seasons, Competitions.
- **JSON Schemas**: Rigorous validation for all entities (`schemas/v0.1/`).
- **Portability Package**: Standardized ZIP + `manifest.json` + NDJSON format for bulk data transfer.
- **API Profile**: OpenAPI definitions for export/import/read patterns.
- **Extension Mechanism**: Versioned, structured extensions for sport-specific deep dives.

## Supported Sports

OTSD is designed to be sport-agnostic while explicitly supporting:
- **Atomic Sports**: Ice Hockey, Basketball, Soccer, Rugby, Handball
- **Hierarchical Sports**: Cricket, Baseball, Tennis

## Quick Start

1. **Read the Spec**: 
   - [Core Model](spec/02-core-model.md) - Entities and relationships
   - [Extensions](spec/05-extensions.md) - How to model sport-specific rules
2. **Validate Data**: 
   - Use schemas in `schemas/v0.1/`
   - See examples in `examples/v0.1/payloads/`
3. **Implement Export/Import**:
   - Follow the [Portability Package Guide](spec/04-portability-export-package.md)

## Reference Implementation

Benchli uses OTSD in production as its native data interchange format, proving the standard's ability to handle:
- Complex multi-sport organizations
- Real-time mobile client requirements
- Global federation of venue and competition data

## Status

Current version: **v0.1** (Enhanced)
*Pre-1.0 specification. Feedback and contributions welcome.*
