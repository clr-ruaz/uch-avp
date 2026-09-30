# UCH-AVPSharePointSearchBridge

[Cloud flow overview](../cloud-automation.md) · [Workflow inventory](../workflows.md) · [Exported definition](../../src/powerplatform/ProjectAVP/src/Workflows/UCH-AVPSharePointSearchBridge-4E7BF09C-595B-F111-BEC7-7CED8D3C078D.json)

Handles an agent search request, searches OneDrive content, and filters resource paths.

## Entry and contract

- **Flow ID:** `4e7bf09c-595b-f111-bec7-7ced8d3c078d`.
- **Trigger:** `manual` (Request).
- **Declared request fields:** `text`, `text_1`
- **Connector families:** None in this definition; built-in actions or HTTP may still be used..
- **Response actions:** `Respond_to_Copilot`

The exported definition is the source for exact request/response schemas, filter expressions, conditions, and schedule settings. This guide omits literal URLs, payload defaults, and credentials.

## Top-level actions

These actions are listed in export order. The `runAfter` dependencies below determine execution order and permitted failure paths.

- **Respond to Copilot** (Response). Return a response.
- **Search OneDrive** (Http). See the action map for its operation and dependencies.
- **Resource Paths Filter** (Compose). See the action map for its operation and dependencies.

## Action map

The path shows nesting inside scopes, loops, conditions, and switch cases. “After” lists the exported `runAfter` dependency and permitted predecessor statuses; an empty cell usually means a branch or scope entry.

| Action path | Type / operation | After |
| --- | --- | --- |
| Respond_to_Copilot | `Response` | Search_OneDrive: Succeeded |
| Search_OneDrive | `Http` | Resource_Paths_Filter: Succeeded |
| Resource_Paths_Filter | `Compose` |  |

## Connections to other flows

No direct child-flow action is present in the exported definition. HTTP callbacks and connector events can still link this flow to other parts of the solution; see the [system map](../cloud-automation.md).

## Operations and verification

Use run history to verify which conditional paths actually ran, connector results, returned values, and retries. The export describes configured behavior, not live connection health or recent run success. For flow changes, validate in a development environment before testing or publishing.
