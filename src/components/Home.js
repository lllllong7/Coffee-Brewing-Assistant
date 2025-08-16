import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBeans, getRecentBrews } from '../utils/storage';
import { getSuggestion } from '../services/aiSuggestions';
import NextBrewCard from './NextBrewCard';
import AddBeanModal from './AddBeanModal';

const Home = () => {
  const navigate = useNavigate();
  const [suggestion, setSuggestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddBean, setShowAddBean] = useState(false);
  const [recentBeans, setRecentBeans] = useState([]);

  useEffect(() => {
    loadSuggestion();
    loadRecentBeans();
  }, []);

  const loadSuggestion = async () => {
    try {
      setLoading(true);
      const recentBrews = getRecentBrews(3);
      const newSuggestion = await getSuggestion(recentBrews, 'espresso');
      setSuggestion(newSuggestion);
    } catch (error) {
      console.error('Error loading suggestion:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRecentBeans = () => {
    const beans = getBeans();
    const recentBrews = getRecentBrews();
    
    // Get beans with recent activity
    const beansWithActivity = beans.map(bean => {
      const beanBrews = recentBrews.filter(brew => brew.beanId === bean.id);
      return {
        ...bean,
        lastBrew: beanBrews[0]?.createdAt || bean.createdAt,
        brewCount: beanBrews.length
      };
    }).sort((a, b) => new Date(b.lastBrew) - new Date(a.lastBrew));
    
    setRecentBeans(beansWithActivity.slice(0, 3));
  };

  const handleBeanAdded = () => {
    setShowAddBean(false);
    loadRecentBeans();
  };

  return (
    <div className="p-4 pb-20">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-coffee-900 mb-2">
          Your Next Brew
        </h1>
        <p className="text-coffee-600">
          AI-powered suggestions for better coffee
        </p>
      </header>

      <NextBrewCard 
        suggestion={suggestion} 
        loading={loading}
        onRefresh={loadSuggestion}
      />

      <div className="mt-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-coffee-900">Recent Beans</h2>
          <button
            onClick={() => navigate('/beans')}
            className="text-coffee-600 text-sm font-medium hover:text-coffee-700"
          >
            View All
          </button>
        </div>

        {recentBeans.length === 0 ? (
          <div className="card text-center py-8">
            <div className="text-4xl mb-3">☕</div>
            <h3 className="font-medium text-coffee-900 mb-2">No beans yet</h3>
            <p className="text-coffee-600 text-sm mb-4">
              Add your first coffee bean to start logging brews
            </p>
            <button
              onClick={() => setShowAddBean(true)}
              className="btn-primary"
            >
              + Add Bean
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {recentBeans.map(bean => (
                <div
                  key={bean.id}
                  onClick={() => navigate(`/bean/${bean.id}`)}
                  className="card hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-medium text-coffee-900">{bean.name}</h3>
                      <p className="text-sm text-coffee-600 mt-1">
                        {bean.origin && `${bean.origin} • `}
                        {bean.roastLevel && `${bean.roastLevel} roast`}
                      </p>
                      <p className="text-xs text-coffee-500 mt-2">
                        {bean.brewCount} brews • Last: {new Date(bean.lastBrew).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-2xl">☕</div>
                  </div>
                </div>
              ))}
            </div>
            
            <button
              onClick={() => setShowAddBean(true)}
              className="w-full mt-4 btn-secondary"
            >
              + Add New Bean
            </button>
          </>
        )}
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
