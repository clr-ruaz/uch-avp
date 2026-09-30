# Project Agent Guidance

## Power Automate Cloud Flows

- Require Microsoft Power Platform CLI (`pac`) for environment discovery, authentication, solution listing, export, unpack, pack, clone, and sync. Follow [the Power Platform setup guide](docs/power-platform-setup.md). PAC is separate from Azure CLI and the optional FlowAgent MCP server.
- Use `powerplatform.config.example.json` as the tracked configuration template and `powerplatform.config.local.json` as the ignored machine-specific copy. The template's `artifactHints` are unverified exported defaults, not an authenticated target. Keep reusable setup instructions in the guide rather than duplicating configuration values here.
- Before remote solution operations, inspect the PAC identity and target environment, compare them with the verified local configuration, and pass an explicit environment ID or Dataverse URL where supported. Do not assume the active PAC profile, Azure CLI login, and FlowAgent session target the same account or environment. Preserve local changes before sync or unpack; review the source diff afterward. Require user authorization for solution import/deployment or publishing.
- The Power Automate solution source is under `src/powerplatform/ProjectAVP/`.
- The [Microsoft Power Platform Skills repository](https://github.com/microsoft/power-platform-skills/tree/main/plugins/power-automate) provides the Power Automate plugin and its FlowAgent MCP server. Its documented plugin hosts are GitHub Copilot CLI and Claude Code; this project does not include a Codex-specific plugin.
- FlowAgent uses stdio transport, which Codex supports. Direct registration with Codex is a candidate integration that must be verified locally; Microsoft's documented plugin hosts do not establish tested Codex compatibility. Install the Power Platform Skills plugin using its [supported instructions](https://learn.microsoft.com/en-us/power-automate/power-automate-plugin-external-tools), then register the local server with Codex. Replace the placeholder below with the actual path on the current machine:

  ```powershell
  codex mcp add flowagent -- node "<power-platform-skills-install>\power-automate\server\mcp.mjs"
  codex mcp list
  ```

- Prerequisites are Node.js 18 or later, Azure CLI, and a work account with the required Power Automate license and environment permissions. Sign in with `az login --allow-no-subscriptions` using the same work account as Power Automate. Some connection-management operations may require additional interactive sign-in.
- Codex CLI, its IDE extension, and the Codex desktop app share the Codex MCP configuration. MCP availability depends on the local server installation, prerequisites, authentication, and the signed-in account's Power Platform permissions. After registration, verify that FlowAgent tools are available in the active session and perform a read-only environment/flow lookup before attempting changes; `codex mcp list` alone does not prove connectivity or authorization.
- If FlowAgent is unavailable or its Codex integration has not been verified, prepare and review changes in chat and apply/test them in [the Power Automate designer](https://make.powerautomate.com/).
- The FlowAgent MCP server can inspect, edit, validate, run, publish, disable, and delete flows. Before changing an existing flow, inspect its current definition and use the preview/edit workflow; validate changes before testing them.
- Use a development environment for changes. Do not publish, disable, or delete a flow without explicit user approval. Do not bypass managed-solution protections without explicit approval and an understanding of the deployment consequences.
- Keep connection credentials, Key Vault values, and signed Power Automate callback URLs out of source control, documentation, and chat output. Treat callback URLs containing signatures as credentials.
- FlowAgent edits change the Power Platform environment, not the local solution files. After approved changes, export/unpack the updated solution into `src/powerplatform/ProjectAVP/` and review the resulting source-control diff.
