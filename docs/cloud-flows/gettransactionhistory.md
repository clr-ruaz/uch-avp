# UCH-AVPGetTransactionHistory

[Cloud flow overview](../cloud-automation.md) · [Workflow inventory](../workflows.md) · [Exported definition](../../src/powerplatform/ProjectAVP/src/Workflows/UCH-AVPGetTransactionHistory-13C004F3-8805-F111-8406-7CED8D3C0F0B.json)

On a property change, retrieves AVP history and PropertyRadar data and records transaction information when available.

## Entry and contract

- **Flow ID:** `13c004f3-8805-f111-8406-7ced8d3c0f0b`.
- **Trigger:** `When_an_item_is_created_or_modified` (OpenApiConnection).
- **Declared request fields:** No request fields declared in the trigger schema.
- **Connector families:** `shared_keyvault`, `shared_sharepointonline`.
- **Response actions:** No explicit response action.

The exported definition is the source for exact request/response schemas, filter expressions, conditions, and schedule settings. This guide omits literal URLs, payload defaults, and credentials.

## Top-level actions

These actions are listed in export order. The `runAfter` dependencies below determine execution order and permitted failure paths.

- **Get AVP History** (OpenApiConnection). See the action map for its operation and dependencies.
- **Get Radar Secret** (OpenApiConnection). See the action map for its operation and dependencies.
- **No Transactions** (If). Evaluate a condition and follow its branch.

## Action map

The path shows nesting inside scopes, loops, conditions, and switch cases. “After” lists the exported `runAfter` dependency and permitted predecessor statuses; an empty cell usually means a branch or scope entry.

| Action path | Type / operation | After |
| --- | --- | --- |
| Get_AVP_History | `OpenApiConnection · GetItems` | Get_Radar_Secret: Succeeded |
| Get_Radar_Secret | `OpenApiConnection · GetSecret` |  |
| No_Transactions | `If` | Get_AVP_History: Succeeded |
| No_Transactions / Get_Radar_History | `Http` |  |
| No_Transactions / Each_Transaction | `Foreach` | Get_Radar_History: Succeeded |
| No_Transactions / Each_Transaction / All_Radar_History | `ParseJson` |  |
| No_Transactions / Each_Transaction / Log_All_Transactions | `OpenApiConnection · PostItem` | All_Radar_History: Succeeded |
| No_Transactions / else / Get_Radar_Hist_Count | `Http` |  |
| No_Transactions / else / New_Radar_Hist | `If` | Get_Radar_Hist_Count: SUCCEEDED |
| No_Transactions / else / New_Radar_Hist / Get_Current_History | `Http` |  |
| No_Transactions / else / New_Radar_Hist / Get_Additional_Hist | `Query` | Get_Current_History: SUCCEEDED |
| No_Transactions / else / New_Radar_Hist / Each_Addition | `Foreach` | Get_Additional_Hist: SUCCEEDED |
| No_Transactions / else / New_Radar_Hist / Each_Addition / Log_New_Transaction | `OpenApiConnection · PostItem` |  |

## Connections to other flows

No direct child-flow action is present in the exported definition. HTTP callbacks and connector events can still link this flow to other parts of the solution; see the [system map](../cloud-automation.md).

## Operations and verification

Use run history to verify which conditional paths actually ran, connector results, returned values, and retries. The export describes configured behavior, not live connection health or recent run success. For flow changes, validate in a development environment before testing or publishing.
