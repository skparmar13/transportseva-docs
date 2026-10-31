import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
import ts from 'typescript';

const workspace = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const routeFile = 'src/app/app.routes.ts';
const reviewFile = 'audit/screen-assessments.json';
const allowedStatuses = new Set(['api_connected', 'mixed', 'prototype', 'browser_local_content', 'static_content', 'deferred_prototype', 'deferred_guarded']);
function read(relative) { return fs.readFileSync(path.join(workspace, relative), 'utf8'); }
function lineAt(source, position) { return source.getLineAndCharacterOfPosition(position).line + 1; }
function anchorLine(file, anchor) {
  const source = read(file); const index = source.indexOf(anchor);
  if (index < 0) throw new Error('Stale/missing review anchor: ' + file + ': ' + anchor);
  return source.slice(0, index).split(/\r?\n/).length;
}

export function collectInventory({ backendEnabled = true } = {}) {
  const review = JSON.parse(read(reviewFile));
  const assessments = new Map();
  for (const group of review.groups) for (const key of group.files) {
    if (!allowedStatuses.has(group.status)) throw new Error('Unknown status: ' + group.status);
    const file = 'src/app/features/' + key + '.component.ts';
    if (assessments.has(file)) throw new Error('Duplicate assessment: ' + file);
    assessments.set(file, { status: group.status, priority: group.priority, note: group.note, anchor: group.anchor });
  }
  const source = ts.createSourceFile(routeFile, read(routeFile), ts.ScriptTarget.Latest, true);
  const records = []; const inactiveImplementations = [];
  function property(object, name) {
    return object.properties.find((item) => item.name && (ts.isIdentifier(item.name) ? item.name.text : item.name.text) === name)?.initializer;
  }
  function selectBackendBranch(node) {
    if (ts.isConditionalExpression(node) && node.condition.getText(source) === 'API_CONFIG.useBackend') {
      const inactive = backendEnabled ? node.whenFalse : node.whenTrue;
      scanImports(inactive).forEach((file) => inactiveImplementations.push(file));
      return selectBackendBranch(backendEnabled ? node.whenTrue : node.whenFalse);
    }
    return node;
  }
  function scanImports(node) {
    const files = [];
    function visit(child) {
      if (ts.isCallExpression(child) && child.expression.kind === ts.SyntaxKind.ImportKeyword) {
        const value = child.arguments[0];
        if (!value || !ts.isStringLiteral(value)) throw new Error('Dynamic route import requires review.');
        files.push(path.posix.normalize('src/app/' + value.text) + '.ts');
      }
      ts.forEachChild(child, visit);
    }
    visit(node); return files;
  }
  function walk(array, prefix = '') {
    for (const object of array.elements) {
      if (!ts.isObjectLiteralExpression(object)) throw new Error('Route spread/dynamic declaration requires review.');
      const segment = property(object, 'path');
      if (!segment || !ts.isStringLiteral(segment)) throw new Error('Non-literal route path requires review.');
      const full = '/' + [prefix, segment.text].filter(Boolean).join('/').replace(/^\/+/, '');
      const children = property(object, 'children');
      if (children && ts.isArrayLiteralExpression(children)) walk(children, full.replace(/^\/+/, ''));
      if (property(object, 'redirectTo')) continue;
      const load = property(object, 'loadComponent');
      if (!load) {
        if (segment.text === '**') records.push({ route: full, role: full.split('/')[1], kind: 'wildcard', sourceLine: lineAt(source, object.getStart(source)) });
        continue;
      }
      const body = ts.isArrowFunction(load) ? selectBackendBranch(load.body) : load;
      const files = scanImports(body);
      if (files.length !== 1) throw new Error('Expected exactly one active component: ' + full);
      const file = files[0]; const assessment = assessments.get(file);
      if (!assessment) throw new Error('Unreviewed route/component: ' + full + ' -> ' + file);
      const text = read(file);
      const imports = [...text.matchAll(/import\s*\{([^}]+)\}\s*from\s*'([^']+)'/g)]
        .filter((match) => /services\/|api\//.test(match[2]))
        .flatMap((match) => match[1].split(',').map((name) => name.trim())).filter((name) => /Service$/.test(name));
      const role = ['admin', 'shipper', 'transporter', 'truck-owner', 'driver', 'company', 'auth'].includes(full.split('/')[1]) ? full.split('/')[1] : 'public';
      records.push({ route: full, role, kind: 'screen', component: file,
        sourceSha256: createHash('sha256').update(text).digest('hex'), services: imports, ...assessment,
        sourceLine: lineAt(source, object.getStart(source)), evidenceLine: anchorLine(file, assessment.anchor),
        access: role === 'admin' ? 'Current server staff role allowlist; blocked routes are not implemented features'
          : role === 'company' ? 'No backend company UserType/workspace contract; static review only'
            : role === 'auth' || role === 'public' ? 'Public/context-dependent' : 'Server-verified matching identity required' });
    }
  }
  let root;
  function find(node) { if (ts.isVariableDeclaration(node) && node.name.getText(source) === 'routes') root = node.initializer; ts.forEachChild(node, find); }
  find(source);
  if (!root || !ts.isArrayLiteralExpression(root)) throw new Error('Routes declaration not found.');
  walk(root);
  const shared = review.shared.map((item) => ({ ...item, evidenceLine: anchorLine(item.file, item.anchor) }));
  const navFile = 'src/app/core/data/nav-config.ts';
  const navSource = ts.createSourceFile(navFile, read(navFile), ts.ScriptTarget.Latest, true);
  let navRoot;
  function findNav(node) {
    if (ts.isVariableDeclaration(node) && node.name.getText(navSource) === 'PORTAL_CONFIGS') navRoot = node.initializer;
    ts.forEachChild(node, findNav);
  }
  findNav(navSource);
  if (!navRoot || !ts.isObjectLiteralExpression(navRoot)) throw new Error('Navigation configuration requires review.');
  const navigation = [];
  for (const portal of navRoot.properties) {
    if (!portal.name || !portal.initializer || !ts.isObjectLiteralExpression(portal.initializer)) continue;
    const role = portal.name.text; const sections = property(portal.initializer, 'nav');
    if (!sections || !ts.isArrayLiteralExpression(sections)) throw new Error('Dynamic portal navigation requires review.');
    for (const section of sections.elements) {
      const items = property(section, 'items');
      if (!items || !ts.isArrayLiteralExpression(items)) continue;
      for (const item of items.elements) {
        const route = '/' + role + '/' + property(item, 'path')?.text;
        navigation.push({ role, route, planned: property(item, 'planned')?.kind === ts.SyntaxKind.TrueKeyword,
          hasConcreteRoute: records.some((record) => record.kind === 'screen' && record.route === route),
          sourceLine: lineAt(navSource, item.getStart(navSource)) });
      }
    }
  }
  const screens = records.filter((item) => item.kind === 'screen');
  if (new Set(screens.map((item) => item.route)).size !== screens.length) throw new Error('Duplicate active screen paths.');
  const counts = {};
  for (const item of screens) {
    counts[item.role] ??= { total: 0 };
    counts[item.role].total++; counts[item.role][item.status] = (counts[item.role][item.status] ?? 0) + 1;
  }
  return { reviewDate: review.reviewDate, mode: review.mode, backendEnabled, screenRoutes: screens.length,
    uniqueComponents: new Set(screens.map((item) => item.component)).size,
    inactiveImplementations: [...new Set(inactiveImplementations)], counts, records, shared, navigation,
    caveat: 'Source wiring classification, not evidence that every action, role or screen was executed successfully. Runtime observations are separate.' };
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const result = collectInventory();
  if (process.argv.includes('--emit')) {
    // Generated audit artifacts only; never writes application/backend source.
    const output = path.join(workspace, 'test-results', 'screen-audit-2026-10-31');
    fs.mkdirSync(output, { recursive: true });
    fs.writeFileSync(path.join(output, 'source-inventory.json'), JSON.stringify(result, null, 2));
    const quote = String.fromCharCode(34);
    const escape = (value) => quote + String(value ?? '').replaceAll(quote, quote + quote) + quote;
    const columns = ['route', 'role', 'status', 'priority', 'component', 'evidenceLine', 'sourceSha256', 'note'];
    fs.writeFileSync(path.join(output, 'source-inventory.csv'), [columns.join(','), ...result.records.filter((item) => item.kind === 'screen').map((row) => columns.map((key) => escape(row[key])).join(','))].join('\r\n'));
  }
  console.log(JSON.stringify({ screenRoutes: result.screenRoutes, uniqueComponents: result.uniqueComponents, counts: result.counts,
    wildcards: result.records.filter((item) => item.kind === 'wildcard').map((item) => item.route),
    plannedNavigation: result.navigation.filter((item) => item.planned), inactiveImplementations: result.inactiveImplementations }, null, 2));
}
