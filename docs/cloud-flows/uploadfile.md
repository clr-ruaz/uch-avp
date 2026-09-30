# UCH-AVPUploadFile

[Cloud flow overview](../cloud-automation.md) · [Workflow inventory](../workflows.md) · [Exported definition](../../src/powerplatform/ProjectAVP/src/Workflows/UCH-AVPUploadFile-06107A9A-75BF-F011-BBD3-7C1E5217E110.json)

Creates a target folder when needed and uploads a file for a property.

## Entry and contract

- **Flow ID:** `06107a9a-75bf-f011-bbd3-7c1e5217e110`.
- **Trigger:** `manual` (Request).
- **Declared request fields:** `Folder`, `Attachment`
- **Connector families:** `shared_sharepointonline`.
- **Response actions:** `Success_Response`, `Error_Response`

The exported definition is the source for exact request/response schemas, filter expressions, conditions, and schedule settings. This guide omits literal URLs, payload defaults, and credentials.

## Top-level actions

These actions are listed in export order. The `runAfter` dependencies below determine execution order and permitted failure paths.

- **Success Response** (Response). Return a response.
- **Create new folder** (OpenApiConnection). See the action map for its operation and dependencies.
- **Create new file** (OpenApiConnection). See the action map for its operation and dependencies.
- **Error Response** (Response). Return a response.
- **Get Property Details** (OpenApiConnection). See the action map for its operation and dependencies.
- **Existing Folder** (Compose). See the action map for its operation and dependencies.
- **Target Library** (Compose). See the action map for its operation and dependencies.
- **Target Folder** (Compose). See the action map for its operation and dependencies.

## Action map

The path shows nesting inside scopes, loops, conditions, and switch cases. “After” lists the exported `runAfter` dependency and permitted predecessor statuses; an empty cell usually means a branch or scope entry.

| Action path | Type / operation | After |
| --- | --- | --- |
| Success_Response | `Response` | Create_new_file: Succeeded |
| Create_new_folder | `OpenApiConnection · CreateNewFolder` | Target_Folder: Succeeded |
| Create_new_file | `OpenApiConnection · CreateFile` | Create_new_folder: Succeeded/Failed |
| Error_Response | `Response` | Create_new_file: Failed |
| Get_Property_Details | `OpenApiConnection · GetItems` |  |
| Existing_Folder | `Compose` | Get_Property_Details: Succeeded |
| Target_Library | `Compose` | Existing_Folder: Succeeded |
| Target_Folder | `Compose` | Target_Library: Succeeded |

## Connections to other flows

No direct child-flow action is present in the exported definition. HTTP callbacks and connector events can still link this flow to other parts of the solution; see the [system map](../cloud-automation.md).

## Operations and verification

Use run history to verify which conditional paths actually ran, connector results, returned values, and retries. The export describes configured behavior, not live connection health or recent run success. For flow changes, validate in a development environment before testing or publishing.
