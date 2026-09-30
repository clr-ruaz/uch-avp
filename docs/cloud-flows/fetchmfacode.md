# UCH-AVPFetchMFACode

[Cloud flow overview](../cloud-automation.md) · [Workflow inventory](../workflows.md) · [Exported definition](../../src/powerplatform/ProjectAVP/src/Workflows/UCH-AVPFetchMFACode-04018DD2-EBCC-F011-BBD3-7C1E5217E110.json)

Searches mailbox messages and attachments for a CoStar access code, with an AI extraction path.

## Entry and contract

- **Flow ID:** `04018dd2-ebcc-f011-bbd3-7c1e5217e110`.
- **Trigger:** `manual` (Request).
- **Declared request fields:** `Query`
- **Connector families:** `shared_office365`.
- **Response actions:** `Response`

The exported definition is the source for exact request/response schemas, filter expressions, conditions, and schedule settings. This guide omits literal URLs, payload defaults, and credentials.

## Top-level actions

These actions are listed in export order. The `runAfter` dependencies below determine execution order and permitted failure paths.

- **Response** (Response). Return a response.
- **Get matching emails** (OpenApiConnection). See the action map for its operation and dependencies.
- **Matched Emails** (If). Evaluate a condition and follow its branch.
- **Init MFA code str** (InitializeVariable). See the action map for its operation and dependencies.
- **Get mail attachment** (OpenApiConnection). See the action map for its operation and dependencies.
- **CoStar Access Code** (Compose). See the action map for its operation and dependencies.

## Action map

The path shows nesting inside scopes, loops, conditions, and switch cases. “After” lists the exported `runAfter` dependency and permitted predecessor statuses; an empty cell usually means a branch or scope entry.

| Action path | Type / operation | After |
| --- | --- | --- |
| Response | `Response` | Matched_Emails: Succeeded |
| Get_matching_emails | `OpenApiConnection · GetEmailsV3` | Init_MFA_code_str: Succeeded |
| Matched_Emails | `If` | CoStar_Access_Code: Succeeded |
| Matched_Emails / Mark_as_read | `OpenApiConnection · MarkAsRead_V3` | Set_MFA_Code: Succeeded |
| Matched_Emails / Get_MFA_with_LLM | `Workflow` |  |
| Matched_Emails / Set_MFA_Code | `SetVariable` | Get_MFA_with_LLM: Succeeded |
| Init_MFA_code_str | `InitializeVariable` |  |
| Get_mail_attachment | `OpenApiConnection · GetAttachment_V2` | Get_matching_emails: Succeeded |
| CoStar_Access_Code | `Compose` | Get_mail_attachment: Succeeded |

## Connections to other flows

| Call action | Target flow |
| --- | --- |
| Matched_Emails / Get_MFA_with_LLM | [UCH-AVPPostOpenAIRequest](postopenairequest.md) |

## Operations and verification

Use run history to verify which conditional paths actually ran, connector results, returned values, and retries. The export describes configured behavior, not live connection health or recent run success. For flow changes, validate in a development environment before testing or publishing.
