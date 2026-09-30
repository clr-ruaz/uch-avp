# UCH-AVPHandleValidationIssues

[Cloud flow overview](../cloud-automation.md) · [Workflow inventory](../workflows.md) · [Exported definition](../../src/powerplatform/ProjectAVP/src/Workflows/UCH-AVPHandleValidationIssues-CCF43295-FFD4-F011-8544-6045BD056AC0.json)

Responds to changes in valuation issue fields, updates the item, and sends operational messages as needed.

## Entry and contract

- **Flow ID:** `ccf43295-ffd4-f011-8544-6045bd056ac0`.
- **Trigger:** `When_an_item_is_created_or_modified` (OpenApiConnection).
- **Declared request fields:** No request fields declared in the trigger schema.
- **Connector families:** `shared_office365`, `shared_sharepointonline`.
- **Response actions:** No explicit response action.

The exported definition is the source for exact request/response schemas, filter expressions, conditions, and schedule settings. This guide omits literal URLs, payload defaults, and credentials.

## Top-level actions

These actions are listed in export order. The `runAfter` dependencies below determine execution order and permitted failure paths.

- **Issue Type** (Switch). See the action map for its operation and dependencies.
- **Init Blank str** (InitializeVariable). See the action map for its operation and dependencies.
- **Valuation Status** (Compose). See the action map for its operation and dependencies.
- **Valuation Source** (Compose). See the action map for its operation and dependencies.

## Action map

The path shows nesting inside scopes, loops, conditions, and switch cases. “After” lists the exported `runAfter` dependency and permitted predecessor statuses; an empty cell usually means a branch or scope entry.

| Action path | Type / operation | After |
| --- | --- | --- |
| Issue_Type | `Switch` | Valuation_Source: Succeeded |
| Issue_Type / default / Send_an_email_alert | `OpenApiConnection · SharedMailboxSendEmailV2` |  |
| Issue_Type / case Incomplete_Address / Address_Complete | `Compose` |  |
| Issue_Type / case Incomplete_Address / Address_Valid | `Compose` | Address_Complete: Succeeded |
| Issue_Type / case Incomplete_Address / ADDR_Compete | `If` | Address_Valid: Succeeded |
| Issue_Type / case Incomplete_Address / ADDR_Compete / Reset_Status_upon_address_completion | `OpenApiConnection · PatchItem` |  |
| Issue_Type / case Incomplete_Valuation / LTV_Available | `If` | LTV_Computed: Succeeded |
| Issue_Type / case Incomplete_Valuation / LTV_Available / Reset_Status_when_LTV_is_provided | `OpenApiConnection · PatchItem` |  |
| Issue_Type / case Incomplete_Valuation / LTV_Parameters | `ParseJson` | SFR_Valuation_avg: Succeeded |
| Issue_Type / case Incomplete_Valuation / LTV_Computed | `Compose` | LTV_Parameters: Succeeded |
| Issue_Type / case Incomplete_Valuation / SFR_Valuation_ary | `Query` |  |
| Issue_Type / case Incomplete_Valuation / SFR_Valuation_avg | `Compose` | SFR_Valuation_ary: Succeeded |
| Issue_Type / case No_CoStar_Match / Get_changes_for_item | `OpenApiConnection · GetItemChanges` |  |
| Issue_Type / case No_CoStar_Match / Address_Updated | `Compose` | Get_changes_for_item: Succeeded |
| Issue_Type / case No_CoStar_Match / ADDR_Changed | `If` | Address_Updated: Succeeded |
| Issue_Type / case No_CoStar_Match / ADDR_Changed / Reset_Status_upon_address_change | `OpenApiConnection · PatchItem` |  |
| Issue_Type / case No_CoStar_Match / ADDR_Changed / else / Change_PType | `If` |  |
| Issue_Type / case No_CoStar_Match / ADDR_Changed / else / Change_PType / Set_PType_to_OTH | `OpenApiConnection · PatchItem` |  |
| Issue_Type / case No_Zillow/Redfin/Realtor_Match / Get_changes_for_Redfin_Property | `OpenApiConnection · GetItemChanges` |  |
| Issue_Type / case No_Zillow/Redfin/Realtor_Match / Address_Updated_for_Redfin_Property | `Compose` | Get_changes_for_Redfin_Property: Succeeded |
| Issue_Type / case No_Zillow/Redfin/Realtor_Match / ADDR_Updated | `If` | Address_Updated_for_Redfin_Property: Succeeded |
| Issue_Type / case No_Zillow/Redfin/Realtor_Match / ADDR_Updated / Reset_Status_for_Redfin_Property | `OpenApiConnection · PatchItem` |  |
| Issue_Type / case Incorrect_PType / Reset_Status_upon_PType_change | `OpenApiConnection · PatchItem` |  |
| Issue_Type / case No_Zillow_Match / Proceed_to_Redfin_Validation | `OpenApiConnection · PatchItem` |  |
| Issue_Type / case No_Zillow/Redfin_Match / Proceed_to_Realtor_Validation | `OpenApiConnection · PatchItem` |  |
| Init_Blank_str | `InitializeVariable` |  |
| Valuation_Status | `Compose` | Init_Blank_str: Succeeded |
| Valuation_Source | `Compose` | Valuation_Status: Succeeded |

## Connections to other flows

No direct child-flow action is present in the exported definition. HTTP callbacks and connector events can still link this flow to other parts of the solution; see the [system map](../cloud-automation.md).

## Operations and verification

Use run history to verify which conditional paths actually ran, connector results, returned values, and retries. The export describes configured behavior, not live connection health or recent run success. For flow changes, validate in a development environment before testing or publishing.
