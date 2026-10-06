export const validateResponse = (data) => {
  if (!data || typeof data !== 'object') {
    throw new Error('Response data is not a valid object.');
  }

  // Ensure all schema keys exist and default if missing
  const validated = {
    title: typeof data.title === 'string' ? data.title.trim() : 'AI Agricultural Advisory',
    summary: typeof data.summary === 'string' ? data.summary.trim() : 'No advisory summary compiled.',
    recommendation: typeof data.recommendation === 'string' ? data.recommendation.trim() : 'Observe crop conditions daily.',
    reasoning: typeof data.reasoning === 'string' ? data.reasoning.trim() : 'Based on crop growth stages, weather parameters, and soil metrics.',
    confidence: typeof data.confidence === 'number' ? data.confidence : 90.0,
    riskLevel: ['Low', 'Medium', 'High'].includes(data.riskLevel) ? data.riskLevel : 'Medium',
    priority: ['Low', 'Medium', 'High'].includes(data.priority) ? data.priority : 'Medium',
    expectedOutcome: typeof data.expectedOutcome === 'string' ? data.expectedOutcome.trim() : 'Healthy growth and minimized post-harvest losses.',
    nextActions: Array.isArray(data.nextActions) ? data.nextActions.filter(item => typeof item === 'string') : [],
    warnings: Array.isArray(data.warnings) ? data.warnings.filter(item => typeof item === 'string') : [],
    references: Array.isArray(data.references) ? data.references.filter(item => typeof item === 'string') : [],
    generatedAt: data.generatedAt || new Date().toISOString(),

    // New AI Page Enhancement Fields
    desiNuska: typeof data.desiNuska === 'string' ? data.desiNuska.trim() : '',
    organicTreatment: typeof data.organicTreatment === 'string' ? data.organicTreatment.trim() : '',
    chemicalTreatment: typeof data.chemicalTreatment === 'string' ? data.chemicalTreatment.trim() : '',
    dosAndDonts: typeof data.dosAndDonts === 'string' ? data.dosAndDonts.trim() : '',
    preventionChecklist: Array.isArray(data.preventionChecklist) ? data.preventionChecklist.filter(item => typeof item === 'string') : [],
    recoveryTimeline: typeof data.recoveryTimeline === 'string' ? data.recoveryTimeline.trim() : '',
    timeline: Array.isArray(data.timeline) ? data.timeline : [],
    tasks: Array.isArray(data.tasks) ? data.tasks : [],
    isValidImage: typeof data.isValidImage === 'boolean' ? data.isValidImage : true
  };

  return validated;
};
