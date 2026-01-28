# Core Model

OTSD uses a small sport-agnostic core and supports sport-specific extensions.

## Core entities (v0.1)
- Player
- Team
- Membership
- Season
- Competition
- Venue
- Event
- Game
- RosterSnapshot
- Appearance
- StatLine
- PaymentRecord (portable ledger record)
- AuditEvent (portable audit trail)

## Relationships (high level)
- Player <-> Team via Membership
- Event belongs to Team (and optionally Competition/Season)
- Game specializes Event
- RosterSnapshot ties to Game and Team, and lists Player IDs
- Appearance ties Player to Game (a player "played")
- StatLine ties to Appearance or Game/Team/Player contexts

## The "players who play" guarantee
Systems should represent actual participation via:
- Appearance (required for played participation)
- StatLine may reference Appearance for player-level stats
