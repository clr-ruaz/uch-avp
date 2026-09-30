# UCH-AVPMatchwithPropertyRadar

[Cloud flow overview](../cloud-automation.md) · [Workflow inventory](../workflows.md) · [Exported definition](../../src/powerplatform/ProjectAVP/src/Workflows/UCH-AVPMatchwithPropertyRadar-F95A485F-CDD9-F011-8544-6045BD056AC0.json)

Matches a changed AVP record against PropertyRadar, updates match details, and handles lookup errors.

## Entry and contract

- **Flow ID:** `f95a485f-cdd9-f011-8544-6045bd056ac0`.
- **Trigger:** `When_an_item_is_created_or_modified` (OpenApiConnection).
- **Declared request fields:** No request fields declared in the trigger schema.
- **Connector families:** `shared_keyvault`, `shared_sharepointonline`.
- **Response actions:** No explicit response action.

The exported definition is the source for exact request/response schemas, filter expressions, conditions, and schedule settings. This guide omits literal URLs, payload defaults, and credentials.

## Top-level actions

These actions are listed in export order. The `runAfter` dependencies below determine execution order and permitted failure paths.

- **Get Radar Match** (Scope). Run the grouped actions below.
- **Init Matches ary** (InitializeVariable). See the action map for its operation and dependencies.
- **Init Radar ID Match** (InitializeVariable). See the action map for its operation and dependencies.
- **Init Radar Match flag** (InitializeVariable). See the action map for its operation and dependencies.
- **Init Import Item ID** (InitializeVariable). See the action map for its operation and dependencies.
- **Init Radar Details** (InitializeVariable). See the action map for its operation and dependencies.
- **Handle Errors** (Scope). Run the grouped actions below.
- **Update Property** (Scope). Run the grouped actions below.

## Action map

The path shows nesting inside scopes, loops, conditions, and switch cases. “After” lists the exported `runAfter` dependency and permitted predecessor statuses; an empty cell usually means a branch or scope entry.

| Action path | Type / operation | After |
| --- | --- | --- |
| Get_Radar_Match | `Scope` | Init_Radar_Details: Succeeded |
| Get_Radar_Match / Match_Property | `If` |  |
| Get_Radar_Match / Match_Property / Non-Radar | `If` | Get_Radar_Secret: Succeeded |
| Get_Radar_Match / Match_Property / Non-Radar / Valid_Address | `If` |  |
| Get_Radar_Match / Match_Property / Non-Radar / Valid_Address / POST_Test_Import | `Http` |  |
| Get_Radar_Match / Match_Property / Non-Radar / Valid_Address / Single_Match | `If` | POST_Test_Import: Succeeded |
| Get_Radar_Match / Match_Property / Non-Radar / Valid_Address / Single_Match / POST_Radar_Import | `Http` |  |
| Get_Radar_Match / Match_Property / Non-Radar / Valid_Address / Single_Match / Unit_Matched | `Until` | POST_Radar_Import: Succeeded |
| Get_Radar_Match / Match_Property / Non-Radar / Valid_Address / Single_Match / Unit_Matched / Get_List_Matches | `Http` | Delay_2_seconds: Succeeded |
| Get_Radar_Match / Match_Property / Non-Radar / Valid_Address / Single_Match / Unit_Matched / Delay_2_seconds | `Wait` |  |
| Get_Radar_Match / Match_Property / Non-Radar / Valid_Address / Single_Match / Found_Match | `If` | Unit_Matched: Succeeded |
| Get_Radar_Match / Match_Property / Non-Radar / Valid_Address / Single_Match / Found_Match / Set_Radar_ID_Match | `SetVariable` | Set_Import_Item_ID: Succeeded |
| Get_Radar_Match / Match_Property / Non-Radar / Valid_Address / Single_Match / Found_Match / Set_Import_Item_ID | `SetVariable` |  |
| Get_Radar_Match / Match_Property / Non-Radar / else / Radar_Originated | `SetVariable` |  |
| Get_Radar_Match / Match_Property / Get_Radar_Secret | `OpenApiConnection · GetSecret` |  |
| Get_Radar_Match / Match_Details | `If` | Match_Property: Succeeded |
| Get_Radar_Match / Match_Details / GET_Test_Details | `Http` |  |
| Get_Radar_Match / Match_Details / Single_Property | `If` | GET_Test_Details: Succeeded |
| Get_Radar_Match / Match_Details / Single_Property / GET_Property_Details | `Http` |  |
| Get_Radar_Match / Match_Details / Single_Property / Check_APN | `If` | GET_Property_Details: Succeeded |
| Get_Radar_Match / Match_Details / Single_Property / Check_APN / Set_APN_Match | `SetVariable` |  |
| Get_Radar_Match / Match_Details / Single_Property / Check_APN / else / Check_Owners | `If` |  |
| Get_Radar_Match / Match_Details / Single_Property / Check_APN / else / Check_Owners / Do_Matching | `If` |  |
| Get_Radar_Match / Match_Details / Single_Property / Check_APN / else / Check_Owners / Do_Matching / Get_System_Prompt | `OpenApiConnection · GetItems` |  |
| Get_Radar_Match / Match_Details / Single_Property / Check_APN / else / Check_Owners / Do_Matching / Get_LLM_Endpoint | `Workflow` | Get_System_Prompt: Succeeded |
| Get_Radar_Match / Match_Details / Single_Property / Check_APN / else / Check_Owners / Do_Matching / AVP_Owners_ary | `Query` | Get_LLM_Endpoint: Succeeded |
| Get_Radar_Match / Match_Details / Single_Property / Check_APN / else / Check_Owners / Do_Matching / Radar_Owners_ary | `Query` | AVP_Owners_ary: Succeeded |
| Get_Radar_Match / Match_Details / Single_Property / Check_APN / else / Check_Owners / Do_Matching / Owner_Datasets | `Compose` | Radar_Owners_ary: Succeeded |
| Get_Radar_Match / Match_Details / Single_Property / Check_APN / else / Check_Owners / Do_Matching / Match_Owner_Names | `Http` | Owner_Datasets: Succeeded |
| Get_Radar_Match / Match_Details / Single_Property / Check_APN / else / Check_Owners / Do_Matching / Set_Owner_Match | `SetVariable` | Match_Owner_Names: Succeeded |
| Get_Radar_Match / Match_Details / Single_Property / Check_APN / else / Check_Owners / else / No_Match_Contraints | `SetVariable` |  |
| Get_Radar_Match / Match_Details / Single_Property / else / Use_Current_Radar_ID | `SetVariable` |  |
| Get_Radar_Match / Match_Details / else / Use_Current_RadarID | `SetVariable` |  |
| Get_Radar_Match / Details_Matched | `If` | Match_Details: Succeeded |
| Get_Radar_Match / Details_Matched / PUT_Item_in_Feeder | `Http` | Record_Details: Succeeded |
| Get_Radar_Match / Details_Matched / Record_Details | `ParseJson` |  |
| Init_Matches_ary | `InitializeVariable` |  |
| Init_Radar_ID_Match | `InitializeVariable` | Init_Import_Item_ID: Succeeded |
| Init_Radar_Match_flag | `InitializeVariable` | Init_Radar_ID_Match: Succeeded |
| Init_Import_Item_ID | `InitializeVariable` | Init_Matches_ary: Succeeded |
| Init_Radar_Details | `InitializeVariable` | Init_Radar_Match_flag: Succeeded |
| Handle_Errors | `Scope` | Get_Radar_Match: Failed |
| Handle_Errors / Set_Pending_Status | `OpenApiConnection · PatchItem` |  |
| Handle_Errors / Terminate_as_failed | `Terminate` | Set_Pending_Status: Succeeded |
| Update_Property | `Scope` | Get_Radar_Match: Succeeded |
| Update_Property / Set_as_Duplicate | `OpenApiConnection · PatchItem` | Update_RadarID: Failed |
| Update_Property / Update_RadarID | `OpenApiConnection · PatchItem` |  |

## Connections to other flows

| Call action | Target flow |
| --- | --- |
| Get_Radar_Match / Match_Details / Single_Property / Check_APN / else / Check_Owners / Do_Matching / Get_LLM_Endpoint | [UCH-AVPGetCallbakURL](getcallbakurl.md) |

## Operations and verification

Use run history to verify which conditional paths actually ran, connector results, returned values, and retries. The export describes configured behavior, not live connection health or recent run success. For flow changes, validate in a development environment before testing or publishing.
