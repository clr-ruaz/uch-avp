# Signed URL externalization plan

Status: proposed; no source remediation or remote changes have been performed.

## Outcome

Keep ProjectAVP deployable from this repository while removing signed Power Automate invocation URLs from all source, exported defaults, and packaged artifacts intended for Git. Preserve behavior by resolving URLs in the target environment or providing environment-specific values outside source control.

The reviewed baseline contains 11 distinct signed endpoints, with 24 occurrences in nine files. This plan addresses those credentials and prevents their reintroduction. Screenshot privacy review remains a separate pre-publication task.

## Configuration design

- Keep existing environment-variable schema names and references for the three cloud-to-cloud endpoints. Remove secret default values; supply target-specific current values during deployment from an ignored, access-controlled settings file. These text values are still credentials in Power Platform; restrict access accordingly. This is source-control externalization, not encryption or automatic Key Vault protection.
- Preserve the existing runtime callback lookup and caller-to-desktop input bindings for the other eight endpoints. Remove fallback URLs from both desktop representations. Do not introduce eight new stored URL secrets when the application already resolves them dynamically.
- Keep the workstation config JSON limited to non-secret environment identifiers and paths. Do not put signed URLs in its tracked example or in AGENTS.md.
- Keep deployment files containing real values and intermediate exports under ignored `.artifacts/`. Do not print values in terminal output, validation errors, pipeline logs, or reports. Ignore rules are a convenience, not an access-control mechanism.
- If organizational policy requires Key Vault storage for the three endpoints, implement explicit runtime secret retrieval as a separate design change; do not merely change the variable type and assume existing expressions still work.

## 1. Verify the complete caller map and preserve recovery information

1. Rescan the working tree, staged files, archives, and any available history without printing matched values. Refresh the nine-file inventory.
2. Record a non-secret mapping of each endpoint to its destination flow, consumers, environment-variable name or desktop input, and retrieval method.
3. Inspect all desktop invocation branches in Validate Properties and any other callers. Confirm that each required input is supplied and that callback lookup targets the selected environment and the imported flow, rather than a fixed source-environment identifier.
4. Inspect direct/manual desktop-run behavior. Document that users must supply required URLs securely if bypassing the normal cloud caller.
5. Before deleting local defaults, preserve necessary recovery values in an approved secret store or protected local deployment settings, outside Git. Do not create a backup commit containing secrets. Preserve unrelated local work.

Deliverable: redacted endpoint inventory plus recovery instructions; no secret values in the inventory.

## 2. Remove the three cloud endpoint defaults

Retain these existing definitions, but remove signed `defaultvalue` contents and any exported current values:

| Environment variable | Cloud-flow JSON defaults to sanitize |
| --- | --- |
| `clr_UCHAVPSharePointConnectorURL` | AVP Change Tracker, SharePoint Bridge, SharePoint History Bridge |
| `clr_UCHAVPSearchOneDriveConnectorURL` | SharePoint Search Bridge |
| `clr_UCHAVPM365CopilotAPIURLRefreshToken` | SharePoint Search Connector |

1. Remove the duplicated `defaultValue` values from the five cloud-flow JSON definitions. Preserve parameter types, schema metadata, existing names (including legacy spelling), and action references.
2. Add an early configuration check before each affected HTTP call. Missing/invalid configuration must terminate with a clear, redacted error before sending requests or performing dependent work. Do not use a dummy URL or fall back to a source-environment URL.
3. Protect supported action inputs/outputs that contain callback URLs using the platform's secure logging settings. Review error and notification paths for accidental disclosure.
4. Verify that the source solution has no remaining signed URLs in these definitions or generated parameter defaults.

Deliverable: three clean XML definitions and five clean, configurable cloud-flow definitions.

## 3. Remove desktop fallback URLs while preserving runtime injection

Update the Automated Valuation Desktop Flow's XML `Inputs` metadata and JSON-encoded `Definition` together. The eight affected inputs are:

| Desktop input | Existing callback lookup in cloud caller |
| --- | --- |
| `strWebApp_FetchQueue_URL` | Get Callback URL for Fetch Work Queue |
| `strWebApp_FlowMailer_URL` | Get Callback URL for Send Notification |
| `strWebApp_UpdateQueueUrl` | Get Callback URL for Update Work Queue |
| `strWebApp_FileUpload_URL` | Get Callback URL for Upload File |
| `strWebApp_OpenAIRequest_URL` | Get Callback URL for OpenAI Request |
| `strWebApp_FetchMFA_URL` | Get Callback URL for CoStar MFA Code |
| `strWebApp_FetchLlmPrompt_URL` | Get Callback URL for Fetch LLM Prompt |
| `strWebApp_ImageAnalysis_URL` | Get Callback URL for Image Analysis |

1. Remove all 16 literal copies without changing input names or corrupting XML/JSON/script escaping.
2. Preserve all existing runtime bindings. Resolve any fixed environment/flow lookup references found in phase 1 using verified target metadata.
3. Validate required URLs at desktop startup before business actions. Missing values must fail locally with input names only; the failure path must not depend on an absent notification callback. Determine required inputs per supported execution mode and test each mode.
4. Mark inputs sensitive where supported by Power Automate Desktop and verify that caller run history, desktop logs, and exception messages do not expose them. Validate metadata changes through supported tooling/designer behavior.
5. Confirm that unattended runs still receive all values and that manual runs have a documented secure configuration path.

Deliverable: a desktop definition with no credential defaults and verified caller bindings.

## 4. Add repeatable deployment configuration

1. Add a tracked deployment-settings example containing connection-reference mappings and environment-variable schema names, with blank secret values. Keep it separate from `powerplatform.config.example.json`.
2. Generate the settings shape using PAC `solution create-settings`, then sanitize all inherited environment-specific values before committing the example.
3. Document a two-stage import/configuration process:
   - Verify tenant/environment, dependencies, connections, permissions, and desktop-machine setup.
   - Pack the sanitized solution and import with activation behavior explicitly controlled. Do not assume all imported flows remain disabled; verify and prevent consumer execution until configuration is complete.
   - Identify the imported endpoint flows and obtain their target callback URLs through authenticated tooling without invoking them or logging the URLs. If endpoint activation is required for retrieval, enable only the reviewed providers in a controlled test environment.
   - Apply the three target-specific current values outside Git, verify callback lookup mappings for desktop inputs, and check that no endpoint points back to the original environment.
   - Enable and test consumers only after configuration checks pass.
4. Document existing-environment updates separately from fresh deployments: preserve intentional current values, remove old defaults, and confirm active flows use the intended configuration.
5. Include rotation/rebinding and rollback instructions. Rollback must not restore secret-bearing files to Git. If a signature was exposed beyond its authorized audience, rotate it and update legitimate callers through a coordinated change.

Known import prerequisites: resolve `clr_UPMDHAO365UserConnection` from DallasHousingAuthority, and verify the `msdyn_Dataverse` dependency. Also provision or deliberately reuse external SharePoint, Key Vault, Azure, and desktop resources. Resolving unrelated dependencies is not required to remove secrets locally, but is required before claiming a successful fresh-environment deployment.

## 5. Prevent secrets returning through export or sync

1. Add a repository scanner that examines tracked/untracked candidate files and, for commit checks, the actual staged blobs. Decode XML entities, embedded desktop JSON/script text, URL encoding, and ZIP-based canvas artifacts. Detect nonempty credential signatures and other common secret formats without echoing values.
2. Add an export sanitizer for the specific URL defaults/current values and both desktop representations. Preserve schema, validate parseability, and make repeated runs idempotent. Unknown secret findings must block the process for review rather than being silently deleted.
3. Change the documented refresh process to export/unpack into ignored staging, sanitize, scan, and only then merge into repository source. Direct PAC sync into the working source must be followed by the same checks before staging; prefer the staged workflow.
4. Add a local pre-commit check and a CI check. Document hook installation on each computer. CI detects regressions after upload, so it does not replace the local staged-content check.
5. Update README, AGENTS.md, and the workstation/deployment guide to make the sanitized export and secret-injection steps the normal workflow.

Deliverables: reusable sanitizer and redacting scanner, hook/CI integration, clean examples, and setup instructions. Do not commit raw audit contact sheets or sensitive fixtures.

## 6. Validate and establish completion

Local checks:

- Parse all changed XML/JSON, including desktop metadata and embedded script encoding.
- Verify all 24 baseline occurrences are gone and all 11 endpoints still have a runtime/configuration source.
- Test sanitizer idempotence and preservation of unrelated flow content using synthetic credentials only.
- Test detection in XML entities, embedded JSON, URL-encoded values, archive members, and staged blobs that differ from working-tree files.
- Confirm missing configuration fails before dependent calls and errors never include secret values.
- Pack using PAC, unpack into a fresh ignored directory, and rescan the round-trip output and packaged archive.

Authorized development-environment checks:

- Import the sanitized package, resolve dependencies, bind connections, and apply target configuration.
- Exercise the three configured endpoint paths and all supported desktop invocation branches using test data and controlled side effects. Do not send real notifications or modify business records merely to prove routing.
- Verify correct destination environment, no fallback to source URLs, and no credential leakage in run histories/errors.
- Export again, sanitize, and verify the repository remains credential-free.

Completion requires both a clean commit candidate and a demonstrated deploy/configure/run cycle. If target access, connections, licensing, desktop infrastructure, or dependency resolution is unavailable, report local remediation as complete separately from unverified deployment behavior.

Remote imports, publishing/enabling, disabling, key rotation, and business-impacting test runs require authorization under the project's operating rules. This planning request authorizes preparation of this plan only.
