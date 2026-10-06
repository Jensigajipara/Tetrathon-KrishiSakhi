import { query, isMock } from '../config/db.js';
import { callLLM } from './aiClient.js';
import { DEFAULT_SYSTEM_PROMPT } from './systemPrompts.js';
import * as templates from './promptTemplates.js';
import { parseJSONResponse } from './responseParser.js';
import { validateResponse } from './validators.js';

// Rate limiting state
const rateLimits = new Map(); // key -> timestamps array
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 30; // Max 30 queries per min

const checkRateLimit = (userId) => {
  if (!userId) return;
  const now = Date.now();
  if (!rateLimits.has(userId)) {
    rateLimits.set(userId, []);
  }
  const timestamps = rateLimits.get(userId).filter(t => now - t < RATE_LIMIT_WINDOW);
  if (timestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    throw new Error('Rate limit exceeded. Please wait a minute before querying the AI advisor again.');
  }
  timestamps.push(now);
  rateLimits.set(userId, timestamps);
};

export const generateAdvice = async (templateName, variables, options = {}) => {
  const userId = options.userId || null;

  // 1. Rate Limiting Check
  checkRateLimit(userId);

  // 2. Resolve Prompt Builder
  const promptBuilder = templates[templateName];
  if (!promptBuilder) {
    throw new Error(`AI prompt template "${templateName}" does not exist.`);
  }

  // 3. Compile User Prompt
  const promptText = promptBuilder(variables);

  // 4. System Prompt & Context
  const systemPrompt = options.systemPrompt || DEFAULT_SYSTEM_PROMPT;
  
  const messages = [
    { role: 'system', content: systemPrompt },
    { 
      role: 'user', 
      content: promptText,
      ...(options.image ? { image: options.image } : {})
    }
  ];

  const startTime = Date.now();

  // 5. Call LLM
  console.log(`[AI SERVICE] Calling Google Gemini API for template: ${templateName}...`);
  const result = await callLLM(messages, { temperature: options.temperature });
  const processingTime = Date.now() - startTime;

  // 6. Parse & Validate JSON response
  const rawText = result.text.trim();
  const parsedData = parseJSONResponse(rawText);
  const validatedAdvice = validateResponse(parsedData);

  // 7. Save Interaction Log to Database
  try {
    if (!isMock) {
      const sql = `
        INSERT INTO ai_interactions 
        (user_id, prompt, system_prompt, context, model_name, tokens_used, response, confidence, processing_time)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `;
      await query(sql, [
        userId,
        promptText,
        systemPrompt,
        JSON.stringify(variables),
        result.model,
        result.tokensUsed,
        JSON.stringify(validatedAdvice),
        validatedAdvice.confidence,
        processingTime
      ]);
    } else {
      console.log('[AI SERVICE] Mock DB Mode: Logging AI interaction to console.');
    }
  } catch (dbError) {
    console.error('Failed to log AI interaction details to PostgreSQL:', dbError.message);
  }

  return validatedAdvice;
};
