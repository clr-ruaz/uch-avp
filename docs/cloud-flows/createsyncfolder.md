# UCH-AVPCreateSyncFolder

[Cloud flow overview](../cloud-automation.md) · [Workflow inventory](../workflows.md) · [Exported definition](../../src/powerplatform/ProjectAVP/src/Workflows/UCH-AVPCreateSyncFolder-3553A92A-AFF5-F011-8406-7CED8D3C078D.json)

Watches a SharePoint record and prepares or copies its synchronization folder when the workflow status warrants it.

## Entry and contract

- **Flow ID:** `3553a92a-aff5-f011-8406-7ced8d3c078d`.
- **Trigger:** `When_an_item_or_a_file_is_modified` (OpenApiConnection).
- **Declared request fields:** No request fields declared in the trigger schema.
- **Connector families:** `shared_office365`, `shared_sharepointonline`, `shared_webcontents`.
- **Response actions:** No explicit response action.

The exported definition is the source for exact request/response schemas, filter expressions, conditions, and schedule settings. This guide omits literal URLs, payload defaults, and credentials.

## Top-level actions

These actions are listed in export order. The `runAfter` dependencies below determine execution order and permitted failure paths.

- **Get changes for item** (OpenApiConnection). See the action map for its operation and dependencies.
- **Workflow Status** (If). Evaluate a condition and follow its branch.
- **Init Sync Folder** (InitializeVariable). See the action map for its operation and dependencies.

## Action map

The path shows nesting inside scopes, loops, conditions, and switch cases. “After” lists the exported `runAfter` dependency and permitted predecessor statuses; an empty cell usually means a branch or scope entry.

| Action path | Type / operation | After |
| --- | --- | --- |
| Get_changes_for_item | `OpenApiConnection · GetItemChanges` |  |
| Workflow_Status | `If` | Init_Sync_Folder: Succeeded |
| Workflow_Status / Create_Sync_Fld | `Scope` |  |
| Workflow_Status / Create_Sync_Fld / Get_folder_using_path | `OpenApiConnection · GetFolderMetadataByPath` |  |
| Workflow_Status / Create_Sync_Fld / Create_Sync_folder | `OpenApiConnection · CreateNewFolder` | Get_folder_using_path: Failed |
| Workflow_Status / Create_Sync_Fld / Doc_Library | `If` | Get_folder_using_path: Succeeded |
| Workflow_Status / Create_Sync_Fld / Doc_Library / Copy_to_Sync_folder | `OpenApiConnection · CopyFolderAsync` |  |
| Workflow_Status / Create_Sync_Fld / SharePoint_Site_ID | `OpenApiConnection · InvokeHttp` | Doc_Library: Succeeded |
| Workflow_Status / Create_Sync_Fld / Rename_Folder | `OpenApiConnection · InvokeHttp` | SharePoint_Folder_ID: Succeeded |
| Workflow_Status / Create_Sync_Fld / SharePoint_Drives | `OpenApiConnection · InvokeHttp` | SharePoint_Site_ID: Succeeded |
| Workflow_Status / Create_Sync_Fld / SharePoint_Drive_ID | `Query` | SharePoint_Drives: Succeeded |
| Workflow_Status / Create_Sync_Fld / SharePoint_Folder_ID | `OpenApiConnection · InvokeHttp` | SharePoint_Drive_ID: Succeeded |
| Workflow_Status / Create_Sync_Fld / Send_email_alert_due_to_rename_failure | `OpenApiConnection · SharedMailboxSendEmailV2` | Rename_Folder: Failed |
| Workflow_Status / Create_Sync_Fld / Reset_Folder_Name | `SetVariable` | Send_email_alert_due_to_rename_failure: Succeeded |
| Workflow_Status / Update_Folder__Path | `OpenApiConnection · PatchItem` | Create_Sync_Fld: Succeeded/Failed |
| Init_Sync_Folder | `InitializeVariable` | Get_changes_for_item: Succeeded |

## Connections to other flows

No direct child-flow action is present in the exported definition. HTTP callbacks and connector events can still link this flow to other parts of the solution; see the [system map](../cloud-automation.md).

## Operations and verification

Use run history to verify which conditional paths actually ran, connector results, returned values, and retries. The export describes configured behavior, not live connection health or recent run success. For flow changes, validate in a development environment before testing or publishing.
