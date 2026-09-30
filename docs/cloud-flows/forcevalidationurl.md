# UCH-AVPForceValidationURL

[Cloud flow overview](../cloud-automation.md) · [Workflow inventory](../workflows.md) · [Exported definition](../../src/powerplatform/ProjectAVP/src/Workflows/UCH-AVPForceValidationURL-46D7B9C3-2532-F111-88B4-7CED8D3C00CF.json)

Accepts a property validation request, obtains the SharePoint item, and sets valuation status or returns failure.

## Entry and contract

- **Flow ID:** `46d7b9c3-2532-f111-88b4-7ced8d3c00cf`.
- **Trigger:** `manual` (Request).
- **Declared request fields:** `sharepoint_id`
- **Connector families:** `shared_sharepointonline`.
- **Response actions:** `Success_Response`, `Fail_Response`

The exported definition is the source for exact request/response schemas, filter expressions, conditions, and schedule settings. This guide omits literal URLs, payload defaults, and credentials.

## Top-level actions

These actions are listed in export order. The `runAfter` dependencies below determine execution order and permitted failure paths.

- **Success Response** (Response). Return a response.
- **Valuation Source** (Compose). See the action map for its operation and dependencies.
- **Get SharePoint Item** (OpenApiConnection). See the action map for its operation and dependencies.
- **Set Valuation Status** (OpenApiConnection). See the action map for its operation and dependencies.
- **Fail Response** (Response). Return a response.

## Action map

The path shows nesting inside scopes, loops, conditions, and switch cases. “After” lists the exported `runAfter` dependency and permitted predecessor statuses; an empty cell usually means a branch or scope entry.

| Action path | Type / operation | After |
| --- | --- | --- |
| Success_Response | `Response` | Set_Valuation_Status: Succeeded |
| Valuation_Source | `Compose` | Get_SharePoint_Item: Succeeded |
| Get_SharePoint_Item | `OpenApiConnection · GetItem` |  |
| Set_Valuation_Status | `OpenApiConnection · PatchItem` | Valuation_Source: Succeeded |
| Fail_Response | `Response` | Get_SharePoint_Item: FAILED |

## Connections to other flows

No direct child-flow action is present in the exported definition. HTTP callbacks and connector events can still link this flow to other parts of the solution; see the [system map](../cloud-automation.md).

## Operations and verification

Use run history to verify which conditional paths actually ran, connector results, returned values, and retries. The export describes configured behavior, not live connection health or recent run success. For flow changes, validate in a development environment before testing or publishing.
