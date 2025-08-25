import React from 'react';
import { BREW_METHODS } from '../services/aiSuggestions';

const MethodSelector = ({ selectedMethod, onMethodChange, className = '' }) => {
  const methods = Object.keys(BREW_METHODS);

  return (
    <div className={`card ${className}`}>
      <h3 className="font-medium text-coffee-900 mb-4">Brew Method</h3>
      <div className="grid grid-cols-2 gap-2">
        {methods.map(method => (
          <button
            key={method}
            type="button"
            onClick={() => onMethodChange(method)}
            className={`p-3 rounded-lg border transition-colors text-sm font-medium ${
              selectedMethod === method
                ? 'bg-coffee-700 text-white border-coffee-700'
                : 'bg-white text-coffee-700 border-coffee-300 hover:border-coffee-500'
            }`}
          >
            {BREW_METHODS[method].name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default MethodSelector;
