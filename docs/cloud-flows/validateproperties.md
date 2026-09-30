# UCH-AVPValidateProperties

[Cloud flow overview](../cloud-automation.md) · [Workflow inventory](../workflows.md) · [Exported definition](../../src/powerplatform/ProjectAVP/src/Workflows/UCH-AVPValidateProperties-821B8546-78CF-F011-BBD3-7C1E5217E110.json)

Builds desktop inputs, chooses the CoStar or residential source path, and runs the desktop flow for nonempty queues.

## Entry and contract

- **Flow ID:** `821b8546-78cf-f011-bbd3-7c1e5217e110`.
- **Trigger:** `manual` (Request).
- **Declared request fields:** `text`, `boolean`
- **Connector families:** `shared_keyvault`, `shared_office365`, `shared_uiflow`.
- **Response actions:** `Respond_to_a_Power_App_or_flow`

The exported definition is the source for exact request/response schemas, filter expressions, conditions, and schedule settings. This guide omits literal URLs, payload defaults, and credentials.

## Top-level actions

These actions are listed in export order. The `runAfter` dependencies below determine execution order and permitted failure paths.

- **Respond to a Power App or flow** (Response). Return a response.
- **Prep RPA Inputs** (Scope). Run the grouped actions below.
- **CoStar Run** (If). Evaluate a condition and follow its branch.

## Action map

The path shows nesting inside scopes, loops, conditions, and switch cases. “After” lists the exported `runAfter` dependency and permitted predecessor statuses; an empty cell usually means a branch or scope entry.

| Action path | Type / operation | After |
| --- | --- | --- |
| Respond_to_a_Power_App_or_flow | `Response` | CoStar_Run: Succeeded |
| Prep_RPA_Inputs | `Scope` |  |
| Prep_RPA_Inputs / Get_Callback_URL_for_Fetch_Work_Queue | `Workflow` |  |
| Prep_RPA_Inputs / Get_Callback_URL_for_Update_Work_Queue | `Workflow` | Get_Callback_URL_for_Fetch_Work_Queue: Succeeded |
| Prep_RPA_Inputs / Get_Callback_URL_for_Send_Notification | `Workflow` | Get_Callback_URL_for_Update_Work_Queue: Succeeded |
| Prep_RPA_Inputs / Get_Callback_URL_for_Upload_File | `Workflow` | Get_Callback_URL_for_Send_Notification: Succeeded |
| Prep_RPA_Inputs / Get_Callback_URL_for_OpenAI_Request | `Workflow` | Get_Callback_URL_for_Upload_File: Succeeded |
| Prep_RPA_Inputs / Get_Callback_URL_for_Image_Analysis | `Workflow` | Get_Callback_URL_for_OpenAI_Request: Succeeded |
| Prep_RPA_Inputs / Get_Callback_URL_for_CoStar_MFA_Code | `Workflow` | Get_Callback_URL_for_Image_Analysis: Succeeded |
| Prep_RPA_Inputs / Get_Callback_URL_for_Fetch_LLM_Prompt | `Workflow` | Get_Callback_URL_for_CoStar_MFA_Code: Succeeded |
| Prep_RPA_Inputs / Get_CoStar_Secret | `OpenApiConnection · GetSecret` | Workflow_Outline: Succeeded |
| Prep_RPA_Inputs / Workflow_Outline | `Compose` | Get_Callback_URL_for_Fetch_LLM_Prompt: Succeeded |
| CoStar_Run | `If` | Prep_RPA_Inputs: Succeeded |
| CoStar_Run / Process_CoStar | `Scope` |  |
| CoStar_Run / Process_CoStar / Convert_time_zone | `Expression` |  |
| CoStar_Run / Process_CoStar / CoStar_Run_Flag | `Compose` | Convert_time_zone: Succeeded |
| CoStar_Run / Process_CoStar / Scheduled_Run | `If` | CoStar_Run_Flag: Succeeded |
| CoStar_Run / Process_CoStar / Scheduled_Run / Fetch_Costar_Queue | `Http` |  |
| CoStar_Run / Process_CoStar / Scheduled_Run / CoStar_Queue | `Query` | Fetch_Costar_Queue: Succeeded |
| CoStar_Run / Process_CoStar / Scheduled_Run / CoStar_Items | `If` | CoStar_Queue: Succeeded |
| CoStar_Run / Process_CoStar / Scheduled_Run / CoStar_Items / Run_Desktop_Flow | `OpenApiConnection · RunUIFlow_V2` |  |
| CoStar_Run / Process_CoStar / Scheduled_Run / CoStar_Items / Send_CoStar_failure_email_notification | `OpenApiConnection · SharedMailboxSendEmailV2` | Run_Desktop_Flow: Failed |
| CoStar_Run / else / Process_Zillow | `Scope` |  |
| CoStar_Run / else / Process_Zillow / Fetch_Zillow_Queue | `Http` |  |
| CoStar_Run / else / Process_Zillow / Zillow_Queue | `Query` | Fetch_Zillow_Queue: Succeeded |
| CoStar_Run / else / Process_Zillow / Zillow_Items | `If` | Zillow_Queue: Succeeded |
| CoStar_Run / else / Process_Zillow / Zillow_Items / Process_Zillow_Items | `OpenApiConnection · RunUIFlow_V2` |  |
| CoStar_Run / else / Process_Zillow / Zillow_Items / Send_Zillow_failure_email_notification | `OpenApiConnection · SharedMailboxSendEmailV2` | Process_Zillow_Items: Failed |
| CoStar_Run / else / Process_Zillow / Zillow_Items / Terminate_due_to_Zillow_failure | `Terminate` | Send_Zillow_failure_email_notification: Succeeded |
| CoStar_Run / else / Process_Redfin | `Scope` | Process_Zillow: SUCCEEDED |
| CoStar_Run / else / Process_Redfin / Fetch_Redfin_Queue | `Http` |  |
| CoStar_Run / else / Process_Redfin / Redfin_Queue | `Query` | Fetch_Redfin_Queue: Succeeded |
| CoStar_Run / else / Process_Redfin / Redfin_Items | `If` | Redfin_Queue: Succeeded |
| CoStar_Run / else / Process_Redfin / Redfin_Items / Process_Redfin_Items | `OpenApiConnection · RunUIFlow_V2` |  |
| CoStar_Run / else / Process_Redfin / Redfin_Items / Send_Redfin_failure_email_notification | `OpenApiConnection · SharedMailboxSendEmailV2` | Process_Redfin_Items: Failed |
| CoStar_Run / else / Process_Redfin / Redfin_Items / Terminate_due_to_Redfin_failure | `Terminate` | Send_Redfin_failure_email_notification: Succeeded |
| CoStar_Run / else / Process_Realtor | `Scope` | Process_Redfin: SUCCEEDED |
| CoStar_Run / else / Process_Realtor / Fetch_Realtor_Queue | `Http` |  |
| CoStar_Run / else / Process_Realtor / Realtor_Queue | `Query` | Fetch_Realtor_Queue: Succeeded |
| CoStar_Run / else / Process_Realtor / Realtor_Items | `If` | Realtor_Queue: Succeeded |
| CoStar_Run / else / Process_Realtor / Realtor_Items / Process_Realtor_Item | `OpenApiConnection · RunUIFlow_V2` |  |
| CoStar_Run / else / Process_Realtor / Realtor_Items / Send_Realtor_failure_email_notification | `OpenApiConnection · SharedMailboxSendEmailV2` | Process_Realtor_Item: Failed |
| CoStar_Run / else / Process_Realtor / Realtor_Items / Terminate_due_to_Realtor_failure | `Terminate` | Send_Realtor_failure_email_notification: Succeeded |

## Connections to other flows

| Call action | Target flow |
| --- | --- |
| Prep_RPA_Inputs / Get_Callback_URL_for_Fetch_Work_Queue | [UCH-AVPGetCallbakURL](getcallbakurl.md) |
| Prep_RPA_Inputs / Get_Callback_URL_for_Update_Work_Queue | [UCH-AVPGetCallbakURL](getcallbakurl.md) |
| Prep_RPA_Inputs / Get_Callback_URL_for_Send_Notification | [UCH-AVPGetCallbakURL](getcallbakurl.md) |
| Prep_RPA_Inputs / Get_Callback_URL_for_Upload_File | [UCH-AVPGetCallbakURL](getcallbakurl.md) |
| Prep_RPA_Inputs / Get_Callback_URL_for_OpenAI_Request | [UCH-AVPGetCallbakURL](getcallbakurl.md) |
| Prep_RPA_Inputs / Get_Callback_URL_for_Image_Analysis | [UCH-AVPGetCallbakURL](getcallbakurl.md) |
| Prep_RPA_Inputs / Get_Callback_URL_for_CoStar_MFA_Code | [UCH-AVPGetCallbakURL](getcallbakurl.md) |
| Prep_RPA_Inputs / Get_Callback_URL_for_Fetch_LLM_Prompt | [UCH-AVPGetCallbakURL](getcallbakurl.md) |

## Operations and verification

Use run history to verify which conditional paths actually ran, connector results, returned values, and retries. The export describes configured behavior, not live connection health or recent run success. For flow changes, validate in a development environment before testing or publishing.
