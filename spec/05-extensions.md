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

