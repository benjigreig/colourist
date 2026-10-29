import { describe, expect, it } from 'vitest';
import { findTestNames, parseScenarios } from './scenario-report.ts';

describe('scenario report (ADR 0004)', () => {
  it('reads each scenario under the story it belongs to', () => {
    const markdown = [
      '### US-01 · Enter my brand colours',
      '```gherkin',
      'Scenario: Add several brand colours',
      '  Given I am on the brand colours stage',
      'Scenario: Invalid input',
      '```',
      '### US-02 · Choose a ladder',
      'Scenario Outline: Contrast at each target',
    ].join('\n');

    expect(parseScenarios(markdown)).toEqual([
      { story: 'US-01', title: 'Add several brand colours' },
      { story: 'US-01', title: 'Invalid input' },
      { story: 'US-02', title: 'Contrast at each target' },
    ]);
  });

  it('matches test names with or without a detail after a dash', () => {
    const source = `
      it('US-01: Invalid input', () => {});
      test("US-01: Invalid input — hue shows dashes", () => {});
      it(\`US-02: Choose a ladder - keyboard\`, () => {});
      it('not a story test', () => {});
    `;

    expect(findTestNames(source)).toEqual([
      'US-01: Invalid input',
      'US-01: Invalid input',
      'US-02: Choose a ladder',
    ]);
  });
});
