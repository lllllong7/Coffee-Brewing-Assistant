import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getBeans, saveBrew, getBrewsForBean, saveBeanSuggestion } from '../utils/storage';
import { BREW_METHODS, TASTE_OPTIONS, getSuggestion, migrateBrewMethod, calculateRatio } from '../services/aiSuggestions';
import MethodSelector from './MethodSelector';
import MethodFields from './MethodFields';

const BrewForm = () => {
  const { beanId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isOnboarding = new URLSearchParams(location.search).get('onboarding') === 'true';
  const [bean, setBean] = useState(null);
  const [suggestion, setSuggestion] = useState(null);
  const [formData, setFormData] = useState({
    method: 'pourover',
    taste: [],
    notes: '',
    // Method-specific fields will be added dynamically
    doseG: 20,
    waterMl: 300,
    grindSize: 'medium',
    waterTempC: 95,
    brewTimeSec: 240
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBeanAndSuggestion();
  }, [beanId]);

  const loadBeanAndSuggestion = async () => {
    try {
      const allBeans = getBeans();
      const currentBean = allBeans.find(b => b.id === beanId);
      
      if (!currentBean) {
        navigate('/beans');
        return;
      }

      setBean(currentBean);
      
      // Load AI suggestion based on previous brews for the current method
      const previousBrews = getBrewsForBean(beanId)
        .filter(brew => brew.method === formData.method)
        .slice(0, 3);
      const newSuggestion = await getSuggestion(previousBrews, formData.method, currentBean.name);
      setSuggestion(newSuggestion);
      
      // Apply suggestion to form if available
      if (newSuggestion) {
        applySuggestionToForm(newSuggestion);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const applySuggestionToForm = (suggestion) => {
    const updates = {
      grindSize: suggestion.grindSize,
      waterTempC: suggestion.waterTempC
    };

    // Apply method-specific fields from suggestion
    switch (formData.method) {
      case 'espresso':
        updates.brewTimeSec = suggestion.brewTime;
        if (suggestion.pressureBar) updates.pressureBar = suggestion.pressureBar;
        break;
      case 'pourover':
        updates.brewTimeSec = suggestion.brewTime;
        break;
      case 'frenchpress':
      case 'mokapot':
        updates.brewTimeMin = suggestion.brewTime;
        break;
    }

    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.taste || formData.taste.length === 0) {
      alert('Please select at least one taste feedback');
      return;
    }

    try {
      setSaving(true);
      const brewData = {
        ...formData,
        beanId: beanId,
        brewMethod: formData.method // For backward compatibility
      };
      
      // Save the brew
      await saveBrew(brewData);
      
      // Generate and save new AI suggestion based on updated brew history
      try {
        const updatedBrews = getBrewsForBean(beanId)
          .filter(brew => (brew.method || migrateBrewMethod(brew.brewMethod || brew.coffeeType)) === formData.method);
        const recentBrews = updatedBrews.slice(0, 5);
        const newSuggestion = await getSuggestion(recentBrews, formData.method, bean.name);
        await saveBeanSuggestion(beanId, newSuggestion);
      } catch (suggestionError) {
        console.warn('Failed to generate new suggestion after brew save:', suggestionError);
        // Don't block navigation if suggestion fails
      }
      
      navigate(`/bean/${beanId}`);
    } catch (error) {
      console.error('Error saving brew:', error);
      alert('Error saving brew. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleMethodChange = async (newMethod) => {
    setFormData(prev => ({ 
      ...prev, 
      method: newMethod,
      // Reset method-specific fields to defaults
      doseG: 20,
      yieldG: newMethod === 'espresso' ? 40 : undefined,
      waterMl: newMethod !== 'espresso' ? 300 : undefined,
      grindSize: 'medium',
      waterTempC: 95,
      brewTimeSec: ['espresso', 'pourover'].includes(newMethod) ? 240 : undefined,
      brewTimeMin: ['frenchpress', 'mokapot'].includes(newMethod) ? 4 : undefined,
      pressureBar: newMethod === 'espresso' ? 9 : undefined,
      pouringNote: newMethod === 'pourover' ? '' : undefined
    }));
    
    // Get new suggestion for different method
    try {
      const previousBrews = getBrewsForBean(beanId)
        .filter(brew => (brew.method || migrateBrewMethod(brew.brewMethod || brew.coffeeType)) === newMethod)
        .slice(0, 3);
      const newSuggestion = await getSuggestion(previousBrews, newMethod, bean.name);
      setSuggestion(newSuggestion);
      
      if (newSuggestion) {
        // Apply suggestion after method change
        setTimeout(() => applySuggestionToForm(newSuggestion), 100);
      }
    } catch (error) {
      console.error('Error updating suggestion:', error);
    }
  };


  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-coffee-200 rounded w-3/4"></div>
          <div className="card space-y-4">
            <div className="h-4 bg-coffee-200 rounded"></div>
            <div className="h-10 bg-coffee-200 rounded"></div>
            <div className="h-4 bg-coffee-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!bean) {
    return (
      <div className="p-4">
        <div className="card text-center py-8">
          <p className="text-coffee-600">Bean not found</p>
          <button
            onClick={() => navigate('/beans')}
            className="btn-primary mt-4"
          >
            Back to Beans
          </button>
        </div>
      </div>
    );
  }

    return (
    <div className="pb-20">
      <header className="p-6 bg-header-gradient relative">
        <button
          onClick={() => navigate(`/bean/${beanId}`)}
          className="absolute top-6 left-6 text-coffee-700 hover:text-coffee-900 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <div className="text-center pt-8">
          <h1 className="text-3xl font-bold text-coffee-900 mb-2">
            Log New Brew
          </h1>
          <p className="text-coffee-600">
            For <span className="font-semibold">{bean.name}</span>
          </p>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {suggestion && (
          <div className="card bg-cream-200 border-cream-300">
            <div className="flex items-start mb-3">
              <span className="text-2xl mr-3 -mt-1">💡</span>
              <div>
                <h3 className="font-bold text-coffee-900">AI Suggestion</h3>
                <p className="text-sm text-coffee-700">{suggestion.explanation}</p>
              </div>
            </div>
            <div className="text-xs text-coffee-600 pl-8">
              Try: {suggestion.grindSize} grind, {suggestion.ratio} ratio, {suggestion.brewTime}{BREW_METHODS[formData.method]?.timeUnit === 'minutes' ? 'min' : 's'}
              {suggestion.waterTempC && `, ${suggestion.waterTempC}°C`}
              {suggestion.pressureBar && `, ${suggestion.pressureBar} bar`}
            </div>
          </div>
        )}

        <MethodSelector 
          selectedMethod={formData.method}
          onMethodChange={handleMethodChange}
        />

        <MethodFields
          method={formData.method}
          formData={formData}
          onChange={handleChange}
          errors={fieldErrors}
        />

        {formData.method && (
          <div className="card">
            <h3 className="font-bold text-coffee-900 mb-2">Calculated Ratio</h3>
            <div className="text-2xl font-semibold text-coffee-800">
              {calculateRatio(formData.method, formData).value}
            </div>
            <div className="text-xs text-coffee-600">
              {BREW_METHODS[formData.method]?.ratioLabel}
            </div>
          </div>
        )}

        <div className="card">
          <h3 className="font-bold text-coffee-900 mb-2">Taste Feedback *</h3>
          <p className="text-sm text-coffee-600 mb-4">Select all that apply. This is crucial for AI suggestions.</p>
          <div className="grid grid-cols-2 gap-3">
            {TASTE_OPTIONS.map(option => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  const currentTastes = formData.taste || [];
                  const isSelected = currentTastes.includes(option.value);
                  const newTastes = isSelected 
                    ? currentTastes.filter(t => t !== option.value)
                    : [...currentTastes, option.value];
                  handleChange('taste', newTastes);
                }}
                className={`p-4 rounded-xl border-2 transition-all text-sm font-semibold text-center ${
                  formData.taste.includes(option.value)
                    ? 'bg-coffee-800 text-white border-coffee-800 shadow-lg'
                    : 'bg-white text-coffee-800 border-cream-400 hover:border-coffee-400 hover:shadow-md'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="font-bold text-coffee-900 mb-2">Notes (Optional)</h3>
          <textarea
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            placeholder="E.g., pre-infusion time, specific water used, etc."
            rows={4}
            className="input-field resize-none"
          />
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={() => navigate(`/bean/${beanId}`)}
            className="flex-1 btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving || !formData.taste || formData.taste.length === 0}
            className="flex-1 btn-primary"
          >
            {saving ? 'Saving...' : 'Save Brew'}
          </button>
        </div>

        {isOnboarding && (
          <div className="text-center mt-4">
            <button 
              onClick={() => navigate('/')} 
              className="text-sm text-coffee-600 hover:text-coffee-800"
            >
              I'll do this later
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default BrewForm;
