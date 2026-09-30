# UCH-AVPSendEventNotification

[Cloud flow overview](../cloud-automation.md) · [Workflow inventory](../workflows.md) · [Exported definition](../../src/powerplatform/ProjectAVP/src/Workflows/UCH-AVPSendEventNotification-36752642-FCBE-F011-BBD3-7C1E5217E110.json)

Sends an operational email, optionally including an attachment, and responds to its caller.

## Entry and contract

- **Flow ID:** `36752642-fcbe-f011-bbd3-7c1e5217e110`.
- **Trigger:** `manual` (Request).
- **Declared request fields:** `To`, `Subject`, `Body`, `Importance`, `Attachment`
- **Connector families:** `shared_office365`.
- **Response actions:** `Response`

The exported definition is the source for exact request/response schemas, filter expressions, conditions, and schedule settings. This guide omits literal URLs, payload defaults, and credentials.

## Top-level actions

These actions are listed in export order. The `runAfter` dependencies below determine execution order and permitted failure paths.

- **Response** (Response). Return a response.
- **With Attachment** (If). Evaluate a condition and follow its branch.

## Action map

The path shows nesting inside scopes, loops, conditions, and switch cases. “After” lists the exported `runAfter` dependency and permitted predecessor statuses; an empty cell usually means a branch or scope entry.

| Action path | Type / operation | After |
| --- | --- | --- |
| Response | `Response` | With_Attachment: SUCCEEDED |
| With_Attachment | `If` |  |
| With_Attachment / Send_an_email_alert_with_attachment | `OpenApiConnection · SharedMailboxSendEmailV2` |  |
| With_Attachment / else / Send_an_email_alert_with_no_attachment | `OpenApiConnection · SharedMailboxSendEmailV2` |  |

## Connections to other flows

No direct child-flow action is present in the exported definition. HTTP callbacks and connector events can still link this flow to other parts of the solution; see the [system map](../cloud-automation.md).

## Operations and verification

Use run history to verify which conditional paths actually ran, connector results, returned values, and retries. The export describes configured behavior, not live connection health or recent run success. For flow changes, validate in a development environment before testing or publishing.
