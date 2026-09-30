# UCH-AVPManualValidationTrigger

[Cloud flow overview](../cloud-automation.md) · [Workflow inventory](../workflows.md) · [Exported definition](../../src/powerplatform/ProjectAVP/src/Workflows/UCH-AVPManualValidationTrigger-331B4B1B-B70C-B30D-8C38-CE2D7F36AC5B.json)

Accepts a manual validation request and invokes Validate Properties.

## Entry and contract

- **Flow ID:** `331b4b1b-b70c-b30d-8c38-ce2d7f36ac5b`.
- **Trigger:** `manual` (Request).
- **Declared request fields:** No request fields declared in the trigger schema.
- **Connector families:** None in this definition; built-in actions or HTTP may still be used..
- **Response actions:** No explicit response action.

The exported definition is the source for exact request/response schemas, filter expressions, conditions, and schedule settings. This guide omits literal URLs, payload defaults, and credentials.

## Top-level actions

These actions are listed in export order. The `runAfter` dependencies below determine execution order and permitted failure paths.

- **Run a Child Flow** (Workflow). Invoke a child flow.

## Action map

The path shows nesting inside scopes, loops, conditions, and switch cases. “After” lists the exported `runAfter` dependency and permitted predecessor statuses; an empty cell usually means a branch or scope entry.

| Action path | Type / operation | After |
| --- | --- | --- |
| Run_a_Child_Flow | `Workflow` |  |

## Connections to other flows

| Call action | Target flow |
| --- | --- |
| Run_a_Child_Flow | [UCH-AVPValidateProperties](validateproperties.md) |

## Operations and verification

Use run history to verify which conditional paths actually ran, connector results, returned values, and retries. The export describes configured behavior, not live connection health or recent run success. For flow changes, validate in a development environment before testing or publishing.
