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
