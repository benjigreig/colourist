# Component anatomy: a reference for the test pattern

> Researched 30 and 31 October 2026 for CLR-94, as part of the brief for the modelled interface examples, which Benji is designing. Scripts and outputs: [`component-anatomy/`](component-anatomy/). The full breakdown of every component is in [`component-anatomy/components.md`](component-anatomy/components.md). Related: [`colour-relationships.md`](colour-relationships.md) (D-052's test pattern), [`ladder-zones.md`](ladder-zones.md) (D-055's questions), [`recipe-ladders.md`](recipe-ladders.md).

## What the brief has settled so far

Agreed with Benji on 31 October:

- **The job:** each modelled example does two things:
  - recognition: "my product has that"
  - consequence: "this is what ticking it does to my colours"
- **The form:** one abstract test pattern, like a television test card, rather than real components. It's there to give a feel for the relationships between colours. Its versions add or remove parts as choices are ticked.
- **The parts:** just enough shape to recognise each kind of thing:
  - a small round button, something button-like, an icon, text and a paragraph of placeholder text
  - a card with a border
  - selected and unselected states
  - status as coloured text and as a badge or tag
  - tables as a grid of borders
  - focus that starts on one element and can move between them
- **Themes:** a dark theme shows a duplicate of the pattern beside the light one. When there isn't room, down to 320 CSS pixels (WCAG 1.4.10), they stack.
- **Colours:** the person's own, getting more refined as they go through the stages.
  - At the ladder stage the default view is the ladder itself: their colour families on the recipe's ladder.
  - A switch shows the test pattern with those ladders applied.
- **States:** shown first, with a way to step through them (rest, hover, pressed, selected, focused), and an interactive mode on request. In interactive mode the pattern is a single stop in the tab order, and arrow keys move within it.
- **At the mapping stage:** the same pattern again, or a more refined one that's clearly related.

## The question: what is "enough"?

Benji's direction: cover enough of what common components contain, including a notification with a feedback-coloured border, a toast, and a modal or overlay, without drawing every component.

**The rule agreed:** the pattern shows **every relationship the common components contain at least once**, not every component.

## Which components are common

From The Component Gallery (Iain Bean), which indexes 60 kinds of component across 95 public design systems, including 20 of our 27. Its counts are examples, not systems: badge has 123 across 95, so some systems have several.

The 27 kinds with 40 or more examples:
- badge, button, alert, accordion
- radio button, checkbox, select, text input, textarea, date picker
- modal, popover, dropdown menu, tooltip, toast
- tabs, navigation, breadcrumbs, pagination, link
- card, table, list
- spinner, toggle, progress bar, icon

Grouped by colour anatomy, 11 forms cover all 27, plus 52 of the 60 kinds overall and 95% of the examples. The kinds left over are avatars, images, video, heroes and file chips, which are about media rather than colour relationships. "Visually hidden" and stacks have no colour at all.

## The breakdown

[`anatomy.mjs`](component-anatomy/anatomy.mjs) breaks each common component into parts. Each part has:
- **an element:** text, small text, large text, icon, boundary, fill, surface or indicator
- **what it sits on:** the page, a surface, the overlay, a tint, a fill, the inverse surface or the scrim
- **the relationship it needs:** legibility, separation, signifier, emphasis, state or distinctness
- **the use it draws on,** and **its states**

For example, a notification (alert) breaks down like this:

| Part | Element | On | Relationship | Use |
|---|---|---|---|---|
| The message area | surface | page | separation | tint |
| Its coloured border or edge bar | boundary | tint | emphasis | tint border |
| The status icon | icon | tint | legibility | accent icon on tint |
| The title and body | large text, text | tint | legibility | text on tint |
| The close button | icon | tint | legibility, with hover and focus | text |
| Across error, warning, success and info | surface | surface | distinctness | the feedback set |

Every component is in [`components.md`](component-anatomy/components.md).

## Coverage

Across the 27 components there are **83 distinct relationships**, counting states.

**With the 11 forms alone, 51 of the 83 are covered.** The 32 gaps were mostly the same small parts on a different background:
- text, with hover, focus and expanded, on a card
- a heading, an icon and a filled button, with states, inside an overlay, as in a modal
- a heading, small text and a close button's states on a tint, as in a notification
- an icon and a link's states on an inverse chip, as in a toast

A few were new kinds: a scrim behind a modal, disabled text, an expanded state, and an outlined button's pressed state.

**What closes them:** a small cluster of parts repeated on each background. That's the "surround" dimension of D-052's test pattern. With the clusters, and a scrim under the overlay, **all 83 are covered** ([`anatomy.txt`](component-anatomy/anatomy.txt)).

**What the components need on each background,** which is the content of each cluster:

| Background | Parts needed | What |
|---|---|---|
| Page | 30 | Everything the forms show: text, links, fields, buttons, selection, status, track and fill |
| Overlay (menus, modals, popovers) | 19 | A heading, text and an icon; a filled button and a quiet button with their states; a selected row; a border; an emphasis ring (such as a date picker's today) |
| Card or surface | 13 | Text and muted text, with hover, focus and expanded; an icon; dividers; hovered and selected rows |
| Tint (notifications) | 8 | A heading, text, small text and an icon; a close button's hover and focus; a coloured border; a subtle badge |
| Inverse (tooltips, toasts) | 5 | Text, small text and an icon; a link's hover and focus |
| Scrim | 1 | The overlay standing apart from the dimmed page |
| On a fill, or on text | 7 | A label and icon on a fill; a thumb on its track; the feedback set; a link against body text; selected against unselected labels |

The script's generic cluster contains more than each background needs. The table above is the trimmed version, and the shapes and composition are Benji's.

## For the relationship model (CLR-27)

Four relationships that common components rely on aren't yet in the rules' list of uses:
- **The inverse surface:** a dark chip on a light page, and the reverse, for tooltips and toasts (115 examples between them). In ladders with both themes, the steps already exist: light text is the dark surface. What's missing is the relationship.
- **Track and thumb:** a toggle's or slider's thumb against its track, and the fill against the track. These need 3:1 where they convey state (WCAG 1.4.11).
- **The scrim:** a modal's overlay standing apart from the dimmed page.
- **A link against body text:** a link must be distinguishable from the text around it by more than colour alone, or by 3:1 against it (WCAG 1.4.1).

## Limits

- The breakdown is a judgement, drawn from common practice, not measured from each system. A system's own component may use different parts.
- The Gallery's counts are examples, not a census of systems, and 7 of our 27 aren't in it.
- Relationships are counted by element and background. Sizes, such as small against large text, are only partly separated.

## Files

| File | What it does |
|---|---|
| [`component-anatomy/anatomy.mjs`](component-anatomy/anatomy.mjs) | The components' parts and the pattern's forms as data. De-duplicates the relationships, checks coverage, and lists what each background needs. Output in `anatomy.txt` |
| [`component-anatomy/components.md`](component-anatomy/components.md) | The breakdown of every component, generated by the script |

## Sources

- Bean, I. [The Component Gallery](https://component.gallery/components/): 60 kinds of component across 95 design systems.
- W3C. *Understanding WCAG 2.2*: [1.4.1 Use of Color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html), [1.4.10 Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html), [1.4.11 Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html).
