// AI suggestion engine with OpenAI integration and fallback rules

const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;

// Method-aware fallback rules
const getFallbackSuggestion = (history, method) => {
  const defaultSuggestions = {
    espresso: { 
      method: 'espresso',
      grindSize: 'fine',
      ratio: '2.0:1',
      brewTime: 25,
      waterTempC: 93,
      pressureBar: 9,
      explanation: 'Standard espresso parameters for balanced extraction.'
    },
    pourover: { 
      method: 'pourover',
      grindSize: 'medium',
      ratio: '15:1',
      brewTime: 240,
      waterTempC: 95,
      explanation: 'Medium grind with controlled pour for clean, bright extraction.'
    },
    frenchpress: { 
      method: 'frenchpress',
      grindSize: 'coarse',
      ratio: '15:1',
      brewTime: 4,
      waterTempC: 93,
      explanation: 'Coarse grind with full immersion for rich, full-bodied coffee.'
    },
    mokapot: { 
      method: 'mokapot',
      grindSize: 'fine-medium',
      ratio: '10:1',
      brewTime: 4,
      waterTempC: 90,
      explanation: 'Fine-medium grind for stovetop pressure brewing.'
    }
  };

  if (!history || history.length === 0) {
    return defaultSuggestions[method] || defaultSuggestions.pourover;
  }

  const lastBrew = history[0];
  const { taste, method: brewMethod } = lastBrew;
  let suggestion = { ...defaultSuggestions[method] };
  
  // Handle both array and string taste values for backward compatibility
  const tastes = Array.isArray(taste) ? taste : [taste];
  const primaryTaste = tastes[0]; // Use first taste for primary adjustment logic
  
  // Apply method-specific adjustments based on taste
  switch (method) {
    case 'espresso':
      switch (primaryTaste) {
        case 'too_bitter':
          suggestion.grindSize = 'slightly coarser';
          suggestion.brewTime = Math.max((lastBrew.brewTimeSec || 25) - 3, 15);
          suggestion.ratio = '1.9:1';
          suggestion.explanation = 'Coarser grind, shorter time, and lower ratio to reduce bitterness.';
          break;
        case 'too_sour':
          suggestion.grindSize = 'finer';
          suggestion.brewTime = Math.min((lastBrew.brewTimeSec || 25) + 3, 45);
          suggestion.ratio = '2.3:1';
          suggestion.explanation = 'Finer grind, longer time, and higher ratio for better extraction.';
          break;
        case 'balanced':
          suggestion.explanation = 'Maintaining balanced parameters with minor optimization.';
          break;
      }
      break;
      
    case 'pourover':
      switch (primaryTaste) {
        case 'too_bitter':
          suggestion.grindSize = 'slightly coarser';
          suggestion.brewTime = Math.max((lastBrew.brewTimeSec || 240) * 0.9, 120);
          suggestion.waterTempC = Math.max((lastBrew.waterTempC || 95) - 2, 80);
          suggestion.ratio = '16:1';
          suggestion.explanation = 'Coarser grind, shorter time, and cooler water to reduce bitterness.';
          break;
        case 'too_sour':
          suggestion.grindSize = 'finer';
          suggestion.brewTime = Math.min((lastBrew.brewTimeSec || 240) * 1.1, 360);
          suggestion.waterTempC = Math.min((lastBrew.waterTempC || 95) + 2, 100);
          suggestion.ratio = '14:1';
          suggestion.explanation = 'Finer grind, longer time, and hotter water for better extraction.';
          break;
        case 'balanced':
          suggestion.explanation = 'Maintaining balanced pour-over parameters.';
          break;
      }
      break;
      
    case 'frenchpress':
      switch (primaryTaste) {
        case 'too_bitter':
          suggestion.grindSize = 'coarser';
          suggestion.brewTime = Math.max((lastBrew.brewTimeMin || 4) - 0.5, 3);
          suggestion.waterTempC = Math.max((lastBrew.waterTempC || 93) - 2, 80);
          suggestion.explanation = 'Coarser grind, shorter steep, and cooler water to reduce bitterness.';
          break;
        case 'too_sour':
          suggestion.grindSize = 'slightly finer';
          suggestion.brewTime = Math.min((lastBrew.brewTimeMin || 4) + 0.5, 8);
          suggestion.waterTempC = Math.min((lastBrew.waterTempC || 93) + 2, 100);
          suggestion.explanation = 'Finer grind, longer steep, and hotter water for better extraction.';
          break;
        case 'balanced':
          suggestion.explanation = 'Maintaining balanced French press parameters.';
          break;
      }
      break;
      
    case 'mokapot':
      switch (primaryTaste) {
        case 'too_bitter':
          suggestion.grindSize = 'slightly coarser';
          suggestion.brewTime = Math.max((lastBrew.brewTimeMin || 4) * 0.85, 2);
          suggestion.waterTempC = Math.max((lastBrew.waterTempC || 90) - 3, 80);
          suggestion.explanation = 'Coarser grind, reduced heat/time, and cooler start water.';
          break;
        case 'too_sour':
          suggestion.grindSize = 'finer';
          suggestion.brewTime = Math.min((lastBrew.brewTimeMin || 4) * 1.15, 6);
          suggestion.waterTempC = Math.min((lastBrew.waterTempC || 90) + 3, 100);
          suggestion.explanation = 'Finer grind, increased time, and hotter start water.';
          break;
        case 'balanced':
          suggestion.explanation = 'Maintaining balanced moka pot parameters.';
          break;
      }
      break;
  }

  return suggestion;
};

// Method-aware OpenAI API call
const getAISuggestion = async (history, method, beanName = '') => {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  const methodConfig = BREW_METHODS[method];
  const timeUnit = methodConfig?.timeUnit || 'seconds';
  
  let prompt;
  if (history.length === 0) {
    prompt = `The user wants a good starting recipe for a coffee bean named "${beanName || 'unknown'}".

Bean Name: ${beanName || 'N/A'}
Brew Method: ${methodConfig?.name || method}

Please provide a solid starting point recipe. If the bean name is specific, tailor the recipe to that bean's typical profile. If not, provide a general-purpose recipe for this method.

Provide a brief explanation (≤2 sentences) for why this is a good starting point.

Return strict JSON with keys: method, grindSize, ratio, brewTime, waterTempC${method === 'espresso' ? ', pressureBar' : ''}, explanation.`;
  } else {
    prompt = `Based on the user's previous ${methodConfig?.name || method} brews for a coffee bean named "${beanName || 'unknown'}", recommend parameters for their next brew.

Bean Name: ${beanName || 'N/A'}
Method: ${method}
Recent brews: ${JSON.stringify(history)}

Note: Taste feedback may be an array of multiple values (e.g., ["too_bitter", "weak"]) or a single string for backward compatibility.

Please recommend adjustments to parameters.

Provide a brief explanation (≤2 sentences) for these adjustments.

Return strict JSON with keys: method, grindSize, ratio, brewTime, waterTempC${method === 'espresso' ? ', pressureBar' : ''}, explanation.`;
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a coffee brewing expert. Provide precise brewing recommendations based on taste feedback and brewing history.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 200,
        temperature: 0.3
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const suggestion = JSON.parse(data.choices[0].message.content);
    
    // Validate the response structure
    const requiredKeys = ['method', 'grindSize', 'ratio', 'brewTime', 'waterTempC', 'explanation'];
    if (method === 'espresso') requiredKeys.push('pressureBar');
    
    const missingKeys = requiredKeys.filter(key => !suggestion.hasOwnProperty(key));
    if (missingKeys.length > 0) {
      throw new Error(`Invalid AI response format: missing ${missingKeys.join(', ')}`);
    }

    return suggestion;
  } catch (error) {
    console.error('AI suggestion error:', error);
    throw error;
  }
};

// Main suggestion function - now method-aware
export const getSuggestion = async (history, method = 'pourover', beanName = '') => {
  try {
    // Try AI first if API key is available
    if (OPENAI_API_KEY) {
      return await getAISuggestion(history, method, beanName);
    }
  } catch (error) {
    console.warn('AI suggestion failed, using fallback:', error.message);
  }
  
  // Use fallback rules
  return getFallbackSuggestion(history, method);
};

// Brew methods and their configurations
export const BREW_METHODS = {
  espresso: {
    name: 'Espresso',
    fields: ['doseG', 'yieldG', 'grindSize', 'waterTempC', 'brewTimeSec', 'pressureBar'],
    ratioLabel: 'Ratio (Yield/Dose)',
    timeUnit: 'seconds'
  },
  pourover: {
    name: 'Pour-Over',
    fields: ['doseG', 'waterMl', 'grindSize', 'waterTempC', 'brewTimeSec', 'pouringNote'],
    ratioLabel: 'Ratio (Water/Dose)',
    timeUnit: 'seconds'
  },
  frenchpress: {
    name: 'French Press',
    fields: ['doseG', 'waterMl', 'grindSize', 'waterTempC', 'brewTimeMin'],
    ratioLabel: 'Ratio (Water/Dose)',
    timeUnit: 'minutes'
  },
  mokapot: {
    name: 'Moka Pot',
    fields: ['doseG', 'waterMl', 'grindSize', 'waterTempC', 'brewTimeMin'],
    ratioLabel: 'Ratio (Water/Dose)',
    timeUnit: 'minutes'
  }
};

export const VALIDATION_RULES = {
  doseG: { min: 5, max: 40, unit: 'g' },
  yieldG: { min: 10, max: 70, unit: 'g' },
  waterMl: { 
    espresso: { min: 10, max: 70 },
    pourover: { min: 120, max: 700 },
    frenchpress: { min: 200, max: 1000 },
    mokapot: { min: 60, max: 400 },
    unit: 'ml'
  },
  waterTempC: { min: 80, max: 100, unit: '°C' },
  brewTimeSec: {
    espresso: { min: 15, max: 45 },
    pourover: { min: 120, max: 360 },
    unit: 'seconds'
  },
  brewTimeMin: {
    frenchpress: { min: 3, max: 8 },
    mokapot: { min: 2, max: 6 },
    unit: 'minutes'
  },
  pressureBar: { min: 6, max: 12, unit: 'bar' },
  grindSize: { min: 1, max: 60, allowText: true }
};

// Legacy coffee types for migration
export const LEGACY_COFFEE_TYPES = [
  'espresso',
  'americano',
  'latte',
  'cappuccino',
  'pourover',
  'french_press',
  'aeropress'
];

export const TASTE_OPTIONS = [
  { value: 'too_bitter', label: 'Too Bitter' },
  { value: 'too_sour', label: 'Too Sour' },
  { value: 'balanced', label: 'Balanced' },
  { value: 'weak', label: 'Too Weak' },
  { value: 'strong', label: 'Too Strong' }
];

// Migration helper
export const migrateBrewMethod = (legacyCoffeeType) => {
  const mapping = {
    'espresso': 'espresso',
    'americano': 'pourover',
    'latte': 'pourover',
    'cappuccino': 'espresso',
    'pourover': 'pourover',
    'french_press': 'frenchpress',
    'aeropress': 'pourover'
  };
  return mapping[legacyCoffeeType] || 'pourover';
};

// Calculate derived ratio
export const calculateRatio = (method, brewData) => {
  switch (method) {
    case 'espresso':
      if (brewData.yieldG && brewData.doseG) {
        const ratio = (brewData.yieldG / brewData.doseG).toFixed(1);
        return { value: `${ratio}:1`, label: 'Yield/Dose' };
      }
      break;
    case 'pourover':
    case 'frenchpress':
    case 'mokapot':
      if (brewData.waterMl && brewData.doseG) {
        const ratio = (brewData.waterMl / brewData.doseG).toFixed(1);
        return { value: `${ratio}:1`, label: 'Water/Dose' };
      }
      break;
  }
  return { value: 'N/A', label: 'Ratio' };
};
