# Extensions

OTSD supports sport-specific fields via `extensions`.

## Rule
Any OTSD entity MAY include:
- `sport`: string (e.g., "ice_hockey", "football", "rugby_union")
- `extensions`: map keyed by namespace

Example:
```json
{
  "extensions": {
    "otsd.ice_hockey": { "plus_minus": 1, "pim": 2 }
  }
}
```

## Namespaces

Recommended:
- `otsd.<sport>` for community extensions
- `<vendor>.<domain>` for vendor-specific fields (should be avoided in shared exports)

## Recommended Structure

While not mandatory, a versioned structure improves predictability and evolution:

```json
{
  "extensions": {
    "otsd.<domain>": {
      "version": "1.0",
      "data": {
        // extension-specific fields
      }
    }
  }
}
```

### Examples

**Game metadata:**
```json
{
  "extensions": {
    "otsd.game_meta": {
      "version": "1.0",
      "data": {
        "periods": 3,
        "period_length_minutes": 20,
        "overtime_format": "sudden_death"
      }
    }
  }
}
```

**Sport-specific stats:**
```json
{
  "extensions": {
    "otsd.ice_hockey": {
      "version": "1.0",
      "data": {
        "plus_minus": 1,
        "pim": 2,
        "faceoff_wins": 12,
        "faceoff_losses": 8
      }
    }
  }
}
```

This pattern mirrors how OpenAPI vendor extensions evolved (`x-*` → conventions) and provides:
- Clear versioning for extension evolution
- Predictable structure for parsers
- Separation between metadata and data

## Modeling Hierarchical Competitive Structures

Some sports have complex internal competitive structures that go beyond simple timing segments. OTSD supports these through structured extensions.

### Cricket Example

Cricket matches contain innings, which contain overs, which contain individual balls. Each level has competitive significance:

```json
{
  "type": "game",
  "id": "gme_cricket_001",
  "source": "benchli",
  "team_id": "team_mumbai",
  "title": "Mumbai Indians vs Chennai Super Kings",
  "start_at": "2026-03-15T19:30:00Z",
  "end_at": "2026-03-15T23:00:00Z",
  "competition_id": "ipl_2026",
  "opponent_name": "Chennai Super Kings",
  "status": "completed",
  "sport": "cricket",
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
            "number": 1,
            "batting_team_id": "team_mumbai",
            "bowling_team_id": "team_chennai",
            "runs": 185,
            "wickets": 6,
            "overs": 20.0,
            "extras": {
              "wides": 8,
              "no_balls": 3,
              "byes": 2,
              "leg_byes": 1
            }
          },
          {
            "number": 2,
            "batting_team_id": "team_chennai",
            "bowling_team_id": "team_mumbai",
            "runs": 178,
            "wickets": 8,
            "overs": 20.0,
            "extras": {
              "wides": 5,
              "no_balls": 2,
              "byes": 0,
              "leg_byes": 3
            }
          }
        ],
        "result": {
          "winner_team_id": "team_mumbai",
          "margin_type": "runs",
          "margin_value": 7,
          "description": "Mumbai Indians won by 7 runs"
        },
        "toss": {
          "winner_team_id": "team_mumbai",
          "decision": "bat"
        }
      }
    }
  }
}
```

### Baseball Example

Baseball has innings with top/bottom halves, each representing a competitive unit:

```json
{
  "type": "game",
  "id": "gme_baseball_001",
  "source": "benchli",
  "team_id": "team_yankees",
  "title": "Yankees vs Red Sox",
  "start_at": "2026-04-10T19:00:00Z",
  "end_at": "2026-04-10T22:30:00Z",
  "home_away": "home",
  "opponent_name": "Boston Red Sox",
  "home_score": 5,
  "away_score": 3,
  "status": "completed",
  "sport": "baseball",
  "extensions": {
    "otsd.baseball": {
      "version": "1.0",
      "data": {
        "shape": "hierarchical",
        "root_unit": "game",
        "units": ["game", "inning", "half_inning", "at_bat"],
        "outcome_level": "game",
        "innings_played": 9,
        "innings": [
          {
            "number": 1,
            "top": { "runs": 0, "hits": 1, "errors": 0 },
            "bottom": { "runs": 2, "hits": 3, "errors": 0 }
          },
          {
            "number": 2,
            "top": { "runs": 1, "hits": 2, "errors": 0 },
            "bottom": { "runs": 0, "hits": 0, "errors": 1 }
          }
          // ... additional innings
        ],
        "line_score": {
          "away": { "runs": 3, "hits": 8, "errors": 1 },
          "home": { "runs": 5, "hits": 10, "errors": 0 }
        }
      }
    }
  }
}
```

### Tennis Example (Set-based)

Tennis matches are won by winning sets, which are won by winning games:

```json
{
  "type": "game",
  "sport": "tennis",
  "extensions": {
    "otsd.tennis": {
      "version": "1.0",
      "data": {
        "shape": "hierarchical",
        "format": "best_of_3",
        "root_unit": "match",
        "units": ["match", "set", "game", "point"],
        "outcome_level": "match",
        "sets": [
          {
            "number": 1,
            "player1_games": 6,
            "player2_games": 4,
            "tiebreak": false
          },
          {
            "number": 2,
            "player1_games": 7,
            "player2_games": 6,
            "tiebreak": true,
            "tiebreak_score": "7-5"
          }
        ],
        "result": {
          "winner_player_id": "ply_001",
          "sets_won": 2,
          "sets_lost": 0
        }
      }
    }
  }
}
```

### Design Principles for Hierarchical Sports

1. **Declare the hierarchy**: Use `units` array to show competitive unit nesting
2. **Specify outcome level**: Indicate where the final competitive outcome is determined
3. **Model variants explicitly**: Different formats (T20 vs Test, best-of-3 vs best-of-5) should be distinguishable
4. **Preserve competitive semantics**: Each level should capture its competitive significance, not just timing
5. **Use consistent structure**: Follow the versioned extension pattern for predictability

