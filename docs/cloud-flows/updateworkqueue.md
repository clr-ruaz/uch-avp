# UCH-AVPUpdateWorkQueue

[Cloud flow overview](../cloud-automation.md) · [Workflow inventory](../workflows.md) · [Exported definition](../../src/powerplatform/ProjectAVP/src/Workflows/UCH-AVPUpdateWorkQueue-EFE9CC19-FCBE-F011-BBD3-7C1E5217E110.json)

Applies desktop result details to the property item, including valuation status and related calculations.

## Entry and contract

- **Flow ID:** `efe9cc19-fcbe-f011-bbd3-7c1e5217e110`.
- **Trigger:** `manual` (Request).
- **Declared request fields:** `ID`, `Status`, `Source`, `Notes`
- **Connector families:** `shared_sharepointonline`.
- **Response actions:** `Response`

The exported definition is the source for exact request/response schemas, filter expressions, conditions, and schedule settings. This guide omits literal URLs, payload defaults, and credentials.

## Top-level actions

These actions are listed in export order. The `runAfter` dependencies below determine execution order and permitted failure paths.

- **Response** (Response). Return a response.
- **Update Details** (OpenApiConnection). See the action map for its operation and dependencies.
- **Get Property Details** (OpenApiConnection). See the action map for its operation and dependencies.
- **Extra Actions** (If). Evaluate a condition and follow its branch.
- **Issue Status** (Compose). See the action map for its operation and dependencies.
- **Valuation Status** (Compose). See the action map for its operation and dependencies.
- **Prep Datasets** (Scope). Run the grouped actions below.
- **Compute LTV** (Scope). Run the grouped actions below.

## Action map

The path shows nesting inside scopes, loops, conditions, and switch cases. “After” lists the exported `runAfter` dependency and permitted predecessor statuses; an empty cell usually means a branch or scope entry.

| Action path | Type / operation | After |
| --- | --- | --- |
| Response | `Response` | Extra_Actions: Succeeded |
| Update_Details | `OpenApiConnection · PatchItem` | Issue_Status: Succeeded |
| Get_Property_Details | `OpenApiConnection · GetItem` |  |
| Extra_Actions | `If` | Update_Details: Succeeded |
| Extra_Actions / Create_Folder | `If` |  |
| Extra_Actions / Create_Folder / Create_new_folder | `OpenApiConnection · CreateNewFolder` |  |
| Extra_Actions / Create_Folder / Update_Files_Folder | `OpenApiConnection · PatchItem` | Create_new_folder: Succeeded |
| Extra_Actions / No_LTV | `If` | Create_Folder: Succeeded |
| Extra_Actions / No_LTV / Set_Status_to_incomplete_valuation | `OpenApiConnection · PatchItem` |  |
| Issue_Status | `Compose` | Valuation_Status: Succeeded |
| Valuation_Status | `Compose` | Compute_LTV: Succeeded |
| Prep_Datasets | `Scope` | Get_Property_Details: Succeeded |
| Prep_Datasets / Notes_Breakdown | `Compose` |  |
| Prep_Datasets / Update_Payload | `ParseJson` | Notes_Breakdown: Succeeded |
| Compute_LTV | `Scope` | Prep_Datasets: Succeeded |
| Compute_LTV / Estimated_Value_ary | `Query` |  |
| Compute_LTV / Estimated_Value | `Compose` | Estimated_Value_ary: Succeeded |
| Compute_LTV / LTV_Percentage | `Compose` | Estimated_Value: Succeeded |

## Connections to other flows

No direct child-flow action is present in the exported definition. HTTP callbacks and connector events can still link this flow to other parts of the solution; see the [system map](../cloud-automation.md).

## Operations and verification

Use run history to verify which conditional paths actually ran, connector results, returned values, and retries. The export describes configured behavior, not live connection health or recent run success. For flow changes, validate in a development environment before testing or publishing.
