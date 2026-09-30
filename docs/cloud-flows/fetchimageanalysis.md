# UCH-AVPFetchImageAnalysis

[Cloud flow overview](../cloud-automation.md) · [Workflow inventory](../workflows.md) · [Exported definition](../../src/powerplatform/ProjectAVP/src/Workflows/UCH-AVPFetchImageAnalysis-882705E8-AB1E-F111-8341-7CED8D3C00CF.json)

Accepts an image-analysis request and forwards the prepared message to the shared OpenAI request flow.

## Entry and contract

- **Flow ID:** `882705e8-ab1e-f111-8341-7ced8d3c00cf`.
- **Trigger:** `manual` (Request).
- **Declared request fields:** `Instruction`, `Image`
- **Connector families:** None in this definition; built-in actions or HTTP may still be used..
- **Response actions:** `Response`

The exported definition is the source for exact request/response schemas, filter expressions, conditions, and schedule settings. This guide omits literal URLs, payload defaults, and credentials.

## Top-level actions

These actions are listed in export order. The `runAfter` dependencies below determine execution order and permitted failure paths.

- **Response** (Response). Return a response.
- **Post OpenAI Request** (Workflow). Invoke a child flow.
- **User Message** (Compose). See the action map for its operation and dependencies.

## Action map

The path shows nesting inside scopes, loops, conditions, and switch cases. “After” lists the exported `runAfter` dependency and permitted predecessor statuses; an empty cell usually means a branch or scope entry.

| Action path | Type / operation | After |
| --- | --- | --- |
| Response | `Response` | Post_OpenAI_Request: Succeeded |
| Post_OpenAI_Request | `Workflow` | User_Message: Succeeded |
| User_Message | `Compose` |  |

## Connections to other flows

| Call action | Target flow |
| --- | --- |
| Post_OpenAI_Request | [UCH-AVPPostOpenAIRequest](postopenairequest.md) |

## Operations and verification

Use run history to verify which conditional paths actually ran, connector results, returned values, and retries. The export describes configured behavior, not live connection health or recent run success. For flow changes, validate in a development environment before testing or publishing.
