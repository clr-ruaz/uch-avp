# UCH-AVPSearchPropertyListing

[Cloud flow overview](../cloud-automation.md) · [Workflow inventory](../workflows.md) · [Exported definition](../../src/powerplatform/ProjectAVP/src/Workflows/UCH-AVPSearchPropertyListing-7522EB76-33E4-FCE7-9D68-51DF51765368.json)

Searches AVP property listings by address and returns either results or an error response.

## Entry and contract

- **Flow ID:** `7522eb76-33e4-fce7-9d68-51df51765368`.
- **Trigger:** `manual` (Request).
- **Declared request fields:** `Property UID`, `APN`, `Street Address`, `City`, `State`, `Zip`
- **Connector families:** `shared_sharepointonline`.
- **Response actions:** `Success_Response`, `Fail_Response`, `Terminate_due_to_error_response`, `Query_AVP_Data / Valid_Filter / else / Invalid_Filter`

The exported definition is the source for exact request/response schemas, filter expressions, conditions, and schedule settings. This guide omits literal URLs, payload defaults, and credentials.

## Top-level actions

These actions are listed in export order. The `runAfter` dependencies below determine execution order and permitted failure paths.

- **Success Response** (Response). Return a response.
- **Fail Response** (Response). Return a response.
- **Terminate due to error response** (Terminate). See the action map for its operation and dependencies.
- **Get Address Fltr** (Scope). Run the grouped actions below.
- **Query AVP Data** (Scope). Run the grouped actions below.

## Action map

The path shows nesting inside scopes, loops, conditions, and switch cases. “After” lists the exported `runAfter` dependency and permitted predecessor statuses; an empty cell usually means a branch or scope entry.

| Action path | Type / operation | After |
| --- | --- | --- |
| Success_Response | `Response` | Query_AVP_Data: Succeeded |
| Fail_Response | `Response` | Query_AVP_Data: Failed |
| Terminate_due_to_error_response | `Terminate` | Fail_Response: Succeeded |
| Get_Address_Fltr | `Scope` |  |
| Get_Address_Fltr / Address_Filter_ary | `Query` |  |
| Get_Address_Fltr / Address_Filter_str | `Select` | Address_Filter_ary: Succeeded |
| Get_Address_Fltr / Address_Filter | `Compose` | Address_Filter_str: Succeeded |
| Query_AVP_Data | `Scope` | Get_Address_Fltr: Succeeded |
| Query_AVP_Data / oData_Filter_ary | `Query` |  |
| Query_AVP_Data / oData_Filter | `Compose` | oData_Filter_ary: Succeeded |
| Query_AVP_Data / Valid_Filter | `If` | oData_Filter: Succeeded |
| Query_AVP_Data / Valid_Filter / Match_Properties | `OpenApiConnection · GetItems` |  |
| Query_AVP_Data / Valid_Filter / else / Invalid_Filter | `Response` |  |
| Query_AVP_Data / Valid_Filter / else / Terminate_due_to_invalid_oData_filter | `Terminate` | Invalid_Filter: Succeeded |

## Connections to other flows

No direct child-flow action is present in the exported definition. HTTP callbacks and connector events can still link this flow to other parts of the solution; see the [system map](../cloud-automation.md).

## Operations and verification

Use run history to verify which conditional paths actually ran, connector results, returned values, and retries. The export describes configured behavior, not live connection health or recent run success. For flow changes, validate in a development environment before testing or publishing.
