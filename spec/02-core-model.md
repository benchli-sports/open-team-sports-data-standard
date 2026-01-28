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

## Scoring Perspectives

OTSD supports both team-relative and absolute scoring perspectives:

### Team-Relative Scoring
- `score_for`: goals/points scored by the team
- `score_against`: goals/points scored by opponent

**Use when:** Exporting team-scoped datasets where the perspective is always from one team's viewpoint.

### Absolute Scoring
- `home_score`: goals/points scored by home team
- `away_score`: goals/points scored by away team

**Use when:** Exporting competition-scoped datasets, league tables, or neutral aggregation scenarios.

Both perspectives are optional and can coexist in the same game record.

## Participation Intent vs Actual

OTSD distinguishes between participation intent (RSVP) and actual participation:

### Participation Summary (Intent)
The optional `participation_summary` field in `game.json` provides denormalized RSVP data:
- `yes`: player IDs who confirmed attendance
- `no`: player IDs who declined
- `maybe`: player IDs who are uncertain
- `unknown`: player IDs with no response

**Important:** This summary is explicitly allowed to be stale and is optimized for fast UI rendering.

### Appearance (Actual)
The `appearance` entity remains the source of truth for who actually played in a game.

## Statistics Model

### Metrics Container
The `metrics` field in `StatLine` is the canonical container for all statistical values:
- Values can be numeric (integer or float) or categorical (string, boolean)
- Examples: `{"goals": 2, "assists": 3, "plus_minus": 1, "position": "forward"}`

### Commentary
The optional `notes` field provides space for:
- Coaching observations
- Disciplinary remarks
- Game report annotations
- Any contextual information about the statistics

