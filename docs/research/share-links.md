# Sharing a project by link

> Status: spike not yet run. Started 28 October 2026 for US-10. Plane: CLR-75 (spike, cycle 2), CLR-35 (share by link). Related decisions: D-029, D-033.

## Question

How do we encode a project into a link, with no server, and where are the limits? People need a warning before they make a project that can't be shared by link.

## Starting point

Benji supplied a reference brief, "Architectural Brief: Stateless URL-Based Preset Synchronization". It describes this pipeline:

1. Positional arrays instead of named keys
2. MessagePack binary encoding
3. Deflate compression (fflate), or LZMA in a worker for large payloads
4. URL-safe Base64
5. A leading schema-version byte, so old links keep working
6. Stored in the URL fragment (after the #), which browsers never send to the server, so GitHub Pages never sees anyone's colours
7. A target of under 2,048 characters

## Why it fits colouri.st

The engine is deterministic, so a link only needs the inputs: the rules version, the brand colours, and anything changed from the defaults. Every shade, token and check can be regenerated from those.

## Questions for the spike

- **Store inputs only:** how small does a typical project get?
- **Rules versions:** old links need the rules version they were made with, or a migration. Otherwise the same link could quietly produce different colours.
- **Encoding:** positional arrays compared with numbered field IDs, for robustness as the format changes
- **Compression:** the browser's built-in `CompressionStream` compared with fflate and LZMA. Built-in would avoid a dependency; any library goes through the investment assessment (D-014).
- **Limits:** where links break in practice, in chat apps, email clients and link shorteners. Is 2,048 characters the right ceiling?
- **Fallback:** a project file, in the same project format, when a project is too big for a link

## Agreed measures

- A typical shared link shows its report or editor within 2 seconds on a mid-range phone over 4G
- A loading state if it takes longer, never a blank page
- A clear message for broken, too long or unmigratable links, suggesting a project file instead

## Results

To be added when the spike runs: measured link lengths for small, typical and large projects (for example 3, 8 and 15 colours with overrides), round trips through at least three real channels, and the recommended pipeline and warning threshold, recorded as an ADR.
