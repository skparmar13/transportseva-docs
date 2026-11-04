import { test } from 'node:test';
import assert from 'node:assert/strict';
import { collectInventory } from './screen-source-audit.mjs';

test('every active backend route has a reviewed assessment and a current source anchor', () => {
  const audit = collectInventory();
  assert.ok(audit.screenRoutes > 100);
  assert.equal(audit.records.filter((row) => row.kind === 'screen').length, audit.screenRoutes);
  for (const row of audit.records.filter((item) => item.kind === 'screen')) {
    assert.ok(row.note && row.evidenceLine > 0 && row.status);
    assert.match(row.sourceSha256, /^[a-f0-9]{64}$/);
  }
});
test('backend-dependent users route selects real staff access, not prototype user administration', () => {
  const audit = collectInventory();
  const route = audit.records.find((row) => row.route === '/admin/users');
  assert.match(route.component, /staff-access/);
  assert.ok(audit.inactiveImplementations.some((item) => item.includes('user-management')));
});
test('all six portal route families, public pages and auth pages are included', () => {
  const audit = collectInventory();
  assert.deepEqual(Object.keys(audit.counts).sort(), ['admin', 'auth', 'company', 'driver', 'public', 'shipper', 'transporter', 'truck-owner'].sort());
  assert.equal(audit.records.filter((row) => row.kind === 'wildcard').length, 6);
});
test('sidebar links without a concrete route are explicitly marked planned', () => {
  const audit = collectInventory();
  assert.ok(audit.navigation.length > 50);
  for (const item of audit.navigation) assert.ok(item.hasConcreteRoute || item.planned, 'Unlabelled missing sidebar route: ' + item.route);
});
test('lazy private layouts do not double-count portal screens or hide guarded children', () => {
  const audit = collectInventory();
  assert.equal(audit.counts.shipper.total, 19);
  assert.ok(!audit.records.some((r) => r.kind === 'screen' && r.component.includes('admin-shell')));
  for (const role of ['admin','shipper','transporter','truck-owner','driver','company'])
    assert.ok(audit.records.some((r) => r.route === '/' + role + '/notifications'));
});

test('truck owner trip routes select real operational views rather than the shared prototype', () => {
  const audit = collectInventory();
  for (const route of ['/truck-owner/trips', '/truck-owner/trips/:id']) {
    const row = audit.records.find((item) => item.route === route);
    assert.ok(row);
    assert.equal(row.status, 'api_connected');
    assert.match(row.component, /shipper\/trips/);
  }
});

test('truck owner documents selects the private account hub rather than sample compliance files', () => {
  const row = collectInventory().records.find((item) => item.route === '/truck-owner/documents');
  assert.ok(row);
  assert.equal(row.status, 'api_connected');
  assert.match(row.component, /shipper\/documents/);
});

test('truck owner reports selects its provider-owned application and booking report', () => {
  const row = collectInventory().records.find((item) => item.route === '/truck-owner/reports');
  assert.ok(row);
  assert.equal(row.status, 'api_connected');
  assert.match(row.component, /truck-owner\/reports/);
});
