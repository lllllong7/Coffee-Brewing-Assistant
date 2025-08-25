import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getBeans, getBrewsForBean, deleteBean, deleteBrew, getBeanSuggestion, migrateBrewData } from '../utils/storage';
import { getSuggestion, migrateBrewMethod, BREW_METHODS } from '../services/aiSuggestions';
import NextBrewCard from './NextBrewCard';
import BrewForm from './BrewForm';

const BeanProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [bean, setBean] = useState(null);
  const [brews, setBrews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [suggestion, setSuggestion] = useState(null);
  const [suggestionLoading, setSuggestionLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState('pourover');

  useEffect(() => {
    loadBeanData();
  }, [id, location.key]);

  const loadBeanData = async () => {
    try {
      const allBeans = getBeans();
      const currentBean = allBeans.find(b => b.id === id);
      
      if (!currentBean) {
        navigate('/beans');
        return;
      }

      // Migrate legacy data first
      const migratedBrews = migrateBrewData();
      const beanBrews = migratedBrews.filter(brew => brew.beanId === id);
      
      // Determine the most recent method used
      let initialMethod = 'pourover';
      if (beanBrews.length > 0) {
        initialMethod = beanBrews[0].method || migrateBrewMethod(beanBrews[0].brewMethod || beanBrews[0].coffeeType);
      }
      setSelectedMethod(initialMethod);
      
      setBean(currentBean);
      setBrews(beanBrews);
      
      // Load AI suggestion for this bean
      await loadBeanSuggestion(currentBean, beanBrews, initialMethod);
    } catch (error) {
      console.error('Error loading bean data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMethodChange = (newMethod) => {
    setSelectedMethod(newMethod);
    loadBeanSuggestion(bean, brews, newMethod);
  };

  const loadBeanSuggestion = async (beanData, beanBrews, method = selectedMethod) => {
    setSuggestionLoading(true);
    setIsOffline(false);

    try {
      // Immediately show cached suggestion if available
      const cachedSuggestion = getBeanSuggestion(beanData.id, method);
      if (cachedSuggestion) {
        setSuggestion(cachedSuggestion);
      } else {
        // If no cache, clear previous suggestion to prevent showing stale data
        setSuggestion(null);
      }

      // Always try to fetch a fresh suggestion
      const methodBrews = beanBrews.filter(brew => 
        (brew.method || migrateBrewMethod(brew.brewMethod || brew.coffeeType)) === method
      );

      let newSuggestion;
      if (methodBrews.length > 0) {
        const recentBrews = methodBrews.slice(0, 5);
        newSuggestion = await getSuggestion(recentBrews, method, beanData.name);
      } else {
        // No brews for this method, get a default suggestion
        newSuggestion = await getSuggestion([], method, beanData.name);
      }
      
      if (newSuggestion) {
        setSuggestion(newSuggestion);
      }

    } catch (error) {
      console.error('Error loading bean suggestion:', error);
      setIsOffline(true);
      
      // Use cached suggestion as fallback if API fails
      const cached = getBeanSuggestion(beanData.id, method);
      if (!suggestion && cached) {
        setSuggestion(cached);
      } else {
        // If no suggestion and no cache, try one last time for a default
        try {
          const fallbackSuggestion = await getSuggestion([], method, beanData.name);
          setSuggestion(fallbackSuggestion);
        } catch (fallbackError) {
          console.error('Fallback suggestion also failed:', fallbackError);
        }
      }
    } finally {
      setSuggestionLoading(false);
    }
  };


  const getTasteColor = (taste) => {
    const colors = {
      'too_bitter': 'text-red-500 bg-red-100',
      'too_sour': 'text-yellow-600 bg-yellow-100',
      'balanced': 'text-green-600 bg-green-100',
      'weak': 'text-blue-500 bg-blue-100',
      'strong': 'text-purple-500 bg-purple-100',
    };
    return colors[taste] || 'text-coffee-600 bg-coffee-100';
  };

  const getTasteLabel = (taste) => {
    const labels = {
      'too_bitter': 'Too Bitter',
      'too_sour': 'Too Sour',
      'balanced': 'Balanced',
      'weak': 'Too Weak',
      'strong': 'Too Strong'
    };
    return labels[taste] || taste;
  };

  // Normalize taste to an array for backward compatibility
  const asTasteArray = (taste) => Array.isArray(taste) ? taste : (taste ? [taste] : []);

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-cream-400 rounded w-3/4"></div>
          <div className="h-4 bg-cream-400 rounded w-1/2"></div>
          <div className="h-40 bg-cream-300 rounded-2xl mt-6"></div>
          <div className="h-24 bg-cream-300 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  if (!bean) {
    return (
      <div className="p-6">
        <div className="card text-center items-center flex flex-col py-12">
          <div className="text-6xl mb-4">🤔</div>
          <h2 className="text-xl font-bold text-coffee-900 mb-2">Bean Not Found</h2>
          <p className="text-coffee-600 mb-6 max-w-xs">We couldn't find that coffee bean. It may have been removed.</p>
          <button onClick={() => navigate('/beans')} className="btn-primary w-full max-w-xs">
            Back to My Beans
          </button>
        </div>
      </div>
    );
  }


    return (
    <div className="pb-20">
      <header className="p-6 bg-header-gradient relative">
        <button
          onClick={() => navigate('/beans')}
          className="absolute top-6 left-6 text-coffee-700 hover:text-coffee-900 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <div className="text-center pt-8">
          <h1 className="text-3xl font-bold text-coffee-900 mb-2">
            {bean.name}
          </h1>
          <div className="text-coffee-600 space-y-1">
            {bean.origin && <p>{bean.origin}</p>}
            {bean.roastLevel && <p className="capitalize">{bean.roastLevel} roast</p>}
            <p className="text-sm text-coffee-700">{brews.length} brew{brews.length !== 1 ? 's' : ''} logged</p>
          </div>
        </div>
      </header>

      <div className="p-6 space-y-6">
        {bean.notes && (
          <div className="card">
            <h3 className="font-bold text-coffee-900 mb-2">Roaster's Notes</h3>
            <p className="text-coffee-700">{bean.notes}</p>
          </div>
        )}

        <div>
          <NextBrewCard 
            bean={bean}
            suggestion={suggestion} 
            loading={suggestionLoading}
            onRefresh={() => loadBeanSuggestion(bean, brews, selectedMethod)}
            isOffline={isOffline}
            selectedMethod={selectedMethod}
            onMethodChange={handleMethodChange}
          />
        </div>

        <div>
          <button
            onClick={() => navigate(`/brew/new?beanId=${bean.id}`)}
            className="w-full btn-primary"
          >
            + Log New Brew
          </button>
        </div>

        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-coffee-900">Brew History</h3>
            <span className="text-sm text-coffee-600">{brews.length} total</span>
          </div>

          {brews.length === 0 ? (
            <div className="text-center py-10">
              <div className="text-5xl mb-4">📝</div>
              <h4 className="text-lg font-bold text-coffee-800 mb-2">No brews yet</h4>
              <p className="text-coffee-600 mb-6">Log your first brew to see your history here.</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto -mr-3 pr-3">
              {brews.map((brew, index) => (
                <div key={brew.id} className="border-b border-coffee-100 pb-4 last:border-b-0">
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-sm font-medium text-coffee-900">
                      Brew #{brews.length - index}
                    </div>
                    <div className="text-xs text-coffee-500">
                      {new Date(brew.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-coffee-600">Grind:</span> {brew.grindSize}
                    </div>
                    <div>
                      <span className="text-coffee-600">Time:</span> {brew.brewTime}s
                    </div>
                    <div>
                      <span className="text-coffee-600">Coffee:</span> {brew.coffeeAmount}g
                    </div>
                    <div>
                      <span className="text-coffee-600">Water:</span> {brew.waterAmount}ml
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 items-center">
                    {asTasteArray(brew.taste).map((t) => (
                      <span key={t} className={`px-2 py-1 rounded-full ${getTasteColor(t)} text-xs font-semibold`}>
                        {getTasteLabel(t)}
                      </span>
                    ))}
                    {brew.coffeeType && (
                      <span className="text-xs text-coffee-600 ml-2">
                        • {migrateBrewMethod(brew.coffeeType)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BeanProfile;
