# 0002 - Benchli Alignment Updates

## Status
Accepted

## Context
Benchli has been using OTSD v0.1 in production and identified several areas where targeted refinements would materially improve:
- **Interoperability**: Absolute vs team-relative scoring perspectives
- **Client efficiency**: Denormalized participation summaries for fast UI rendering
- **Real-world adoption**: Commentary fields, flexible identifiers, structured extensions

All proposals are additive and preserve OTSD's portability-first philosophy.

## Decision
Enhance OTSD v0.1 specification with the following optional additions:

### 1. Absolute Scoring Perspective
**Add to `game.json`:**
- `home_score` (optional integer)
- `away_score` (optional integer)

**Rationale:**
- Absolute scores simplify aggregation, league tables, and neutral viewing
- Team-relative scores (`score_for`/`score_against`) remain valuable for team-scoped exports
- Both perspectives serve different use cases, similar to financial APIs offering account-relative and absolute values

**Guidance:**
- Use `score_for`/`score_against` for team-scoped datasets
- Use `home_score`/`away_score` for competition-scoped datasets

### 2. Stat Commentary
**Add to `stat_line.json`:**
- `notes` (optional string)

**Rationale:**
- Commentary is common in coaching notes, disciplinary remarks, and game reports
- Keeping it optional preserves portability and privacy controls
- Clarifies that `metrics` is the canonical container for stat values

### 3. Participation Summary
**Add to `game.json`:**
- `participation_summary` (optional object with `yes`, `no`, `maybe`, `unknown` arrays)

**Rationale:**
- Massive client performance win for UI rendering
- Clear separation between intent (RSVP) and actual participation (`appearance`)
- Summary is explicitly denormalized and allowed to be stale
- Avoids forcing every UI to re-implement aggregation logic

### 4. Flexible Venue Identifiers
**Clarify in specification:**
- Identifiers MAY be opaque IDs, URNs, or structured slugs
- Examples: `"venue_123"`, `"urn:venue:ch/zurich/hallenstadion"`, `"ch/zurich/hallenstadion"`

**Rationale:**
- Enables federation without central registries
- Aligns with OpenStreetMap, DNS, URN patterns
- Improves human debugging and cross-system reconciliation

### 5. Structured Extension Pattern
**Recommend (not mandate) in specification:**
```json
"extensions": {
  "otsd.<domain>": {
    "version": "1.0",
    "data": { ... }
  }
}
```

**Rationale:**
- Predictability without lock-in
- Mirrors how OpenAPI vendor extensions evolved (`x-*` → conventions)
- Keeps presentation metadata out of core while providing UI clients a predictable hook

### 6. Competition Shape (Core Schema Enhancement)
**Add to `game.json`:**
- `competition_shape` (optional enum: "atomic" | "hierarchical")
- `competition_units` (optional array of strings)

**Rationale:**
- Different sports have fundamentally different competitive structures
- **Atomic sports** (ice hockey, basketball, football): single competitive unit with timing segments
- **Hierarchical sports** (cricket, baseball, tennis): nested competitive units with independent outcomes
- Core fields provide discoverability; extensions provide sport-specific details
- Enables clients to understand competitive structure without parsing sport-specific extensions
- Critical for global sports adoption (cricket, baseball have billions of fans)

**Examples:**
```json
// Ice hockey (atomic)
{
  "competition_shape": "atomic",
  "extensions": {
    "otsd.ice_hockey": {
      "data": { "periods": 3, "period_length_minutes": 20 }
    }
  }
}

// Cricket (hierarchical)
{
  "competition_shape": "hierarchical",
  "competition_units": ["match", "innings", "over", "ball"],
  "extensions": {
    "otsd.cricket": {
      "data": {
        "variant": "t20",
        "innings": [...]
      }
    }
  }
}
```

### 7. Stat Cataloging (Deferred)
**Decision:** Introduce as optional, non-core extension in future
- Tiered stats (simple/detailed/advanced) are presentation metadata
- Keeping out of core avoids premature standardization
- Can be added later as `stat_definitions.json` under extensions

## Consequences
### Positive
- OTSD stays thin and portable
- Benchli fits naturally as reference implementation
- Third-party clients get faster rendering, clearer semantics, fewer implicit assumptions
- Avoids over-modeling too early

### Neutral
- Implementations can adopt new fields incrementally
- No breaking changes to existing v0.1 exports

### Risks
- None identified; all changes are optional and additive

## References
- Benchli alignment review document (2026-01-28)
- OTSD v0.1 specification
