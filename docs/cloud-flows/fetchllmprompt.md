# UCH-AVPFetchLLMPrompt

[Cloud flow overview](../cloud-automation.md) · [Workflow inventory](../workflows.md) · [Exported definition](../../src/powerplatform/ProjectAVP/src/Workflows/UCH-AVPFetchLLMPrompt-0DF4D05D-68F0-F011-8407-6045BD051327.json)

Looks up a named prompt in the SharePoint prompt list and returns it to the caller.

## Entry and contract

- **Flow ID:** `0df4d05d-68f0-f011-8407-6045bd051327`.
- **Trigger:** `manual` (Request).
- **Declared request fields:** `Title`
- **Connector families:** `shared_sharepointonline`.
- **Response actions:** `Response`

The exported definition is the source for exact request/response schemas, filter expressions, conditions, and schedule settings. This guide omits literal URLs, payload defaults, and credentials.

## Top-level actions

These actions are listed in export order. The `runAfter` dependencies below determine execution order and permitted failure paths.

- **Get LLM Prompt** (OpenApiConnection). See the action map for its operation and dependencies.
- **Response** (Response). Return a response.

## Action map

The path shows nesting inside scopes, loops, conditions, and switch cases. “After” lists the exported `runAfter` dependency and permitted predecessor statuses; an empty cell usually means a branch or scope entry.

| Action path | Type / operation | After |
| --- | --- | --- |
| Get_LLM_Prompt | `OpenApiConnection · GetItems` |  |
| Response | `Response` | Get_LLM_Prompt: Succeeded |

## Connections to other flows

No direct child-flow action is present in the exported definition. HTTP callbacks and connector events can still link this flow to other parts of the solution; see the [system map](../cloud-automation.md).

## Operations and verification

Use run history to verify which conditional paths actually ran, connector results, returned values, and retries. The export describes configured behavior, not live connection health or recent run success. For flow changes, validate in a development environment before testing or publishing.
