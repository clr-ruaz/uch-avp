# UCH-AVPOpenAIRequest

[Cloud flow overview](../cloud-automation.md) · [Workflow inventory](../workflows.md) · [Exported definition](../../src/powerplatform/ProjectAVP/src/Workflows/UCH-AVPOpenAIRequest-736370EC-8ECB-F011-BBD3-7C1E5217E110.json)

Exposes the shared AI request as a callable wrapper around Post OpenAI Request.

## Entry and contract

- **Flow ID:** `736370ec-8ecb-f011-bbd3-7c1e5217e110`.
- **Trigger:** `manual` (Request).
- **Declared request fields:** `System Message`, `User Message`
- **Connector families:** None in this definition; built-in actions or HTTP may still be used..
- **Response actions:** `Response`

The exported definition is the source for exact request/response schemas, filter expressions, conditions, and schedule settings. This guide omits literal URLs, payload defaults, and credentials.

## Top-level actions

These actions are listed in export order. The `runAfter` dependencies below determine execution order and permitted failure paths.

- **Response** (Response). Return a response.
- **OpenAI Request** (Workflow). Invoke a child flow.

## Action map

The path shows nesting inside scopes, loops, conditions, and switch cases. “After” lists the exported `runAfter` dependency and permitted predecessor statuses; an empty cell usually means a branch or scope entry.

| Action path | Type / operation | After |
| --- | --- | --- |
| Response | `Response` | OpenAI_Request: SUCCEEDED |
| OpenAI_Request | `Workflow` |  |

## Connections to other flows

| Call action | Target flow |
| --- | --- |
| OpenAI_Request | [UCH-AVPPostOpenAIRequest](postopenairequest.md) |

## Operations and verification

Use run history to verify which conditional paths actually ran, connector results, returned values, and retries. The export describes configured behavior, not live connection health or recent run success. For flow changes, validate in a development environment before testing or publishing.
