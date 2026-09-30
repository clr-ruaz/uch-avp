# UCH-AVPSendAVPDailySummary

[Cloud flow overview](../cloud-automation.md) · [Workflow inventory](../workflows.md) · [Exported definition](../../src/powerplatform/ProjectAVP/src/Workflows/UCH-AVPSendAVPDailySummary-5BC386FF-CA80-F111-AB0E-70A8A5AFCC95.json)

On a recurrence, gathers newly created deals and emails a daily summary when there is content.

## Entry and contract

- **Flow ID:** `5bc386ff-ca80-f111-ab0e-70a8a5afcc95`.
- **Trigger:** `Recurrence` (Recurrence).
- **Declared request fields:** No request fields declared in the trigger schema.
- **Connector families:** `shared_office365`, `shared_office365users`.
- **Response actions:** No explicit response action.

The exported definition is the source for exact request/response schemas, filter expressions, conditions, and schedule settings. This guide omits literal URLs, payload defaults, and credentials.

## Top-level actions

These actions are listed in export order. The `runAfter` dependencies below determine execution order and permitted failure paths.

- **Get newly deals** (Http). See the action map for its operation and dependencies.
- **Get Callback URL** (Workflow). Invoke a child flow.
- **Create Date Filter** (Compose). See the action map for its operation and dependencies.
- **New Deals Exist** (If). Evaluate a condition and follow its branch.
- **Init Recipient Names** (InitializeVariable). See the action map for its operation and dependencies.

## Action map

The path shows nesting inside scopes, loops, conditions, and switch cases. “After” lists the exported `runAfter` dependency and permitted predecessor statuses; an empty cell usually means a branch or scope entry.

| Action path | Type / operation | After |
| --- | --- | --- |
| Get_newly_deals | `Http` | Get_Callback_URL: Succeeded |
| Get_Callback_URL | `Workflow` | Create_Date_Filter: Succeeded |
| Create_Date_Filter | `Compose` | Init_Recipient_Names: Succeeded |
| New_Deals_Exist | `If` | Get_newly_deals: Succeeded |
| New_Deals_Exist / Newly_Added_Deals | `Compose` | Xform_Fetched_Deals: Succeeded |
| New_Deals_Exist / Property_Source_Ary | `Select` | Newly_Added_Deals: Succeeded |
| New_Deals_Exist / Property_Type_Ary | `Select` | Property_Source_Ary: Succeeded |
| New_Deals_Exist / Property_State_Ary | `Select` | Property_Type_Ary: Succeeded |
| New_Deals_Exist / Valuation_Status_Ary | `Select` | Property_State_Ary: Succeeded |
| New_Deals_Exist / AVP_Statistics_JSON | `Select` | Valuation_Source_Ary: Succeeded |
| New_Deals_Exist / AVP_Statistics_Html | `Table` | AVP_Statistics_JSON: Succeeded |
| New_Deals_Exist / Send_email_alert | `OpenApiConnection · SharedMailboxSendEmailV2` | Get_Recipients: Succeeded |
| New_Deals_Exist / Get_Recipients | `Foreach` | AVP_Statistics_Final: Succeeded |
| New_Deals_Exist / Get_Recipients / UPN_Provided | `If` |  |
| New_Deals_Exist / Get_Recipients / UPN_Provided / Get_user_profile | `OpenApiConnection · UserProfile_V2` |  |
| New_Deals_Exist / Get_Recipients / UPN_Provided / Add_Recipient_Name | `AppendToArrayVariable` | Get_user_profile: Succeeded |
| New_Deals_Exist / AVP_Statistics_Final | `Compose` | AVP_Statistics_Html: Succeeded |
| New_Deals_Exist / Valuation_Source_Ary | `Select` | Valuation_Status_Ary: Succeeded |
| New_Deals_Exist / Xform_Fetched_Deals | `Select` |  |
| Init_Recipient_Names | `InitializeVariable` |  |

## Connections to other flows

| Call action | Target flow |
| --- | --- |
| Get_Callback_URL | [UCH-AVPGetCallbakURL](getcallbakurl.md) |

## Operations and verification

Use run history to verify which conditional paths actually ran, connector results, returned values, and retries. The export describes configured behavior, not live connection health or recent run success. For flow changes, validate in a development environment before testing or publishing.
