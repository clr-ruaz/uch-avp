# UCH-AVPForcetoIntake

[Cloud flow overview](../cloud-automation.md) · [Workflow inventory](../workflows.md) · [Exported definition](../../src/powerplatform/ProjectAVP/src/Workflows/UCH-AVPForcetoIntake-FCB8413C-C959-F111-BEC7-7CED8D3C078D.json)

Periodically finds due records and moves each eligible item back into intake processing.

## Entry and contract

- **Flow ID:** `fcb8413c-c959-f111-bec7-7ced8d3c078d`.
- **Trigger:** `Recurrence` (Recurrence).
- **Declared request fields:** No request fields declared in the trigger schema.
- **Connector families:** `shared_sharepointonline`.
- **Response actions:** No explicit response action.

The exported definition is the source for exact request/response schemas, filter expressions, conditions, and schedule settings. This guide omits literal URLs, payload defaults, and credentials.

## Top-level actions

These actions are listed in export order. The `runAfter` dependencies below determine execution order and permitted failure paths.

- **Due Records** (Scope). Run the grouped actions below.
- **Each Due Record** (Foreach). Process each item.

## Action map

The path shows nesting inside scopes, loops, conditions, and switch cases. “After” lists the exported `runAfter` dependency and permitted predecessor statuses; an empty cell usually means a branch or scope entry.

| Action path | Type / operation | After |
| --- | --- | --- |
| Due_Records | `Scope` |  |
| Due_Records / Convert_time_zone | `Expression` |  |
| Due_Records / Base_Filter | `OpenApiConnection · GetItem` | Convert_time_zone: Succeeded |
| Due_Records / Sale_Date_Filter | `Compose` | Base_Filter: Succeeded |
| Due_Records / Modified_Data_Filter | `Compose` | Sale_Date_Filter: Succeeded |
| Due_Records / Get_Due_Records | `OpenApiConnection · GetItems` | Modified_Data_Filter: Succeeded |
| Each_Due_Record | `Foreach` | Due_Records: Succeeded |
| Each_Due_Record / Set_Stage_to_Intake | `OpenApiConnection · PatchItem` |  |

## Connections to other flows

No direct child-flow action is present in the exported definition. HTTP callbacks and connector events can still link this flow to other parts of the solution; see the [system map](../cloud-automation.md).

## Operations and verification

Use run history to verify which conditional paths actually ran, connector results, returned values, and retries. The export describes configured behavior, not live connection health or recent run success. For flow changes, validate in a development environment before testing or publishing.
