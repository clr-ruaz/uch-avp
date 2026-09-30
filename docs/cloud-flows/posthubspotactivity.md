# UCH-AVPPostHubSpotActivity

[Cloud flow overview](../cloud-automation.md) · [Workflow inventory](../workflows.md) · [Exported definition](../../src/powerplatform/ProjectAVP/src/Workflows/UCH-AVPPostHubSpotActivity-52D44BD7-E228-F111-8341-7CED8D3C00CF.json)

Finds a corresponding HubSpot deal and posts or updates activity for a changed AVP item.

## Entry and contract

- **Flow ID:** `52d44bd7-e228-f111-8341-7ced8d3c00cf`.
- **Trigger:** `When_an_item_is_created_or_modified` (OpenApiConnection).
- **Declared request fields:** No request fields declared in the trigger schema.
- **Connector families:** `shared_keyvault`, `shared_office365`.
- **Response actions:** No explicit response action.

The exported definition is the source for exact request/response schemas, filter expressions, conditions, and schedule settings. This guide omits literal URLs, payload defaults, and credentials.

## Top-level actions

These actions are listed in export order. The `runAfter` dependencies below determine execution order and permitted failure paths.

- **Get HubSpot Secret** (OpenApiConnection). See the action map for its operation and dependencies.
- **Find Deal Match** (Http). See the action map for its operation and dependencies.
- **Existing Deal** (If). Evaluate a condition and follow its branch.

## Action map

The path shows nesting inside scopes, loops, conditions, and switch cases. “After” lists the exported `runAfter` dependency and permitted predecessor statuses; an empty cell usually means a branch or scope entry.

| Action path | Type / operation | After |
| --- | --- | --- |
| Get_HubSpot_Secret | `OpenApiConnection · GetSecret` |  |
| Find_Deal_Match | `Http` | Get_HubSpot_Secret: Succeeded |
| Existing_Deal | `If` | Find_Deal_Match: Succeeded |
| Existing_Deal / Add_Radar_Activity | `Http` |  |
| Existing_Deal / Send_email_alert | `OpenApiConnection · SharedMailboxSendEmailV2` | Add_Radar_Activity: Failed |
| Existing_Deal / Log_as_Failed_Run | `Terminate` | Send_email_alert: SUCCEEDED |

## Connections to other flows

No direct child-flow action is present in the exported definition. HTTP callbacks and connector events can still link this flow to other parts of the solution; see the [system map](../cloud-automation.md).

## Operations and verification

Use run history to verify which conditional paths actually ran, connector results, returned values, and retries. The export describes configured behavior, not live connection health or recent run success. For flow changes, validate in a development environment before testing or publishing.
