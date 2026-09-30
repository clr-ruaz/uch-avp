# Redfin desktop process

[RPA overview](../desktop-automation.md) · [CoStar](costar.md) · [Zillow](zillow.md) · [Redfin](redfin.md) · [Realtor.com](realtor.md)

Collect the available Redfin estimate, public property details, and page URL; process them with the configured Redfin Details prompt; and update the queue.

## Source and entry conditions

The [desktop XML definition](../../src/powerplatform/ProjectAVP/src/Workflows/UCH-AVPAutomatedValuationDesktopFlow-2E6975E7-8C20-4F15-9FEC-AC412E9A55DD.json.data.xml) stores the script in `<Definition>`. The following locations are **decoded script** lines, not XML file lines; see [inspection instructions](../desktop-automation.md#inspecting-the-script).

| Subflow | Decoded starting line | Role |
| --- | --- | --- |
| `Redfin: Initialize Web App` | 1664 | Initialize the portal browser state. |
| `Redfin: Extract Valuation` | 1738 | Search, match, extract, and request AI processing. |

The validation cloud flow's false branch reaches Redfin only after the Zillow scope succeeds. It fetches the Redfin queue and calls the desktop flow only when that queue is nonempty, with source label `Redfin`. 

Shared queue validation requires the item's ID/Title for tracking and checks Address, City, State, Zip, and Property Type. The accepted residential report codes are **CND, OTH, RES, SFR, UNK**. Unsupported types, missing details, or a CoStar-only type in this source queue produce a skip reason. See the [routing table](../desktop-automation.md#property-validation-and-routing).

The portal URL, queue, notification settings, exception tracker, and helper callbacks must be configured. The shared browser variable is named `objWebApp_CoStar_Instance` even in this Redfin path.

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
    Prompt --> Update[Update queue: Processed]
    Skip --> NoMatch[Update queue: No Match]
```

The search-specific behavior when no suggestions exist is explained below. Runtime errors follow shared retry/failure handling rather than the no-match branch.

## 1. Initialize the portal

1. Clear the subflow status. If no tracked browser exists, launch Edge at `strWebApp_Redfin_BaseUrl`, retaining cache and cookies. Otherwise navigate the tracked instance to that URL.
2. Launch/navigation actions use `ON ERROR REPEAT 3 TIMES WAIT 10`.
3. If the stored Edge Restore control appears, click it; its handler repeats three times with five-second waits on errors. Call the shared wait helper.
4. Run the conditional security-control branch described below.
5. Set the subflow status to `Done`; orchestration proceeds to the queue item.

### Initialization verification branch

The initializer also checks for a stored human-verification control. If present, the existing implementation reads the challenge instructions, captures its canvas, retrieves the externally stored **Redfin Human Verification** prompt, and calls the image-analysis helper. It uses the helper response to interact with the challenge, submits it, and waits up to 30 seconds for the normal Search field.

This documents an existing branch, not evidence that it works with current challenges. The helper request loop is indexed 0–3, waits 60 seconds between unsuccessful responses, and reports failure on its final unsuccessful response. Prompt contents and actual responses are external to this export. The branch runs in initialization; the extraction subflow does not repeat it after every later navigation.

## 2. Open search and enter the address

1. Reset the subflow status and skip reason, move the pointer to (200, 200), and navigate to `strWebApp_Redfin_BaseUrl`.
2. Wait up to **60 seconds** for `Redfin 'Search' Field`.
3. Start an address-entry loop with up to **three** iterations. Enter `Address, City, State ZIP` with the physical keyboard action and read the field back.
4. The read-back condition combines street-prefix, city/state containment, and ZIP-suffix checks inside the exported `Contains(..., True, True)` expression. Runtime behavior of that expression remains unverified.
5. Wait up to **60 seconds** for Search Match once the entry check passes. Suppress that wait's error and clear the last error.
6. Reset the candidate counter/list. If `Redfin 'Search' Matched Addresses` is absent, immediately go to the no-match branch.
7. Otherwise inspect the indexed Search Match controls.

## 3. Choose a search result

1. Read the current suggestion's Own Text. A direct suggestion must start with the street address, contain the city, and end with the state. Unlike the typed query and final property-page check, this direct suggestion comparison does not require ZIP.
2. For a rejected suggestion, append its counter value and address to `aryPossibleMatches`, increment the counter, and inspect the next indexed control.
3. If direct matching exhausts the suggestions but candidates exist, call `Flow: OpenAI Request` with the embedded address-matching system message, full requested address, and collected candidates.
4. The prompt requests a candidate ID, or -1 for no match. The script accepts a response `>= 0` and assigns it to `intListCounter`; it does not independently demonstrate that the response is a valid in-range index.
5. For an AI-selected suggestion, read its address, split on the comma, trim the first part, and save it as `strManualAddress`. Click the selected suggestion and continue to the property-page check.
6. A negative AI result goes to `No Match Report`.
7. If no direct match is selected and there are no accumulated candidates, go to the no-match branch. There is no Zillow-style Submit Search fallback in this function.
8. If the address cannot pass the search field's read-back check after the third attempt, set `Fail` with an address-entry error and return.

The embedded matching prompt allows formatting/abbreviation variations and asks the model to reject different street numbers or names. This is an instruction to the model, not a guarantee of match accuracy.

## 4. Verify the opened property

1. Wait up to **30 seconds** for the portal's Home Address control. The wait error is suppressed so the next presence check decides the path.
2. If the address control is absent, go to no match.
3. Read its Own Text. The displayed address must contain the street address, city, and state and end with ZIP. The street test uses `Contains`, whereas Zillow and Realtor use `StartsWith` at this stage.
4. If the direct check fails, send that single displayed address as candidate ID 0 through the address-matching helper.
5. A nonnegative response allows extraction; a negative response goes to no match.
6. The no-match branch sets the subflow to `Done` **with a skip reason**, annotates the current step with `(No Matching Address)`, and returns. Orchestration sees the skip reason and calls shared skip handling. `Done` here does not mean the property was successfully valued.

## 5. Extract the available fields

| Value | UI source | Behavior |
| --- | --- | --- |
| Estimate text | `Redfin Property 'Estimate'` | Read Own Text only when present; read errors are suppressed. |
| Public property details | `Redfin Property 'Public' Section` | Read Own Text only when present; read errors are suppressed. |
| Page URL | Browser URL address | Read after the optional fields. |

1. Clear `strSfr_PropertyEstimate`, `strSfr_PropertyDetails`, and `strSfr_PropertyUrl`.
2. Read the estimate and public section independently when their controls exist. A missing estimate does not itself set a skip reason.
3. Read the current page URL and append `Redfin URL: <value>` and `Redfin Estimate: <value>` to the details text.

Missing optional text fields can remain empty without setting a skip reason. The next step may still run using the remaining text and URL.

## 6. Process the extracted information

1. Pass `strSfr_PropertyDetails` through a PowerShell JSON-escaping operation with a ten-second script timeout.
2. Replace remaining double-quote characters with single quotes as implemented in the desktop script.
3. Set `strLlm_PromptTitle = Redfin Details` and call `Flow: Get LLM Prompt`. The helper requests a prompt by Title and reads its `Prompt` field.
4. Build the OpenAI request using the fetched prompt as System Message and the extracted/escaped text as User Message.
5. Call `Flow: OpenAI Request`.
6. If `strOpenAIResponse` is nonempty, add it to `strQueueItem_UpdateNotes` under `Redfin Details`. The response is inserted as a JSON value rather than wrapped as a quoted string.
7. Mark the extraction subflow `Done`.

The actual details prompt and its expected result schema are stored outside this export. The code does not enforce a nonempty AI response before setting `Done`; valid structure and business completeness should be checked through the helper output and receiving flow.

## 7. Persist the result and continue

1. If extraction returns `Done` with no skip reason, orchestration assigns **Processed**.
2. Call `Flow: Update Status`. It sends `ID`, `Status`, `Source`, `Notes`, and `URL` to the queue-update callback. Notes include Title, Manual Address, and the detail result when populated.
3. The page URL is included in the text sent to AI. The outer update payload's `URL` field comes from the shared `strQueueItem_Filename` variable; this extraction routine does not directly assign the captured page URL to that variable.
4. Require HTTP 200 from the update helper. Only then remove the first item from the local queue and clear the shared item state.
5. Continue to the next queue item, or wrap up when the queue is empty. After a reported item failure and successful status update, orchestration restarts browser preparation.

The active Redfin extraction path sends structured notes through the queue helper. It does not call the report-upload state on its successful route.

## Outcomes and troubleshooting

| Condition | Result in the desktop flow | What to inspect |
| --- | --- | --- |
| Invalid/mismatched input | `Skipped` via shared queue validation | Required fields, report-type/source mapping. |
| Search text cannot be entered/verified | Subflow failure and retry handling | Search selector, keyboard focus, read-back expression. |
| Candidate or opened address rejected | `No Match`, with support notification | Actual displayed address, candidates, AI matching response. |
| Optional property text is missing | Extraction may continue | Available controls and the text supplied to the details prompt. |
| AI details response is empty | No detail key added; subflow can still finish | Prompt retrieval and OpenAI response; status alone is insufficient evidence. |
| Successful extraction path | `Processed` | Result detail key, source, and receiving cloud-flow behavior. |
| Initialization security-control failure | Initializer returns failure | Image-analysis/helper availability, response shape, and whether the normal Search field becomes available. |
| Terminal item error | Notify support, mark `Failed`, update, and request browser restart | Exception tracker, error text, screenshots when attached. |
| Terminal queue-update error | Alert and wrap up | Callback response; the item was not removed from the local queue. |

The shared attempt counter has a configured limit of 3, while individual UI/HTTP actions can have additional retries. See [shared retry behavior](../desktop-automation.md#retries-and-failure-recovery) before interpreting attempt counts.

## Selector and verification notes

Principal stored control labels: `Redfin 'Search' Field`, `Redfin 'Search' Matched Addresses`, `Redfin 'Search' Match`, `Redfin 'Home Address'`, `Redfin Property 'Estimate'`, and `Redfin Property 'Public' Section`.

The control repository supplies the actual selector definitions. Candidate counters and stored controls must remain aligned with the live DOM. This guide describes active source paths; it excludes disabled actions and development routines.

For an environment check, use a known direct match, an address-format variation, a genuine no-match case, and a property with missing optional details. Inspect the requested address, selected address, AI output, and stored result together. No portal session or external callback was executed to prepare this guide.
