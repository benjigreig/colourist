import { defaultRules } from '@colourist/rules';
import { describe, expect, it } from 'vitest';
import * as enAU from './en-AU.ts';

/** Every language key the rules use, with whether its rule is still a placeholder. */
function keys(): { key: string; placeholder: boolean }[] {
  const found: { key: string; placeholder: boolean }[] = [];
  const walk = (node: unknown): void => {
    if (Array.isArray(node)) node.forEach(walk);
    else if (node !== null && typeof node === 'object') {
      const record = node as Record<string, unknown>;
      for (const field of ['reason', 'nameKey']) {
        const key = record[field];
        if (typeof key === 'string') found.push({ key, placeholder: 'placeholder' in record });
      }
      Object.values(record).forEach(walk);
    }
  };
  walk(defaultRules);
  return found;
}

/** Follows a dotted key into the language file. */
function lookup(key: string): unknown {
  return key.split('.').reduce<unknown>((node, part) => {
    if (node === null || typeof node !== 'object' || !Object.hasOwn(node, part)) return undefined;
    return (node as Record<string, unknown>)[part];
  }, enAU);
}

describe('rule text', () => {
  it("US-11: Recommendations come with reasons — every rule's reason and name is in the language files", () => {
    const found = keys();
    expect(found.length).toBeGreaterThan(0);
    for (const { key } of found) {
      const text = lookup(key);
      expect(typeof text, key).toBe('string');
      expect((text as string).length, key).toBeGreaterThan(0);
    }
  });

  it('US-11: Recommendations come with reasons — placeholder text only for placeholder rules', () => {
    for (const { key, placeholder } of keys().filter(({ key }) => key.endsWith('.reason'))) {
      expect((lookup(key) as string).startsWith('Placeholder:'), key).toBe(placeholder);
    }
  });
});
