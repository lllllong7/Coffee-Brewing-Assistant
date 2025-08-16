import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBeans, saveBrew, getBrewsForBean } from '../utils/storage';
import { COFFEE_TYPES, TASTE_OPTIONS, getSuggestion } from '../services/aiSuggestions';

const BrewForm = () => {
  const { beanId } = useParams();
  const navigate = useNavigate();
  const [bean, setBean] = useState(null);
  const [suggestion, setSuggestion] = useState(null);
  const [formData, setFormData] = useState({
    grindSize: 3,
    coffeeAmount: 18,
    waterAmount: 300,
    brewTime: 240,
    taste: '',
    coffeeType: 'espresso',
    notes: ''
  });
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
      
      // Load AI suggestion based on previous brews
      const previousBrews = getBrewsForBean(beanId).slice(0, 3);
      const newSuggestion = await getSuggestion(previousBrews, formData.coffeeType);
      setSuggestion(newSuggestion);
      
      // Apply suggestion to form
      if (newSuggestion) {
        const [coffeeRatio, waterRatio] = newSuggestion.ratio.split(':').map(r => parseFloat(r.trim()));
        const waterAmount = Math.round((formData.coffeeAmount / coffeeRatio) * waterRatio);
        
        setFormData(prev => ({
          ...prev,
          grindSize: newSuggestion.grindSize,
          waterAmount: waterAmount,
          brewTime: newSuggestion.brewTime
        }));
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.taste) {
      alert('Please select taste feedback');
      return;
    }

    try {
      setSaving(true);
      const brewData = {
        ...formData,
        beanId: beanId
      };
      await saveBrew(brewData);
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
    
    // Update water amount when coffee amount changes to maintain ratio
    if (field === 'coffeeAmount' && suggestion) {
      const [coffeeRatio, waterRatio] = suggestion.ratio.split(':').map(r => parseFloat(r.trim()));
      const newWaterAmount = Math.round((value / coffeeRatio) * waterRatio);
      setFormData(prev => ({ ...prev, waterAmount: newWaterAmount }));
    }
  };

  const handleCoffeeTypeChange = async (newType) => {
    setFormData(prev => ({ ...prev, coffeeType: newType }));
    
    // Get new suggestion for different coffee type
    try {
      const previousBrews = getBrewsForBean(beanId).slice(0, 3);
      const newSuggestion = await getSuggestion(previousBrews, newType);
      setSuggestion(newSuggestion);
      
      if (newSuggestion) {
        const [coffeeRatio, waterRatio] = newSuggestion.ratio.split(':').map(r => parseFloat(r.trim()));
        const waterAmount = Math.round((formData.coffeeAmount / coffeeRatio) * waterRatio);
        
        setFormData(prev => ({
          ...prev,
          grindSize: newSuggestion.grindSize,
          waterAmount: waterAmount,
          brewTime: newSuggestion.brewTime
        }));
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
    <div className="p-4 pb-20">
      <header className="mb-6">
        <button
          onClick={() => navigate(`/bean/${beanId}`)}
          className="text-coffee-600 hover:text-coffee-700 mb-3 flex items-center"
        >
          ← Back to {bean.name}
        </button>
        <h1 className="text-2xl font-bold text-coffee-900 mb-2">
          Log New Brew
        </h1>
        <p className="text-coffee-600">
          Record your brewing parameters and taste feedback
        </p>
      </header>

      {suggestion && (
        <div className="card mb-6 bg-coffee-50 border-coffee-300">
          <div className="flex items-center mb-3">
            <span className="text-lg mr-2">💡</span>
            <h3 className="font-medium text-coffee-900">AI Suggestion</h3>
          </div>
          <p className="text-sm text-coffee-700 mb-3">{suggestion.explanation}</p>
          <div className="text-xs text-coffee-600">
            Recommended: {suggestion.grindSize} grind • {suggestion.ratio} ratio • {suggestion.brewTime}s
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card">
          <h3 className="font-medium text-coffee-900 mb-4">Coffee Type</h3>
          <select
            value={formData.coffeeType}
            onChange={(e) => handleCoffeeTypeChange(e.target.value)}
            className="input-field"
          >
            {COFFEE_TYPES.map(type => (
              <option key={type} value={type} className="capitalize">
                {type.replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>

        <div className="card">
          <h3 className="font-medium text-coffee-900 mb-4">Brew Parameters</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-coffee-700 mb-2">
                Grind Size: {formData.grindSize}
              </label>
              <input
                type="range"
                min="1"
                max="6"
                step="0.1"
                value={formData.grindSize}
                onChange={(e) => handleChange('grindSize', parseFloat(e.target.value))}
                className="slider"
              />
              <div className="flex justify-between text-xs text-coffee-600 mt-1">
                <span>Fine</span>
                <span>Coarse</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-coffee-700 mb-2">
                  Coffee (grams)
                </label>
                <input
                  type="number"
                  value={formData.coffeeAmount}
                  onChange={(e) => handleChange('coffeeAmount', parseInt(e.target.value))}
                  min="5"
                  max="50"
                  className="input-field"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-coffee-700 mb-2">
                  Water (ml)
                </label>
                <input
                  type="number"
                  value={formData.waterAmount}
                  onChange={(e) => handleChange('waterAmount', parseInt(e.target.value))}
                  min="50"
                  max="1000"
                  className="input-field"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-coffee-700 mb-2">
                Brew Time: {formData.brewTime}s
              </label>
              <input
                type="range"
                min="15"
                max="480"
                step="5"
                value={formData.brewTime}
                onChange={(e) => handleChange('brewTime', parseInt(e.target.value))}
                className="slider"
              />
              <div className="flex justify-between text-xs text-coffee-600 mt-1">
                <span>15s</span>
                <span>8min</span>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="font-medium text-coffee-900 mb-4">Taste Feedback *</h3>
          <div className="grid grid-cols-2 gap-3">
            {TASTE_OPTIONS.map(option => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleChange('taste', option.value)}
                className={`p-3 rounded-lg border transition-colors text-sm font-medium ${
                  formData.taste === option.value
                    ? 'bg-coffee-700 text-white border-coffee-700'
                    : 'bg-white text-coffee-700 border-coffee-300 hover:border-coffee-500'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="font-medium text-coffee-900 mb-4">Notes (Optional)</h3>
          <textarea
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            placeholder="Additional notes about this brew..."
            rows={3}
            className="input-field resize-none"
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={() => navigate(`/bean/${beanId}`)}
            className="flex-1 btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving || !formData.taste}
            className="flex-1 btn-primary disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Brew'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BrewForm;
