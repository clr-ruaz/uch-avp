# UCH-AVPPostOpenAIRequest

[Cloud flow overview](../cloud-automation.md) · [Workflow inventory](../workflows.md) · [Exported definition](../../src/powerplatform/ProjectAVP/src/Workflows/UCH-AVPPostOpenAIRequest-9B3A2388-A7C3-F011-BBD3-7C1E5217E110.json)

Retrieves the AI credential, sends a model request, cleans the response, and returns it to the caller.

## Entry and contract

- **Flow ID:** `9b3a2388-a7c3-f011-bbd3-7c1e5217e110`.
- **Trigger:** `manual` (Request).
- **Declared request fields:** `text`, `text_1`, `boolean`
- **Connector families:** `shared_keyvault`.
- **Response actions:** `Respond_to_flow`, `LLM_Response`

The exported definition is the source for exact request/response schemas, filter expressions, conditions, and schedule settings. This guide omits literal URLs, payload defaults, and credentials.

## Top-level actions

These actions are listed in export order. The `runAfter` dependencies below determine execution order and permitted failure paths.

- **Get OpenAI Key** (OpenApiConnection). See the action map for its operation and dependencies.
- **LLM POST Request** (Http). See the action map for its operation and dependencies.
- **User Message** (Query). See the action map for its operation and dependencies.
- **Respond to flow** (Response). Return a response.
- **Cleanup String** (Compose). See the action map for its operation and dependencies.
- **LLM Response** (Query). See the action map for its operation and dependencies.

## Action map

The path shows nesting inside scopes, loops, conditions, and switch cases. “After” lists the exported `runAfter` dependency and permitted predecessor statuses; an empty cell usually means a branch or scope entry.

| Action path | Type / operation | After |
| --- | --- | --- |
| Get_OpenAI_Key | `OpenApiConnection · GetSecret` | User_Message: Succeeded |
| LLM_POST_Request | `Http` | Get_OpenAI_Key: Succeeded |
| User_Message | `Query` | Cleanup_String: Succeeded |
| Respond_to_flow | `Response` | LLM_Response: Succeeded |
| Cleanup_String | `Compose` |  |
| LLM_Response | `Query` | LLM_POST_Request: Succeeded |

## Connections to other flows

No direct child-flow action is present in the exported definition. HTTP callbacks and connector events can still link this flow to other parts of the solution; see the [system map](../cloud-automation.md).

## Operations and verification

Use run history to verify which conditional paths actually ran, connector results, returned values, and retries. The export describes configured behavior, not live connection health or recent run success. For flow changes, validate in a development environment before testing or publishing.
