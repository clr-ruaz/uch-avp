# UCH-AVPSharePointSearchConnector

[Cloud flow overview](../cloud-automation.md) · [Workflow inventory](../workflows.md) · [Exported definition](../../src/powerplatform/ProjectAVP/src/Workflows/UCH-AVPSharePointSearchConnector-A46F2477-575B-F111-BEC7-7CED8D3C078D.json)

Retrieves and transforms search content for a caller.

## Entry and contract

- **Flow ID:** `a46f2477-575b-f111-bec7-7ced8d3c078d`.
- **Trigger:** `manual` (Request).
- **Declared request fields:** `Resource Paths Filter`, `User Query`
- **Connector families:** `shared_keyvault`.
- **Response actions:** `Response`

The exported definition is the source for exact request/response schemas, filter expressions, conditions, and schedule settings. This guide omits literal URLs, payload defaults, and credentials.

## Top-level actions

These actions are listed in export order. The `runAfter` dependencies below determine execution order and permitted failure paths.

- **Response** (Response). Return a response.
- **Retrieve Content** (Scope). Run the grouped actions below.
- **Transform Results** (Select). See the action map for its operation and dependencies.

## Action map

The path shows nesting inside scopes, loops, conditions, and switch cases. “After” lists the exported `runAfter` dependency and permitted predecessor statuses; an empty cell usually means a branch or scope entry.

| Action path | Type / operation | After |
| --- | --- | --- |
| Response | `Response` | Transform_Results: SUCCEEDED |
| Retrieve_Content | `Scope` |  |
| Retrieve_Content / Do_until | `Until` |  |
| Retrieve_Content / Do_until / Retrieve_Data | `Http` | Get_Bearer_Token: Succeeded |
| Retrieve_Content / Do_until / Invalid_Token | `If` | Retrieve_Data: Failed |
| Retrieve_Content / Do_until / Invalid_Token / Refresh_Bearer_Token | `Http` |  |
| Retrieve_Content / Do_until / Get_Bearer_Token | `OpenApiConnection · GetSecret` |  |
| Transform_Results | `Select` | Retrieve_Content: Succeeded |

## Connections to other flows

No direct child-flow action is present in the exported definition. HTTP callbacks and connector events can still link this flow to other parts of the solution; see the [system map](../cloud-automation.md).

## Operations and verification

Use run history to verify which conditional paths actually ran, connector results, returned values, and retries. The export describes configured behavior, not live connection health or recent run success. For flow changes, validate in a development environment before testing or publishing.
