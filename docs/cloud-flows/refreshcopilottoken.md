# UCH-AVPRefreshCopilotToken

[Cloud flow overview](../cloud-automation.md) · [Workflow inventory](../workflows.md) · [Exported definition](../../src/powerplatform/ProjectAVP/src/Workflows/UCH-AVPRefreshCopilotToken-09C0113B-555B-F111-BEC7-7CED8D3C06DF.json)

Refreshes a Copilot access token and stores the result for connector use.

## Entry and contract

- **Flow ID:** `09c0113b-555b-f111-bec7-7ced8d3c06df`.
- **Trigger:** `manual` (Request).
- **Declared request fields:** No request fields declared in the trigger schema.
- **Connector families:** `shared_keyvault`.
- **Response actions:** `Response`

The exported definition is the source for exact request/response schemas, filter expressions, conditions, and schedule settings. This guide omits literal URLs, payload defaults, and credentials.

## Top-level actions

These actions are listed in export order. The `runAfter` dependencies below determine execution order and permitted failure paths.

- **Response** (Response). Return a response.
- **Copilot Token** (Scope). Run the grouped actions below.
- **Store Token** (Scope). Run the grouped actions below.

## Action map

The path shows nesting inside scopes, loops, conditions, and switch cases. “After” lists the exported `runAfter` dependency and permitted predecessor statuses; an empty cell usually means a branch or scope entry.

| Action path | Type / operation | After |
| --- | --- | --- |
| Response | `Response` | Store_Token: Succeeded |
| Copilot_Token | `Scope` |  |
| Copilot_Token / Get_Refresh_Token | `OpenApiConnection · GetSecret` |  |
| Copilot_Token / Get_Client_Secret | `OpenApiConnection · GetSecret` | Get_Refresh_Token: Succeeded |
| Copilot_Token / Get_Copilot_Token | `Http` | Get_Client_Secret: Succeeded |
| Store_Token | `Scope` | Copilot_Token: Succeeded |
| Store_Token / Store_Access_Token | `Http` | Get_Vault_Token: Succeeded |
| Store_Token / Get_Vault_Token | `Http` |  |
| Store_Token / Store_Refresh_Token | `Http` | Store_Access_Token: SUCCEEDED |

## Connections to other flows

No direct child-flow action is present in the exported definition. HTTP callbacks and connector events can still link this flow to other parts of the solution; see the [system map](../cloud-automation.md).

## Operations and verification

Use run history to verify which conditional paths actually ran, connector results, returned values, and retries. The export describes configured behavior, not live connection health or recent run success. For flow changes, validate in a development environment before testing or publishing.
