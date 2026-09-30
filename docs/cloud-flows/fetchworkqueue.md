# UCH-AVPFetchWorkQueue

[Cloud flow overview](../cloud-automation.md) · [Workflow inventory](../workflows.md) · [Exported definition](../../src/powerplatform/ProjectAVP/src/Workflows/UCH-AVPFetchWorkQueue-DA0DCFF9-F6BE-F011-BBD3-7C1E5217E110.json)

Retrieves queue items from SharePoint, filters and shapes eligible records, and returns them to the desktop caller.

## Entry and contract

- **Flow ID:** `da0dcff9-f6be-f011-bbd3-7c1e5217e110`.
- **Trigger:** `manual` (Request).
- **Declared request fields:** `Status`
- **Connector families:** `shared_sharepointonline`.
- **Response actions:** `Response`

The exported definition is the source for exact request/response schemas, filter expressions, conditions, and schedule settings. This guide omits literal URLs, payload defaults, and credentials.

## Top-level actions

These actions are listed in export order. The `runAfter` dependencies below determine execution order and permitted failure paths.

- **Get items** (OpenApiConnection). See the action map for its operation and dependencies.
- **Response** (Response). Return a response.
- **Clean Queued Data** (Select). See the action map for its operation and dependencies.
- **Get Valid Items Only** (Query). See the action map for its operation and dependencies.
- **Select Queued Data** (Select). See the action map for its operation and dependencies.

## Action map

The path shows nesting inside scopes, loops, conditions, and switch cases. “After” lists the exported `runAfter` dependency and permitted predecessor statuses; an empty cell usually means a branch or scope entry.

| Action path | Type / operation | After |
| --- | --- | --- |
| Get_items | `OpenApiConnection · GetItems` |  |
| Response | `Response` | Clean_Queued_Data: Succeeded |
| Clean_Queued_Data | `Select` | Select_Queued_Data: Succeeded |
| Get_Valid_Items_Only | `Query` | Get_items: Succeeded |
| Select_Queued_Data | `Select` | Get_Valid_Items_Only: Succeeded |

## Connections to other flows

No direct child-flow action is present in the exported definition. HTTP callbacks and connector events can still link this flow to other parts of the solution; see the [system map](../cloud-automation.md).

## Operations and verification

Use run history to verify which conditional paths actually ran, connector results, returned values, and retries. The export describes configured behavior, not live connection health or recent run success. For flow changes, validate in a development environment before testing or publishing.
