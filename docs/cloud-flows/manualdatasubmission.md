# UCH-AVPManualDataSubmission

[Cloud flow overview](../cloud-automation.md) · [Workflow inventory](../workflows.md) · [Exported definition](../../src/powerplatform/ProjectAVP/src/Workflows/UCH-AVPManualDataSubmission-8D085789-D4C5-F011-BBD3-7C1E5217E110.json)

Processes submitted spreadsheet attachments, maps rows to properties, and posts processing results.

## Entry and contract

- **Flow ID:** `8d085789-d4c5-f011-bbd3-7c1e5217e110`.
- **Trigger:** `When_an_item_is_created_or_modified` (OpenApiConnection).
- **Declared request fields:** No request fields declared in the trigger schema.
- **Connector families:** `shared_excelonlinebusiness`, `shared_office365`, `shared_sharepointonline`.
- **Response actions:** No explicit response action.

The exported definition is the source for exact request/response schemas, filter expressions, conditions, and schedule settings. This guide omits literal URLs, payload defaults, and credentials.

## Top-level actions

These actions are listed in export order. The `runAfter` dependencies below determine execution order and permitted failure paths.

- **Fetch Files** (Scope). Run the grouped actions below.
- **Process Files** (Scope). Run the grouped actions below.
- **Init Property List** (InitializeVariable). See the action map for its operation and dependencies.
- **Init Property Tmp** (InitializeVariable). See the action map for its operation and dependencies.
- **Each Property** (Foreach). Process each item.
- **Handle County** (Scope). Run the grouped actions below.
- **Init County Name** (InitializeVariable). See the action map for its operation and dependencies.
- **Init Excludes ary** (InitializeVariable). See the action map for its operation and dependencies.
- **Init Headers List** (InitializeVariable). See the action map for its operation and dependencies.
- **Field Mappings** (Scope). Run the grouped actions below.
- **Init Data Diff ary** (InitializeVariable). See the action map for its operation and dependencies.
- **Post-Processing** (Scope). Run the grouped actions below.

## Action map

The path shows nesting inside scopes, loops, conditions, and switch cases. “After” lists the exported `runAfter` dependency and permitted predecessor statuses; an empty cell usually means a branch or scope entry.

| Action path | Type / operation | After |
| --- | --- | --- |
| Fetch_Files | `Scope` | Handle_County: Succeeded |
| Fetch_Files / Get_attachments | `OpenApiConnection · GetItemAttachments` | Filename_Prefix: Succeeded |
| Fetch_Files / XLSX_Attachments | `Query` | Get_attachments: Succeeded |
| Fetch_Files / XLSX_Attached | `If` | XLSX_Attachments: Succeeded |
| Fetch_Files / XLSX_Attached / Each_Attachment | `Foreach` |  |
| Fetch_Files / XLSX_Attached / Each_Attachment / Get_file_content | `OpenApiConnection · GetAttachmentContent` |  |
| Fetch_Files / XLSX_Attached / Each_Attachment / Create_file_in_library | `OpenApiConnection · CreateFile` | Get_file_content: Succeeded |
| Fetch_Files / XLSX_Attached / else / Terminate | `Terminate` | Send_email_alert_re_missing_XLSX_file: Succeeded |
| Fetch_Files / XLSX_Attached / else / Send_email_alert_re_missing_XLSX_file | `OpenApiConnection · SharedMailboxSendEmailV2` |  |
| Fetch_Files / Filename_Prefix | `Compose` |  |
| Process_Files | `Scope` | Fetch_Files: Succeeded/Failed |
| Process_Files / Each_File | `Foreach` |  |
| Process_Files / Each_File / Get_worksheets | `OpenApiConnection · GetAllWorksheets` |  |
| Process_Files / Each_File / Run_script_from_SharePoint_library | `OpenApiConnection · RunScriptProdV2` | Property_Source: Succeeded |
| Process_Files / Each_File / Excel_Data | `ParseJson` | Run_script_from_SharePoint_library: Succeeded |
| Process_Files / Each_File / Set_Property_Tmp | `SetVariable` | Excel_Data: Succeeded |
| Process_Files / Each_File / Set_Property_List | `SetVariable` | Set_Property_Tmp: Succeeded |
| Process_Files / Each_File / Property_Source | `Switch` | Get_worksheets: Succeeded |
| Process_Files / Each_File / Property_Source / case PropertyOnion.com / Set_Onion_Headers | `SetVariable` |  |
| Process_Files / Each_File / Property_Source / case The_Warren_Group / Set_TWG_Headers | `SetVariable` |  |
| Process_Files / Each_File / Property_Source / case CoStar_Report / Set_CoStar_Headers | `SetVariable` |  |
| Process_Files / Each_File / Send_email_re_failure_to_convert_table | `OpenApiConnection · SharedMailboxSendEmailV2` | Run_script_from_SharePoint_library: Failed |
| Process_Files / Get_Callback_URL | `Workflow` | Each_File: Succeeded |
| Process_Files / Set_Processing_Status | `OpenApiConnection · PatchItem` | Get_Callback_URL: Succeeded |
| Init_Property_List | `InitializeVariable` |  |
| Init_Property_Tmp | `InitializeVariable` | Init_Property_List: Succeeded |
| Each_Property | `Foreach` | Process_Files: Succeeded |
| Each_Property / Record_in_AVP | `Scope` |  |
| Each_Property / Record_in_AVP / Transform_Data | `ParseJson` | Match_Property_Type: Succeeded |
| Each_Property / Record_in_AVP / Valid_Property | `If` | Alternate_UID: Succeeded |
| Each_Property / Record_in_AVP / Valid_Property / Update_Payload | `Compose` | Format_County: Succeeded |
| Each_Property / Record_in_AVP / Valid_Property / Format_County | `Scope` |  |
| Each_Property / Record_in_AVP / Valid_Property / Format_County / Set_County_Name | `SetVariable` |  |
| Each_Property / Record_in_AVP / Valid_Property / Format_County / County_Code | `If` | Set_County_Name: Succeeded |
| Each_Property / Record_in_AVP / Valid_Property / Format_County / County_Code / Get_County_Name | `Query` |  |
| Each_Property / Record_in_AVP / Valid_Property / Format_County / County_Code / County_Matched | `If` | Get_County_Name: Succeeded |
| Each_Property / Record_in_AVP / Valid_Property / Format_County / County_Code / County_Matched / Final_County_Name | `SetVariable` |  |
| Each_Property / Record_in_AVP / Valid_Property / Valid_County | `If` | Update_Payload: Succeeded |
| Each_Property / Record_in_AVP / Valid_Property / Valid_County / Find_Matching_Item | `OpenApiConnection · GetItems` |  |
| Each_Property / Record_in_AVP / Valid_Property / Valid_County / Matches_Found | `If` | Find_Matching_Item: Succeeded |
| Each_Property / Record_in_AVP / Valid_Property / Valid_County / Matches_Found / Data_Differences | `Query` |  |
| Each_Property / Record_in_AVP / Valid_Property / Valid_County / Matches_Found / Diffs_Found | `If` | Data_Differences: Succeeded |
| Each_Property / Record_in_AVP / Valid_Property / Valid_County / Matches_Found / Diffs_Found / Differences_array | `Select` | Update_Property_List: Succeeded |
| Each_Property / Record_in_AVP / Valid_Property / Valid_County / Matches_Found / Diffs_Found / Differences_summary | `Compose` | Differences_array: Succeeded |
| Each_Property / Record_in_AVP / Valid_Property / Valid_County / Matches_Found / Diffs_Found / Append_Diff_Data | `AppendToArrayVariable` | Differences_summary: Succeeded |
| Each_Property / Record_in_AVP / Valid_Property / Valid_County / Matches_Found / Diffs_Found / Update_Property_List | `Http` |  |
| Each_Property / Record_in_AVP / Valid_Property / Valid_County / Matches_Found / else / Add_Property_List | `Http` |  |
| Each_Property / Record_in_AVP / Valid_Property / Valid_County / Matches_Found / else / Append_New_Data | `AppendToArrayVariable` | Add_Property_List: Succeeded |
| Each_Property / Record_in_AVP / Valid_Property / else / Add_to_Excludes | `If` |  |
| Each_Property / Record_in_AVP / Valid_Property / else / Add_to_Excludes / Append_to_Excludes | `AppendToArrayVariable` |  |
| Each_Property / Record_in_AVP / Alternate_UID | `Compose` | Transform_Data: Succeeded |
| Each_Property / Record_in_AVP / Match_Property_Type | `Query` |  |
| Each_Property / Send_email_re_failure_to_process_property | `OpenApiConnection · SharedMailboxSendEmailV2` | Record_in_AVP: Failed |
| Handle_County | `Scope` | Field_Mappings: Succeeded |
| Handle_County / Get_County_Listing | `OpenApiConnection · GetItems` |  |
| Init_County_Name | `InitializeVariable` | Init_Property_Tmp: Succeeded |
| Init_Excludes_ary | `InitializeVariable` | Init_Headers_List: Succeeded |
| Init_Headers_List | `InitializeVariable` | Init_County_Name: Succeeded |
| Field_Mappings | `Scope` | Init_Data_Diff_ary: Succeeded |
| Field_Mappings / Get_AVP_API_Config | `OpenApiConnection · GetItems` | Get_PType_Codes: Succeeded |
| Field_Mappings / AVP_API__Mapping | `Select` | Get_AVP_API_Config: Succeeded |
| Field_Mappings / Get_PType_Codes | `OpenApiConnection · GetItems` |  |
| Init_Data_Diff_ary | `InitializeVariable` | Init_Excludes_ary: Succeeded |
| Post-Processing | `Scope` | Each_Property: Succeeded/Failed |
| Post-Processing / Update_item | `OpenApiConnection · PatchItem` |  |
| Post-Processing / Differences_Reviewer | `Compose` | Update_item: Succeeded |
| Post-Processing / Exclusions | `If` | Differences_Reviewer: Succeeded |
| Post-Processing / Exclusions / Exclusions_Table | `Table` |  |
| Post-Processing / Exclusions / Send_email_alert_about_exclusions | `OpenApiConnection · SharedMailboxSendEmailV2` | Exclusions_Table: Succeeded |

## Connections to other flows

| Call action | Target flow |
| --- | --- |
| Process_Files / Get_Callback_URL | [UCH-AVPGetCallbakURL](getcallbakurl.md) |

## Operations and verification

Use run history to verify which conditional paths actually ran, connector results, returned values, and retries. The export describes configured behavior, not live connection health or recent run success. For flow changes, validate in a development environment before testing or publishing.
