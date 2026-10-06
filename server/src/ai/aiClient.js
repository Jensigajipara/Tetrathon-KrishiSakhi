import axios from 'axios';

export const callLLM = async (messages, options = {}) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in .env variables.');
  }

  // Configure Google's latest/best Gemini model (configurable at a single configuration point)
  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  const temperature = options.temperature ?? 0.2;
  const maxRetries = options.maxRetries ?? 3;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  // 1. Separate system message
  const systemMsg = messages.find(m => m.role === 'system');
  const systemInstruction = systemMsg ? {
    parts: [{ text: systemMsg.content }]
  } : undefined;

  // 2. Format history contents (Gemini role mapping: user / model)
  const contents = messages
    .filter(m => m.role !== 'system')
    .map(m => {
      const parts = [{ text: m.content }];
      if (m.image && m.image.data) {
        let base64Data = m.image.data;
        if (base64Data.includes(';base64,')) {
          base64Data = base64Data.split(';base64,')[1];
        }
        parts.push({
          inlineData: {
            mimeType: m.image.mimeType || 'image/jpeg',
            data: base64Data
          }
        });
      }
      return {
        role: m.role === 'assistant' ? 'model' : 'user',
        parts
      };
    });

  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      const payload = {
        contents,
        generationConfig: {
          temperature,
          responseMimeType: 'application/json'
        }
      };

      if (systemInstruction) {
        payload.systemInstruction = systemInstruction;
      }

      const response = await axios.post(url, payload, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30s timeout
      });

      const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        const promptTokens = response.data?.usageMetadata?.promptTokenCount || 0;
        const completionTokens = response.data?.usageMetadata?.candidatesTokenCount || 0;
        const totalTokens = promptTokens + completionTokens;

        return {
          text,
          model,
          tokensUsed: totalTokens
        };
      }
      throw new Error('Empty response content returned from Google Gemini.');
    } catch (err) {
      attempt++;
      console.warn(`[GEMINI CLIENT WARNING] Attempt ${attempt} failed:`, err.response?.data || err.message);
      if (attempt >= maxRetries) {
        throw new Error(`Gemini Service Request failed after ${maxRetries} attempts. Details: ${err.message}`);
      }
      // Wait with exponential backoff (1s, 2s, 4s...)
      await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }
};
