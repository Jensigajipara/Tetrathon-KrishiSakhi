export const parseJSONResponse = (text) => {
  if (!text) {
    throw new Error('Empty text content cannot be parsed.');
  }

  // Strip markdown code block wrappers (e.g. ```json ... ```)
  let cleanText = text.trim();
  if (cleanText.startsWith('```')) {
    cleanText = cleanText.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '');
  }
  cleanText = cleanText.trim();

  try {
    return JSON.parse(cleanText);
  } catch (error) {
    // Attempt a regex match to extract the first valid JSON block if there is garbage around it
    const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (innerError) {
        // Fall back to throwing parsing error
      }
    }
    console.error('Failed JSON payload parse attempt on text:', cleanText);
    throw new Error(`Failed to parse AI response as JSON: ${error.message}`);
  }
};
