# User stories

> Status: agreed story by story with Benji Greig, 28 October 2026. Plane: project `CLR`. These build on [jobs-to-be-done.md](jobs-to-be-done.md), and the decisions behind them are in [decision-log.md](decision-log.md).

## How to read these stories

### Story format

Each story names who it's for, what they want and why, then links to the jobs it serves, the Plane tickets that build it and the stage of the guided flow it belongs to. That way every story can be traced from the problem through to its tests.

### Acceptance criteria

Behaviour is written as **Given / When / Then** scenarios (Gherkin). Each scenario can become an automated test almost word for word. The Gherkin isn't run directly: ordinary tests are named after each scenario, and `npm run scenarios` lists any scenario without a test ([ADR 0004](adr/0004-toolchain.md), D-040).

Requirements that aren't behaviour, such as privacy, performance and writing style, are in the [verification checklist](#verification-checklist) at the end.

### How each scenario is tested

Each story lists how it's tested, using these tags:

| Tag | What it means | Where it runs |
|---|---|---|
| `[engine]` | Unit tests on the engine package | CI on every push |
| `[property]` | Tests across many generated inputs, for rules that must always hold (contrast, hue) | CI on every push |
| `[schema]` | The rules and default configuration validate against the schema | CI on every push |
| `[component]` | Interface logic tested without a browser | CI on every push |
| `[e2e]` | Real-browser tests of the flow (Playwright) | CI on every push |
| `[a11y]` | Automated axe checks, plus a manual keyboard and VoiceOver pass before launch | CI, plus manual (CLR-36) |
| `[usability]` | Checked in the alpha sessions against the success measures | Manual (CLR-38) |
| `[content]` | Benji's review of the explainer text | Manual |

**Traceability:** every automated test is named after its story and the scenario's exact title, with an optional detail after a dash, for example `US-01: Invalid input — hue shows dashes`. A failing test then points straight back to the story, the job and the ticket.

**Definition of done for a story:** every scenario passes at its tagged level, the explainer text is approved, and the ticket links to the pull request.

### Words used in these stories

- **Project:** what colouri.st saves. It holds the palette and every choice made in it: the brand colours, the ladder, the names and naming style, the mappings, and decisions such as suggestions not applied (D-029).
- **Colour:** a name, a group and a starting value. The engine attaches no meaning to a colour's name (D-025).
- **Group:** a set of colours, such as the brand colours or the feedback colours.

## The guided flow

### US-01 · Enter my brand colours
**As an** individual designer, **I want** to enter all of my brand's colours and group them, **so that** the system is built from the whole brand, not just one colour.
**Jobs:** 1, 3 · **Plane:** CLR-22, CLR-14, CLR-18, CLR-16 · **Stage:** 1

```gherkin
Scenario: Add several brand colours
  Given I'm on the brand colours stage
  When I enter three valid hex values and name them
  Then each colour appears with its name, hex, hue, saturation and lightness
  And I can reorder, regroup or remove any of them

Scenario: Invalid input
  Given I'm entering a colour
  When I type a value that isn't a valid colour
  Then its hue, saturation and lightness show as dashes, not a guess
  And a message says what format is expected

Scenario: Similar hues flagged early
  Given I've entered two colours within the similar-hue threshold
  When the colours are checked
  Then both are flagged with a plain explanation of why they may be hard to tell apart

Scenario: Try an example
  Given I don't have brand colours to hand
  When I choose "Try an example"
  Then an invented example brand loads and I can continue through the flow
```
**Tested:** `[component]` input and validation · `[engine]` similar-hue check · `[e2e]` add, reorder, example · `[a11y]` keyboard and screen reader input

The similar-hue check here is an early warning only. The full test is the shade-by-shade distinctness check in US-05 and US-07 (D-026).

### US-02 · Shape my ladder from what my product needs
**As an** individual designer, **I want** colouri.st to build my ladder from a few easy questions about my product, with a recommendation I can understand, **so that** I get steps where my system actually uses colour, without knowing the theory first.
**Jobs:** 2, 5, 7, 10 · **Plane:** CLR-13, CLR-94, CLR-12, CLR-23, CLR-81, CLR-17 · **Stage:** 2

```gherkin
Scenario: Recommended recipe shown
  Given I've entered my brand colours
  When I reach the ladder stage
  Then one recipe is marked as recommended, with a one-sentence reason
  And I can continue with it without answering any questions

Scenario: Tell colouri.st about my product
  Given I'm on the ladder stage
  When I tick what my product will have, shown as examples rather than asked in the abstract
  Then my choices add up, and none of them has to be my only one
  And the ladder updates to match, with a reason for each change

Scenario: Every step has a reason
  Given my ladder is built
  When I look at any step
  Then I can see which zone it's in (light background, contrast or dark background) and what it's for

Scenario: One ladder for every colour
  Given my ladder is built
  When I look at the scales for my colours
  Then every colour family uses the same steps, with the same grade names

Scenario: Contrast rule holds on every recipe
  Given any recipe and any set of brand colours
  When the scales are generated
  Then no pair of steps whose grade names are 37, 50 or 64 apart falls below 3:1, 4.5:1 or 7:1 under WCAG 2, checked on exact values

Scenario: Changing my answers keeps my tokens steady
  Given I've mapped some tokens
  When I change an answer and the ladder is rebuilt
  Then each token stays at about the same contrast, because steps are named by grade
  And colouri.st lists what changed

Scenario: Brand colours placed on the ladder
  Given my scales are generated
  When I view the ladder
  Then each brand colour is shown beside the step it lands nearest, with the difference stated

Scenario: Choose my accessibility target
  Given I'm starting a project
  When I choose WCAG AA (the default) or AAA as my target
  Then the ladder's contrast zone and the contrast rule reflect that target
  And every later stage, check and export reports against it

Scenario: A colour can't reach AAA
  Given my target is AAA
  When a colour can't meet it for a use, such as a mid-tone carrying body text
  Then colouri.st says so plainly
  And it never falls back to AA without telling me
```
**Tested:** `[engine, property]` contrast rule on every recipe at AA and AAA, and one ladder for every family · `[engine]` zones and reasons per recipe, and rebuilding keeps grades · `[e2e]` recommendation, answers, placement and target choice · `[a11y]` the examples and answers by keyboard and screen reader · `[usability]` whether people can answer the questions (CLR-95) · `[content]` reasons, zone explanations and the answer for people used to even ladders

In the beta there's a small set of fixed recipes, with their ladders worked out in the rules file (D-054). Fully open answers, and tuning the ladder to the mapping, come after the beta (CLR-98). Gaps found while mapping are flagged in US-06 and US-07, with a suggestion to change an answer here (D-053).

### US-03 · Keep each colour's hue
**As an** individual designer, **I want** each colour to keep its hue from lightest to darkest, **so that** my blue stays blue and my shades don't turn muddy.
**Jobs:** 2, 3, 10 · **Plane:** CLR-14, CLR-12, CLR-24, CLR-70 · **Stage:** 3

```gherkin
Scenario: Hue held across the scale
  Given my scales are generated
  When I view the hue stage
  Then each colour shows how far its hue drifts across the usable steps
  And no colour drifts more than the threshold in the rules, unless the sRGB limit forces it, in which case that's explained

Scenario: See why it matters
  Given I'm on the hue stage
  When I turn on the comparison
  Then I see my scale beside a naive scale of the same colour, so I can see the difference

Scenario: Compare colour methods
  Given my scales are generated using the recommended method
  When I choose "Compare methods"
  Then I see my own colours built with CIE L* and OKLCH alone beside the recommended method
  And each shows its hue drift and whether the step-counting rule still holds
  And a short explanation says why we recommend our method, without changing my scales
```
**Tested:** `[engine, property]` drift within threshold · `[engine]` alternative generation and measurement · `[e2e]` comparison toggle and method comparison · `[content]` explainers

HCT in the comparison, and switching methods, are post-beta (CLR-71, D-024).

### US-04 · Keep vividness in the dark shades
**As an** individual designer with a soft or pastel brand, **I want** to control how vivid my shades are, **so that** dark shades keep the brand's character.
**Jobs:** 3, 10 · **Plane:** CLR-15, CLR-12, CLR-25 · **Stage:** 4

```gherkin
Scenario: Choose a vividness preset
  Given my scales are generated
  When I choose a vividness preset for a group
  Then that group's shades update and every other group stays the same

Scenario: The setting that matters is shown first
  Given a group's vividness is limited by its ceiling, not its recovery
  When I view the vividness controls
  Then the ceiling control is shown first, with a note that it's the one having an effect

Scenario: Small changes are made visible
  Given I adjust a setting by a small amount
  When the change is too small to see easily
  Then the measured difference is shown beside each affected step

Scenario: Vividness never changes contrast
  Given any vividness settings
  When the scales are regenerated
  Then every contrast figure is identical to before

Scenario: Say how colour should feel
  Given my scales are generated
  When I choose how colour should feel: neutral greys, greys tinted with the brand, or vivid
  Then the greys' tint and each colour family's vividness update to match
  And each colour's fill moves to the step where its hue is most vivid for that style, with the reason shown
  And no step's contrast changes
```
**Tested:** `[engine, property]` contrast unchanged · `[engine]` binding-control detection, and the fill step chosen for each hue · `[e2e]` presets and readouts · `[content]` the explanation of each style

The style question moved here from the ladder stage, because it changes chroma, not the ladder (D-055).

### US-05 · Add the rest of my palette
**As an** individual designer, **I want** to add the other colours a product needs, such as error, warning, success and info, named the way my team already works, **so that** I have full coverage and every colour stays clearly distinct.
**Jobs:** 4, 9, 14 · **Plane:** CLR-26, CLR-16, CLR-67, CLR-3 · **Stage:** 5

```gherkin
Scenario: Start from a preset
  Given I've entered my brand colours
  When I reach the "rest of your palette" stage
  Then I can pick a preset (for example error, warning, success and info) that adds named colours with starting values in their own group

Scenario: Make it my own
  Given colours have been added from a preset
  When I rename, add, remove or regroup any of them
  Then the palette updates, and nothing requires a particular name or number of colours

Scenario: Warn when shades are too close
  Given my palette's scales are generated
  When any shade of one colour is closer than the threshold to the same step of another colour, in any group
  Then both colours are flagged, showing which steps converge and by how much
  And the check also runs under simulated colour vision deficiency

Scenario: Suggest a clearer colour
  Given a colour is flagged as too close to another
  When I view the warning
  Then colouri.st suggests a hue that gives the clearest separation across all steps, and says why
  And I can accept the suggestion, reject it and keep my colour, or remove the colour altogether
  And nothing changes until I choose

Scenario: Labels chosen for legibility
  Given a solid fill of any colour in my palette
  When its label colour is chosen
  Then the label is picked by APCA, with the WCAG 2 result shown alongside
  And where the two disagree, that's pointed out

Scenario: Preview in use
  Given my palette's scales are generated
  When I view the preview
  Then I see each colour in use as badges and alerts, with tints, solid fills and labels
```
**Tested:** `[engine, property]` shade-by-shade distinctness and label choice · `[engine]` colour vision deficiency check and hue suggestion · `[e2e]` presets, editing, accept, reject and remove, and the preview · `[content]` explainers

Colour names are configuration, with presets for common frameworks (D-025). The token pattern is colouri.st's own, with a choice of case and separator. Full naming templates are post-beta (CLR-72, D-027).

### US-06 · One set of tokens for light and dark, with every state
**As an** individual designer, **I want** semantic tokens that work in light and dark mode and cover every interactive state, **so that** I don't design everything twice or invent states screen by screen.
**Jobs:** 5, 6, 14 · **Plane:** CLR-27, CLR-66, CLR-29 · **Stage:** 6

```gherkin
Scenario: Core semantic tokens in both modes
  Given my brand and feedback scales are generated
  When I reach the light and dark stage
  Then I see canvas, surface, text, border and feedback tokens for light and for dark
  And each token shows which step it points to in each mode, and why

Scenario: Interactive states
  Given an action token, such as a primary button
  When its states are generated
  Then default, hover, pressed, focus and disabled exist in light and dark
  And each meets its contrast target, except disabled, which is marked as exempt with the reason

Scenario: Focus is visible against both surface and control
  Given a focus state
  When it's checked
  Then it meets 3:1 against both the surface and the filled control
  Or the gap is reported with a suggested fix

Scenario: Preview in a sample interface
  Given my tokens are generated
  When I switch the preview between light and dark
  Then a sample interface updates using only the tokens

Scenario: Meaningful names
  Given the semantic tokens
  When I read their names
  Then they describe purpose (for example "feedback.error"), not colour (for example "red")
  And they use the colour names I chose in stage 5, in my chosen case and separator

Scenario: Unmapped tokens must be resolved
  Given a semantic token points to a colour I've removed or renamed
  When I'm on the light and dark stage
  Then the token is called out as unmapped on the page
  And I must either point it at another colour or remove the token
  And I can't move past this stage until every unmapped token is resolved

Scenario: Unused colours
  Given a colour in my palette isn't used by any semantic token
  When I'm on the light and dark stage
  Then the colour is flagged as unused
  And I can map it to one or more tokens, delete it from the palette, or leave it as it is

Scenario: Leaving an unused colour
  Given I've chosen to leave an unused colour
  When I export
  Then its full scale is included with the primitives, available for later use
```
**Tested:** `[engine, property]` contrast in both modes · `[schema]` token naming · `[component]` unmapped and unused detection · `[e2e]` preview toggle and resolving unmapped tokens · `[a11y]` preview legibility

### US-07 · Check everything before I use it
**As an** individual designer, **I want** one place that shows whether every pairing in my system is accessible and distinguishable, **so that** I can trust it before I build with it, and show others where it falls short.
**Jobs:** 7, 8, 9, 11 · **Plane:** CLR-17, CLR-30, CLR-16, CLR-67 · **Stage:** 7

```gherkin
Scenario: Every semantic pairing checked
  Given my system is generated
  When I reach the checks stage
  Then every semantic pairing shows its WCAG 2 and APCA result and whether it passes its target

Scenario: Disagreements explained
  Given a pairing where WCAG 2 and APCA disagree
  When I view it
  Then a plain explanation says why they disagree and which to trust for that use

Scenario: Failures come with a fix
  Given a check fails
  When I view the failure
  Then it suggests a fix and links to the stage where I can make it

Scenario: Distinctness across the palette
  Given my system is generated
  When the checks run
  Then any shades of different colours that are too close, at the same step, are listed with the steps and how close they are
  And the same check runs under simulated colour vision deficiency

Scenario: Failures stay failures
  Given a colour whose shades are too close to another, and whose suggested alternative wasn't applied
  When I view the checks
  Then the pairing is still marked as a failure
  And it's noted "suggestion not applied"

Scenario: Unused colours are information, not failures
  Given an unused colour I chose to leave
  When I view the checks
  Then it's listed separately as information, not as a failure

Scenario: Continuing with known issues
  Given one or more checks are still failing
  When I continue past the checks stage
  Then I'm asked to confirm, with each open issue named

Scenario: Failures travel with the output
  Given one or more checks are failing when I export
  When I export in any format
  Then every affected token carries a note in the output saying what fails, against which standard, and by how much
  And the reference sheet includes a "Known issues" section that explains each issue in plain words, including who it affects and the alternative that was suggested
  And I can export the known issues on their own as a short report for stakeholders

Scenario: Without APCA
  Given the APCA add-on is unavailable
  When the checks run
  Then WCAG 2 results are shown
  And a note explains that APCA isn't available
```
**Tested:** `[engine]` check results, distinctness and known-issue notes · `[e2e]` fix links, confirmation and fallback · `[content]` disagreement explanations and known-issues wording · `[a11y]` results don't rely on colour alone

Outputs state only what's measured and what was suggested. They never say colours were "kept by choice", because the person may have been handed them (D-031).

### US-08 · Take my system into design and code
**As an** individual designer, **I want** to export my system for Figma, for code and as a shareable reference, **so that** design and code stay in step and everyone has the same source.
**Jobs:** 12, 13, 16 · **Plane:** CLR-31, CLR-32, CLR-33, CLR-34, CLR-68 · **Stage:** 8

```gherkin
Scenario: Design tokens JSON
  Given my system is complete
  When I export design tokens
  Then I get a W3C design tokens file with primitives and semantic tokens for both modes
  And it validates against the specification
  And it imports into a Figma tokens plugin without errors

Scenario: CSS variables
  Given my system is complete
  When I export CSS
  Then I get CSS variables (custom properties) for primitives and semantic tokens
  And dark mode works from the system setting and from a data attribute

Scenario: Choose the colour format
  Given I'm exporting CSS
  When I view the format options
  Then hex is recommended by default, with a one-line reason
  And I can choose rgb(), hsl() or oklch() instead, each with a note on when it's the right choice
  And oklch() can include hex fallbacks for older browsers
  And every value in the export uses the chosen format

Scenario: My names in every export
  Given I've renamed colours and chosen a case and separator
  When I export in any format
  Then every token uses my colour names, case and separator

Scenario: Reference sheet
  Given my system is complete
  When I export the reference sheet
  Then I get one HTML file with every colour, name, value and contrast figure
  And it prints cleanly to A4 PDF

Scenario: Brand fidelity report
  Given my system is complete
  When I open the reference sheet
  Then a section shows each brand colour, the step it lands nearest, and how close it stays, in plain words

Scenario: Known issues in every export
  Given one or more checks are failing when I export
  When I export in any format
  Then every affected token carries a note saying what fails, against which standard, and by how much
  And the reference sheet includes a "Known issues" section in plain words, including who it affects and the alternative that was suggested
  And I can export the known issues on their own as a short report

Scenario: Unused colours included
  Given my palette has colours that no semantic token uses
  When I export
  Then their full scales are included with the primitives

Scenario: One source for every export
  Given the same system
  When I export in every format
  Then every value and note matches across formats
```
**Tested:** `[engine]` adapters, names, formats, notes and cross-format match · `[schema]` design tokens validation · `[e2e]` download and print · Figma import checked manually · `[content]` how-to text and the known-issues wording

Display P3 and wide-gamut colour are post-beta (CLR-74, D-032).

## Across the flow

### US-09 · Come back to my projects
**As an** individual designer, **I want** my projects kept in my browser, **so that** I can close the tab and carry on later without an account.
**Jobs:** 15 · **Plane:** CLR-21, CLR-20

```gherkin
Scenario: Work survives a reload
  Given I've made changes to a project
  When I reload or reopen colouri.st in the same browser
  Then the project and the stage I was on are restored

Scenario: Several projects
  Given I have more than one project saved
  When I open my projects
  Then I see each one's name and when I last opened it
  And I can open, create, rename, duplicate or delete any of them

Scenario: Storage unavailable
  Given my browser blocks local storage, for example in private browsing
  When I use colouri.st
  Then everything still works for the session
  And a message explains that work won't be saved, and suggests sharing a link or exporting instead

Scenario: Storage running low
  Given my saved projects are close to the browser's storage limit
  When I save
  Then I'm warned before anything fails, and offered ways to free space, such as exporting or deleting old projects

Scenario: Rules change between versions
  Given I saved a project with an earlier version of colouri.st
  When I open it after an update
  Then it loads, and anything that changed is explained
```
**Tested:** `[component]` save, restore, index and versioned migration · `[e2e]` reload, several projects and private browsing

Storage is designed for several projects from day one: a small index plus one versioned record per project, behind its own interface. The same project format is used for storage, share links, project files and AI tools (D-029).

### US-10 · Share my project with a link
**As a** designer in a small team, **I want** to share my project as a link, **so that** a colleague, client or brand team can see exactly what I see, with no account and no server.
**Jobs:** 11, 12, 16 · **Plane:** CLR-35, CLR-75

```gherkin
Scenario: Create a link
  Given I have a project open
  When I choose "Copy link"
  Then a link containing the whole project is copied

Scenario: Know what a link shares
  Given I'm copying a link
  When the link is created
  Then a short note says that anyone with the link can see the project

Scenario: Open a link
  Given someone sends me a colouri.st link
  When I open it
  Then I see their project exactly as they had it
  And I can save my own copy without changing theirs

Scenario: Old or damaged links
  Given a link from an earlier version, or one that's been cut short
  When I open it
  Then an earlier version loads correctly, or a damaged link shows a clear message instead of a broken project

Scenario: Warn before a link gets too long
  Given my project is approaching the size that can be shared reliably by link
  When I view the share option
  Then I see a warning that the link may not work in some apps, before I copy it

Scenario: Too big for a link
  Given my project is too large to share reliably by link
  When I choose to share it
  Then I'm told why, and offered a project file to download and send instead

Scenario: Open a project file
  Given someone sends me a colouri.st project file
  When I open it in colouri.st
  Then the project loads exactly as they had it, and I can save my own copy

Scenario: Opening a shared link on a phone
  Given someone has shared a project link
  When I open it on a screen narrower than a tablet
  Then I see the project as a read-only report: every colour and shade, the semantic tokens in light and dark, the checks, and the reasoning behind each choice
  And I can't edit the project
  And I'm told that editing works on a tablet or computer for now, because we're making the first version solid where it's used most, and that phones come next

Scenario: Visiting colouri.st on a phone
  Given I go to colouri.st on a phone without a shared link
  When the page loads
  Then I see the same message about phones
  And I can view a read-only example report built from an invented brand
```
**Tested:** `[component]` encode, decode and versioning · `[e2e]` round trip through a link, project file, and the phone report · `[a11y]` the phone report

Links store only the inputs needed to recreate the project, in the part of the URL after the #, so they never reach a server. The pipeline and the size threshold come from the spike (CLR-75). Phone editing is CLR-77 (D-033).

### US-11 · Learn the theory as I go
**As an** individual designer, **I want** each stage to explain what's happening and why, in plain words, **so that** I understand my project well enough to adjust and/or defend it.
**Jobs:** 10, 11 · **Plane:** CLR-28, CLR-37, CLR-7, CLR-20

```gherkin
Scenario: Every stage explains itself
  Given I'm on any stage of the guided flow
  When I view the stage
  Then a short explanation says what this stage does and why it matters
  And any colour science term is defined the first time it appears

Scenario: Recommendations come with reasons
  Given colouri.st recommends a setting
  When I view the recommendation
  Then the reason is shown beside it, drawn from the same rule the engine uses

Scenario: Full guidance the first time
  Given I haven't seen a stage before in this browser
  When I reach it
  Then its full explanation is shown

Scenario: Lighter guidance once I know it
  Given I've seen a stage's explanation recently
  When I reach that stage again
  Then the explanation is collapsed to one line, and I can open it

Scenario: Full guidance again after a long gap
  Given I last saw a stage's explanation more than three months ago
  When I reach that stage again
  Then its full explanation is shown again

Scenario: Skip guidance when I already know the tool
  Given I'm starting colouri.st on a browser that hasn't seen me before
  When I choose "I know colouri.st, keep guidance short"
  Then every stage shows its one-line explanation, which I can still open
  And the choice is remembered in this browser if storage is available, or for this session if it isn't

Scenario: I'm in control
  Given any stage
  When I choose to show or hide its explanation, or reset all guidance
  Then colouri.st remembers my choice in this browser

Scenario: Go deeper, with my own colours
  Given I want more detail than the short explanation
  When I choose "Learn more"
  Then I see a fuller explanation with an example built from my own colours, without leaving the stage
  And where my colours don't show the point, a clearly labelled example colour is used instead
```
**Tested:** `[schema]` every rule has a rationale and an example template · `[component]` guidance memory and expiry · `[content]` review of every explainer · `[usability]` teach-back in the alpha sessions

Guidance memory is kept per browser, not per project, and never leaves the browser. The three-month gap is a setting in the rules. Explainers are drafted in two passes: skeletons early, final copy once their dependencies are settled (D-034).

### US-12 · Let my AI tools work with the same method
**As** someone working with AI tools, **I want** colouri.st's method, exports and projects available in a form my AI assistant can read, **so that** it explains and reasons about colour the same way the tool does.
**Jobs:** 14, 15 · **Plane:** CLR-60

```gherkin
Scenario: Method readable by AI tools
  Given an AI assistant is pointed at colouri.st
  When it reads llms.txt
  Then it finds plain-text descriptions of the method, the rules and the token format

Scenario: Exports explain themselves
  Given an AI assistant is given a colouri.st export
  When it reads the file
  Then it can tell which tokens are primitives, which are semantic, and how light and dark mode work

Scenario: Known issues readable by AI tools
  Given an AI assistant is given an export with known issues
  When it reads the file
  Then it can tell which tokens fail which checks, and warn before using them

Scenario: Project files readable by AI tools
  Given an AI assistant is given a colouri.st project file
  When it reads the file
  Then it can explain the project and what was changed from the defaults

Scenario: Same reasoning as the tool
  Given the agent skill file and a set of brand colours
  When an AI assistant explains how the method would treat them
  Then its explanation of the ladder, contrast rule and naming matches colouri.st's own
```
**Tested:** `[schema]` llms.txt and skill file generated from the rules · manual check with at least two AI assistants

With these files alone, an AI assistant can explain and reason about the method. Reliably calculating the same colours needs the MCP server, which is a fast follow (CLR-61).

### US-13 · Tell colouri.st what I think, and what I want next
**As** anyone using colouri.st, **I want** an easy way to give feedback and to suggest or vote on features, **so that** I can help shape what gets built.
**Jobs:** none (supports the success measures) · **Plane:** CLR-63, CLR-73, CLR-76

```gherkin
Scenario: Feedback from anywhere
  Given I'm on any page
  When I choose "Send feedback"
  Then I can use GitHub Discussions, or a simple form if I don't use GitHub

Scenario: Suggest a feature without GitHub
  Given I'm using the feedback form
  When I choose "Suggest a feature"
  Then I can describe the feature and send it

Scenario: My project stays private unless I choose
  Given I'm sending feedback
  When I view the form
  Then "Include my project link" is offered, and off by default
  And nothing about my project is sent unless I turn it on

Scenario: Suggest and vote on features
  Given I have GitHub and a feature in mind
  When I open "Feature requests" in GitHub Discussions
  Then I can suggest it, or upvote an existing request, including items already on the backlog

Scenario: One optional question after export (open, see CLR-76)
  Given I've just exported a project for the first time
  When the export completes
  Then I'm asked one optional question about my understanding of the project
  And nothing is sent unless I choose to answer
  And I'm not asked again for that project once I've answered or dismissed it
```
**Tested:** `[e2e]` feedback links, the form's opt-in and the optional question · manual check of the Discussions set-up

The post-export question itself, including whether it's the right way to measure understanding, is still to be designed with Benji (CLR-76). Suggestions sent through the form are moved into Discussions by hand (D-028).

## Verification checklist

Requirements that aren't behaviour. Each is tagged with how it's checked.

**Privacy**
- [ ] No analytics, tracking scripts or cookies anywhere in the app `[e2e: network audit]`
- [ ] Brand colours never leave the browser, except in a link or project file the person chooses to share, or feedback they choose to attach a project link to `[e2e: network audit]`
- [ ] Share links keep project data in the part of the URL after the # (the fragment), so it never reaches a server `[component]`
- [ ] The privacy position is stated plainly on the site `[content]`

**Accessibility of colouri.st itself**
- [ ] Meets WCAG 2.1 AA throughout `[a11y]`
- [ ] Every stage can be completed by keyboard alone `[a11y: manual]`
- [ ] Works with VoiceOver on macOS and iOS `[a11y: manual]`
- [ ] Colour is never the only way information is shown; every swatch has its value as text `[a11y]`
- [ ] Respects reduced motion settings `[a11y]`

**The interface's own colours**
- [ ] The interface is predominantly black, white and grey, so it doesn't skew how people judge their own colours `[component]`
- [ ] Colour is used only for the person's palette and previews, and for error, warning and success states, which always pair colour with an icon and words (WCAG 1.4.1) `[a11y]`
- [ ] Every interface colour comes from tokens generated by the colouri.st engine, with no hard-coded colours (CLR-83) `[code review]`

**Truth in outputs**
- [ ] Every failing check that reaches an output is noted on the affected token, and in the reference sheet's known issues `[engine]`
- [ ] Outputs state only what's measured and what was suggested, never whose choice it was `[content]`

**Performance**
- [ ] First load under 2 seconds on a typical home connection `[e2e: Lighthouse]`
- [ ] Changing a setting regenerates the project in under 200 ms, and never takes longer than 500 ms, tested on a mid-range laptop with the largest recipe ladder and 15 colours `[engine: benchmark]`
- [ ] A typical shared link shows its report or editor within 2 seconds on a mid-range phone over 4G `[e2e]`
- [ ] If loading takes longer, a loading state says what's happening, never a blank page `[e2e]`
- [ ] A broken, too long or unmigratable link shows a clear message explaining why, and suggests a project file instead `[e2e]`

**Compatibility**
- [ ] Works in the current and previous major versions of Chrome, Safari, Firefox and Edge `[e2e]`
- [ ] At phone width, shared projects open as a read-only report that meets WCAG 2.1 AA, including reflow at 320 CSS pixels `[e2e, a11y]`
- [ ] Stage layouts are built mobile-friendly, so full phone support (CLR-77) is an extension rather than a rework `[code review]`

**Writing and language**
- [ ] Australian English and plain language by default, with terms defined at first use `[content]`
- [ ] Every interface string and explainer lives in a language file, not in code (CLR-78) `[code review]`
- [ ] "color" is used everywhere in code, tokens and exports; "colour" is the Australian English localisation of what people read (D-035) `[code review]`

**Engineering**
- [ ] Every public engine function has a docstring and full types `[CI]`
- [ ] Visual design, logic and configuration kept in separate layers `[code review]`
- [ ] README, problem statement, jobs, stories and decision log kept current `[definition of done]`
