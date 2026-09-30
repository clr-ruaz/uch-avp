# UCH-AVPExtractCoStarReport

[Cloud flow overview](../cloud-automation.md) · [Workflow inventory](../workflows.md) · [Exported definition](../../src/powerplatform/ProjectAVP/src/Workflows/UCH-AVPExtractCoStarReport-1F6F7ED0-41CC-F011-BBD3-7C1E5217E110.json)

Processes a newly created CoStar report file, extracts content, adds comparable-sale summaries, and updates the property.

## Entry and contract

- **Flow ID:** `1f6f7ed0-41cc-f011-bbd3-7c1e5217e110`.
- **Trigger:** `When_file_is_created` (OpenApiConnection).
- **Declared request fields:** No request fields declared in the trigger schema.
- **Connector families:** `shared_office365`, `shared_sharepointonline`.
- **Response actions:** No explicit response action.

The exported definition is the source for exact request/response schemas, filter expressions, conditions, and schedule settings. This guide omits literal URLs, payload defaults, and credentials.

## Top-level actions

These actions are listed in export order. The `runAfter` dependencies below determine execution order and permitted failure paths.

- **Add Summary** (Scope). Run the grouped actions below.
- **Send an email about Comps Header fail** (OpenApiConnection). See the action map for its operation and dependencies.
- **Get SPList Refs** (Scope). Run the grouped actions below.
- **Extract Content** (Scope). Run the grouped actions below.
- **Set Property Status** (OpenApiConnection). See the action map for its operation and dependencies.
- **Update Property** (OpenApiConnection). See the action map for its operation and dependencies.

## Action map

The path shows nesting inside scopes, loops, conditions, and switch cases. “After” lists the exported `runAfter` dependency and permitted predecessor statuses; an empty cell usually means a branch or scope entry.

| Action path | Type / operation | After |
| --- | --- | --- |
| Add_Summary | `Scope` | Extract_Content: Succeeded |
| Add_Summary / Each_Comp_List | `Foreach` | Update_Comps_Hdr: Succeeded |
| Add_Summary / Each_Comp_List / Sale_Comps_Rows | `ParseJson` |  |
| Add_Summary / Each_Comp_List / Create_Comps_Item | `OpenApiConnection · PostItem` | Sale_Comps_Rows: Succeeded |
| Add_Summary / Create_Comps_Hdr | `OpenApiConnection · PostItem` | Demog_Link: Succeeded |
| Add_Summary / Undisclosed_Prices | `Query` | Sale_Comparables: Succeeded |
| Add_Summary / Under_Contract | `Query` | Undisclosed_Prices: Succeeded |
| Add_Summary / Update_Comps_Hdr | `OpenApiConnection · PatchItem` | Demog_Exists: Succeeded |
| Add_Summary / Property_Size | `Compose` | Under_Contract: Succeeded |
| Add_Summary / Sale_Comparables | `Compose` |  |
| Add_Summary / Target_Property | `Compose` | Property_Size: Succeeded |
| Add_Summary / Price_for_Size | `Compose` | Target_Property: Succeeded |
| Add_Summary / Price_for_Units | `Compose` | Price_for_Size: Succeeded |
| Add_Summary / LTV_Pct | `Compose` | Price_for_Units: Succeeded |
| Add_Summary / Demog_Link | `Compose` | LTV_Pct: Succeeded |
| Add_Summary / Demog_Exists | `If` | Create_Comps_Hdr: Succeeded |
| Add_Summary / Demog_Exists / Create_Demog | `OpenApiConnection · PostItem` |  |
| Send_an_email_about_Comps_Header_fail | `OpenApiConnection · SharedMailboxSendEmailV2` | Add_Summary: Failed |
| Get_SPList_Refs | `Scope` |  |
| Get_SPList_Refs / Sale_Comps_List | `Compose` | Sale_Comps_Header: Succeeded |
| Get_SPList_Refs / Sale_Comps_Header | `Compose` | Get_Demographics: Succeeded |
| Get_SPList_Refs / Get_Sale_Comps_List | `OpenApiConnection · HttpRequest` | Get_Sale_Comps_Hdr: Succeeded |
| Get_SPList_Refs / Get_Sale_Comps_Hdr | `OpenApiConnection · HttpRequest` | Get_Property_Details: Succeeded |
| Get_SPList_Refs / Get_Property_Details | `OpenApiConnection · GetItems` |  |
| Get_SPList_Refs / Comps_Hdr_Views | `Query` | Demographics: Succeeded |
| Get_SPList_Refs / Comps_List_Views | `Query` | Comps_Hdr_Views: Succeeded |
| Get_SPList_Refs / Get_Demographics | `OpenApiConnection · HttpRequest` | Get_Sale_Comps_List: Succeeded |
| Get_SPList_Refs / Demographics | `Compose` | Sale_Comps_List: Succeeded |
| Extract_Content | `Scope` | Get_SPList_Refs: Succeeded |
| Extract_Content / Get_System_Prompt | `OpenApiConnection · GetItems` |  |
| Extract_Content / System_Message | `Compose` | Get_System_Prompt: Succeeded |
| Extract_Content / Get_File_Content | `OpenApiConnection · GetFileContent` | System_Message: Succeeded |
| Extract_Content / User_Message | `Compose` | Get_File_Content: Succeeded |
| Extract_Content / Post_OpenAI_Request | `Workflow` | User_Message: Succeeded |
| Extract_Content / Extracted_Data | `ParseJson` | Post_OpenAI_Request: Succeeded |
| Extract_Content / Send_an_email_alert | `OpenApiConnection · SharedMailboxSendEmailV2` | Post_OpenAI_Request: Failed |
| Extract_Content / Terminate | `Terminate` | Update_Property_Status_to_Failed: Succeeded |
| Extract_Content / Update_Property_Status_to_Failed | `OpenApiConnection · PatchItem` | Send_an_email_alert: Succeeded |
| Extract_Content / Sale_Comps_Data | `ParseJson` | Extracted_Data: Succeeded |
| Set_Property_Status | `OpenApiConnection · PatchItem` | Send_an_email_about_Comps_Header_fail: Succeeded |
| Update_Property | `OpenApiConnection · PatchItem` | Add_Summary: Succeeded |

## Connections to other flows

| Call action | Target flow |
| --- | --- |
| Extract_Content / Post_OpenAI_Request | [UCH-AVPPostOpenAIRequest](postopenairequest.md) |

## Operations and verification

Use run history to verify which conditional paths actually ran, connector results, returned values, and retries. The export describes configured behavior, not live connection health or recent run success. For flow changes, validate in a development environment before testing or publishing.
