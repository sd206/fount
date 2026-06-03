/**
 * AI Router — abstracts provider selection so callsites never need to know
 * which model is being used. Add providers here; routes stay unchanged.
 */

import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { AI_TASKS } from '@fount/shared/constants';

type AiTask = typeof AI_TASKS[keyof typeof AI_TASKS];

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Map task types to preferred providers
const PROVIDER_MAP: Record<AiTask, 'openai' | 'claude' | 'gemini'> = {
  [AI_TASKS.TAG_SUGGEST]: 'openai',
  [AI_TASKS.EMBED]: 'openai',
  [AI_TASKS.SEARCH]: 'claude',
  [AI_TASKS.GENERATE]: 'claude',
  [AI_TASKS.COMMENTARY]: 'claude',
  [AI_TASKS.OCR]: 'gemini',
};

interface CallOptions {
  task: AiTask;
  systemPrompt: string;
  userPrompt: string;
  maxTokens?: number;
}

export async function callAi({ task, systemPrompt, userPrompt, maxTokens = 1024 }: CallOptions): Promise<string> {
  const provider = PROVIDER_MAP[task];

  if (provider === 'claude') {
    const msg = await anthropic.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    });
    const block = msg.content[0];
    return block.type === 'text' ? block.text : '';
  }

  if (provider === 'openai') {
    const res = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: maxTokens,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    });
    return res.choices[0]?.message?.content ?? '';
  }

  // Gemini: placeholder — wire in @google/generative-ai when needed
  throw new Error(`Provider ${provider} not yet implemented`);
}

export async function createEmbedding(text: string): Promise<number[]> {
  const res = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  });
  return res.data[0].embedding;
}
