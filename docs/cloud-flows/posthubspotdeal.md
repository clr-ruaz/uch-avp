# UCH-AVPPostHubSpotDeal

[Cloud flow overview](../cloud-automation.md) · [Workflow inventory](../workflows.md) · [Exported definition](../../src/powerplatform/ProjectAVP/src/Workflows/UCH-AVPPostHubSpotDeal-6A1C7505-310D-F111-8406-7CED8D3C078D.json)

Creates, updates, or handles deletion of a HubSpot deal based on AVP item changes.

## Entry and contract

- **Flow ID:** `6a1c7505-310d-f111-8406-7ced8d3c078d`.
- **Trigger:** `When_an_item_is_created_or_modified` (OpenApiConnection).
- **Declared request fields:** No request fields declared in the trigger schema.
- **Connector families:** `shared_keyvault`, `shared_office365`, `shared_sharepointonline`.
- **Response actions:** No explicit response action.

The exported definition is the source for exact request/response schemas, filter expressions, conditions, and schedule settings. This guide omits literal URLs, payload defaults, and credentials.

## Top-level actions

These actions are listed in export order. The `runAfter` dependencies below determine execution order and permitted failure paths.

- **Init ErrorMsg** (InitializeVariable). See the action map for its operation and dependencies.
- **Failed Operation** (If). Evaluate a condition and follow its branch.
- **Init Delete Flag** (InitializeVariable). See the action map for its operation and dependencies.
- **Add or Update** (If). Evaluate a condition and follow its branch.
- **Init Data Payload** (InitializeVariable). See the action map for its operation and dependencies.
- **Find HB Deal** (Scope). Run the grouped actions below.

## Action map

The path shows nesting inside scopes, loops, conditions, and switch cases. “After” lists the exported `runAfter` dependency and permitted predecessor statuses; an empty cell usually means a branch or scope entry.

| Action path | Type / operation | After |
| --- | --- | --- |
| Init_ErrorMsg | `InitializeVariable` | Init_Delete_Flag: Succeeded |
| Failed_Operation | `If` | Add_or_Update: Succeeded |
| Failed_Operation / Send_email_alert | `OpenApiConnection · SharedMailboxSendEmailV2` |  |
| Failed_Operation / Terminate | `Terminate` | Send_email_alert: Succeeded |
| Init_Delete_Flag | `InitializeVariable` | Init_Data_Payload: Succeeded |
| Add_or_Update | `If` | Find_HB_Deal: Succeeded |
| Add_or_Update / Existing_Deal | `If` | Finalize_Payload: Succeeded |
| Add_or_Update / Existing_Deal / Valid_Payload_A | `If` |  |
| Add_or_Update / Existing_Deal / Valid_Payload_A / Update_HubSpot | `Scope` |  |
| Add_or_Update / Existing_Deal / Valid_Payload_A / Update_HubSpot / Update_Existing_Deal | `Http` |  |
| Add_or_Update / Existing_Deal / Valid_Payload_A / Update_HubSpot / Set_Update_Error | `SetVariable` | Update_Existing_Deal: Failed |
| Add_or_Update / Existing_Deal / else / Valid_Payload_B | `If` |  |
| Add_or_Update / Existing_Deal / else / Valid_Payload_B / HubSpot_Pipeline | `Compose` |  |
| Add_or_Update / Existing_Deal / else / Valid_Payload_B / Add_Pipeline | `Compose` | HubSpot_Pipeline: Succeeded |
| Add_or_Update / Existing_Deal / else / Valid_Payload_B / Set_Final_Payload | `SetVariable` | Add_Pipeline: Succeeded |
| Add_or_Update / Existing_Deal / else / Valid_Payload_B / Post_to_HubSpot | `If` | Set_Final_Payload: Succeeded |
| Add_or_Update / Existing_Deal / else / Valid_Payload_B / Post_to_HubSpot / Create_New_Deal | `Http` |  |
| Add_or_Update / Existing_Deal / else / Valid_Payload_B / Post_to_HubSpot / Set_Create_Error | `SetVariable` | Create_New_Deal: FAILED |
| Add_or_Update / Get_AVP_Edits | `Scope` |  |
| Add_or_Update / Get_AVP_Edits / Get_changes_for_item | `OpenApiConnection · GetItemChanges` |  |
| Add_or_Update / Get_AVP_Edits / All_Changed_Props | `Select` | Get_changes_for_item: Succeeded |
| Add_or_Update / Get_Fields_Map | `Scope` | Get_AVP_Edits: Succeeded |
| Add_or_Update / Get_Fields_Map / Get_AVP-HB_Map | `OpenApiConnection · GetItems` |  |
| Add_or_Update / Get_Fields_Map / AVP_Valid_Changes | `Query` | Get_AVP-HB_Map: Succeeded |
| Add_or_Update / Prep_Payload | `Scope` | Get_Fields_Map: Succeeded |
| Add_or_Update / Prep_Payload / Payload_Index | `Select` |  |
| Add_or_Update / Prep_Payload / Payload_Array | `Select` | Payload_Index: Succeeded |
| Add_or_Update / Prep_Payload / Payload_Object | `SetVariable` | Payload_Array: Succeeded |
| Add_or_Update / Finalize_Payload | `Scope` | Prep_Payload: Succeeded |
| Add_or_Update / Finalize_Payload / Get_Deal_Stage | `If` |  |
| Add_or_Update / Finalize_Payload / Get_Deal_Stage / Get_Stage_Details | `OpenApiConnection · GetItem` |  |
| Add_or_Update / Finalize_Payload / Get_Deal_Stage / Matched_Stage | `Compose` | Get_Stage_Details: Succeeded |
| Add_or_Update / Finalize_Payload / Get_Deal_Stage / Adjust_Payload | `SetVariable` | Matched_Stage: Succeeded |
| Add_or_Update / Update_Atlas | `Scope` | Existing_Deal: Succeeded |
| Add_or_Update / Update_Atlas / Payload_is_Valid | `If` |  |
| Add_or_Update / Update_Atlas / Payload_is_Valid / Add_Property_UID | `Compose` |  |
| Add_or_Update / Update_Atlas / Payload_is_Valid / Add_SPList_ID | `Compose` | Add_Property_UID: Succeeded |
| Add_or_Update / Update_Atlas / Payload_is_Valid / HTTP_Send_to_Atlas | `Http` | Add_SPList_ID: Succeeded |
| Add_or_Update / Update_Atlas / Payload_is_Valid / Set_Atlas_Error | `SetVariable` | HTTP_Send_to_Atlas: Failed |
| Add_or_Update / else / Deal_Exists | `If` |  |
| Add_or_Update / else / Deal_Exists / Delete_Existing_Deal | `Http` |  |
| Add_or_Update / else / Deal_Exists / Set_Delete_Error | `SetVariable` | Delete_Existing_Deal: Failed |
| Init_Data_Payload | `InitializeVariable` |  |
| Find_HB_Deal | `Scope` | Init_ErrorMsg: Succeeded |
| Find_HB_Deal / Get_HubSpot_Secret | `OpenApiConnection · GetSecret` |  |
| Find_HB_Deal / Find_Deal_Match | `Http` | Get_HubSpot_Secret: Succeeded |
| Find_HB_Deal / Delay_15_sec | `Wait` | Find_Deal_Match: Succeeded |

## Connections to other flows

No direct child-flow action is present in the exported definition. HTTP callbacks and connector events can still link this flow to other parts of the solution; see the [system map](../cloud-automation.md).

## Operations and verification

Use run history to verify which conditional paths actually ran, connector results, returned values, and retries. The export describes configured behavior, not live connection health or recent run success. For flow changes, validate in a development environment before testing or publishing.
