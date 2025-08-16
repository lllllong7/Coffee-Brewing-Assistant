import React from 'react';
import { BREW_METHODS, VALIDATION_RULES } from '../services/aiSuggestions';

const MethodFields = ({ method, formData, onChange, errors = {} }) => {
  const methodConfig = BREW_METHODS[method];
  if (!methodConfig) return null;

  const validateField = (field, value) => {
    const rules = VALIDATION_RULES[field];
    if (!rules) return null;

    if (field === 'grindSize' && rules.allowText) {
      // Allow text or numeric values for grind size
      if (typeof value === 'string' && isNaN(value)) return null;
      const numValue = parseFloat(value);
      if (numValue < rules.min || numValue > rules.max) {
        return `Suggested range: ${rules.min}-${rules.max}`;
      }
    } else if (rules.min !== undefined && rules.max !== undefined) {
      const methodRules = rules[method] || rules;
      const min = methodRules.min || rules.min;
      const max = methodRules.max || rules.max;
      
      if (value < min || value > max) {
        return `Recommended range: ${min}-${max} ${rules.unit || ''}`;
      }
    }
    return null;
  };

  const renderField = (field) => {
    const value = formData[field] || '';
    const error = errors[field] || validateField(field, value);
    
    switch (field) {
      case 'doseG':
        return (
          <div key={field}>
            <label className="block text-sm font-medium text-coffee-700 mb-2">
              Dose (g)
            </label>
            <input
              type="number"
              value={value}
              onChange={(e) => onChange(field, parseFloat(e.target.value) || 0)}
              min="5"
              max="40"
              step="0.1"
              className={`input-field ${error ? 'border-amber-400' : ''}`}
            />
            {error && <p className="text-xs text-amber-600 mt-1">{error}</p>}
          </div>
        );

      case 'yieldG':
        return (
          <div key={field}>
            <label className="block text-sm font-medium text-coffee-700 mb-2">
              Yield (g)
            </label>
            <input
              type="number"
              value={value}
              onChange={(e) => onChange(field, parseFloat(e.target.value) || 0)}
              min="10"
              max="70"
              step="0.1"
              className={`input-field ${error ? 'border-amber-400' : ''}`}
            />
            {error && <p className="text-xs text-amber-600 mt-1">{error}</p>}
          </div>
        );

      case 'waterMl':
        const waterRules = VALIDATION_RULES.waterMl[method];
        return (
          <div key={field}>
            <label className="block text-sm font-medium text-coffee-700 mb-2">
              Water (ml)
            </label>
            <input
              type="number"
              value={value}
              onChange={(e) => onChange(field, parseInt(e.target.value) || 0)}
              min={waterRules?.min || 50}
              max={waterRules?.max || 1000}
              className={`input-field ${error ? 'border-amber-400' : ''}`}
            />
            {error && <p className="text-xs text-amber-600 mt-1">{error}</p>}
          </div>
        );

      case 'grindSize':
        return (
          <div key={field}>
            <label className="block text-sm font-medium text-coffee-700 mb-2">
              Grind Size
            </label>
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(field, e.target.value)}
              placeholder="e.g., 20, fine, medium-coarse"
              className={`input-field ${error ? 'border-amber-400' : ''}`}
            />
            <p className="text-xs text-coffee-500 mt-1">Number or description (fine, medium, coarse)</p>
            {error && <p className="text-xs text-amber-600 mt-1">{error}</p>}
          </div>
        );

      case 'waterTempC':
        return (
          <div key={field}>
            <label className="block text-sm font-medium text-coffee-700 mb-2">
              Water Temperature (°C)
            </label>
            <input
              type="number"
              value={value}
              onChange={(e) => onChange(field, parseInt(e.target.value) || 0)}
              min="80"
              max="100"
              className={`input-field ${error ? 'border-amber-400' : ''}`}
            />
            {error && <p className="text-xs text-amber-600 mt-1">{error}</p>}
          </div>
        );

      case 'brewTimeSec':
        const timeSecRules = VALIDATION_RULES.brewTimeSec[method];
        return (
          <div key={field}>
            <label className="block text-sm font-medium text-coffee-700 mb-2">
              Brew Time (seconds)
            </label>
            <input
              type="number"
              value={value}
              onChange={(e) => onChange(field, parseInt(e.target.value) || 0)}
              min={timeSecRules?.min || 15}
              max={timeSecRules?.max || 480}
              className={`input-field ${error ? 'border-amber-400' : ''}`}
            />
            {error && <p className="text-xs text-amber-600 mt-1">{error}</p>}
          </div>
        );

      case 'brewTimeMin':
        const timeMinRules = VALIDATION_RULES.brewTimeMin[method];
        return (
          <div key={field}>
            <label className="block text-sm font-medium text-coffee-700 mb-2">
              Brew Time (minutes)
            </label>
            <input
              type="number"
              value={value}
              onChange={(e) => onChange(field, parseFloat(e.target.value) || 0)}
              min={timeMinRules?.min || 2}
              max={timeMinRules?.max || 8}
              step="0.5"
              className={`input-field ${error ? 'border-amber-400' : ''}`}
            />
            {error && <p className="text-xs text-amber-600 mt-1">{error}</p>}
          </div>
        );

      case 'pressureBar':
        return (
          <div key={field}>
            <label className="block text-sm font-medium text-coffee-700 mb-2">
              Pressure (bar) - Optional
            </label>
            <input
              type="number"
              value={value}
              onChange={(e) => onChange(field, parseFloat(e.target.value) || 0)}
              min="6"
              max="12"
              step="0.1"
              className={`input-field ${error ? 'border-amber-400' : ''}`}
            />
            {error && <p className="text-xs text-amber-600 mt-1">{error}</p>}
          </div>
        );

      case 'pouringNote':
        return (
          <div key={field} className="col-span-2">
            <label className="block text-sm font-medium text-coffee-700 mb-2">
              Pouring Instructions
            </label>
            <textarea
              value={value}
              onChange={(e) => onChange(field, e.target.value)}
              placeholder="e.g., Small pulses, bloom 30-45s"
              rows={2}
              className="input-field resize-none"
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="card">
      <h3 className="font-medium text-coffee-900 mb-4">
        {methodConfig.name} Parameters
      </h3>
      <div className="grid grid-cols-2 gap-4">
        {methodConfig.fields.map(field => renderField(field))}
      </div>
    </div>
  );
};

export default MethodFields;
