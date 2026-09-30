# UCH-AVPQueryAVPDatabase

[Cloud flow overview](../cloud-automation.md) · [Workflow inventory](../workflows.md) · [Exported definition](../../src/powerplatform/ProjectAVP/src/Workflows/UCH-AVPQueryAVPDatabase-D5683CEC-463A-F111-88B5-7CED8D3C078D.json)

Queries AVP SharePoint data for an agent and returns whether matching records were found.

## Entry and contract

- **Flow ID:** `d5683cec-463a-f111-88b5-7ced8d3c078d`.
- **Trigger:** `manual` (Request).
- **Declared request fields:** `text`, `text_1`, `text_2`, `text_4`, `text_5`, `text_6`, `text_3`, `text_7`, `date`, `date_1`
- **Connector families:** `shared_sharepointonline`.
- **Response actions:** `Respond_to_the_agent`

The exported definition is the source for exact request/response schemas, filter expressions, conditions, and schedule settings. This guide omits literal URLs, payload defaults, and credentials.

## Top-level actions

These actions are listed in export order. The `runAfter` dependencies below determine execution order and permitted failure paths.

- **Respond to the agent** (Response). Return a response.
- **Init Matched bln** (InitializeVariable). See the action map for its operation and dependencies.
- **Matches Found** (If). Evaluate a condition and follow its branch.
- **Get Address Fltr** (Scope). Run the grouped actions below.
- **Query AVP Data** (Scope). Run the grouped actions below.

## Action map

The path shows nesting inside scopes, loops, conditions, and switch cases. “After” lists the exported `runAfter` dependency and permitted predecessor statuses; an empty cell usually means a branch or scope entry.

| Action path | Type / operation | After |
| --- | --- | --- |
| Respond_to_the_agent | `Response` | Matches_Found: Succeeded |
| Init_Matched_bln | `InitializeVariable` |  |
| Matches_Found | `If` | Query_AVP_Data: Succeeded |
| Matches_Found / Properties_Table | `Table` |  |
| Matches_Found / Set_Matched_Flag | `SetVariable` | Properties_Summary: Succeeded |
| Matches_Found / Properties_Summary | `Compose` | Properties_Table: Succeeded |
| Get_Address_Fltr | `Scope` | Init_Matched_bln: Succeeded |
| Get_Address_Fltr / Address_Filter_ary | `Query` |  |
| Get_Address_Fltr / Address_Filter_str | `Select` | Address_Filter_ary: Succeeded |
| Get_Address_Fltr / Address_Filter | `Compose` | Address_Filter_str: Succeeded |
| Query_AVP_Data | `Scope` | Get_Address_Fltr: Succeeded |
| Query_AVP_Data / oData_Filter_ary | `Query` |  |
| Query_AVP_Data / oData_Filter | `Compose` | oData_Filter_ary: Succeeded |
| Query_AVP_Data / Match_Properties | `OpenApiConnection · GetItems` | oData_Filter: Succeeded |
| Query_AVP_Data / Matched_Properties | `Select` | Match_Properties: Succeeded |

## Connections to other flows

No direct child-flow action is present in the exported definition. HTTP callbacks and connector events can still link this flow to other parts of the solution; see the [system map](../cloud-automation.md).

## Operations and verification

Use run history to verify which conditional paths actually ran, connector results, returned values, and retries. The export describes configured behavior, not live connection health or recent run success. For flow changes, validate in a development environment before testing or publishing.
