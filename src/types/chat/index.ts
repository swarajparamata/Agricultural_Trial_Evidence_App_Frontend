import type { LucideIcon } from 'lucide-react';
import { z } from 'zod';

export type ChatRole = 'user' | 'model';

/** How an answer was produced, shown under the assistant's message. */
export interface ChatAnswerMeta {
  mode: 'llm' | 'offline';
  model: string;
  verified: boolean;
  trialIds: string[];
  sources: string[];
  durationMs: number;
  toolCalls: number;
  revisions: number;
}

export interface ChatMessage {
  id: string;
  role: ChatRole;
  text: string;
  meta?: ChatAnswerMeta;
  isError?: boolean;
}

export type AgentLogStatus = 'info' | 'processing' | 'success' | 'error';

export interface AgentLog {
  id: string;
  time: string;
  message: string;
  status: AgentLogStatus;
}

export type ChatTab = 'chat' | 'logs';

export interface ChatTabConfig {
  id: ChatTab;
  label: string;
  icon: LucideIcon;
}

/** One server-sent event from the agent stream. */
export const ChatStreamEventSchema = z.object({
  type: z.enum(['log', 'answer', 'error', 'done']),
  status: z.enum(['info', 'processing', 'success', 'error']).default('info'),
  message: z.string().default(''),
  node: z.string().nullish(),
  elapsed_ms: z.number().default(0),
  data: z.record(z.string(), z.unknown()).nullish(),
});

export type ChatStreamEvent = z.infer<typeof ChatStreamEventSchema>;

/** `data` of the final `answer` event. */
export const ChatAnswerDataSchema = z.object({
  mode: z.enum(['llm', 'offline']),
  model: z.string(),
  fallback_reason: z.string().nullish(),
  trial_ids: z.array(z.string()),
  sources: z.array(z.string()),
  iterations: z.number(),
  revisions: z.number(),
  tool_calls: z.number(),
  verification: z.object({
    passed: z.boolean(),
    skipped: z.boolean().optional(),
    issues: z.array(z.string()),
  }),
  duration_ms: z.number(),
});
