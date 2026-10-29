import { contrastGrade, gradesForRatio, yFromLstar } from '@colourist/engine';
import { describe, expect, it } from 'vitest';
import { defaultRules as rules, type Placeholder } from '../src/index.ts';

const VALIDATES = 'CLR-7: Default configuration file validates against it';
const COVERS =
  'CLR-7: JSON Schema covering ladder presets and recommendation rules, vividness curve presets, feedback families and separation rules, contrast thresholds (WCAG 2 and APCA), token naming, and the light/dark semantic mapping';

/** Every placeholder in the rules, with where it is. */
function placeholders(): { path: string; placeholder: Placeholder }[] {
  const found: { path: string; placeholder: Placeholder }[] = [];
  const walk = (node: unknown, path: string): void => {
    if (Array.isArray(node)) node.forEach((item, i) => walk(item, `${path}[${i}]`));
    else if (node !== null && typeof node === 'object') {
      for (const [key, value] of Object.entries(node)) {
        if (key === 'placeholder') found.push({ path, placeholder: value as Placeholder });
        else walk(value, path ? `${path}.${key}` : key);
      }
    }
  };
  walk(rules, '');
  return found;
}

describe('the default rules hang together', () => {
  // Checks a schema can't express: order, consistency with the engine, and references.

  it(`${VALIDATES} — each ladder runs from light to dark, with grades that match its L*`, () => {
    for (const [id, preset] of Object.entries(rules.ladders.presets)) {
      preset.steps.forEach((step, i) => {
        const previous = preset.steps[i - 1];
        if (previous) expect(step.lstar, id).toBeLessThan(previous.lstar);
        expect(step.grade, `${id} step ${i + 1}`).toBe(
          Math.round(contrastGrade(yFromLstar(step.lstar))),
        );
      });
    }
    expect(Object.keys(rules.ladders.presets)).toContain(rules.ladders.recommended.preset);
  });

  it(`${VALIDATES} — each contrast target's grade difference is its ratio, rounded up`, () => {
    for (const [id, use] of Object.entries(rules.contrast.uses)) {
      if (!use.targets) continue;
      const targets = [use.targets.aa, use.targets.aaa];
      for (const context of Object.values(use.contexts ?? {})) {
        if (context.aa) targets.push(context.aa);
        if (context.aaa) targets.push(context.aaa);
      }
      for (const target of targets) {
        expect(target.grades, id).toBe(Math.ceil(gradesForRatio(target.ratio)));
      }
    }
  });

  it(`${VALIDATES} — every use carries targets for both AA and AAA (D-044)`, () => {
    for (const [id, use] of Object.entries(rules.contrast.uses)) {
      const levels = use.targets ?? use.separation;
      expect(levels, id).toBeDefined();
      expect(
        Object.keys(levels ?? {})
          .filter((key) => key !== 'placeholder')
          .sort(),
        id,
      ).toEqual(['aa', 'aaa']);
    }
  });

  it(`${VALIDATES} — surfaces, hover and subtle borders have a separation target, not none`, () => {
    for (const id of ['surface', 'hover', 'subtleBorder']) {
      const separation = rules.contrast.uses[id]?.separation;
      expect(separation, id).toBeDefined();
      for (const grade of [
        ...Object.values(separation?.aa ?? {}),
        ...Object.values(separation?.aaa ?? {}),
      ]) {
        expect(grade, id).toBeGreaterThan(0);
      }
    }
    // Only the page background sits on nothing, so only it has no use.
    for (const [id, token] of Object.entries(rules.semantic)) {
      expect(token.use === undefined, id).toBe(token.on === undefined);
    }
  });

  it(`${VALIDATES} — contrast follows WCAG 2 for the uses decided so far`, () => {
    const { bodyText, largeText, interfaceElement } = rules.contrast.uses;
    expect(rules.contrast.defaultLevel).toBe('aa');
    expect([bodyText?.targets?.aa.ratio, bodyText?.targets?.aaa.ratio]).toEqual([4.5, 7]);
    expect([largeText?.targets?.aa.ratio, largeText?.targets?.aaa.ratio]).toEqual([3, 4.5]);
    // WCAG 1.4.11 has no AAA level, so interface elements need 3:1 at either target (D-044).
    expect([interfaceElement?.targets?.aa.ratio, interfaceElement?.targets?.aaa.ratio]).toEqual([
      3, 3,
    ]);
  });

  it(`${COVERS} — every reference points at something that exists`, () => {
    const contexts = Object.keys(rules.contrast.contexts);
    const uses = Object.keys(rules.contrast.uses);
    const groups = Object.keys(rules.groups);
    const presets = Object.keys(rules.palettePresets);
    for (const use of Object.values(rules.contrast.uses)) {
      for (const context of Object.keys(use.contexts ?? {})) expect(contexts).toContain(context);
      for (const level of [use.separation?.aa, use.separation?.aaa]) {
        for (const context of Object.keys(level ?? {})) expect(contexts).toContain(context);
      }
    }
    for (const use of Object.keys(rules.contrast.apca.targets ?? {})) expect(uses).toContain(use);
    for (const [group, preset] of Object.entries(rules.vividness.defaults)) {
      expect(groups).toContain(group);
      expect(Object.keys(rules.vividness.presets)).toContain(preset);
    }
    for (const preset of Object.values(rules.palettePresets))
      expect(groups).toContain(preset.group);
    for (const [id, token] of Object.entries(rules.semantic)) {
      expect(presets, id).toContain(token.source);
      for (const context of Object.keys(token.grade)) expect(contexts, id).toContain(context);
      if (token.on !== undefined) expect(Object.keys(rules.semantic), id).toContain(token.on);
      if (token.use !== undefined) expect(uses, id).toContain(token.use);
    }
  });

  it(`${COVERS} — grades count towards dark by default (D-042)`, () => {
    expect(rules.naming.direction.value).toBe('towardsDark');
  });

  it(`${VALIDATES} — every placeholder names the ticket deciding it, and the rules stay 0.x until none are left`, () => {
    const found = placeholders();
    const tickets = new Set(found.map(({ placeholder }) => placeholder.ticket));
    // The tickets still deciding values, as agreed for CLR-7. A new ticket here is deliberate.
    expect([...tickets].sort()).toEqual(
      [
        'CLR-13',
        'CLR-14',
        'CLR-15',
        'CLR-16',
        'CLR-17',
        'CLR-18',
        'CLR-27',
        'CLR-3',
        'CLR-72',
      ].sort(),
    );
    expect(found.map(({ path }) => path)).toMatchSnapshot();
    if (found.length > 0) expect(rules.meta.rulesVersion).toMatch(/^0\./);
  });
});
