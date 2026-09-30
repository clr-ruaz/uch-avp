# UCH-AVPLogHelperInteraction

[Cloud flow overview](../cloud-automation.md) · [Workflow inventory](../workflows.md) · [Exported definition](../../src/powerplatform/ProjectAVP/src/Workflows/UCH-AVPLogHelperInteraction-5614F716-373D-F111-88B5-7CED8D3C078D.json)

Records a helper interaction in SharePoint and returns formatted content to the agent.

## Entry and contract

- **Flow ID:** `5614f716-373d-f111-88b5-7ced8d3c078d`.
- **Trigger:** `manual` (Request).
- **Declared request fields:** `text`, `text_1`, `text_2`, `text_3`
- **Connector families:** `shared_sharepointonline`.
- **Response actions:** `Respond_to_the_agent`, `Response_HTML`

The exported definition is the source for exact request/response schemas, filter expressions, conditions, and schedule settings. This guide omits literal URLs, payload defaults, and credentials.

## Top-level actions

These actions are listed in export order. The `runAfter` dependencies below determine execution order and permitted failure paths.

- **Respond to the agent** (Response). Return a response.
- **Response HTML** (Http). See the action map for its operation and dependencies.
- **Query HTML** (Http). See the action map for its operation and dependencies.
- **Record Interaction** (OpenApiConnection). See the action map for its operation and dependencies.

## Action map

The path shows nesting inside scopes, loops, conditions, and switch cases. “After” lists the exported `runAfter` dependency and permitted predecessor statuses; an empty cell usually means a branch or scope entry.

| Action path | Type / operation | After |
| --- | --- | --- |
| Respond_to_the_agent | `Response` | Record_Interaction: Succeeded |
| Response_HTML | `Http` | Query_HTML: Succeeded |
| Query_HTML | `Http` |  |
| Record_Interaction | `OpenApiConnection · PostItem` | Response_HTML: Succeeded |

## Connections to other flows

No direct child-flow action is present in the exported definition. HTTP callbacks and connector events can still link this flow to other parts of the solution; see the [system map](../cloud-automation.md).

## Operations and verification

Use run history to verify which conditional paths actually ran, connector results, returned values, and retries. The export describes configured behavior, not live connection health or recent run success. For flow changes, validate in a development environment before testing or publishing.
