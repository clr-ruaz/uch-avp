const fs = require('node:fs');
const assert = require('node:assert/strict');
const Module = require('node:module');
const ts = require('typescript');
function load(name) {
  const source = fs.readFileSync(__dirname + '/../src/webparts/propertiesCounter/' + name + '.ts', 'utf8');
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const mod = new Module(name); mod.require = name => load(name.replace('./', '')); mod._compile(compiled, name + '.js');
  return mod.exports;
}
const { CountService, categories, saleDay, countFilter, listEndpoint } = load('CountService');
const { sharePointError, countErrorHint } = load('SharePointError');
const { compileFilter } = load('FilterPredicate');
const { resolveListUrl, listViewUrl, defaultPropertyListId } = load('ListNavigation');
const schema = () => ({ value: Object.entries({Id:'Counter',WorkflowStatus:'Text',Action:'Lookup',Amount:'Number',SaleDate:'DateTime',Title:'Text'}).map(([InternalName,TypeAsString]) => ({InternalName,TypeAsString})) });
const site = 'https://tenant.sharepoint.com/sites/avp';
const property = '11111111-1111-1111-1111-111111111111';
const filters = '22222222-2222-2222-2222-222222222222';
const rules = () => ({ value: categories.map(c => ({ Title: c.title, Filter: "WorkflowStatus eq '" + c.title + "'" })) });
const tests = [];
function test(name, run) { tests.push({ name, run }); }
test('SharePoint REST errors preserve diagnostic codes, messages and correlation IDs', () => {
  assert.match(sharePointError(500, { error: { code: 'SPQueryThrottledException', message: { value: 'List view threshold exceeded.' } } }, 'abc-123'), /SPQueryThrottledException.*List view threshold exceeded.*abc-123/);
  assert.match(sharePointError(400, { 'odata.error': { message: 'Invalid lookup query.' } }, null), /Invalid lookup query/);
  assert.match(sharePointError(403, undefined, null), /Access denied/);
  assert.doesNotMatch(sharePointError(502, '<html>proxy details</html>', null), /html|proxy details/);
  assert.ok(sharePointError(400, { error: { message: 'x'.repeat(5000) } }, null).length < 1300);
});
test('legacy date cutoff and filter grouping', () => {
  assert.equal(saleDay(new Date('2026-10-27T07:59:59Z')), '2026-10-26');
  assert.equal(saleDay(new Date('2026-10-27T08:00:00Z')), '2026-10-27');
  assert.equal(countFilter('A eq 1 or B eq 2', true, '2026-10-27'), "(A eq 1 or B eq 2) and SaleDate ne null and SaleDate ge '2026-10-27'");
  assert.equal(countFilter('A eq 1', false, '2026-10-27'), '(A eq 1)');
});
test('all pages counted beyond 5000; one rules read; ID-only queries; max three requests', async () => {
  let active = 0, peak = 0, ruleReads = 0; const updates = [];
  const read = async url => {
    if (url.includes(filters)) { ruleReads++; return rules(); }
    active++; peak = Math.max(peak, active);
    await new Promise(r => setTimeout(r, 2)); active--;
    const parsed = new URL(url);
    assert.equal(parsed.searchParams.get('$select'), 'Id');
    const filter = parsed.searchParams.get('$filter');
    if (filter.includes('Intake') && !parsed.searchParams.has('page')) {
      return { value: Array.from({ length: 5000 }, (_, Id) => ({ Id })), 'odata.nextLink': url + '&page=2' };
    }
    return { value: [{ Id: 5001 }] };
  };
  await new CountService(read, site, property, filters).load((i, r) => updates[i] = r);
  assert.equal(ruleReads, 1); assert.equal(peak, 3); assert.equal(updates[0].count, 5001);
  assert.equal(updates.length, 6); assert.equal(updates[5].count, 1);
});
test('individual failures never turn into zero or prevent other counts', async () => {
  const updates = [];
  await new CountService(async url => {
    if (url.includes(filters)) return rules();
    if (url.includes('/fields?')) return schema();
    if (decodeURIComponent(url).includes('Junior Review')) throw Error('Threshold exceeded');
    return { value: [] };
  }, site, property, filters).load((i, r) => updates[i] = r);
  assert.equal(updates[1].error, 'Threshold exceeded'); assert.equal(updates[1].count, undefined);
  assert.equal(updates[0].count, 0); assert.equal(updates[5].count, 0);
});
test('missing and duplicate filters fail closed', async () => {
  const updates = []; const data = rules(); data.value.shift(); data.value.push(data.value[0]);
  await new CountService(async url => url.includes(filters) ? data : { value: [] }, site, property, filters).load((i, r) => updates[i] = r);
  assert.ok(updates[0].error); assert.ok(updates[1].error); assert.equal(updates[2].count, 0);
});
test('repeated and cross-origin paging links are rejected without partial counts', async () => {
  for (const foreign of [false, true]) {
    const updates = [];
    await new CountService(async url => url.includes(filters) ? rules() : {
      value: [{ Id: 1 }], '@odata.nextLink': foreign ? 'https://evil.example/_api/items' : url
    }, site, property, filters).load((i, r) => updates[i] = r);
    assert.ok(updates.every(r => r.error && r.count === undefined));
  }
});
test('disposal stops callbacks and new requests', async () => {
  let cancelled = false; let callbacks = 0, requests = 0;
  await assert.rejects(new CountService(async () => { requests++; cancelled = true; return rules(); }, site, property, filters)
    .load(() => callbacks++, () => cancelled), /Cancelled/);
  assert.equal(requests, 1); assert.equal(callbacks, 0);
});
test('invalid list identifiers fail before network access', () => {
  assert.throws(() => listEndpoint(site, "x')/items"), /valid SharePoint list ID/);
});
test('threshold fallback scans required fields once, expands lookup and counts every page', async () => {
  const updates = []; let scans = 0;
  const data = rules();
  data.value[0].Filter = "(Action/Title eq null or Action/Title eq '') and Amount ge 500000";
  data.value[1].Filter = "Action/Title ne 'Intake' and Amount ge 500000";
  await new CountService(async url => {
    if (url.includes(filters)) return data;
    if (url.includes('/fields?')) return schema();
    const p = new URL(url).searchParams;
    if (p.has('$filter')) {
      if (p.get('$filter').includes('Action/Title')) throw Error('SPQueryThrottledException');
      return { value: [] };
    }
    scans++;
    assert.equal(p.get('$expand'), 'Action');
    assert.equal(p.get('$orderby'), 'Id');
    assert.deepEqual(new Set(p.get('$select').split(',')), new Set(['Id','Action/Title','ActionId','Amount','SaleDate']));
    const row = { Action: null, Amount: 600000, SaleDate: '2026-10-27T00:00:00Z' };
    return p.has('page') ? { value: [{ ...row, Id: 6001 }] } : {
      value: Array.from({length: 6000}, (_, i) => ({ ...row, Id: i + 1 })), '@odata.nextLink': url + '&page=2'
    };
  }, site, property, filters).load((i,r) => updates[i] = r, () => false, new Date('2026-10-27T12:00:00Z'));
  assert.equal(scans, 2); assert.equal(updates[0].count, 6001); assert.equal(updates[1].count, 6001);
  assert.equal(updates[2].count, 0);
});
test('fallback page failures and cancellation never expose partial totals', async () => {
  for (const cancel of [false, true]) {
    let cancelled = false, scans = 0; const updates = [];
    await new CountService(async url => {
      if (url.includes(filters)) return rules();
    if (url.includes('/fields?')) return schema();
      if (new URL(url).searchParams.has('$filter')) throw Error('SPQueryThrottledException');
      scans++;
      if (scans === 2) throw Error('Page failed');
      if (cancel) cancelled = true;
      return { value: [{Id: 1, WorkflowStatus: 'Pipeline', SaleDate: null}], '@odata.nextLink': url + '&page=2' };
    }, site, property, filters).load((i,r) => updates[i] = r, () => cancelled);
    assert.ok(updates.every(r => r.count === undefined));
    if (cancel) assert.equal(scans, 1);
    else assert.ok(updates.every(r => r.error === 'Page failed'));
  }
});
test('strict rule evaluator preserves logical precedence, lookup nulls, amounts, escaped strings and dates', () => {
  const matches = compileFilter("(Action/Title eq null or Action/Title eq '') and Amount ge 500000 and SaleDate ge '2026-10-27'", new Set(['SaleDate'])).matches;
  assert.equal(matches({Action: null, Amount: 500000, SaleDate: '2026-10-27T00:00:00Z'}), true);
  assert.equal(matches({Action: {Title: ''}, Amount: 499999, SaleDate: '2026-10-27T00:00:00Z'}), false);
  assert.equal(matches({Action: null, Amount: null, SaleDate: null}), false);
  assert.equal(matches({Action: null, Amount: 600000, SaleDate: '2026-10-26T23:59:59Z'}), false);
  assert.equal(compileFilter("A eq 1 or B eq 2 and C ne null").matches({A: 0, B: 2, C: null}), false);
  assert.equal(compileFilter("Title eq 'O''Brien'").matches({Title: "O'Brien"}), true);
  for (const source of ['A eq 1 garbage', 'substringof(Title)', 'A eq 1; alert(1)', '', '(A eq 1', 'A eq B']) {
    assert.throws(() => compileFilter(source), /Unsupported/);
  }
  assert.equal(matches({ActionId: null, Amount: 600000, SaleDate: '2026-10-27T00:00:00Z'}), true);
  assert.throws(() => matches({ActionId: 12, Amount: 600000}), /omitted counting field/);
  assert.throws(() => matches({}), /omitted counting field/);
  assert.throws(() => compileFilter('Amount ge 1').matches({Amount: 'unknown'}), /Incompatible/);
  assert.equal(countErrorHint('SPQueryThrottledException').includes('Request ID'), false);
});
test('date-like text stays text; only declared DateTime fields are normalized', () => {
  assert.equal(compileFilter("Title eq '2026-10-27'").matches({Title:'2026-10-27T00:00:00Z'}), false);
  assert.equal(compileFilter("Title ne '2026-10-27'").matches({Title:'2026-10-27T00:00:00Z'}), true);
  const date = compileFilter("SaleDate eq '2026-10-27'", new Set(['SaleDate'])).matches;
  assert.equal(date({SaleDate:'2026-10-27T08:00:00+08:00'}), true);
  assert.equal(date({SaleDate:null}), false);
  assert.throws(() => date({SaleDate:'not-a-date'}), /Invalid date/);
});
test('duplicate blank or malformed rules are rejected in both row orders, including across pages', async () => {
  for (const invalid of ['', '  ', null, 123]) for (const first of [true,false]) {
    const updates = []; const valid = rules().value[0], bad = {Title:'Intake',Filter:invalid};
    await new CountService(async url => {
      if (url.includes(filters)) return new URL(url).searchParams.has('page') ? {value:[first ? valid : bad,...rules().value.slice(1)]} :
        {value:[first ? bad : valid], '@odata.nextLink':url+'&page=2'};
      assert.ok(!decodeURIComponent(url).includes("'Intake'"));
      return {value:[]};
    },site,property,filters).load((i,r)=>updates[i]=r);
    assert.match(updates[0].error,/duplicate/); assert.equal(updates[0].count,undefined);
    assert.equal(updates[1].count,0);
  }
});
test('fallback evaluation errors discard only the affected category, including late page errors', async () => {
  const updates=[]; const data=rules(); data.value[0].Filter='Amount ge 1'; let scans=0;
  await new CountService(async url=>{
    if(url.includes(filters))return data;
    if(url.includes('/fields?'))return schema();
    const p=new URL(url).searchParams;
    if(p.has('$filter'))throw Error('SPQueryThrottledException');
    scans++;
    return {value:[{Id:scans, Amount:scans===1?2:'invalid',WorkflowStatus:'Pipeline',SaleDate:null}],
      ...(scans===1?{'@odata.nextLink':url+'&page=2'}:{})};
  },site,property,filters).load((i,r)=>updates[i]=r);
  assert.match(updates[0].error,/Incompatible/);assert.equal(updates[0].count,undefined);
  assert.equal(updates[4].count,2);assert.equal(updates[1].count,0);assert.equal(scans,2);
});
test('invalid field rules are isolated before building the shared projection', async () => {
  const updates=[];const data=rules();data.value[0].Filter='DeletedColumn eq 1';
  await new CountService(async url=>{
    if(url.includes(filters))return data;
    if(url.includes('/fields?'))return schema();
    const p=new URL(url).searchParams;
    if(p.has('$filter'))throw Error('SPQueryThrottledException');
    assert.ok(!p.get('$select').includes('DeletedColumn'));
    return {value:[{Id:1,WorkflowStatus:'Pipeline',SaleDate:null}]};
  },site,property,filters).load((i,r)=>updates[i]=r);
  assert.match(updates[0].error,/Unknown counting field/);assert.equal(updates[4].count,1);
});
test('root sites and trailing slashes work, while paging cannot switch sites or lists', async () => {
  for(const root of ['https://tenant.sharepoint.com','https://tenant.sharepoint.com/',site+'/']) {
    const updates=[];
    await new CountService(async url=>url.includes(filters)?rules():{value:[]},root,property,filters).load((i,r)=>updates[i]=r);
    assert.ok(updates.every(r=>r.count===0));
  }
  for(const bad of [site.replace('/avp','/other')+'/_api/items', site+"/_api/web/lists(guid'"+filters+"')/items"]) {
    const updates=[];
    await new CountService(async url=>url.includes(filters)?rules():{value:[{Id:1}],'@odata.nextLink':bad},site,property,filters).load((i,r)=>updates[i]=r);
    assert.ok(updates.every(r=>r.count===undefined&&r.error));
  }
});
test('navigation follows configured list metadata and never reuses foreign view IDs', async () => {
  const base=await resolveListUrl(async url=>{
    assert.ok(url.includes(property));assert.ok(url.endsWith('?$select=DefaultViewUrl'));
    return {DefaultViewUrl:'/sites/avp/Lists/Custom/AllItems.aspx'};
  },site,property);
  assert.equal(listViewUrl(base,property,categories[0].view),base);
  assert.equal(new URL(listViewUrl(base,defaultPropertyListId,categories[0].view)).searchParams.get('viewid'),categories[0].view);
  assert.equal(listViewUrl(undefined,property),undefined);
  for(const DefaultViewUrl of ['https://evil.example/list','/sites/other/list','javascript:alert(1)','']) {
    await assert.rejects(resolveListUrl(async()=>({DefaultViewUrl}),site,property), /navigation URL/);
  }
  assert.equal(await resolveListUrl(async()=>({DefaultViewUrl:'/Lists/Root/AllItems.aspx'}),'https://tenant.sharepoint.com',property),'https://tenant.sharepoint.com/Lists/Root/AllItems.aspx');
});
test('app rename retains upgrade identities and increments the installed package version', () => {
  const config=JSON.parse(fs.readFileSync(__dirname+'/../config/package-solution.json'));
  const manifest=JSON.parse(fs.readFileSync(__dirname+'/../src/webparts/propertiesCounter/PropertiesCounterWebPart.manifest.json'));
  assert.equal(config.solution.name,'AVP Home Page');assert.equal(config.solution.version,'1.0.1.0');
  assert.equal(config.solution.id,'a8765e03-0be3-4af8-9c0e-ddeffae787a3');
  assert.equal(manifest.id,'aeb2c8e1-f482-47a3-930a-f20e41060e11');
  assert.equal(manifest.preconfiguredEntries[0].title.default,'AVP Home Page');
});
test('security overrides retain the APIs used by packaging, reports and development server', () => {
  const path = require('node:path');
  for (const parent of ['@microsoft/spfx-heft-plugins','jest-junit','sockjs']) {
    const from = path.dirname(require.resolve(parent + '/package.json'));
    const uuid = require(require.resolve('uuid', {paths:[from]}));
    assert.equal(uuid.validate(uuid.v4()), true);
    assert.equal(uuid.validate(uuid.v1()), true);
  }
  const from = path.dirname(require.resolve('@rushstack/module-minifier/package.json'));
  const serialize = require(require.resolve('serialize-javascript', {paths:[from]}));
  const serialized = serialize({value:'</script>', pattern:/test/gi});
  assert.ok(!serialized.includes('</script>'));
  assert.ok(serialized.includes('test'));
});
test('wide-list schema is not capped and uses REST entity property names', async () => {
  const updates=[];
  await new CountService(async url=>{
    if(url.includes(filters))return rules();
    if(url.includes('/fields?')) {
      const p=new URL(url).searchParams;
      assert.equal(p.has('$top'),false);
      assert.ok(p.get('$select').includes('EntityPropertyName'));
      return {value:[...Array.from({length:150},(_,i)=>({InternalName:'Unused'+i,TypeAsString:'Text'})),
        {InternalName:'LegacyStatus',EntityPropertyName:'WorkflowStatus',TypeAsString:'Text'},
        {InternalName:'SaleDate',TypeAsString:'DateTime'}]};
    }
    if(new URL(url).searchParams.has('$filter'))throw Error('SPQueryThrottledException');
    return {value:[{Id:1,WorkflowStatus:'Pipeline',SaleDate:null}]};
  },site,property,filters).load((i,r)=>updates[i]=r);
  assert.equal(updates[4].count,1);assert.ok(updates.every(r=>!r.error));
});
test('SharePoint canonical paging casing and encoded characters are accepted', async () => {
  const updates=[];
  await new CountService(async url=>{
    if(url.includes(filters))return rules();
    if(new URL(url).searchParams.has('page'))return {value:[{Id:2}]};
    return {value:[{Id:1}],'@odata.nextLink':url.replace('/web/lists(', '/Web/Lists(').replace('/items?', '/Items?').replaceAll("'",'%27')+'&page=2'};
  },site,property,filters).load((i,r)=>updates[i]=r);
  assert.ok(updates.every(r=>r.count===2));
});
(async () => {
  for (const t of tests) { await t.run(); console.log('PASS ' + t.name); }
  console.log(`${tests.length} tests passed`);
})().catch(error => { console.error(error); process.exitCode = 1; });
