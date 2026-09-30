# UCH-AVPAVPChangeTracker

[Cloud flow overview](../cloud-automation.md) · [Workflow inventory](../workflows.md) · [Exported definition](../../src/powerplatform/ProjectAVP/src/Workflows/UCH-AVPAVPChangeTracker-EF3B2E0E-5254-F111-BEC7-7CED8D3C078D.json)

Watches SharePoint item changes, checks whether a change is relevant or duplicate, and records change activity.

## Entry and contract

- **Flow ID:** `ef3b2e0e-5254-f111-bec7-7ced8d3c078d`.
- **Trigger:** `When_an_item_or_a_file_is_modified` (OpenApiConnection).
- **Declared request fields:** No request fields declared in the trigger schema.
- **Connector families:** `shared_office365`, `shared_sharepointonline`.
- **Response actions:** No explicit response action.

The exported definition is the source for exact request/response schemas, filter expressions, conditions, and schedule settings. This guide omits literal URLs, payload defaults, and credentials.

## Top-level actions

These actions are listed in export order. The `runAfter` dependencies below determine execution order and permitted failure paths.

- **Init HTTP Requests** (InitializeVariable). See the action map for its operation and dependencies.
- **Valid Request** (If). Evaluate a condition and follow its branch.
- **Change Tracker** (Scope). Run the grouped actions below.
- **Duplicate Check** (Scope). Run the grouped actions below.

## Action map

The path shows nesting inside scopes, loops, conditions, and switch cases. “After” lists the exported `runAfter` dependency and permitted predecessor statuses; an empty cell usually means a branch or scope entry.

| Action path | Type / operation | After |
| --- | --- | --- |
| Init_HTTP_Requests | `InitializeVariable` |  |
| Valid_Request | `If` | Duplicate_Check: Succeeded |
| Valid_Request / Request_Forwarder | `Http` |  |
| Valid_Request / Send_an_email_alert | `OpenApiConnection · SharedMailboxSendEmailV2` | Request_Forwarder: Failed |
| Change_Tracker | `Scope` | Init_HTTP_Requests: Succeeded |
| Change_Tracker / Get_changes_for_item | `OpenApiConnection · GetItemChanges` |  |
| Change_Tracker / PType_Changed | `If` | Get_changes_for_item: Succeeded |
| Change_Tracker / PType_Changed / On_Property_Type | `SetVariable` |  |
| Duplicate_Check | `Scope` | Change_Tracker: Succeeded |
| Duplicate_Check / Address_Filter_str | `Select` | Address_Filter_ary: Succeeded |
| Duplicate_Check / Address_Filter_ary | `Query` |  |
| Duplicate_Check / Get_Same_Address | `OpenApiConnection · GetItems` | Address_Filter_str: Succeeded |
| Duplicate_Check / Multiple_Match | `If` | Get_Same_Address: Succeeded |
| Duplicate_Check / Multiple_Match / Each_Match | `Foreach` |  |
| Duplicate_Check / Multiple_Match / Each_Match / Untagged_yet | `If` |  |
| Duplicate_Check / Multiple_Match / Each_Match / Untagged_yet / Get_Entity_Type | `AppendToArrayVariable` |  |
| Duplicate_Check / Multiple_Match / Each_Match / Untagged_yet / Set_Duplicate_Value | `AppendToArrayVariable` | Get_Entity_Type: Succeeded |

## Connections to other flows

No direct child-flow action is present in the exported definition. HTTP callbacks and connector events can still link this flow to other parts of the solution; see the [system map](../cloud-automation.md).

## Operations and verification

Use run history to verify which conditional paths actually ran, connector results, returned values, and retries. The export describes configured behavior, not live connection health or recent run success. For flow changes, validate in a development environment before testing or publishing.
