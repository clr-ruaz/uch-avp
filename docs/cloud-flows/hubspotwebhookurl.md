# UCH-AVPHubSpotWebhookURL

[Cloud flow overview](../cloud-automation.md) · [Workflow inventory](../workflows.md) · [Exported definition](../../src/powerplatform/ProjectAVP/src/Workflows/UCH-AVPHubSpotWebhookURL-25A83390-5D27-F111-8341-7CED8D3C06DF.json)

Receives a HubSpot webhook, maps changed fields and identifiers, and processes the affected AVP records.

## Entry and contract

- **Flow ID:** `25a83390-5d27-f111-8341-7ced8d3c06df`.
- **Trigger:** `manual` (Request).
- **Declared request fields:** No request fields declared in the trigger schema.
- **Connector families:** `shared_keyvault`, `shared_office365`, `shared_sharepointonline`.
- **Response actions:** No explicit response action.

The exported definition is the source for exact request/response schemas, filter expressions, conditions, and schedule settings. This guide omits literal URLs, payload defaults, and credentials.

## Top-level actions

These actions are listed in export order. The `runAfter` dependencies below determine execution order and permitted failure paths.

- **Get HB Changes** (Scope). Run the grouped actions below.
- **Get Field Map** (Scope). Run the grouped actions below.
- **Each HB ID** (Foreach). Process each item.
- **Init Payload Object** (InitializeVariable). See the action map for its operation and dependencies.
- **Prep Global Data** (Scope). Run the grouped actions below.

## Action map

The path shows nesting inside scopes, loops, conditions, and switch cases. “After” lists the exported `runAfter` dependency and permitted predecessor statuses; an empty cell usually means a branch or scope entry.

| Action path | Type / operation | After |
| --- | --- | --- |
| Get_HB_Changes | `Scope` | Get_Field_Map: Succeeded |
| Get_HB_Changes / HB_Valid_Changes | `Query` |  |
| Get_HB_Changes / HB_Changed_IDs | `Select` | HB_Valid_Changes: Succeeded |
| Get_Field_Map | `Scope` | Prep_Global_Data: Succeeded |
| Get_Field_Map / AVP-HB_Mapping | `Select` | Get_AVP_Properties: Succeeded |
| Get_Field_Map / Get_AVP_Properties | `OpenApiConnection · GetItems` |  |
| Each_HB_ID | `Foreach` | Get_HB_Changes: Succeeded |
| Each_HB_ID / Prep_Payload | `Scope` | HB_Changes_Object: Succeeded |
| Each_HB_ID / Prep_Payload / Payload_Index | `Query` |  |
| Each_HB_ID / Prep_Payload / Payload_Array | `Select` | Payload_Index: Succeeded |
| Each_HB_ID / Prep_Payload / Payload_Object | `Compose` | Payload_Array: Succeeded |
| Each_HB_ID / HB_This_Change | `Query` |  |
| Each_HB_ID / HB_Changed_Keys | `Select` | HB_This_Change: Succeeded |
| Each_HB_ID / HB_Changes_Array | `Select` | HB_Changed_Keys: Succeeded |
| Each_HB_ID / HB_Changes_Object | `Compose` | HB_Changes_Array: Succeeded |
| Each_HB_ID / Valid_Payload | `If` | Finalize_Payload: Succeeded |
| Each_HB_ID / Valid_Payload / Find_Deal_Matches | `Http` |  |
| Each_HB_ID / Valid_Payload / Valid_Update | `If` | Find_Deal_Matches: Succeeded |
| Each_HB_ID / Valid_Payload / Valid_Update / Valid_SPL_ID | `If` |  |
| Each_HB_ID / Valid_Payload / Valid_Update / Valid_SPL_ID / Final_Payload | `Compose` |  |
| Each_HB_ID / Valid_Payload / Valid_Update / Valid_SPL_ID / Update_AVP_Record | `OpenApiConnection · HttpRequest` | Final_Payload: Succeeded |
| Each_HB_ID / Valid_Payload / Valid_Update / Valid_SPL_ID / Send_email_alert | `OpenApiConnection · SharedMailboxSendEmailV2` | Update_AVP_Record: Failed |
| Each_HB_ID / Valid_Payload / Valid_Update / Valid_SPL_ID / else / Send_alert_re_missing_SharePoint_ID | `OpenApiConnection · SharedMailboxSendEmailV2` |  |
| Each_HB_ID / Finalize_Payload | `Scope` | Prep_Payload: Succeeded |
| Each_HB_ID / Finalize_Payload / Stage_Required | `If` |  |
| Each_HB_ID / Finalize_Payload / Stage_Required / Adjust_Payload | `SetVariable` | Get_Deal_Stages: Succeeded |
| Each_HB_ID / Finalize_Payload / Stage_Required / Get_Deal_Stages | `OpenApiConnection · GetItems` |  |
| Each_HB_ID / Finalize_Payload / Stage_Required / else / Set_Payload | `SetVariable` |  |
| Init_Payload_Object | `InitializeVariable` |  |
| Prep_Global_Data | `Scope` | Init_Payload_Object: Succeeded |
| Prep_Global_Data / Get_HubSpot_Secret | `OpenApiConnection · GetSecret` | Get_SPL_Details: Succeeded |
| Prep_Global_Data / HubSpot_Pipeline | `Compose` |  |
| Prep_Global_Data / Get_SPL_Details | `OpenApiConnection · HttpRequest` | HubSpot_Pipeline: Succeeded |

## Connections to other flows

No direct child-flow action is present in the exported definition. HTTP callbacks and connector events can still link this flow to other parts of the solution; see the [system map](../cloud-automation.md).

## Operations and verification

Use run history to verify which conditional paths actually ran, connector results, returned values, and retries. The export describes configured behavior, not live connection health or recent run success. For flow changes, validate in a development environment before testing or publishing.
