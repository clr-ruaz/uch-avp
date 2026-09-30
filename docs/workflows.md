# Workflow reference

This inventory is generated from the exported JSON definitions in `src/powerplatform/ProjectAVP/src/Workflows/`. It lists entry points and top-level action names; nested actions, trigger conditions, schedules, and request schemas remain in the linked definitions. A trigger named `manual` does not by itself identify whether the caller is an HTTP client, a parent flow, Power Apps, or an agent.

There are 37 cloud flows and one desktop-flow record. Companion `.json.data.xml` files hold Power Platform workflow metadata. For the desktop flow, the XML also contains the action script in `<Definition>` and input declarations in `<Inputs>`; the JSON alone is not the complete implementation.

[Return to the project README](../README.md)

For the desktop flow's detailed portal sequences, see [CoStar](rpa/costar.md), [Zillow](rpa/zillow.md), [Redfin](rpa/redfin.md), and [Realtor.com](rpa/realtor.md). Shared orchestration and helper behavior are covered in the [RPA overview](desktop-automation.md).

For how the cloud flows work together and detailed action maps for each one, see the [cloud automation guide](cloud-automation.md).

| Workflow | Exported trigger | Top-level actions |
| --- | --- | --- |
| [UCH-AVPAddtoPropertyList](../src/powerplatform/ProjectAVP/src/Workflows/UCH-AVPAddtoPropertyList-94EE58AB-F2BA-F011-BBD3-7C1E5217E110.json) | manual (Request) | `Response`, `Update_AVP_DB`, `Init_Update_flag`, `Init_Activity_ary`, `Init_Item_ID_int`, `Init_Reset_flag`, `Init_Header_obj` |
| [UCH-AVPAutomatedValuationDesktopFlow](../src/powerplatform/ProjectAVP/src/Workflows/UCH-AVPAutomatedValuationDesktopFlow-2E6975E7-8C20-4F15-9FEC-AC412E9A55DD.json.data.xml) | Invoked by Validate Properties through `RunUIFlow_V2` | Embedded desktop script: initialize variables, orchestrate queue processing, and call portal/helper subflows; see [desktop process](desktop-automation.md). |
| [UCH-AVPAVPChangeTracker](../src/powerplatform/ProjectAVP/src/Workflows/UCH-AVPAVPChangeTracker-EF3B2E0E-5254-F111-BEC7-7CED8D3C078D.json) | When_an_item_or_a_file_is_modified (OpenApiConnection) | `Init_HTTP_Requests`, `Valid_Request`, `Change_Tracker`, `Duplicate_Check` |
| [UCH-AVPCreateSyncFolder](../src/powerplatform/ProjectAVP/src/Workflows/UCH-AVPCreateSyncFolder-3553A92A-AFF5-F011-8406-7CED8D3C078D.json) | When_an_item_or_a_file_is_modified (OpenApiConnection) | `Get_changes_for_item`, `Workflow_Status`, `Init_Sync_Folder` |
| [UCH-AVPExtractCoStarReport](../src/powerplatform/ProjectAVP/src/Workflows/UCH-AVPExtractCoStarReport-1F6F7ED0-41CC-F011-BBD3-7C1E5217E110.json) | When_file_is_created (OpenApiConnection) | `Add_Summary`, `Send_an_email_about_Comps_Header_fail`, `Get_SPList_Refs`, `Extract_Content`, `Set_Property_Status`, `Update_Property` |
| [UCH-AVPFetchImageAnalysis](../src/powerplatform/ProjectAVP/src/Workflows/UCH-AVPFetchImageAnalysis-882705E8-AB1E-F111-8341-7CED8D3C00CF.json) | manual (Request) | `Response`, `Post_OpenAI_Request`, `User_Message` |
| [UCH-AVPFetchLLMPrompt](../src/powerplatform/ProjectAVP/src/Workflows/UCH-AVPFetchLLMPrompt-0DF4D05D-68F0-F011-8407-6045BD051327.json) | manual (Request) | `Get_LLM_Prompt`, `Response` |
| [UCH-AVPFetchMFACode](../src/powerplatform/ProjectAVP/src/Workflows/UCH-AVPFetchMFACode-04018DD2-EBCC-F011-BBD3-7C1E5217E110.json) | manual (Request) | `Response`, `Get_matching_emails`, `Matched_Emails`, `Init_MFA_code_str`, `Get_mail_attachment`, `CoStar_Access_Code` |
| [UCH-AVPFetchWorkQueue](../src/powerplatform/ProjectAVP/src/Workflows/UCH-AVPFetchWorkQueue-DA0DCFF9-F6BE-F011-BBD3-7C1E5217E110.json) | manual (Request) | `Get_items`, `Response`, `Clean_Queued_Data`, `Get_Valid_Items_Only`, `Select_Queued_Data` |
| [UCH-AVPForcetoIntake](../src/powerplatform/ProjectAVP/src/Workflows/UCH-AVPForcetoIntake-FCB8413C-C959-F111-BEC7-7CED8D3C078D.json) | Recurrence (Recurrence) | `Due_Records`, `Each_Due_Record` |
| [UCH-AVPForceValidationURL](../src/powerplatform/ProjectAVP/src/Workflows/UCH-AVPForceValidationURL-46D7B9C3-2532-F111-88B4-7CED8D3C00CF.json) | manual (Request) | `Success_Response`, `Valuation_Source`, `Get_SharePoint_Item`, `Set_Valuation_Status`, `Fail_Response` |
| [UCH-AVPGetCallbakURL](../src/powerplatform/ProjectAVP/src/Workflows/UCH-AVPGetCallbakURL-DB89759A-F8BE-F011-BBD3-7C1E5217E110.json) | manual (Request) | `Respond_to_flow`, `Get_Environment`, `Get_Cloud_Flow` |
| [UCH-AVPGetItemsCount](../src/powerplatform/ProjectAVP/src/Workflows/UCH-AVPGetItemsCount-90A5396E-1CDC-F011-8544-6045BD056AC0.json) | manual (Request) | `Get_Items_Count`, `Respond_to_a_Power_App_or_flow`, `Sale_Date_Filter`, `Convert_time_zone`, `Get_OData_Filter` |
| [UCH-AVPGetTransactionHistory](../src/powerplatform/ProjectAVP/src/Workflows/UCH-AVPGetTransactionHistory-13C004F3-8805-F111-8406-7CED8D3C0F0B.json) | When_an_item_is_created_or_modified (OpenApiConnection) | `Get_AVP_History`, `Get_Radar_Secret`, `No_Transactions` |
| [UCH-AVPHandleValidationIssues](../src/powerplatform/ProjectAVP/src/Workflows/UCH-AVPHandleValidationIssues-CCF43295-FFD4-F011-8544-6045BD056AC0.json) | When_an_item_is_created_or_modified (OpenApiConnection) | `Issue_Type`, `Init_Blank_str`, `Valuation_Status`, `Valuation_Source` |
| [UCH-AVPHubSpotWebhookURL](../src/powerplatform/ProjectAVP/src/Workflows/UCH-AVPHubSpotWebhookURL-25A83390-5D27-F111-8341-7CED8D3C06DF.json) | manual (Request) | `Get_HB_Changes`, `Get_Field_Map`, `Each_HB_ID`, `Init_Payload_Object`, `Prep_Global_Data` |
| [UCH-AVPLogHelperInteraction](../src/powerplatform/ProjectAVP/src/Workflows/UCH-AVPLogHelperInteraction-5614F716-373D-F111-88B5-7CED8D3C078D.json) | manual (Request) | `Respond_to_the_agent`, `Response_HTML`, `Query_HTML`, `Record_Interaction` |
| [UCH-AVPManualDataSubmission](../src/powerplatform/ProjectAVP/src/Workflows/UCH-AVPManualDataSubmission-8D085789-D4C5-F011-BBD3-7C1E5217E110.json) | When_an_item_is_created_or_modified (OpenApiConnection) | `Fetch_Files`, `Process_Files`, `Init_Property_List`, `Init_Property_Tmp`, `Each_Property`, `Handle_County`, `Init_County_Name`, `Init_Excludes_ary`, `Init_Headers_List`, `Field_Mappings`, `Init_Data_Diff_ary`, `Post-Processing` |
| [UCH-AVPManualValidationTrigger](../src/powerplatform/ProjectAVP/src/Workflows/UCH-AVPManualValidationTrigger-331B4B1B-B70C-B30D-8C38-CE2D7F36AC5B.json) | manual (Request) | `Run_a_Child_Flow` |
| [UCH-AVPMatchwithPropertyRadar](../src/powerplatform/ProjectAVP/src/Workflows/UCH-AVPMatchwithPropertyRadar-F95A485F-CDD9-F011-8544-6045BD056AC0.json) | When_an_item_is_created_or_modified (OpenApiConnection) | `Get_Radar_Match`, `Init_Matches_ary`, `Init_Radar_ID_Match`, `Init_Radar_Match_flag`, `Init_Import_Item_ID`, `Init_Radar_Details`, `Handle_Errors`, `Update_Property` |
| [UCH-AVPOpenAIRequest](../src/powerplatform/ProjectAVP/src/Workflows/UCH-AVPOpenAIRequest-736370EC-8ECB-F011-BBD3-7C1E5217E110.json) | manual (Request) | `Response`, `OpenAI_Request` |
| [UCH-AVPPostHubSpotActivity](../src/powerplatform/ProjectAVP/src/Workflows/UCH-AVPPostHubSpotActivity-52D44BD7-E228-F111-8341-7CED8D3C00CF.json) | When_an_item_is_created_or_modified (OpenApiConnection) | `Get_HubSpot_Secret`, `Find_Deal_Match`, `Existing_Deal` |
| [UCH-AVPPostHubSpotDeal](../src/powerplatform/ProjectAVP/src/Workflows/UCH-AVPPostHubSpotDeal-6A1C7505-310D-F111-8406-7CED8D3C078D.json) | When_an_item_is_created_or_modified (OpenApiConnection) | `Init_ErrorMsg`, `Failed_Operation`, `Init_Delete_Flag`, `Add_or_Update`, `Init_Data_Payload`, `Find_HB_Deal` |
| [UCH-AVPPostOpenAIRequest](../src/powerplatform/ProjectAVP/src/Workflows/UCH-AVPPostOpenAIRequest-9B3A2388-A7C3-F011-BBD3-7C1E5217E110.json) | manual (Request) | `Get_OpenAI_Key`, `LLM_POST_Request`, `User_Message`, `Respond_to_flow`, `Cleanup_String`, `LLM_Response` |
| [UCH-AVPQueryAVPDatabase](../src/powerplatform/ProjectAVP/src/Workflows/UCH-AVPQueryAVPDatabase-D5683CEC-463A-F111-88B5-7CED8D3C078D.json) | manual (Request) | `Respond_to_the_agent`, `Init_Matched_bln`, `Matches_Found`, `Get_Address_Fltr`, `Query_AVP_Data` |
| [UCH-AVPRefreshCopilotToken](../src/powerplatform/ProjectAVP/src/Workflows/UCH-AVPRefreshCopilotToken-09C0113B-555B-F111-BEC7-7CED8D3C06DF.json) | manual (Request) | `Response`, `Copilot_Token`, `Store_Token` |
| [UCH-AVPScheduleTrigger](../src/powerplatform/ProjectAVP/src/Workflows/UCH-AVPScheduleTrigger-A0BE04EA-77CF-F011-BBD3-7C1E5217E110.json) | Recurrence (Recurrence) | `Validate_Properties` |
| [UCH-AVPSearchPropertyListing](../src/powerplatform/ProjectAVP/src/Workflows/UCH-AVPSearchPropertyListing-7522EB76-33E4-FCE7-9D68-51DF51765368.json) | manual (Request) | `Success_Response`, `Fail_Response`, `Terminate_due_to_error_response`, `Get_Address_Fltr`, `Query_AVP_Data` |
| [UCH-AVPSendAVPDailySummary](../src/powerplatform/ProjectAVP/src/Workflows/UCH-AVPSendAVPDailySummary-5BC386FF-CA80-F111-AB0E-70A8A5AFCC95.json) | Recurrence (Recurrence) | `Get_newly_deals`, `Get_Callback_URL`, `Create_Date_Filter`, `New_Deals_Exist`, `Init_Recipient_Names` |
| [UCH-AVPSendEventNotification](../src/powerplatform/ProjectAVP/src/Workflows/UCH-AVPSendEventNotification-36752642-FCBE-F011-BBD3-7C1E5217E110.json) | manual (Request) | `Response`, `With_Attachment` |
| [UCH-AVPSharePointBridge](../src/powerplatform/ProjectAVP/src/Workflows/UCH-AVPSharePointBridge-CCA40E71-0946-F111-BEC7-7CED8D3C078D.json) | manual (Request) | `Respond_to_the_agent`, `Request_Forwarder` |
| [UCH-AVPSharePointConnector](../src/powerplatform/ProjectAVP/src/Workflows/UCH-AVPSharePointConnector-AD87F198-5454-F111-BEC7-7CED8D3C0784.json) | manual (Request) | `Response`, `Init_Request_Output`, `Each_Request` |
| [UCH-AVPSharePointHistoryBridge](../src/powerplatform/ProjectAVP/src/Workflows/UCH-AVPSharePointHistoryBridge-A6FC842B-AB59-F111-BEC7-7CED8D3C00CF.json) | manual (Request) | `Respond_to_the_agent`, `Request_Forwarder`, `Version_History` |
| [UCH-AVPSharePointSearchBridge](../src/powerplatform/ProjectAVP/src/Workflows/UCH-AVPSharePointSearchBridge-4E7BF09C-595B-F111-BEC7-7CED8D3C078D.json) | manual (Request) | `Respond_to_Copilot`, `Search_OneDrive`, `Resource_Paths_Filter` |
| [UCH-AVPSharePointSearchConnector](../src/powerplatform/ProjectAVP/src/Workflows/UCH-AVPSharePointSearchConnector-A46F2477-575B-F111-BEC7-7CED8D3C078D.json) | manual (Request) | `Response`, `Retrieve_Content`, `Transform_Results` |
| [UCH-AVPUpdateWorkQueue](../src/powerplatform/ProjectAVP/src/Workflows/UCH-AVPUpdateWorkQueue-EFE9CC19-FCBE-F011-BBD3-7C1E5217E110.json) | manual (Request) | `Response`, `Update_Details`, `Get_Property_Details`, `Extra_Actions`, `Issue_Status`, `Valuation_Status`, `Prep_Datasets`, `Compute_LTV` |
| [UCH-AVPUploadFile](../src/powerplatform/ProjectAVP/src/Workflows/UCH-AVPUploadFile-06107A9A-75BF-F011-BBD3-7C1E5217E110.json) | manual (Request) | `Success_Response`, `Create_new_folder`, `Create_new_file`, `Error_Response`, `Get_Property_Details`, `Existing_Folder`, `Target_Library`, `Target_Folder` |
| [UCH-AVPValidateProperties](../src/powerplatform/ProjectAVP/src/Workflows/UCH-AVPValidateProperties-821B8546-78CF-F011-BBD3-7C1E5217E110.json) | manual (Request) | `Respond_to_a_Power_App_or_flow`, `Prep_RPA_Inputs`, `CoStar_Run` |

## Reading a flow

- `properties.connectionReferences`: connector bindings used by the flow.
- `properties.definition.parameters`: environment settings and runtime parameters.
- `properties.definition.triggers`: entry points, input schemas, recurrence settings, and conditions.
- `properties.definition.actions`: processing steps, child-flow calls, connector operations, and response handling.
- `runAfter` on an action: the action's dependency and permitted preceding outcomes.

The desktop-flow record uses a different schema. Its JSON package field is empty, but its companion XML contains a JSON-encoded script string in `<Definition>`. Parsing the XML and decoding that string reveals approximately 2,082 lines and 28 subflow definitions, including support/test routines. Its `<Inputs>` element also supplies input declarations despite the empty input schema in the JSON wrapper. The control and image repositories under `desktopflowbinaries` supply the referenced UI assets. See the [desktop automation reference](desktop-automation.md) for source inspection, process routing, result handling, and live verification limits.
