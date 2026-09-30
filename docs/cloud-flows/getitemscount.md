# UCH-AVPGetItemsCount

[Cloud flow overview](../cloud-automation.md) · [Workflow inventory](../workflows.md) · [Exported definition](../../src/powerplatform/ProjectAVP/src/Workflows/UCH-AVPGetItemsCount-90A5396E-1CDC-F011-8544-6045BD056AC0.json)

Builds an OData filter, counts matching SharePoint items, and returns the count to Power Apps or a flow.

## Entry and contract

- **Flow ID:** `90a5396e-1cdc-f011-8544-6045bd056ac0`.
- **Trigger:** `manual` (Request).
- **Declared request fields:** `text`
- **Connector families:** `shared_sharepointonline`.
- **Response actions:** `Respond_to_a_Power_App_or_flow`

The exported definition is the source for exact request/response schemas, filter expressions, conditions, and schedule settings. This guide omits literal URLs, payload defaults, and credentials.

## Top-level actions

These actions are listed in export order. The `runAfter` dependencies below determine execution order and permitted failure paths.

- **Get Items Count** (OpenApiConnection). See the action map for its operation and dependencies.
- **Respond to a Power App or flow** (Response). Return a response.
- **Sale Date Filter** (Compose). See the action map for its operation and dependencies.
- **Convert time zone** (Expression). See the action map for its operation and dependencies.
- **Get OData Filter** (OpenApiConnection). See the action map for its operation and dependencies.

## Action map

The path shows nesting inside scopes, loops, conditions, and switch cases. “After” lists the exported `runAfter` dependency and permitted predecessor statuses; an empty cell usually means a branch or scope entry.

| Action path | Type / operation | After |
| --- | --- | --- |
| Get_Items_Count | `OpenApiConnection · GetItems` | Sale_Date_Filter: Succeeded |
| Respond_to_a_Power_App_or_flow | `Response` | Get_Items_Count: Succeeded |
| Sale_Date_Filter | `Compose` | Get_OData_Filter: Succeeded |
| Convert_time_zone | `Expression` |  |
| Get_OData_Filter | `OpenApiConnection · GetItems` | Convert_time_zone: Succeeded |

## Connections to other flows

No direct child-flow action is present in the exported definition. HTTP callbacks and connector events can still link this flow to other parts of the solution; see the [system map](../cloud-automation.md).

## Operations and verification

Use run history to verify which conditional paths actually ran, connector results, returned values, and retries. The export describes configured behavior, not live connection health or recent run success. For flow changes, validate in a development environment before testing or publishing.
