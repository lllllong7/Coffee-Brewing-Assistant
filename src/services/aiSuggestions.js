// AI suggestion engine with OpenAI integration and fallback rules

const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;

// Fallback rules when AI is not available
const getFallbackSuggestion = (history, coffeeType) => {
  const defaultSuggestions = {
    espresso: { grindSize: 2, ratio: '1:2', brewTime: 25, explanation: 'Standard espresso parameters for balanced extraction.' },
    americano: { grindSize: 3, ratio: '1:15', brewTime: 240, explanation: 'Medium grind with longer extraction for full body.' },
    latte: { grindSize: 2, ratio: '1:2', brewTime: 25, explanation: 'Espresso base with milk - focused on strong coffee flavor.' },
    pourover: { grindSize: 4, ratio: '1:16', brewTime: 300, explanation: 'Medium-coarse grind for clean, bright extraction.' }
  };

  if (!history || history.length === 0) {
    return defaultSuggestions[coffeeType] || defaultSuggestions.espresso;
  }

  const lastBrew = history[0];
  const { grindSize, ratio, brewTime, taste } = lastBrew;
  
  let newGrindSize = grindSize;
  let newRatio = ratio;
  let newBrewTime = brewTime;
  let explanation = '';

  switch (taste) {
    case 'too_bitter':
      newGrindSize = Math.min(grindSize + 0.5, 6);
      newBrewTime = Math.max(brewTime - 10, 15);
      explanation = 'Making grind coarser and reducing time to reduce bitterness.';
      break;
    case 'too_sour':
      newGrindSize = Math.max(grindSize - 0.5, 1);
      newBrewTime = Math.min(brewTime + 15, 360);
      explanation = 'Making grind finer and increasing time to improve extraction.';
      break;
    case 'balanced':
      // Small optimizations for balanced brews
      newGrindSize = grindSize + (Math.random() - 0.5) * 0.2;
      explanation = 'Fine-tuning parameters to maintain balance with slight optimization.';
      break;
    default:
      explanation = 'Using previous parameters as baseline for next brew.';
  }

  return {
    grindSize: Math.round(newGrindSize * 10) / 10,
    ratio: newRatio,
    brewTime: Math.round(newBrewTime),
    explanation
  };
};

// OpenAI API call
const getAISuggestion = async (history, coffeeType) => {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  const prompt = `Based on the user's previous brews: ${JSON.stringify(history)}, and their target coffee type: ${coffeeType}, recommend the next brew's grind size (numeric 1-6 scale), coffee-to-water ratio (e.g. 1:15), and brew time (seconds). Also explain briefly why these adjustments are being made in simple language. Return JSON with keys: grindSize, ratio, brewTime, explanation.`;

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
    if (!suggestion.grindSize || !suggestion.ratio || !suggestion.brewTime || !suggestion.explanation) {
      throw new Error('Invalid AI response format');
    }

    return suggestion;
  } catch (error) {
    console.error('AI suggestion error:', error);
    throw error;
  }
};

// Main suggestion function
export const getSuggestion = async (history, coffeeType = 'espresso') => {
  try {
    // Try AI first if API key is available
    if (OPENAI_API_KEY) {
      return await getAISuggestion(history, coffeeType);
    }
  } catch (error) {
    console.warn('AI suggestion failed, using fallback:', error.message);
  }
  
  // Use fallback rules
  return getFallbackSuggestion(history, coffeeType);
};

export const COFFEE_TYPES = [
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
