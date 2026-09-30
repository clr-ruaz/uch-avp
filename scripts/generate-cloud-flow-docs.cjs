// Generate a safe, reviewable reference from the unpacked Power Automate export.
// Does not reproduce request bodies, URLs, credentials, or trigger defaults.
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const source = path.join(root, 'src/powerplatform/ProjectAVP/src/Workflows');
const target = path.join(root, 'docs/cloud-flows');
fs.mkdirSync(target, { recursive: true });
const files = fs.readdirSync(source).filter(x => x.endsWith('.json') && !x.includes('DesktopFlow'));
const flows = files.map(file => {
  const data = JSON.parse(fs.readFileSync(path.join(source, file), 'utf8'));
  const id = file.match(/-([0-9A-F]{8}(?:-[0-9A-F]{4}){3}-[0-9A-F]{12})\.json$/i)[1].toLowerCase();
  const name = file.slice(0, -1 - id.length - 5);
  return { name, id, file, properties: data.properties };
});
const byId = new Map(flows.map(f => [f.id, f]));
const descriptions = {
  AddtoPropertyList: 'Accepts a property-list request, updates or creates AVP database items, and records related activity.',
  AVPChangeTracker: 'Watches SharePoint item changes, checks whether a change is relevant or duplicate, and records change activity.',
  CreateSyncFolder: 'Watches a SharePoint record and prepares or copies its synchronization folder when the workflow status warrants it.',
  ExtractCoStarReport: 'Processes a newly created CoStar report file, extracts content, adds comparable-sale summaries, and updates the property.',
  FetchImageAnalysis: 'Accepts an image-analysis request and forwards the prepared message to the shared OpenAI request flow.',
  FetchLLMPrompt: 'Looks up a named prompt in the SharePoint prompt list and returns it to the caller.',
  FetchMFACode: 'Searches mailbox messages and attachments for a CoStar access code, with an AI extraction path.',
  FetchWorkQueue: 'Retrieves queue items from SharePoint, filters and shapes eligible records, and returns them to the desktop caller.',
  ForcetoIntake: 'Periodically finds due records and moves each eligible item back into intake processing.',
  ForceValidationURL: 'Accepts a property validation request, obtains the SharePoint item, and sets valuation status or returns failure.',
  GetCallbakURL: 'Finds a cloud flow in the target environment and returns its callback URL to an authorized child-flow caller.',
  GetItemsCount: 'Builds an OData filter, counts matching SharePoint items, and returns the count to Power Apps or a flow.',
  GetTransactionHistory: 'On a property change, retrieves AVP history and PropertyRadar data and records transaction information when available.',
  HandleValidationIssues: 'Responds to changes in valuation issue fields, updates the item, and sends operational messages as needed.',
  HubSpotWebhookURL: 'Receives a HubSpot webhook, maps changed fields and identifiers, and processes the affected AVP records.',
  LogHelperInteraction: 'Records a helper interaction in SharePoint and returns formatted content to the agent.',
  ManualDataSubmission: 'Processes submitted spreadsheet attachments, maps rows to properties, and posts processing results.',
  ManualValidationTrigger: 'Accepts a manual validation request and invokes Validate Properties.',
  MatchwithPropertyRadar: 'Matches a changed AVP record against PropertyRadar, updates match details, and handles lookup errors.',
  OpenAIRequest: 'Exposes the shared AI request as a callable wrapper around Post OpenAI Request.',
  PostHubSpotActivity: 'Finds a corresponding HubSpot deal and posts or updates activity for a changed AVP item.',
  PostHubSpotDeal: 'Creates, updates, or handles deletion of a HubSpot deal based on AVP item changes.',
  PostOpenAIRequest: 'Retrieves the AI credential, sends a model request, cleans the response, and returns it to the caller.',
  QueryAVPDatabase: 'Queries AVP SharePoint data for an agent and returns whether matching records were found.',
  RefreshCopilotToken: 'Refreshes a Copilot access token and stores the result for connector use.',
  ScheduleTrigger: 'Runs the validation child flow on the exported recurrence schedule.',
  SearchPropertyListing: 'Searches AVP property listings by address and returns either results or an error response.',
  SendAVPDailySummary: 'On a recurrence, gathers newly created deals and emails a daily summary when there is content.',
  SendEventNotification: 'Sends an operational email, optionally including an attachment, and responds to its caller.',
  SharePointBridge: 'Forwards an agent request to the SharePoint connector endpoint and returns its response.',
  SharePointConnector: 'Processes one or more SharePoint HTTP requests and returns their results.',
  SharePointHistoryBridge: 'Forwards an agent request and retrieves SharePoint version history.',
  SharePointSearchBridge: 'Handles an agent search request, searches OneDrive content, and filters resource paths.',
  SharePointSearchConnector: 'Retrieves and transforms search content for a caller.',
  UpdateWorkQueue: 'Applies desktop result details to the property item, including valuation status and related calculations.',
  UploadFile: 'Creates a target folder when needed and uploads a file for a property.',
  ValidateProperties: 'Builds desktop inputs, chooses the CoStar or residential source path, and runs the desktop flow for nonempty queues.'
};
const clean = value => String(value ?? '').replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
function collect(actions, prefix = '', rows = [], calls = [], connectors = new Set(), depth = 0) {
  for (const [name, action] of Object.entries(actions || {})) {
    const full = prefix ? `${prefix} / ${name}` : name;
    const host = action.inputs?.host || {};
    const op = host.operationId || host.apiId?.split('/').pop() || '';
    const after = Object.entries(action.runAfter || {}).map(([n,s]) => `${n}: ${s.join('/')}`).join('; ');
    rows.push({ full, type: action.type, op, after, depth });
    if (action.type === 'Workflow' && host.workflowReferenceName) calls.push({ from: full, id: host.workflowReferenceName.toLowerCase() });
    if (host.apiId) connectors.add(host.apiId.split('/').pop());
    collect(action.actions, full, rows, calls, connectors, depth + 1);
    collect(action.else?.actions, `${full} / else`, rows, calls, connectors, depth + 1);
    collect(action.default?.actions, `${full} / default`, rows, calls, connectors, depth + 1);
    for (const [caseName, c] of Object.entries(action.cases || {})) collect(c.actions, `${full} / case ${caseName}`, rows, calls, connectors, depth + 1);
  }
  return { rows, calls, connectors };
}
for (const flow of flows) {
  const short = flow.name.replace(/^UCH-AVP/, '');
  const def = flow.properties.definition;
  const scan = collect(def.actions);
  const trigger = Object.entries(def.triggers || {});
  const inputFields = [...new Set(trigger.flatMap(([,t]) => Object.keys(t.inputs?.schema?.properties || {})))];
  const responses = scan.rows.filter(r => /response|respond/i.test(r.type) || /response|respond/i.test(r.full.split(' / ').at(-1)));
  const sourceLink = `../../src/powerplatform/ProjectAVP/src/Workflows/${flow.file}`;
  const lines = [
    `# ${flow.name}`, '',
    `[Cloud flow overview](../cloud-automation.md) · [Workflow inventory](../workflows.md) · [Exported definition](${sourceLink})`, '',
    descriptions[short] || 'Cloud flow in the AVP solution.', '',
    '## Entry and contract', '',
    `- **Flow ID:** \`${flow.id}\`.`,
    ...trigger.map(([n,t]) => `- **Trigger:** \`${n}\` (${t.type}).`),
    `- **Declared request fields:** ${inputFields.map(x => `\`${x}\``).join(', ') || 'No request fields declared in the trigger schema.'}`,
    `- **Connector families:** ${[...scan.connectors].sort().map(x => `\`${x}\``).join(', ') || 'None in this definition; built-in actions or HTTP may still be used.'}.`,
    `- **Response actions:** ${responses.map(r => `\`${r.full}\``).join(', ') || 'No explicit response action.'}`, '',
    'The exported definition is the source for exact request/response schemas, filter expressions, conditions, and schedule settings. This guide omits literal URLs, payload defaults, and credentials.', '',
    '## Top-level actions', '',
    'These actions are listed in export order. The `runAfter` dependencies below determine execution order and permitted failure paths.', '',
    ...Object.entries(def.actions || {}).map(([n,a]) => `- **${n.replace(/_/g,' ')}** (${a.type}). ${a.type === 'Workflow' ? 'Invoke a child flow.' : a.type === 'Scope' ? 'Run the grouped actions below.' : a.type === 'If' ? 'Evaluate a condition and follow its branch.' : a.type === 'Foreach' ? 'Process each item.' : a.type === 'Response' ? 'Return a response.' : 'See the action map for its operation and dependencies.'}`), '',
    '## Action map', '',
    'The path shows nesting inside scopes, loops, conditions, and switch cases. “After” lists the exported `runAfter` dependency and permitted predecessor statuses; an empty cell usually means a branch or scope entry.', '',
    '| Action path | Type / operation | After |', '| --- | --- | --- |',
    ...scan.rows.map(r => `| ${clean(r.full)} | \`${clean(r.type)}${r.op ? ` · ${clean(r.op)}` : ''}\` | ${clean(r.after)} |`), '',
    '## Connections to other flows', ''
  ];
  if (scan.calls.length) {
    lines.push('| Call action | Target flow |', '| --- | --- |');
    for (const c of scan.calls) {
      const targetFlow = byId.get(c.id);
      lines.push(`| ${clean(c.from)} | ${targetFlow ? `[${targetFlow.name}](${targetFlow.name.replace(/^UCH-AVP/,'').toLowerCase()}.md)` : `ID \`${c.id}\` (outside this export)`} |`);
    }
  } else lines.push('No direct child-flow action is present in the exported definition. HTTP callbacks and connector events can still link this flow to other parts of the solution; see the [system map](../cloud-automation.md).');
  lines.push('', '## Operations and verification', '', 'Use run history to verify which conditional paths actually ran, connector results, returned values, and retries. The export describes configured behavior, not live connection health or recent run success. For flow changes, validate in a development environment before testing or publishing.', '');
  fs.writeFileSync(path.join(target, `${short.toLowerCase()}.md`), lines.join('\n'));
}
console.log(`Generated ${flows.length} cloud-flow guides.`);
