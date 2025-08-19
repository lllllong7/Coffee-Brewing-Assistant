import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getBeans,
  getBrewsForBean,
  hasAnyBrew,
  getMostRecentBean,
  setLastIntent,
  setOnboardingStatus,
} from '../utils/storage';
import { getSuggestion } from '../services/aiSuggestions';
import NextBrewCard from './NextBrewCard';
import AddBeanModal from './AddBeanModal';

// --- State-specific Components ---

const EmptyState = ({ onAddBean, onRestartOnboarding }) => (
  <div className="card text-center items-center flex flex-col py-12">
    <div className="text-6xl mb-4">☕️</div>
    <h2 className="text-xl font-bold text-coffee-900 mb-2">Your coffee journey starts here.</h2>
    <p className="text-coffee-600 mb-6 max-w-xs">Add your first bean to begin logging brews and discovering AI-powered suggestions.</p>
    <button onClick={onAddBean} className="btn-primary w-full max-w-xs">
      Add Your First Bean
    </button>
    <button onClick={onRestartOnboarding} className="mt-4 text-sm text-coffee-500 hover:text-coffee-700 transition-colors">
      Restart onboarding
    </button>
  </div>
);

const PlaceholderState = ({ bean, onLogBrew }) => (
  <div className="card text-center items-center flex flex-col py-10">
    <div className="text-5xl mb-4">📝</div>
    <h2 className="text-xl font-bold text-coffee-900 mb-2">Log your first brew</h2>
    <p className="text-coffee-600 mb-6 max-w-xs">
      You've added <span className="font-semibold text-coffee-800">{bean.name}</span>. Now, let's log a brew to get tailored suggestions.
    </p>
    <button onClick={onLogBrew} className="btn-primary w-full max-w-xs">
      Log First Brew
    </button>
  </div>
);

// --- Main Home Component ---

const Home = () => {
  const navigate = useNavigate();
  const [homeState, setHomeState] = useState('loading'); // loading, empty, placeholder, normal
  const [suggestion, setSuggestion] = useState(null);
  const [suggestionBean, setSuggestionBean] = useState(null);
  const [loadingSuggestion, setLoadingSuggestion] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState('pourover');
  const [showAddBean, setShowAddBean] = useState(false);

  const loadSuggestion = useCallback(async (method) => {
    const currentMethod = method || selectedMethod;
    try {
      setLoadingSuggestion(true);
      setIsOffline(false);
      
      const mostRecentBean = getMostRecentBean();
      if (!mostRecentBean) return;

      setSuggestionBean(mostRecentBean);
      
      const brews = getBrewsForBean(mostRecentBean.id);
      const newSuggestion = await getSuggestion(brews, currentMethod, mostRecentBean.name);
      setSuggestion(newSuggestion);
      
    } catch (error) {
      console.error('Error loading suggestion:', error);
      setIsOffline(true);
      setSuggestion(await getSuggestion([], currentMethod)); // Fallback
    } finally {
      setLoadingSuggestion(false);
    }
  }, [selectedMethod]);

  const resolveHomeState = useCallback(async () => {
    setHomeState('loading');
    const beans = getBeans();
    const hasBrews = hasAnyBrew();

    if (beans.length === 0) {
      setHomeState('empty');
    } else if (!hasBrews) {
      const mostRecentBean = getMostRecentBean();
      setSuggestionBean(mostRecentBean);
      setHomeState('placeholder');
    } else {
      setHomeState('normal');
      await loadSuggestion(selectedMethod);
    }
  }, [loadSuggestion, selectedMethod]);

  useEffect(() => {
    resolveHomeState();
  }, [resolveHomeState]);

  const handleMethodChange = (newMethod) => {
    setSelectedMethod(newMethod);
    if (homeState === 'normal') {
      loadSuggestion(newMethod);
    }
  };

  const handleAddBeanClick = () => {
    setLastIntent('add_bean');
    setShowAddBean(true);
  };

  const handleBeanAdded = () => {
    setShowAddBean(false);
    resolveHomeState();
  };

  const handleLogFirstBrewClick = () => {
    if (!suggestionBean) return;
    setLastIntent('log_brew');
    navigate(`/brew/new?beanId=${suggestionBean.id}&method=pourover`);
  };

  const handleRestartOnboarding = () => {
    setOnboardingStatus('not-started');
    navigate('/onboarding');
  };

  const renderContent = () => {
    switch (homeState) {
      case 'loading':
        return <div className="text-center p-12 text-coffee-500">Loading your dashboard...</div>;
      case 'empty':
        return <EmptyState onAddBean={handleAddBeanClick} onRestartOnboarding={handleRestartOnboarding} />;
      case 'placeholder':
        return (
          <>
            <PlaceholderState bean={suggestionBean} onLogBrew={handleLogFirstBrewClick} />
            <div className="text-center mt-4">
              <button onClick={() => navigate('/beans')} className="text-sm text-coffee-600 hover:text-coffee-700">
                View all beans
              </button>
            </div>
          </>
        );
      case 'normal':
        return (
          <NextBrewCard
            bean={suggestionBean}
            suggestion={suggestion}
            loading={loadingSuggestion}
            onRefresh={() => loadSuggestion(selectedMethod)}
            isOffline={isOffline}
            selectedMethod={selectedMethod}
            onMethodChange={handleMethodChange}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="pb-20">
      <header className="p-6 bg-header-gradient">
        <div>
          <h1 className="text-3xl font-bold text-coffee-900">Dashboard</h1>
          <p className="text-coffee-700">Your daily brew, perfected.</p>
        </div>
        {/* Optional: Add a '...' menu here for 'Restart Onboarding' later */}
      </header>

      <div className="p-6">
        {renderContent()}
      </div>

      {showAddBean && (
        <AddBeanModal
          onClose={() => setShowAddBean(false)}
          onSave={handleBeanAdded}
        />
      )}
    </div>
  );
};

export default Home;
