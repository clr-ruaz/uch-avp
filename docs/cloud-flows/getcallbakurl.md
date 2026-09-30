# UCH-AVPGetCallbakURL

[Cloud flow overview](../cloud-automation.md) · [Workflow inventory](../workflows.md) · [Exported definition](../../src/powerplatform/ProjectAVP/src/Workflows/UCH-AVPGetCallbakURL-DB89759A-F8BE-F011-BBD3-7C1E5217E110.json)

Finds a cloud flow in the target environment and returns its callback URL to an authorized child-flow caller.

## Entry and contract

- **Flow ID:** `db89759a-f8be-f011-bbd3-7c1e5217e110`.
- **Trigger:** `manual` (Request).
- **Declared request fields:** `text`
- **Connector families:** `shared_flowmanagement`.
- **Response actions:** `Respond_to_flow`

The exported definition is the source for exact request/response schemas, filter expressions, conditions, and schedule settings. This guide omits literal URLs, payload defaults, and credentials.

## Top-level actions

These actions are listed in export order. The `runAfter` dependencies below determine execution order and permitted failure paths.

- **Respond to flow** (Response). Return a response.
- **Get Environment** (Scope). Run the grouped actions below.
- **Get Cloud Flow** (Scope). Run the grouped actions below.

## Action map

The path shows nesting inside scopes, loops, conditions, and switch cases. “After” lists the exported `runAfter` dependency and permitted predecessor statuses; an empty cell usually means a branch or scope entry.

| Action path | Type / operation | After |
| --- | --- | --- |
| Respond_to_flow | `Response` | Get_Cloud_Flow: Succeeded |
| Get_Environment | `Scope` |  |
| Get_Environment / List_Environments | `OpenApiConnection · ListUserEnvironments` |  |
| Get_Environment / Filter_Environments | `Query` | List_Environments: Succeeded |
| Get_Environment / Target_Environment | `Compose` | Filter_Environments: Succeeded |
| Get_Cloud_Flow | `Scope` | Get_Environment: Succeeded |
| Get_Cloud_Flow / Filter_Cloud_Flows | `Query` | List_Flows_as_Admin: Succeeded |
| Get_Cloud_Flow / Target_Cloud_Flow | `Compose` | Filter_Cloud_Flows: Succeeded |
| Get_Cloud_Flow / List_Callback_URL | `OpenApiConnection · ListCallbackUrl` | Target_Cloud_Flow: Succeeded |
| Get_Cloud_Flow / List_Flows_as_Admin | `OpenApiConnection · ListFlowsInEnvironment_V2` |  |

## Connections to other flows

No direct child-flow action is present in the exported definition. HTTP callbacks and connector events can still link this flow to other parts of the solution; see the [system map](../cloud-automation.md).

## Operations and verification

Use run history to verify which conditional paths actually ran, connector results, returned values, and retries. The export describes configured behavior, not live connection health or recent run success. For flow changes, validate in a development environment before testing or publishing.
