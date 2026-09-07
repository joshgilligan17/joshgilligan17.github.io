# Design direction

## Navigation refinement

Global navigation remains a horizontal, right-aligned row on the homepage, About, blog index and individual posts. The journal's left margin now contains a newest-first post index with dates and the current post indicated. The main blog area previews the latest published post; the empty index says "No posts yet" until content is added. The paired-loop motif remains in the journal header. On smaller screens the post index wraps above the reading area.

## Selected pairing: Thread homepage + Aside journal

Thread is now the homepage, with the comparison bar hidden there. The blog index and individual posts use Aside's paired-loop mark and narrow navigation margin, with the same navy palette, serif type and fine line weight as Thread. The SVG loop mark is shared with the Aside preview. Journal navigation becomes a horizontal row above the content on small screens. Existing variation URLs remain available for reference.

## Personal variations

The accepted sparse homepage remains at `/`. Three variations explore an identity independent of the reference site's illustration-above-title composition. `/personal-1/` puts the original line study beside a compact introduction and italic surname; `/personal-2/` integrates a two-line abstract crossing as a horizontal rule between prose and right-aligned navigation; `/personal-3/` pairs a small two-line name with overlapping ellipse geometry, then places the links beside the prose. All use navy on white and native fonts, contain identical introductory copy, and have no animation. The comparison links appear below the studies, never on the accepted homepage.

## Personal homepage — aesthetic reference: gloria.ma

The reference was viewed directly in the browser: a small introduction on an open page, simple underlined navigation, and one distinctive drawing. The new homepage follows that sparse composition while retaining the user's serif preference, navy-on-white palette and scientific subject. The abstract blue line study is original SVG geometry, not copied imagery or a literal molecular diagram. There is no animation or audio.

The homepage now contains a compact name, a one-sentence introduction and four text links. The biography and existing portrait live at `/about/`; blog and post templates share the quiet styling. Previous layout studies remain at `/layout-a/` through `/layout-f/`, outside the homepage navigation. No design-comparison toolbar is shown on the new homepage.

## Higher-entropy studies — seed 263660

The next seeded shuffle selected D (staggered field), E (bottom-anchored identity), and F (split page). D scatters the heading, small tilted photograph, biography, navigation and subject note across a 12-column field without overlapping text. E begins with two unequal text columns, staggers the second paragraph, and anchors the small identity and navigation to the lower edge in normal document flow. F divides the page into a white face and a navy face, with current work on one and previous work on the other. All three collapse to readable single-column layouts on mobile and retain the existing biography. They are previews at `/layout-d/`, `/layout-e/`, and `/layout-f/`.

## Layout studies — seed 892823

Three compositions share the same biography, palette and navigation. The seed randomized their presentation order: A (open spread), B (margin note), C (personal letter). The homepage previews A; `/layout-b/` and `/layout-c/` show alternatives. A temporary comparison bar connects them. All study pages are marked noindex; remove the comparison bar and noindex when adopting a layout for publication.

A puts the introduction in larger serif text, with the photo lower left and history lower right. B places a compact name, photograph and navigation in a left margin. C uses a letter-like reading flow with a small floated photo and the name at the end. Names are 30–32px instead of the previous 96px masthead. The blog masthead is reduced to 32px as well.

## Creative revision — seed 549938

A fresh `SecureRandom.random_number(1000000)` produced **549938**. Seeded draws selected a two-line serif name with a marginal note, cobalt margin labels, and a portrait as a small endnote.

The revision takes cues from personal research notebooks and early Bay Area personal websites: an oversized Georgia masthead, italic surname, small subject annotation, an offset reading column and numbered section labels. Navy remains the main ink; cobalt is reserved for links and annotations on white. The photograph stays small. There are no animations or decorative illustrations. Below 680px the margin joins the reading column; below 480px the masthead note stacks under the name.

## Initial direction

Random seed: **440314**, generated with Ruby's `SecureRandom.random_number(1000000)`.

The seed initialized `Random.new(seed)`. Three ordered draws selected:

1. Composition: narrow reading column (from narrow column, slim name rail, centered masthead).
2. Typography: serif headings with sans-serif body (from that pairing or serif body with sans-serif navigation).
3. Portrait: small rectangle below the biography (from that position or a square in the name rail).

The choices constrain the composition rather than add random decoration. The result uses a 680px column, white paper, navy ink (#172d4b), Georgia headings and native sans-serif body text. A small photograph follows the biography. The blog uses the same reading measure. There are no decorative graphics, animated elements, web fonts or client-side scripts.

Body copy is 17px on desktop and 16px on mobile. Navigation wraps on narrow screens. Links retain keyboard focus indicators. Article images and code blocks stay within the reading column.
