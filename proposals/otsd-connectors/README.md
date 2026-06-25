# otsd-connectors

> **Status:** Proposal / hand-off overview for a new, separate repository
> (`otsd-connectors`). This document is intended to seed that repo's `README`
> and brief the implementing team. It is **not** part of the OTSD normative
> specification.

An open library of **ETL connectors** that move team-sports operational data
between third-party platforms and the [Open Team Sports Data Standard
(OTSD)](https://github.com/benchli-sports/open-team-sports-data-standard).

The goal is seamless **ingestion and migration**: get a team, club, or league
*out* of whatever system holds their data today and *into* any OTSD-speaking
system — with identity mappings and history preserved.

---

## 1. Why this exists

Teams and clubs are scattered across dozens of platforms — competitive/team
apps (TeamSnap, Spond, Heja, SpielerPlus), club/league platforms (SportsEngine,
LeagueApps, PlayMetrics, GotSport), and a long tail of spreadsheets and custom
databases. Moving between any two of them today is bespoke, lossy, and manual.

OTSD already defines a portable interchange format (records + manifest, schema-
validated). This repo provides the **connectors** that read from and write to
real systems, using OTSD as the pivot. Putting OTSD in the middle turns an
N×M integration problem into **N + M**: each source learns to emit OTSD once,
each destination learns to read OTSD once.

```
   Sources (read)              Interchange                Targets (write)
 ┌──────────────────┐                                   ┌──────────────────┐
 │ TeamSnap         │─┐                               ┌─│ benchli          │
 │ Spond / Heja     │ │     ┌───────────────────┐     │ │ (any OTSD        │
 │ SpielerPlus      │ ├────▶│  OTSD export pkg   │────▶┤ │  consumer)       │
 │ Excel / CSV      │ │     │  *.ndjson +        │     │ │                  │
 │ MySQL (custom)   │─┘     │  manifest.json     │     │ └──────────────────┘
 └──────────────────┘       └───────────────────┘     │
          │                  ▲  validates against      │
          └───── CI ─────────┘  OTSD v0.x schemas ─────┘
```

This mirrors the **tap/target** pattern popularized by Singer and Airbyte: a
**source connector** is a "tap" (`Platform → OTSD`), a **target connector** is a
"target" (`OTSD → system`). Sources and targets never talk to each other
directly — they only ever speak OTSD.

---

## 2. Core concepts

| Term | Meaning |
|---|---|
| **Source connector** | Reads a platform/file/DB and **emits a valid OTSD export package**. |
| **Target connector** | Reads an OTSD export package and **loads it into a destination** system. |
| **Framework** | Shared library every connector builds on: OTSD record/manifest writer, schema validator, ID-mapping, media/attachment handling, run reporting, and the CLI. |
| **OTSD package** | The unit exchanged between a source and a target: `manifest.json` + `*.ndjson` records (+ optional `media/`, `attachments/`), exactly as defined by the OTSD spec. |
| **Access method** | *How* a source obtains data (official API, user-supplied export file, or scrape). Drives the public/private and stability policy — see §5. |

A **migration** is just `source → OTSD package → target`. The package is the
contract; either half can be run independently (export to a file today, import
next week).

---

## 3. Repository layout

```
otsd-connectors/
├── framework/              # core library + CLI (the only hard dependency for connectors)
│   ├── otsd-writer/        #   build records.ndjson + manifest.json
│   ├── validate/           #   wrap the OTSD AJV validator; every package must pass
│   ├── id-map/             #   (source,id) -> local_id table; populate external_ids
│   ├── report/             #   run summary: counts, missing_references, warnings
│   └── cli/                #   `otsd-connect <source|target> ...`
├── sources/                # taps: Platform -> OTSD
│   ├── excel/              #   reference source (template-driven, zero ToS risk)
│   ├── mysql-generic/      #   map a custom schema via config
│   ├── teamsnap/
│   ├── spond/
│   └── ...
├── targets/                # OTSD -> destination
│   └── benchli/
├── schemas/                # vendored OTSD schemas, pinned to a released version
├── docs/
│   ├── connector-contract.md
│   └── access-policy.md    # the §5 decision matrix, authoritative copy
├── CONNECTOR.md            # per-connector metadata template (see §4)
└── LICENSE                 # Apache-2.0
```

Each connector lives in its own directory with: its code, a `CONNECTOR.md`,
fixtures, a golden OTSD output, and tests.

---

## 4. The connector contract

Every connector MUST:

1. **Declare metadata** in `CONNECTOR.md`:
   - `name`, `direction` (`source` | `target`), `platform`, `otsd_version`
   - `access_method` (`official_api` | `user_export` | `scrape`)
   - `tos_posture` (short note + link to the platform's terms/data-export policy)
   - `stability` (`stable` | `beta` | `experimental`), `maintainer` / CODEOWNERS
2. **Sources:** emit a **valid OTSD package** — `manifest.json` (with `counts`
   and `missing_references`) plus NDJSON records — that **passes the OTSD
   validator**. This is non-negotiable and enforced in CI.
3. **Preserve identity:** carry every upstream id into `external_ids`
   (`{system, id}`) so the destination can reconcile; never silently drop ids.
4. **Declare gaps:** anything referenced but not exported goes in
   `missing_references`; anything lossy is logged in the run report.
5. **Implement the standard interface** (CLI verbs): sources expose
   `extract`, targets expose `load`; config/secrets via env or a config file,
   never hard-coded.
6. **Ship fixtures:** at least one realistic input sample and its expected
   ("golden") OTSD output, both checked into the repo and validated in CI with
   **no live network calls**.
7. **Targets:** be idempotent and support `--dry-run`; never perform
   destructive writes without an explicit confirmation flag.

---

## 5. Public vs. private — the access-method policy

The repo is **open by default (Apache-2.0)**. Whether a *specific connector*
ships publicly is governed by **how it gets the data**, not by which platform it
targets:

| Access method | Examples | Posture |
|---|---|---|
| **Official API / partner program** | TeamSnap, LeagueApps, SportsEngine, GotSport org feeds *(verify per platform)* | **Public** — sanctioned, stable, defensible. |
| **User-supplied export file** | Any platform — the **user** downloads their own export, the connector parses it | **Public** — the user exercises their own data-portability right (GDPR Art. 20 is a tailwind, esp. for EU platforms like Spond / Heja / SpielerPlus). |
| **Scraping / undocumented endpoints** | — | **Private, or do not ship.** Brittle, and a public repo advertising a platform invites a takedown. |

Practical consequences:
- For closed platforms with no open API, prefer the **user-export-file** path —
  it is both the most defensible *and* the most stable.
- Each connector's `access_method` makes its posture self-documenting.
- Add a disclaimer to every connector ("not affiliated with or endorsed by
  <platform>") and avoid trademarks in package names that imply endorsement.

The authoritative version of this table lives in `docs/access-policy.md`.

---

## 6. Initial target platforms

Grouped by **likely** access posture. **These are starting hypotheses — the
implementing team must verify each platform's current API availability and terms
before building.**

| Platform | Type | Likely access (verify) | Initial posture |
|---|---|---|---|
| Excel / CSV | Generic | User file | Public |
| Custom MySQL | Generic | Direct (user-owned DB) | Public |
| TeamSnap | Team app | Official API | Public |
| Spond | Team app | User export | Public |
| Heja | Team app | User export | Public |
| SpielerPlus | Team app | User export | Public |
| SportsEngine | Club/league | API / partner | Public (gated) |
| LeagueApps | Club/league | API / partner | Public (gated) |
| PlayMetrics | Club/league | TBD — verify | Pending review |
| GotSport | Club/league | Org data feeds | Public (gated) |

---

## 7. Validation & CI

- **Dogfood the OTSD validator.** Reuse the validator pattern already in the
  standard repo (`scripts/validate.js`, AJV 2020-12): every connector's golden
  output and every fixture-driven run is validated against the pinned OTSD
  schemas. A package that does not validate fails the build.
- **No network in CI.** Connectors are exercised against recorded fixtures, so
  the suite is deterministic and does not depend on third-party uptime or creds.
- **Per-connector CI** plus a framework suite; `CODEOWNERS` routes connector
  PRs to their maintainers.

---

## 8. Quality, safety & privacy

- **Idempotency & dry-run** for targets; no destructive writes without a flag.
- **PII handling** mirrors the OTSD security/privacy guidance: support redaction
  modes (e.g. drop DOB, keep birth year), keep secrets out of free-text fields,
  and export only what portability needs.
- **Schema-version pinning.** Each connector declares the OTSD version it
  targets; bumping the pinned schema is a deliberate, reviewed change.

---

## 9. Non-goals (for the first iteration)

- Not a real-time / continuous-sync platform — this is **batch ETL & migration**
  first. Live bidirectional sync can come later.
- Not a destination product — loading/visualizing data is the job of OTSD
  consumers (e.g. benchli), not this repo.
- No connectors that depend on prohibited scraping or circumventing access
  controls.

---

## 10. Suggested phasing

- **Phase 0 — Foundations.** Framework + CLI + validator wiring, the
  `excel`/`csv` reference **source**, and the `benchli` **target**. Proves the
  end-to-end `source → OTSD → target` loop on the lowest-risk inputs.
- **Phase 1 — Canonical API source.** One official-API source end-to-end (e.g.
  TeamSnap) as the worked example others copy.
- **Phase 2 — User-export sources.** Export-file parsers for the closed team
  apps (Spond / Heja / SpielerPlus).
- **Phase 3 — Club/league + community.** SportsEngine / LeagueApps / GotSport /
  PlayMetrics, and an open contribution path for the long tail.

A connector is "done" when it has a `CONNECTOR.md`, fixtures + golden output,
green CI (including OTSD validation), and a declared stability level.

---

## 11. Open decisions for the implementing team

- **Language/runtime.** Recommend **Node/TypeScript** for continuity — it reuses
  the existing AJV validator and gives one toolchain for CLI + connectors
  (spreadsheet/DB parsing is well-served in Node). Python is a reasonable
  alternative if the team prefers it for data wrangling; pick one and standardize.
- **Mono-repo tooling** (workspaces / turborepo / nx) and release strategy
  (per-connector versioning vs. unified).
- **Hosted service vs. library-only.** The connectors can stay a library; a
  hosted "migrate from X" service (the dbt/Airbyte-cloud model) is a separate,
  optional product decision.

---

## 12. Relationship to the OTSD standard repo

This repo **consumes** OTSD; it does not define it. Connector output must
validate against the published schemas. If a connector surfaces a gap or bug in
the standard itself, raise it upstream as a decision record in
`open-team-sports-data-standard/governance/decision-records/` rather than
working around it here.

## License

Apache-2.0, matching the OTSD standard repo.
