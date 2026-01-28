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

## Competition Shapes

Different sports have fundamentally different competitive structures. OTSD recognizes two primary patterns:

### Atomic Competitive Events

Sports where a single match/game is the primary competitive unit with simple internal structure.

**Examples:** Ice hockey, basketball, football (soccer), rugby

**Characteristics:**
- Match is a single competitive unit
- Internal segments (periods, quarters, halves) are timing divisions, not separate competitive units
- Outcome determined at match level
- Score aggregates across segments

**OTSD Modeling:**
Use `Game` entity with sport-specific segment details in extensions:

```json
{
  "type": "game",
  "title": "Flyers vs Lions",
  "home_score": 4,
  "away_score": 3,
  "status": "completed",
  "extensions": {
    "otsd.ice_hockey": {
      "version": "1.0",
      "data": {
        "periods": 3,
        "period_length_minutes": 20,
        "overtime_played": false
      }
    }
  }
}
```

### Hierarchical Competitive Events

Sports where matches contain nested competitive units with their own outcomes.

**Examples:** Cricket, baseball, tennis (sets/games)

**Characteristics:**
- Match contains multiple competitive sub-units (innings, sets)
- Each sub-unit has its own outcome
- Match outcome derived from sub-unit outcomes
- Different variants may have different structures (Test vs T20 cricket)

**OTSD Modeling:**
Use `Game` entity with hierarchical structure in extensions:

```json
{
  "type": "game",
  "title": "Mumbai Indians vs Chennai Super Kings",
  "status": "completed",
  "competition_shape": "hierarchical",
  "competition_units": ["match", "innings", "over", "ball"],
  "extensions": {
    "otsd.cricket": {
      "version": "1.0",
      "data": {
        "shape": "hierarchical",
        "variant": "t20",
        "root_unit": "match",
        "units": ["match", "innings", "over", "ball"],
        "outcome_level": "match",
        "innings": [
          {
            "batting_team": "team_001",
            "runs": 185,
            "wickets": 6,
            "overs": 20.0
          },
          {
            "batting_team": "opponent",
            "runs": 178,
            "wickets": 8,
            "overs": 20.0
          }
        ],
        "result": {
          "winner": "team_001",
          "margin": "7 runs"
        }
      }
    }
  }
}
```

### Variant Handling

Sports with multiple competitive formats should document variant-specific rules:

**Cricket variants:**
- **Test**: 2 innings per team, unlimited overs, multi-day
- **ODI**: 1 innings per team, 50 overs, single day
- **T20**: 1 innings per team, 20 overs, ~3 hours

**Baseball variants:**
- **Standard**: 9 innings
- **Doubleheader**: 7 innings per game

Extensions should include `variant` field to specify which format applies.

### Best Practices

1. **Atomic sports**: Keep core fields minimal, use extensions for segment details
2. **Hierarchical sports**: Model full structure in extensions with clear unit hierarchy
3. **Variants**: Always specify variant when multiple formats exist
4. **Outcome level**: Document where the competitive outcome is determined (match, set, series)

