# UCH-AVPSharePointConnector

[Cloud flow overview](../cloud-automation.md) · [Workflow inventory](../workflows.md) · [Exported definition](../../src/powerplatform/ProjectAVP/src/Workflows/UCH-AVPSharePointConnector-AD87F198-5454-F111-BEC7-7CED8D3C0784.json)

Processes one or more SharePoint HTTP requests and returns their results.

## Entry and contract

- **Flow ID:** `ad87f198-5454-f111-bec7-7ced8d3c0784`.
- **Trigger:** `manual` (Request).
- **Declared request fields:** No request fields declared in the trigger schema.
- **Connector families:** `shared_sharepointonline`.
- **Response actions:** `Response`

The exported definition is the source for exact request/response schemas, filter expressions, conditions, and schedule settings. This guide omits literal URLs, payload defaults, and credentials.

## Top-level actions

These actions are listed in export order. The `runAfter` dependencies below determine execution order and permitted failure paths.

- **Response** (Response). Return a response.
- **Init Request Output** (InitializeVariable). See the action map for its operation and dependencies.
- **Each Request** (Foreach). Process each item.

## Action map

The path shows nesting inside scopes, loops, conditions, and switch cases. “After” lists the exported `runAfter` dependency and permitted predecessor statuses; an empty cell usually means a branch or scope entry.

| Action path | Type / operation | After |
| --- | --- | --- |
| Response | `Response` | Each_Request: Succeeded |
| Init_Request_Output | `InitializeVariable` |  |
| Each_Request | `Foreach` | Init_Request_Output: Succeeded |
| Each_Request / SharePoint_Request | `OpenApiConnection · HttpRequest` |  |
| Each_Request / Set_Request_Output | `SetVariable` | SharePoint_Request: Succeeded |

## Connections to other flows

No direct child-flow action is present in the exported definition. HTTP callbacks and connector events can still link this flow to other parts of the solution; see the [system map](../cloud-automation.md).

## Operations and verification

Use run history to verify which conditional paths actually ran, connector results, returned values, and retries. The export describes configured behavior, not live connection health or recent run success. For flow changes, validate in a development environment before testing or publishing.
