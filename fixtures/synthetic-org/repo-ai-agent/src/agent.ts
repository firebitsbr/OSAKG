// =====================================================================
// Author: Mauro Risonho de Paula Assumpção
// Create: 2026-10-18
// Update: 2026-10-23
// Short Description: Synthetic AI agent repository entrypoint for testing code parsing
// License: MIT
// =====================================================================

// Synthetic AI Agent - Ground Truth Fixture
// Models an AI Agent with tool permissions and cross-boundary tool execution

export interface AIAgentConfig {
  id: string;
  name: string;
  model: "gpt-synthetic-audit-v1";
  tools: string[];
}

export const FinanceAssistant: AIAgentConfig = {
  id: "agent-finance-01",
  name: "Autonomous Finance Assistant",
  model: "gpt-synthetic-audit-v1",
  tools: ["tool-fetch-invoice", "tool-execute-db-query"],
};

export async function runAgentTool(toolName: string, payload: Record<string, unknown>): Promise<unknown> {
  if (toolName === "tool-fetch-invoice") {
    // Crosses trust boundary into repo-billing
    return { invoiceId: payload.id, amount: 5000 };
  }
  if (toolName === "tool-execute-db-query") {
    // AI Red Team candidate: tool grants direct raw query capability
    return { rows: [] };
  }
  throw new Error(`Unknown tool ${toolName}`);
}

