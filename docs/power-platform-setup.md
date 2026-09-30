# Power Platform workstation setup

Use Microsoft Power Platform CLI (`pac`) for solution lifecycle work. FlowAgent MCP is optional for conversational flow editing/debugging. Azure CLI (`az`) supplies FlowAgent authentication; it does not replace PAC. Each computer needs its own installation and sign-in.

## New workstation checklist

1. Clone this repository and open a shell at its root. Confirm the checkout with `git status --short`.
2. Install PAC and the prerequisites for the work you intend to do. Node.js and Azure CLI are only needed for FlowAgent; they are not required for PAC solution export or packaging. Install a compatible .NET SDK/MSBuild when building the `.cdsproj`.
3. Do not copy PAC credentials or `powerplatform.config.local.json` from another computer. The local config is ignored by Git; create it from the tracked example and sign in on this computer.
4. Use PAC discovery to verify the intended tenant, environment ID, Dataverse URL, environment type, and solution before export or sync. The commands and local-config workflow are below.
5. Treat the environment purpose separately from the solution source: as of 2026-09-29, `Upside Capital PAYG` is verified as **Production**. Use an approved development environment for edits, tests, imports, or publishing. Do not change the local config to Production for write operations.
6. FlowAgent is optional. Follow `AGENTS.md` only if you want conversational cloud-flow tools; verify its account/environment separately from PAC.

## Configuration ownership

| File or location | Purpose |
| --- | --- |
| `powerplatform.config.example.json` | Tracked non-secret template, repository paths, and labelled artifact hints. |
| `powerplatform.config.local.json` | Ignored local copy containing verified target identifiers. |
| `AGENTS.md` | Agent operating rules and pointers to this guide. |
| PAC authentication profiles | Credentials managed locally by PAC through interactive sign-in. Do not copy them into this repository. |
| Solution environment variables and connection references | Runtime configuration in Power Platform; not configured by the workstation JSON file. |

JSON avoids needing a dotenv parser in PowerShell. PAC does not automatically consume this project configuration or a project `.env`; the examples below explicitly load JSON and pass arguments. Neither file transfers authentication, creates connector connections, or updates solution environment variables.

The artifact hints in the tracked example are unverified exported defaults. They do not prove the flow-hosting tenant, canonical environment ID, Dataverse URL, or environment type; the verified target fields intentionally start empty. PAC discovery on 2026-09-29 confirmed `Upside Capital PAYG` is a Production environment. Reconfirm this on a new workstation and do not treat PAYG as a development environment.

## Install prerequisites

1. Install [Microsoft Power Platform CLI](https://learn.microsoft.com/en-us/power-platform/developer/cli/introduction) using a supported method. For a .NET tool installation, install a compatible .NET SDK first, then run `dotnet tool install --global Microsoft.PowerApps.CLI.Tool`. For an existing .NET tool installation, use `dotnet tool update --global Microsoft.PowerApps.CLI.Tool` when an update is needed. Ensure `pac` is available in the terminal used by the agent.
2. Use an account with access to the target environment and permissions for the intended solution operations.
3. For FlowAgent only, install Node.js 18+ and Azure CLI, then follow the registration guidance in `AGENTS.md`. Authenticate with `az login --allow-no-subscriptions`; verify its identity and tenant separately from PAC.

Check installation with `Get-Command pac` and `pac help`. Command syntax in this guide was checked against local PAC 2.10.1; remote operations have not been tested. Use `pac <command group> <command> help` to check another installed version.

## Create local configuration and discover the target

Run these PowerShell examples from the repository root. Copy the template only when a local file does not already exist:

```powershell
if (-not (Test-Path -LiteralPath './powerplatform.config.local.json')) {
    Copy-Item -LiteralPath './powerplatform.config.example.json' -Destination './powerplatform.config.local.json'
}
$ppConfig = Get-Content -LiteralPath './powerplatform.config.local.json' -Raw | ConvertFrom-Json
pac auth list
```

For a new workstation, create a discovery profile and sign in with the intended work account:

```powershell
pac auth create --name UCH-AVP-Discovery
pac auth who
pac org list
```

Without an explicit environment, authentication can initially select the default environment. Use this profile for discovery only. If a suitable profile already exists, select it using `pac auth select --name <existing-profile-name>` rather than creating duplicates. `pac org list` discovers Dataverse environments visible to the account; missing results do not prove an environment does not exist.

Locate the intended environment, using the display-name hint only as a starting point. Confirm its tenant ID, environment ID, Dataverse organization URL, and type using discovery and the Power Platform admin center as needed. Fill `tenantId`, `environmentId`, `environmentUrl`, and `environmentType` in the local JSON. Use the canonical environment ID, not a solution/project GUID or a value reconstructed from a callback hostname. Use a development environment for changes.

`pac org list` shows environments available to the signed-in identity. Use `pac admin list --name "<environment-display-name>"` when tenant-level PAC access is available to confirm environment type. `pac org who --environment <environment-id>` verifies the organization URL and environment ID. If PAC cannot verify the tenant or type, leave those fields unresolved and confirm them in the Power Platform admin center rather than guessing.

Then create the target profile (or select an existing verified one):

```powershell
$ppConfig = Get-Content -LiteralPath './powerplatform.config.local.json' -Raw | ConvertFrom-Json
if (-not $ppConfig.tenantId -or -not $ppConfig.environmentId -or -not $ppConfig.environmentUrl) {
    throw 'Complete the verified tenant, environment ID, and Dataverse URL first.'
}
pac auth create --name $ppConfig.authProfileName --environment $ppConfig.environmentId
if ($LASTEXITCODE -ne 0) { throw 'PAC authentication failed.' }
pac auth who
pac org who --environment $ppConfig.environmentId
pac solution list --environment $ppConfig.environmentId
```

If a named PAC profile already exists, select it instead of creating another:

```powershell
pac auth select --name $ppConfig.authProfileName
```

Compare the reported tenant, identity, organization URL, and solution with the local configuration before continuing. These examples require a human comparison; loading JSON does not enforce tenant matching. On later sessions use `pac auth select --name $ppConfig.authProfileName` and repeat the read-only checks. Browser/device-code sign-in may be required on each machine; do not store passwords, tokens, client secrets, or signed callback URLs in these files.

## Fetch and unpack for review

Load and verify the local configuration as above. Export into a unique ignored staging directory so an initial inspection does not overwrite repository source:

```powershell
$ppFetchPath = Join-Path $ppConfig.artifactPath ([guid]::NewGuid().ToString())
New-Item -ItemType Directory -Path $ppFetchPath -Force | Out-Null
$ppZipPath = Join-Path $ppFetchPath 'ProjectAVP.zip'
$ppUnpackPath = Join-Path $ppFetchPath 'unpacked'
pac solution export --environment $ppConfig.environmentId --name $ppConfig.solutionUniqueName --path $ppZipPath --managed false
if ($LASTEXITCODE -ne 0) { throw 'Solution export failed.' }
pac solution unpack --zipfile $ppZipPath --folder $ppUnpackPath --packagetype Unmanaged
if ($LASTEXITCODE -ne 0) { throw 'Solution unpack failed.' }
```

Review the staged export against `solutionSourcePath`. Downloaded exports may contain sensitive configuration even though the staging directory is ignored.

For a deliberate refresh of the existing `.cdsproj`, first preserve any local solution edits, then run:

```powershell
git status --short
pac solution sync --environment $ppConfig.environmentId --solution-folder $ppConfig.solutionProjectPath --packagetype Unmanaged
if ($LASTEXITCODE -ne 0) { throw 'Solution sync failed; inspect the working tree.' }
git diff --stat -- src/powerplatform/ProjectAVP
git diff --check -- src/powerplatform/ProjectAVP
```

Sync refreshes local files from the environment and can overwrite local work. Review additions, modifications, and deletions before committing. Use `pac solution clone` for a new solution project in a new directory; this repository already contains a project, so cloning over it is unnecessary. `pac solution pack` creates a local package; importing or publishing it is a separate remote change requiring authorization.

Moving this checkout to another computer is not an environment migration. Deploying to a different environment additionally requires connection-reference mappings, runtime environment-variable values, dependencies, and permissions. PAC's `solution create-settings` command can generate a deployment-settings template for that separate workflow.

## References

- [PAC installation](https://learn.microsoft.com/en-us/power-platform/developer/cli/introduction)
- [PAC authentication](https://learn.microsoft.com/en-us/power-platform/developer/cli/reference/auth)
- [PAC solution commands](https://learn.microsoft.com/en-us/power-platform/developer/cli/reference/solution)
- [Power Automate plugin prerequisites](https://learn.microsoft.com/en-us/power-automate/power-automate-plugin-external-tools)
