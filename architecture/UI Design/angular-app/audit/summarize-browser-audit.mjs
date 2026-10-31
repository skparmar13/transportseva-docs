import fs from 'node:fs';
import path from 'node:path';
const file = process.argv[2];
if (!file) throw new Error('Pass the Playwright JSON report path.');
const report = JSON.parse(fs.readFileSync(file, 'utf8'));
const tests = [];
function visit(suite) {
  for (const spec of suite.specs ?? []) for (const test of spec.tests ?? []) tests.push({ title: spec.title, ...test });
  for (const child of suite.suites ?? []) visit(child);
}
visit(report);
const evidence = [];
for (const test of tests) {
  for (const result of test.results ?? []) {
    if (result.status !== 'passed') continue;
    for (const attachment of result.attachments ?? []) {
      if (!attachment.name.endsWith('-audit.json')) continue;
      const body = attachment.body ? Buffer.from(attachment.body, 'base64').toString('utf8')
        : fs.readFileSync(path.resolve(attachment.path), 'utf8');
      evidence.push(JSON.parse(body));
    }
  }
}
const rows = evidence.flatMap((item) => item.rows ?? []);
const unique = [...new Set(rows.map((row) => row.requested))];
const summary = {
  report: file, collections: tests.length,
  passed: tests.filter((test) => test.results?.some((result) => result.status === 'passed')).length,
  failed: tests.filter((test) => !test.results?.some((result) => result.status === 'passed')).map((test) => ({
    title: test.title, errors: test.results?.flatMap((result) => result.errors?.map((error) => error.message) ?? []),
  })),
  evidenceAttachments: evidence.length,
  routeVisits: rows.length, distinctRequestedUrls: unique.length,
  actualRedirects: rows.filter((row) => row.actual !== row.requested).map((row) => ({ requested: row.requested, actual: row.actual })),
  renderOrHttpIssues: rows.filter((row) => row.renderIssue || (row.http && row.http >= 400)),
  blockedBusinessWrites: evidence.flatMap((item) => item.attemptedBlockedWrites ?? []),
  actors: evidence.filter((item) => item.identity).map((item) => ({
    identity: item.identity, inspectedRoutes: item.rows?.length, findings: item.findings,
    staffRole: item.access?.role_code, allowedStaffRoutes: item.access?.routes,
  })),
  publicForms: evidence.filter((item) => 'contactShowsSent' in item).map((item) => ({
    contactShowsSent: item.contactShowsSent, newsletterStoredLocally: item.newsletterStoredLocally,
  })),
  homepageReviewFallback: evidence.flatMap((item) => item.observations ?? []),
  caveat: 'Passing diagnostics means collection completed, not that observed features are correct or complete.',
};
if (process.argv.includes('--emit')) {
  const output = path.resolve('test-results/screen-audit-2026-10-31/browser-summary.json');
  fs.writeFileSync(output, JSON.stringify(summary, null, 2));
}
console.log(JSON.stringify(summary, null, 2));
