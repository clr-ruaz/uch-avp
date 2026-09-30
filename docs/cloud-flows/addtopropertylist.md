# UCH-AVPAddtoPropertyList

[Cloud flow overview](../cloud-automation.md) · [Workflow inventory](../workflows.md) · [Exported definition](../../src/powerplatform/ProjectAVP/src/Workflows/UCH-AVPAddtoPropertyList-94EE58AB-F2BA-F011-BBD3-7C1E5217E110.json)

Accepts a property-list request, updates or creates AVP database items, and records related activity.

## Entry and contract

- **Flow ID:** `94ee58ab-f2ba-f011-bbd3-7c1e5217e110`.
- **Trigger:** `manual` (Request).
- **Declared request fields:** `APN`, `AVM`, `Address`, `AnnualTaxes`, `AssessedValue`, `Attorney`, `AvailableEquity`, `Baths`, `Beds`, `CaseNumber`, `Change1`, `Change2`, `Change3`, `City`, `County`, `DOTPosition`, `DaysOnMarket`, `DefaultAmount`, `DefaultAsOf`, `EquityPercent`, `EstimatedTaxRate`, `EstimatedValue`, `FirstAmount`, `FirstDate`, `FirstLenderOriginal`, `FirstLoanAmount`, `FirstLoanDate`, `FirstLoanLender`, `FirstLoanPurpose`, `FirstLoanRate`, `FirstPurpose`, `FirstRate`, `ForeclosureRecDate`, `ForeclosureStage`, `LastTransferRecDate`, `LastTransferSeller`, `LastTransferType`, `LastTransferValue`, `Latitude`, `LegalOwner`, `LisPendensType`, `ListName`, `ListingPrice`, `Longitude`, `LotSize`, `LotSizeAcres`, `MailingAddress`, `MailingCity`, `MailingState`, `MailingZip`, `NumberLoans`, `OpenLoans`, `OpeningBid`, `OriginalSaleDate`, `Owner`, `OwnerAddress`, `OwnerCity`, `OwnerFirstName`, `OwnerLastName`, `OwnerSpouseFirstName`, `OwnerState`, `OwnerZipFive`, `PType`, `PhotoURL1`, `Pool`, `PostReason`, `PreviousSaleDate`, `PrimaryContactEmail`, `PrimaryContactFirst`, `PrimaryContactLast`, `PrimaryContactPhone`, `PrimaryEmail1`, `PrimaryEmail1Status`, `PrimaryFirstName`, `PrimaryLastName`, `PrimaryMobilePhone1`, `PrimaryMobilePhone1Status`, `PrimaryPhone1`, `PrimaryPhone1Status`, `PropertyType`, `PropertyURL`, `PurchaseAmount`, `PurchaseDate`, `PurchaseSeller`, `PurchaseType`, `RadarID`, `SaleAmount`, `SaleDate`, `SaleDateRelative`, `SalePlace`, `SaleTime`, `SecondaryEmail1`, `SecondaryEmail1Status`, `SecondaryFirstName`, `SecondaryLastName`, `SecondaryMobilePhone1`, `SecondaryMobilePhone1Status`, `SecondaryPhone1`, `SecondaryPhone1Status`, `SqFt`, `State`, `Stories`, `Subdivision`, `TotalLoanBalance`, `TriggerType`, `Units`, `WinningBid`, `YearBuilt`, `Zip`, `ZipFive`, `inForeclosure`, `isListedForSale`, `isMailVacant`, `isSameMailingOrExempt`, `isSiteVacant`, `PropertySource`, `LegalDescription1`, `LegalDescription2`, `LoanType`, `Mortgagor`, `Mortgagee`, `Trustee`, `Volume`, `LoanYear`, `LoanMonth`, `InterestRate`, `MonthlyPayment`, `LoanExpiresYear`, `LoanYearLength`, `PreviousPosting`
- **Connector families:** `shared_office365`, `shared_sharepointonline`.
- **Response actions:** `Response`, `Update_AVP_DB / Update_Existing / Valid_to_update / Update_Error / UPD_Fail_Response`, `Update_AVP_DB / Create_Item / Valid_to_create / Add_Fail_Response`

The exported definition is the source for exact request/response schemas, filter expressions, conditions, and schedule settings. This guide omits literal URLs, payload defaults, and credentials.

## Top-level actions

These actions are listed in export order. The `runAfter` dependencies below determine execution order and permitted failure paths.

- **Response** (Response). Return a response.
- **Update AVP DB** (Scope). Run the grouped actions below.
- **Init Update flag** (InitializeVariable). See the action map for its operation and dependencies.
- **Init Activity ary** (InitializeVariable). See the action map for its operation and dependencies.
- **Init Item ID int** (InitializeVariable). See the action map for its operation and dependencies.
- **Init Reset flag** (InitializeVariable). See the action map for its operation and dependencies.
- **Init Header obj** (InitializeVariable). See the action map for its operation and dependencies.

## Action map

The path shows nesting inside scopes, loops, conditions, and switch cases. “After” lists the exported `runAfter` dependency and permitted predecessor statuses; an empty cell usually means a branch or scope entry.

| Action path | Type / operation | After |
| --- | --- | --- |
| Response | `Response` | Update_AVP_DB: Succeeded |
| Update_AVP_DB | `Scope` | Init_Header_obj: Succeeded |
| Update_AVP_DB / Valuation_Source | `Compose` | Update_Payload: Succeeded |
| Update_AVP_DB / Update_Payload | `ParseJson` | Radar_ID: Succeeded |
| Update_AVP_DB / Update_Existing | `Scope` | Create_Item: Succeeded |
| Update_AVP_DB / Update_Existing / Valid_to_update | `If` |  |
| Update_AVP_DB / Update_Existing / Valid_to_update / Reset_Valuation | `If` | Set_Updated_Header: Succeeded |
| Update_AVP_DB / Update_Existing / Valid_to_update / Reset_Valuation / Set_Valuation_Status | `OpenApiConnection · PatchItem` |  |
| Update_AVP_DB / Update_Existing / Valid_to_update / Reset_Valuation / Prev_Dropped | `If` | Set_Valuation_Status: Succeeded |
| Update_AVP_DB / Update_Existing / Valid_to_update / Reset_Valuation / Prev_Dropped / Set_Workflow_Status | `OpenApiConnection · PatchItem` |  |
| Update_AVP_DB / Update_Existing / Valid_to_update / Reset_Valuation / Prev_Cancelled | `If` | Prev_Dropped: SUCCEEDED |
| Update_AVP_DB / Update_Existing / Valid_to_update / Reset_Valuation / Prev_Cancelled / Set_Workflow_Status_to_Senior_Stage | `OpenApiConnection · PatchItem` |  |
| Update_AVP_DB / Update_Existing / Valid_to_update / Update_Dataset | `OpenApiConnection · PatchItem` | Set_Reset_Flag: Succeeded/Failed |
| Update_AVP_DB / Update_Existing / Valid_to_update / Existing_Dataset | `ParseJson` |  |
| Update_AVP_DB / Update_Existing / Valid_to_update / Set_Existing_Item_ID | `SetVariable` | Update_Dataset: Succeeded |
| Update_AVP_DB / Update_Existing / Valid_to_update / Set_Reset_Flag | `SetVariable` | Existing_Dataset: Succeeded |
| Update_AVP_DB / Update_Existing / Valid_to_update / Update_Error | `Scope` | Update_Dataset: Failed |
| Update_AVP_DB / Update_Existing / Valid_to_update / Update_Error / Send_email_alert_re_failure_to_update | `OpenApiConnection · SharedMailboxSendEmailV2` |  |
| Update_AVP_DB / Update_Existing / Valid_to_update / Update_Error / UPD_Fail_Response | `Response` | Send_email_alert_re_failure_to_update: Succeeded |
| Update_AVP_DB / Update_Existing / Valid_to_update / Update_Error / Terminate_due_to_failure_to_add_update | `Terminate` | UPD_Fail_Response: Succeeded |
| Update_AVP_DB / Update_Existing / Valid_to_update / Set_Updated_Header | `SetVariable` | Set_Existing_Item_ID: Succeeded |
| Update_AVP_DB / Create_Item | `Scope` | Valuation_Issue: Succeeded |
| Update_AVP_DB / Create_Item / Valid_to_create | `If` | Get_existing_items: Succeeded |
| Update_AVP_DB / Create_Item / Valid_to_create / Update_AVP_Item | `SetVariable` | Create_new_item: Succeeded |
| Update_AVP_DB / Create_Item / Valid_to_create / Send_email_alert_re_failure_to_add_item | `OpenApiConnection · SharedMailboxSendEmailV2` | Create_new_item: Failed |
| Update_AVP_DB / Create_Item / Valid_to_create / Create_new_item | `OpenApiConnection · PostItem` |  |
| Update_AVP_DB / Create_Item / Valid_to_create / Set_New_Item_ID | `SetVariable` | Update_AVP_Item: Succeeded |
| Update_AVP_DB / Create_Item / Valid_to_create / Terminate_due_to_failure_to_add_item | `Terminate` | Add_Fail_Response: Succeeded |
| Update_AVP_DB / Create_Item / Valid_to_create / Add_Fail_Response | `Response` | Send_email_alert_re_failure_to_add_item: Succeeded |
| Update_AVP_DB / Create_Item / Valid_to_create / Set_New_Header | `SetVariable` | Set_New_Item_ID: Succeeded |
| Update_AVP_DB / Create_Item / Get_existing_items | `OpenApiConnection · GetItems` |  |
| Update_AVP_DB / Valuation_Status | `Compose` | Valuation_Source: Succeeded |
| Update_AVP_DB / Valuation_Issue | `Compose` | Valuation_Status: Succeeded |
| Update_AVP_DB / Radar_ID | `Compose` |  |
| Update_AVP_DB / Update_Activity | `Scope` | Update_Existing: Succeeded |
| Update_AVP_DB / Update_Activity / Parent_Exists | `If` |  |
| Update_AVP_DB / Update_Activity / Parent_Exists / Trigger_Type | `Switch` |  |
| Update_AVP_DB / Update_Activity / Parent_Exists / Trigger_Type / case New_Record / Set_New_Record | `SetVariable` |  |
| Update_AVP_DB / Update_Activity / Parent_Exists / Trigger_Type / case Change / Set_Change_Details | `SetVariable` |  |
| Update_AVP_DB / Update_Activity / Parent_Exists / Activity_Details | `Query` | Trigger_Type: Succeeded |
| Update_AVP_DB / Update_Activity / Parent_Exists / Each_Activity | `Foreach` | Activity_Details: Succeeded |
| Update_AVP_DB / Update_Activity / Parent_Exists / Each_Activity / Create_Activity_Log | `OpenApiConnection · PostItem` |  |
| Init_Update_flag | `InitializeVariable` |  |
| Init_Activity_ary | `InitializeVariable` | Init_Reset_flag: Succeeded |
| Init_Item_ID_int | `InitializeVariable` | Init_Activity_ary: Succeeded |
| Init_Reset_flag | `InitializeVariable` | Init_Update_flag: Succeeded |
| Init_Header_obj | `InitializeVariable` | Init_Item_ID_int: Succeeded |

## Connections to other flows

No direct child-flow action is present in the exported definition. HTTP callbacks and connector events can still link this flow to other parts of the solution; see the [system map](../cloud-automation.md).

## Operations and verification

Use run history to verify which conditional paths actually ran, connector results, returned values, and retries. The export describes configured behavior, not live connection health or recent run success. For flow changes, validate in a development environment before testing or publishing.
