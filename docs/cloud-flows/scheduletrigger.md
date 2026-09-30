# UCH-AVPScheduleTrigger

[Cloud flow overview](../cloud-automation.md) · [Workflow inventory](../workflows.md) · [Exported definition](../../src/powerplatform/ProjectAVP/src/Workflows/UCH-AVPScheduleTrigger-A0BE04EA-77CF-F011-BBD3-7C1E5217E110.json)

Runs the validation child flow on the exported recurrence schedule.

## Entry and contract

- **Flow ID:** `a0be04ea-77cf-f011-bbd3-7c1e5217e110`.
- **Trigger:** `Recurrence` (Recurrence).
- **Declared request fields:** No request fields declared in the trigger schema.
- **Connector families:** None in this definition; built-in actions or HTTP may still be used..
- **Response actions:** No explicit response action.

The exported definition is the source for exact request/response schemas, filter expressions, conditions, and schedule settings. This guide omits literal URLs, payload defaults, and credentials.

## Top-level actions

These actions are listed in export order. The `runAfter` dependencies below determine execution order and permitted failure paths.

- **Validate Properties** (Workflow). Invoke a child flow.

## Action map

The path shows nesting inside scopes, loops, conditions, and switch cases. “After” lists the exported `runAfter` dependency and permitted predecessor statuses; an empty cell usually means a branch or scope entry.

| Action path | Type / operation | After |
| --- | --- | --- |
| Validate_Properties | `Workflow` |  |

## Connections to other flows

| Call action | Target flow |
| --- | --- |
| Validate_Properties | [UCH-AVPValidateProperties](validateproperties.md) |

## Operations and verification

Use run history to verify which conditional paths actually ran, connector results, returned values, and retries. The export describes configured behavior, not live connection health or recent run success. For flow changes, validate in a development environment before testing or publishing.
