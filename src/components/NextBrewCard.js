import React from 'react';

const NextBrewCard = ({ suggestion, loading, onRefresh, isOffline }) => {
  if (loading) {
    return (
      <div className="card">
        <div className="animate-pulse">
          <div className="h-4 bg-coffee-200 rounded w-3/4 mb-3"></div>
          <div className="space-y-3">
            <div className="h-3 bg-coffee-200 rounded"></div>
            <div className="h-3 bg-coffee-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!suggestion) {
    return (
      <div className="card text-center">
        <div className="text-4xl mb-3">☕</div>
        <h3 className="font-medium text-coffee-900 mb-2">No suggestions yet</h3>
        <p className="text-coffee-600 text-sm mb-4">
          Add some coffee beans and log a few brews to get AI-powered suggestions
        </p>
        <button onClick={onRefresh} className="btn-secondary">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-lg font-semibold text-coffee-900">
            Your Next Brew
          </h2>
          {isOffline && (
            <div className="text-xs text-amber-600 mt-1 flex items-center">
              <span className="mr-1">⚠️</span>
              Using offline suggestion
            </div>
          )}
        </div>
        <button
          onClick={onRefresh}
          className="text-coffee-600 hover:text-coffee-700 p-1"
          title="Refresh suggestions"
        >
          🔄
        </button>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-coffee-700">
              {suggestion.grindSize}
            </div>
            <div className="text-xs text-coffee-600 font-medium">
              Grind Size
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-coffee-700">
              {suggestion.ratio}
            </div>
            <div className="text-xs text-coffee-600 font-medium">
              Ratio
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-coffee-700">
              {suggestion.brewTime}s
            </div>
            <div className="text-xs text-coffee-600 font-medium">
              Brew Time
            </div>
          </div>
        </div>

        <div className="bg-coffee-50 rounded-lg p-3">
          <div className="text-xs font-medium text-coffee-700 mb-1">Why:</div>
          <p className="text-sm text-coffee-600">{suggestion.explanation}</p>
        </div>
      </div>
    </div>
  );
};

export default NextBrewCard;
