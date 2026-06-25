#!/usr/bin/env node
/**
 * OTSD example validator.
 *
 * Loads every v0.1 JSON Schema, then validates each example payload and the
 * example export package against the appropriate schema.
 *
 * Known-failing cases are tracked in scripts/known-failures.json (an xfail-style
 * baseline). The build stays green as long as reality matches the baseline:
 *   - a case that newly fails but is NOT baselined      -> error (regression)
 *   - a case that now passes but IS still baselined     -> error (remove it)
 * This lets the documented v0.1 defects sit in the baseline until they are
 * fixed; fixing one is then just deleting its baseline entry and watching CI.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const Ajv = require('ajv/dist/2020');
const addFormats = require('ajv-formats');

const REPO = path.resolve(__dirname, '..');
const CORE = path.join(REPO, 'schemas/v0.1/core');
const EXPORT_SCHEMAS = path.join(REPO, 'schemas/v0.1/export');
const EXAMPLES = path.join(REPO, 'examples/v0.1');

const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

// Register every schema so relative $ref resolution works by $id.
const schemaIdByFile = {};
for (const dir of [CORE, EXPORT_SCHEMAS]) {
  for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.json'))) {
    const schema = readJson(path.join(dir, file));
    ajv.addSchema(schema);
    schemaIdByFile[file] = schema.$id;
  }
}
const validatorFor = (schemaFile) => ajv.getSchema(schemaIdByFile[schemaFile]);

const TYPE_TO_SCHEMA = {
  player: 'player.json',
  team: 'team.json',
  membership: 'membership.json',
  season: 'season.json',
  competition: 'competition.json',
  venue: 'venue.json',
  event: 'event.json',
  game: 'game.json',
  roster_snapshot: 'roster_snapshot.json',
  appearance: 'appearance.json',
  stat_line: 'stat_line.json',
  payment_record: 'payment_record.json',
  audit_event: 'audit_event.json',
};

// Build the list of validation cases: { id, schemaFile, data }.
const cases = [];

// 1) Standalone example payloads (schema chosen by the payload's own `type`).
const payloadDir = path.join(EXAMPLES, 'payloads');
for (const file of fs.readdirSync(payloadDir).filter((f) => f.endsWith('.json'))) {
  const data = readJson(path.join(payloadDir, file));
  const schemaFile = TYPE_TO_SCHEMA[data.type];
  if (!schemaFile) {
    console.error(`No schema mapped for payload type "${data.type}" (payloads/${file})`);
    process.exitCode = 1;
    continue;
  }
  cases.push({ id: `payloads/${file}`, schemaFile, data });
}

// 2) The export manifest.
cases.push({
  id: 'exports/manifest.json',
  schemaFile: 'package_manifest.json',
  data: readJson(path.join(EXAMPLES, 'exports/manifest.json')),
});

// 3) The NDJSON export: every line's envelope, plus each line's `data` payload.
const ndjsonPath = path.join(EXAMPLES, 'exports/records.core.ndjson');
const ndjsonLines = fs.readFileSync(ndjsonPath, 'utf8').trim().split('\n');
ndjsonLines.forEach((line, i) => {
  const record = JSON.parse(line);
  const lineNo = i + 1;
  cases.push({ id: `exports/records.core.ndjson:${lineNo} (envelope)`, schemaFile: 'ndjson_record.json', data: record });
  const schemaFile = TYPE_TO_SCHEMA[record.data && record.data.type];
  if (schemaFile) {
    cases.push({ id: `exports/records.core.ndjson:${lineNo} (data:${record.data.type})`, schemaFile, data: record.data });
  }
});

// Load the xfail baseline.
const baselinePath = path.join(__dirname, 'known-failures.json');
const baseline = readJson(baselinePath);
const baselineById = new Map(baseline.known_failures.map((k) => [k.id, k]));
const seenBaseline = new Set();

const PAD = Math.max(...cases.map((c) => c.id.length));
const fmtErrors = (errors) =>
  errors.map((e) => `        ${e.instancePath || '/'} ${e.message}${e.params ? ' ' + JSON.stringify(e.params) : ''}`).join('\n');

console.log(`OTSD example validation  (${cases.length} cases against schemas v0.1)\n`);

let pass = 0;
let knownFail = 0;
const regressions = [];
const nowPassing = [];

for (const c of cases) {
  const validate = validatorFor(c.schemaFile);
  const ok = validate(c.data);
  const baselined = baselineById.get(c.id);
  if (baselined) seenBaseline.add(c.id);

  if (ok && !baselined) {
    pass++;
    console.log(`PASS          ${c.id}`);
  } else if (!ok && baselined) {
    knownFail++;
    console.log(`KNOWN-FAIL    ${c.id.padEnd(PAD)}  [${baselined.defect}]`);
    console.log(fmtErrors(validate.errors));
  } else if (!ok && !baselined) {
    regressions.push(c);
    console.log(`REGRESSION    ${c.id.padEnd(PAD)}  <- unexpected failure`);
    console.log(fmtErrors(validate.errors));
  } else {
    // ok && baselined -> the defect appears fixed; baseline must be updated.
    nowPassing.push(c);
    console.log(`NOW-PASSING   ${c.id.padEnd(PAD)}  <- remove from known-failures.json`);
  }
}

// Baseline entries that no longer correspond to any case (stale).
const staleBaseline = baseline.known_failures.filter((k) => !seenBaseline.has(k.id));

console.log(`\nSummary: ${pass} pass, ${knownFail} known-fail (baselined), ${regressions.length} regression(s), ${nowPassing.length} now-passing`);

if (regressions.length) {
  console.error(`\n✗ ${regressions.length} example(s) fail validation and are not in the baseline.`);
}
if (nowPassing.length) {
  console.error(`\n✗ ${nowPassing.length} baselined case(s) now pass — delete them from scripts/known-failures.json.`);
}
if (staleBaseline.length) {
  console.error(`\n✗ Stale baseline id(s) match no validation case: ${staleBaseline.map((k) => k.id).join(', ')}`);
}

if (regressions.length || nowPassing.length || staleBaseline.length) {
  process.exitCode = 1;
} else {
  console.log('\n✓ All examples match the schemas (or the documented known-failure baseline).');
}
