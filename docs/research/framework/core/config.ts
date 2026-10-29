/**
 * Spike configuration: ladder presets and the example brand.
 *
 * In the real product this lives in the versioned rules schema (CLR-7), and the
 * preset contents are decided in CLR-13. The 11-step and 15-step values here are
 * placeholders for the spike only. The 13-step ladder is the one from ADR 0001.
 */

/** A ladder preset the person can choose at stage 2. */
export interface LadderPreset {
  id: string;
  label: string;
  /** CIE L* targets, lightest to darkest. */
  ladder: readonly number[];
  stepNames: readonly string[];
  recommended: boolean;
  /** One-sentence reason, shown beside the recommended option. */
  reason: string;
}

export const LADDER_PRESETS: readonly LadderPreset[] = [
  {
    id: "11",
    label: "11 steps",
    ladder: [98, 94, 86, 76, 65, 54, 43, 33, 23, 14, 7],
    stepNames: ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "950"],
    recommended: false,
    reason: "Fewer steps for small products. (Spike placeholder values.)",
  },
  {
    id: "13",
    label: "13 steps",
    ladder: [98, 96, 92, 86, 78, 68, 57, 46, 35, 25, 17, 10, 5],
    stepNames: ["25", "50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "950", "975"],
    recommended: true,
    reason: "Enough range for light and dark mode, with 7 steps apart meeting 4.5:1 for text.",
  },
  {
    id: "15",
    label: "15 steps",
    ladder: [98, 96, 93, 88, 82, 74, 65, 56, 47, 38, 30, 22, 15, 9, 4],
    stepNames: ["25", "50", "100", "150", "200", "300", "400", "500", "600", "700", "750", "800", "900", "950", "975"],
    recommended: false,
    reason: "Finer steps for large systems. (Spike placeholder values.)",
  },
];

/** An invented example brand for "Try an example". Not a real organisation's colours. */
export const EXAMPLE_BRAND: readonly { name: string; hex: string }[] = [
  { name: "Harbour", hex: "#1B548F" },
  { name: "Wattle", hex: "#E8B931" },
  { name: "Eucalypt", hex: "#6E9B84" },
];
