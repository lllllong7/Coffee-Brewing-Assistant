import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBeans, getBrewsForBean } from '../utils/storage';

const BeanProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [bean, setBean] = useState(null);
  const [brews, setBrews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBeanData();
  }, [id]);

  const loadBeanData = () => {
    try {
      const allBeans = getBeans();
      const currentBean = allBeans.find(b => b.id === id);
      
      if (!currentBean) {
        navigate('/beans');
        return;
      }

      const beanBrews = getBrewsForBean(id);
      setBean(currentBean);
      setBrews(beanBrews);
    } catch (error) {
      console.error('Error loading bean data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLastBrewParams = () => {
    if (brews.length === 0) return null;
    const lastBrew = brews[0];
    return {
      grindSize: lastBrew.grindSize,
      ratio: `${lastBrew.coffeeAmount}g : ${lastBrew.waterAmount}ml`,
      brewTime: `${lastBrew.brewTime}s`,
      taste: lastBrew.taste
    };
  };

  const getTasteColor = (taste) => {
    const colors = {
      'too_bitter': 'text-red-600',
      'too_sour': 'text-yellow-600',
      'balanced': 'text-green-600',
      'weak': 'text-blue-600',
      'strong': 'text-purple-600'
    };
    return colors[taste] || 'text-coffee-600';
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

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-coffee-200 rounded w-3/4"></div>
          <div className="h-4 bg-coffee-200 rounded w-1/2"></div>
          <div className="card">
            <div className="space-y-3">
              <div className="h-4 bg-coffee-200 rounded"></div>
              <div className="h-4 bg-coffee-200 rounded w-5/6"></div>
            </div>
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

  const lastBrewParams = getLastBrewParams();

  return (
    <div className="p-4 pb-20">
      <header className="mb-6">
        <button
          onClick={() => navigate('/beans')}
          className="text-coffee-600 hover:text-coffee-700 mb-3 flex items-center"
        >
          ← Back to Beans
        </button>
        <h1 className="text-2xl font-bold text-coffee-900 mb-2">
          {bean.name}
        </h1>
        <div className="text-coffee-600 space-y-1">
          {bean.origin && <p>{bean.origin}</p>}
          {bean.roastLevel && <p className="capitalize">{bean.roastLevel} roast</p>}
          <p className="text-sm">{brews.length} brew{brews.length !== 1 ? 's' : ''} logged</p>
        </div>
      </header>

      {bean.notes && (
        <div className="card mb-6">
          <h3 className="font-medium text-coffee-900 mb-2">Notes</h3>
          <p className="text-coffee-700 text-sm">{bean.notes}</p>
        </div>
      )}

      {lastBrewParams && (
        <div className="card mb-6">
          <h3 className="font-medium text-coffee-900 mb-4">Most Recent Brew</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <div className="text-lg font-semibold text-coffee-700">
                {lastBrewParams.grindSize}
              </div>
              <div className="text-xs text-coffee-600">Grind Size</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-coffee-700">
                {lastBrewParams.ratio}
              </div>
              <div className="text-xs text-coffee-600">Ratio</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-coffee-700">
                {lastBrewParams.brewTime}
              </div>
              <div className="text-xs text-coffee-600">Brew Time</div>
            </div>
            <div>
              <div className={`text-lg font-semibold ${getTasteColor(lastBrewParams.taste)}`}>
                {getTasteLabel(lastBrewParams.taste)}
              </div>
              <div className="text-xs text-coffee-600">Taste</div>
            </div>
          </div>
        </div>
      )}

      <div className="mb-6">
        <button
          onClick={() => navigate(`/brew/${bean.id}`)}
          className="w-full btn-primary"
        >
          Log New Brew with This Bean
        </button>
      </div>

      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium text-coffee-900">Brew History</h3>
          <span className="text-sm text-coffee-600">{brews.length} total</span>
        </div>

        {brews.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-3">📊</div>
            <p className="text-coffee-600 mb-4">No brews logged yet</p>
            <button
              onClick={() => navigate(`/brew/${bean.id}`)}
              className="btn-secondary"
            >
              Log Your First Brew
            </button>
          </div>
        ) : (
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {brews.map((brew, index) => (
              <div key={brew.id} className="border-l-2 border-coffee-200 pl-4 pb-3">
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
                <div className="mt-2">
                  <span className={`text-xs font-medium ${getTasteColor(brew.taste)}`}>
                    {getTasteLabel(brew.taste)}
                  </span>
                  {brew.coffeeType && (
                    <span className="text-xs text-coffee-600 ml-2">
                      • {brew.coffeeType}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BeanProfile;
