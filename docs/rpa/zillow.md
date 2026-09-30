# Zillow desktop process

[RPA overview](../desktop-automation.md) · [CoStar](costar.md) · [Zillow](zillow.md) · [Redfin](redfin.md) · [Realtor.com](realtor.md)

Extract property-page text and its URL, use the configured Zillow Details prompt to process that information, and write the result back to the property queue.

## Source and entry conditions

The [desktop XML definition](../../src/powerplatform/ProjectAVP/src/Workflows/UCH-AVPAutomatedValuationDesktopFlow-2E6975E7-8C20-4F15-9FEC-AC412E9A55DD.json.data.xml) stores the script in `<Definition>`. The following locations are **decoded script** lines, not XML file lines; see [inspection instructions](../desktop-automation.md#inspecting-the-script).

| Subflow | Decoded starting line | Role |
| --- | --- | --- |
| `Zillow: Initialize Web App` | 1487 | Initialize the portal browser state. |
| `Zillow: Extract Home Details` | 1511 | Search, match, extract, and request AI processing. |

The validation cloud flow's false branch processes Zillow first. It invokes the desktop flow only for a nonempty Zillow queue and passes at most the first **200** entries. The source label is `Zillow`.

Shared queue validation requires the item's ID/Title for tracking and checks Address, City, State, Zip, and Property Type. The accepted residential report codes are **CND, OTH, RES, SFR, UNK**. Unsupported types, missing details, or a CoStar-only type in this source queue produce a skip reason. See the [routing table](../desktop-automation.md#property-validation-and-routing).

The portal URL, queue, notification settings, exception tracker, and helper callbacks must be configured. The shared browser variable is named `objWebApp_CoStar_Instance` even in this Zillow path.

## Process map

```mermaid
flowchart TD
    Init[Initialize portal] --> Query[Enter address and inspect suggestions]
    Query --> Direct{Direct match?}
    Direct -->|yes| Open[Open candidate property]
    Direct -->|no, candidates exist| MatchAI[Ask AI to match candidate addresses]
    MatchAI -->|accepted index| Open
    MatchAI -->|rejected| Skip[Record no-match reason]
    Open --> Verify[Verify property-page address]
    Verify -->|accepted directly or by AI| Extract[Extract available text and URL]
    Verify -->|rejected or absent| Skip
    Extract --> Prompt[Fetch details prompt and process with AI]
    Prompt --> Update[Update queue: Pending]
    Skip --> NoMatch[Update queue: No Match]
```

The search-specific behavior when no suggestions exist is explained below. Runtime errors follow shared retry/failure handling rather than the no-match branch.

## 1. Initialize the portal

1. Clear the subflow status. If no tracked browser exists, launch Edge at `strWebApp_Zillow_BaseUrl`, retaining cache and cookies. Otherwise navigate the tracked instance to that URL.
2. Launch/navigation actions use `ON ERROR REPEAT 3 TIMES WAIT 10`.
3. If the stored Edge Restore control appears, click it; its handler repeats three times with five-second waits on errors. Call the shared wait helper.
4. Set the subflow status to `Done`; orchestration proceeds to the queue item.


## 2. Open search and enter the address

1. Reset the subflow status and skip reason, move the pointer to screen coordinates (200, 200), and navigate back to `strWebApp_Zillow_BaseUrl`.
2. Wait up to **60 seconds** for `Zillow 'Search' Field`. The human-verification check occurs **after** this wait.
3. If `Zillow Human Verification` is present, send support an alert with a screenshot and display a topmost OK dialog asking a person to complete verification. The script does not impose an explicit dialog timeout here. This path can require operator interaction even when the desktop run is otherwise unattended.
4. Begin an address-entry loop with up to **three** iterations. If Clear Search is present, hover over it with the actual mouse and click it.
5. Enter `Address, City, State ZIP` using the physical keyboard action and read the Search field's Own Text.
6. The read-back condition combines street-prefix, city/state containment, and ZIP-suffix checks. The exported expression wraps that combined result in `Contains(..., True, True)`; this guide describes its component checks without claiming that expression has been runtime-tested.
7. Once the entry check passes, wait up to **20 seconds** for Search Match. This wait's error is suppressed, then the last error is cleared.
8. Reset the candidate counter and list, then inspect the indexed Search Match controls.

## 3. Choose a search result

1. Read the current suggestion's Own Text. A direct suggestion must start with the street address, contain city and state, and end with ZIP. The flow hovers over and clicks an accepted suggestion.
2. For a rejected suggestion, append its counter value and address to `aryPossibleMatches`, increment the counter, and inspect the next indexed control.
3. If direct matching exhausts the suggestions but candidates exist, call `Flow: OpenAI Request` with the embedded address-matching system message, full requested address, and collected candidates.
4. The prompt requests a candidate ID, or -1 for no match. The script accepts a response `>= 0` and assigns it to `intListCounter`; it does not independently demonstrate that the response is a valid in-range index.
5. For an AI-selected suggestion, read its address, split on the comma, trim the first part, and save it as `strManualAddress`. Click the selected suggestion and continue to the property-page check.
6. A negative AI result goes to `No Match Report`.
7. If there are no suggestions and no collected candidates, the script clicks `Zillow 'Submit Search' Button` and proceeds to the property-page address check. This is a fallback search submission, not an immediate no-match result.
8. If the address cannot pass the search field's read-back check after the third attempt, set `Fail` with an address-entry error and return.

The embedded matching prompt allows formatting/abbreviation variations and asks the model to reject different street numbers or names. This is an instruction to the model, not a guarantee of match accuracy.

## 4. Verify the opened property

1. Wait up to **30 seconds** for the portal's Home Address control. The wait error is suppressed so the next presence check decides the path.
2. If the address control is absent, go to no match.
3. Read its Own Text. The displayed address must start with the requested street address, contain city and state, and end with ZIP.
4. If the direct check fails, send that single displayed address as candidate ID 0 through the address-matching helper.
5. A nonnegative response allows extraction; a negative response goes to no match.
6. The no-match branch sets the subflow to `Done` **with a skip reason**, annotates the current step with `(No Matching Address)`, and returns. Orchestration sees the skip reason and calls shared skip handling. `Done` here does not mean the property was successfully valued.

## 5. Extract the available fields

| Value | UI source | Behavior |
| --- | --- | --- |
| Property section text | `Zillow Home 'Section'` | Read Own Text when the section exists; read errors are suppressed. |
| Page URL | Browser URL address | Always request the current URL after the section check. |

1. Move the pointer to (600, 600), then clear `strZillow_PropertyDetails` and `strZillow_PropertyUrl`.
2. Read the property section when available. The extraction path does not iterate through every expandable section.
3. Read the page URL and append it as `Zillow URL: <value>` to the collected text.

Missing optional text fields can remain empty without setting a skip reason. The next step may still run using the remaining text and URL.

## 6. Process the extracted information

1. Pass `strZillow_PropertyDetails` through a PowerShell JSON-escaping operation with a ten-second script timeout.
2. Replace remaining double-quote characters with single quotes as implemented in the desktop script.
3. Set `strLlm_PromptTitle = Zillow Details` and call `Flow: Get LLM Prompt`. The helper requests a prompt by Title and reads its `Prompt` field.
4. Build the OpenAI request using the fetched prompt as System Message and the extracted/escaped text as User Message.
5. Call `Flow: OpenAI Request`.
6. If `strOpenAIResponse` is nonempty, add it to `strQueueItem_UpdateNotes` under `Zillow Details`. The response is inserted as a JSON value rather than wrapped as a quoted string.
7. Mark the extraction subflow `Done`.

The actual details prompt and its expected result schema are stored outside this export. The code does not enforce a nonempty AI response before setting `Done`; valid structure and business completeness should be checked through the helper output and receiving flow.

## 7. Persist the result and continue

1. If extraction returns `Done` with no skip reason, orchestration assigns **Pending**.
2. Call `Flow: Update Status`. It sends `ID`, `Status`, `Source`, `Notes`, and `URL` to the queue-update callback. Notes include Title, Manual Address, and the detail result when populated.
3. The page URL is included in the text sent to AI. The outer update payload's `URL` field comes from the shared `strQueueItem_Filename` variable; this extraction routine does not directly assign the captured page URL to that variable.
4. Require HTTP 200 from the update helper. Only then remove the first item from the local queue and clear the shared item state.
5. Continue to the next queue item, or wrap up when the queue is empty. After a reported item failure and successful status update, orchestration restarts browser preparation.

The active Zillow path updates notes; it does not generate or upload a property PDF. 

## Outcomes and troubleshooting

| Condition | Result in the desktop flow | What to inspect |
| --- | --- | --- |
| Invalid/mismatched input | `Skipped` via shared queue validation | Required fields, report-type/source mapping. |
| Search text cannot be entered/verified | Subflow failure and retry handling | Search selector, keyboard focus, read-back expression. |
| Candidate or opened address rejected | `No Match`, with support notification | Actual displayed address, candidates, AI matching response. |
| Optional property text is missing | Extraction may continue | Available controls and the text supplied to the details prompt. |
| AI details response is empty | No detail key added; subflow can still finish | Prompt retrieval and OpenAI response; status alone is insufficient evidence. |
| Successful extraction path | `Pending` | Result detail key, source, and receiving cloud-flow behavior. |
| Human-verification dialog | Support email and interactive prompt | Operator response and whether the search-field wait finished before detection. |
| Terminal item error | Notify support, mark `Failed`, update, and request browser restart | Exception tracker, error text, screenshots when attached. |
| Terminal queue-update error | Alert and wrap up | Callback response; the item was not removed from the local queue. |

The shared attempt counter has a configured limit of 3, while individual UI/HTTP actions can have additional retries. See [shared retry behavior](../desktop-automation.md#retries-and-failure-recovery) before interpreting attempt counts.

## Selector and verification notes

Principal stored control labels: `Zillow 'Search' Field`, `Zillow 'Clear Search' Button`, `Zillow 'Search' Match`, `Zillow 'Submit Search' Button`, `Zillow Home 'Address'`, `Zillow Home 'Section'`, and `Zillow Human Verification`.

The control repository supplies the actual selector definitions. Candidate counters and stored controls must remain aligned with the live DOM. This guide describes active source paths; it excludes disabled actions and development routines.

For an environment check, use a known direct match, an address-format variation, a genuine no-match case, and a property with missing optional details. Inspect the requested address, selected address, AI output, and stored result together. No portal session or external callback was executed to prepare this guide.
