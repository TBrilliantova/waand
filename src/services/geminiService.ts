export type AgentType = 'brainstorm' | 'ux-audit' | 'handoff';

const USE_MOCK = String(import.meta.env.VITE_USE_MOCK ?? 'true').toLowerCase() === 'true';

function mockOutput(agent: AgentType, prompt: string): string {
  const normalizedPrompt = prompt?.trim() || 'Demo request with attachments';

  if (agent === 'brainstorm') {
    return `## Concepts

### 1) Instant Onboarding Overlay
- Show a 3-step walkthrough tailored to first-time users.
- Trigger contextual tips based on the first action in session.
- Use one primary CTA to reduce decision fatigue.

### 2) Smart Starter Templates
- Preload templates by intent (research, audit, handoff).
- Include editable placeholders for team context.
- Add estimated completion time to each template.

### 3) Progressive Personalization
- Ask one preference question after each meaningful action.
- Adapt wording and examples to user role over time.
- Keep controls reversible with a clear reset option.

## Brainstorm
- Prompt interpreted as: "${normalizedPrompt}".
- Best direction: combine templates + contextual tips for faster time-to-value.
- Risk: too many options can slow new users.
- Mitigation: limit initial choices to three high-confidence paths.

## Recommended Direction
- Start with Smart Starter Templates.
- Layer in one contextual tip per screen.
- Measure completion rate and first-value time before adding more complexity.
`;
  }

  if (agent === 'ux-audit') {
    return `## UX Audit

### Audit Summary
- Overall quality score: **7.8 / 10**
- Strong visual hierarchy and clear sections.
- Main issue: action density in the workspace side panels.

### Detailed Findings
1. Consistency
- Button sizes vary between panels without clear semantic reason.
- Some helper texts use different tone and punctuation styles.

2. Accessibility
- Contrast is borderline on muted gray labels in sidebars.
- Some icon-only buttons need explicit aria-label checks.

3. Usability
- First-run path is clear, but error recovery messaging can be more specific.
- Attachment actions are discoverable but could use tighter grouping.

### Prioritized Fixes
1. Raise contrast on muted labels and helper text (high impact, low effort).
2. Standardize button sizing tokens by intent (high impact, medium effort).
3. Add explicit recovery guidance after failed generation (medium impact, low effort).
4. Group attachment controls under a labeled section (medium impact, low effort).

Context used: "${normalizedPrompt}".
`;
  }

  return `## Handoff Pack

### Component / Feature Overview
- Feature: AI-assisted output generation workspace.
- Primary goal: transform a prompt into structured markdown output.
- Input channels: text prompt + optional attachments.

### Interaction States
1. Default
- Agent selected, empty prompt, Run disabled.

2. Hover / Active
- Buttons and cards show affordance via contrast and elevation changes.

3. Loading
- Generation state shows spinner and progress indicators.

4. Error
- Inline recovery panel appears with retry action.

5. Ready
- Markdown output renders with version label in right rail.

### Edge Cases
- Empty prompt with attachments only.
- Very long prompt (>2,000 chars).
- Slow network or API timeout.
- Missing server key in live mode.

### Acceptance Criteria
- Given a selected agent and valid input, when Run is clicked, then loading is shown before output/error state.
- Given API failure, when generation fails, then user sees error state and can retry.
- Given mock mode enabled, when Run is clicked, then deterministic markdown output is returned without external API calls.

Context used: "${normalizedPrompt}".
`;
}

export async function generateAgentOutput(agent: AgentType, prompt: string) {
  if (USE_MOCK) {
    return mockOutput(agent, prompt);
  }

  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({agent, prompt}),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.error || 'Failed to generate output');
  }

  return data.output || '';
}
