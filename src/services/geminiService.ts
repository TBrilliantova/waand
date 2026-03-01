import { GoogleGenAI } from "@google/genai";

export type AgentType = 'brainstorm' | 'ux-audit' | 'handoff';

const AGENT_PROMPTS: Record<AgentType, string> = {
  'brainstorm': `You are the 'Brainstorm' agent for product designers.
Your task is to expand on an idea, critique it, and then synthesize it into one strong, refined option.
Structure your response as:
1. Expansion: 3-5 diverse ideas based on the input.
2. Critique: Honest assessment of the pros and cons of these ideas.
3. Synthesis: One final, high-fidelity concept that combines the best elements.

Output in Markdown format with clear headings and bullet points. Be practical and professional.`,

  'ux-audit': `You are the 'UX Audit' agent for product designers.
Your task is to check the quality of a design (consistency, accessibility, usability) and prioritize fixes.
Structure your response as:
1. Audit Summary: Overall quality score and key observations.
2. Detailed Findings: Specific issues related to consistency, accessibility, and usability.
3. Prioritized Fixes: A list of recommended actions ordered by impact and effort.

Output in Markdown format with clear headings and bullet points. Be practical and professional.`,

  'handoff': `You are the 'Handoff Pack' agent for product designers.
Your task is to generate dev-ready specs, including states, edge cases, and acceptance criteria.
Structure your response as:
1. Component/Feature Overview.
2. Interaction States: Default, Hover, Active, Disabled, Loading, Error.
3. Edge Cases: Empty states, long text, slow network, etc.
4. Acceptance Criteria: Clear 'Given/When/Then' or bullet points for developers.

Output in Markdown format with clear headings and bullet points. Be practical and professional.`
};

export async function generateAgentOutput(agent: AgentType, prompt: string) {
  const apiKey = process.env.GEMINI_API_KEY || "";
  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY. Add it to your .env.local file.");
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `User Input: ${prompt}`,
      config: {
        systemInstruction: AGENT_PROMPTS[agent],
      },
    });

    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
}
