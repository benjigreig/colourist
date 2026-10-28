# Problem statement

> Status: approved by Benji Greig, 28 October 2026. Plane: CLR-2.

## Who has the problem

Individual designers, and designers in small teams, who need to turn a brand's colours into a colour system for a product. Usually they have no colour specialist or design system team to lean on. Developers, founders and others who end up making these choices without a design background have the same problem, with even less to go on.

They're also short on time. Getting quality output under real deadlines is hard, so people sensibly focus on the parts that matter most to them right now. With colour, that often means a few key colours are made accessible and the rest are left for later: the primary button works, but the borders, tints, secondary text and dark mode never get the same care. Deliveroo's team found the same after their rebrand, when "only a few colours met level AA accessibility standards" ([Deliveroo Design](https://medium.com/deliveroo-design/brightening-up-accessibility-with-a-new-colour-system-5921915641ed)).

More and more, the code side is handled with AI tools, and capable designers are already finding ways to store their colours as tokens for those tools to use. What's usually missing is the method behind the values. Without a grounding in colour theory, there's no consistent way to reproduce or extend the palette. When the brand changes or a new colour is needed, it's worked out again from scratch.

## The problem

Brand colours are chosen for feel: how a brand should come across on a logo, a campaign or a shopfront. They're rarely considered with the depth an interface needs, so they have to be translated and interpreted before a product can use them.

An interface needs more than the brand colours themselves. It needs the relationships between them:

- **Between the shades of one colour**, so each step is a predictable distance from the next.
- **Between colours**, so the same step means the same lightness in every colour, and colours stay distinguishable in their darkest and lightest shades.
- **Between foreground and background**, so text, icons and borders meet contrast requirements wherever they're used.
- **Between light and dark mode**, so one set of tokens works in both.
- **Between brand and feedback colours**, so an error or a warning never looks like branding.

Accessibility is usually the last of these to be considered. Colours get chosen, applied, then audited, and failures are patched one screen at a time. The result is the most common accessibility failure on the web. Low-contrast text appears on 83.9% of the top million home pages ([WebAIM Million, 2026](https://webaim.org/projects/million/)), and only around 30% of sites meet minimum text contrast ([HTTP Archive Web Almanac, 2025](https://almanac.httparchive.org/en/2025/accessibility)). It affects a lot of people: at least 2.2 billion have a vision impairment ([WHO World report on vision, 2019](https://www.who.int/publications/i/item/9789241516570)).

## Why existing tools don't solve it

Most free generators start from a single colour and apply one fixed method, often modelled on Tailwind's. That works for strong, saturated colours, but struggles with soft or pastel brands. The tools that handle a full brand palette well are either commercial or built for experts. Almost none of them explain why they made the choices they did, so the designer gets an answer they can't judge, adjust or defend.

## What we're doing about it

colouri.st is a free, open-source guided tool. It takes anyone working with a brand's colours, designer or not, from those colours to a robust, accessible colour system. It explains the colour theory at each step, and hands over tokens that are easy to use in both design and code.

- **Accessibility is the starting point, not a final check.** It's built into how every shade is made, so meeting contrast is a property of the system, not something you have to remember to verify.
- **The method is the product, not just the values.** The same method is available through a visual guided flow, and through a natural language interface for AI tools: LLM-readable docs at launch, and an MCP server soon after.
- **Private by design.** colouri.st runs entirely in your browser. Your brand colours never leave it, and there's no tracking.

## What success looks like for the beta

| Measure | How we'll know | Target |
|---|---|---|
| Designers complete the flow unaided | Alpha usability sessions | 4 of 5 go from brand colours to export without help |
| Benji uses it on a real project | A short log of where it helped and hindered | One real palette within two weeks of launch |
| People find and try it | Early-access sign-ups, feedback responses, GitHub stars and repo traffic | 50 sign-ups before launch; 20 feedback responses in the first month |
| People understand why their palette works | Teach-back in sessions; optional question after export | Most can explain the step-distance rule; 70% agree "I understand why my palette works" |

The full evidence base for the accessibility claims is being gathered in CLR-59.
