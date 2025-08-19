import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getBeans, deleteBean, getBrewsForBean, setOnboardingStatus } from '../utils/storage';
import AddBeanModal from './AddBeanModal';

const BeanList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [beans, setBeans] = useState([]);
  const [showAddBean, setShowAddBean] = useState(false);
  const [editingBean, setEditingBean] = useState(null);

  useEffect(() => {
    loadBeans();
    const params = new URLSearchParams(location.search);
    if (params.get('add') === 'true') {
      setShowAddBean(true);
    }
  }, [location.search]);

  const loadBeans = () => {
    const allBeans = getBeans();
    const beansWithStats = allBeans.map(bean => {
      const brews = getBrewsForBean(bean.id);
      return {
        ...bean,
        brewCount: brews.length,
        lastBrew: brews[0]?.createdAt
      };
    });
    setBeans(beansWithStats);
  };

  const handleDeleteBean = async (beanId, beanName) => {
    if (window.confirm(`Delete "${beanName}" and all its brew logs?`)) {
      try {
        await deleteBean(beanId);
        loadBeans();
      } catch (error) {
        console.error('Error deleting bean:', error);
      }
    }
  };

  const params = new URLSearchParams(location.search);
  const isOnboarding = params.get('onboarding') === 'true';

  const handleBeanSaved = (savedBean) => {
    setShowAddBean(false);
    setEditingBean(null);
    loadBeans();

    const params = new URLSearchParams(location.search);
    if (params.get('onboarding') === 'true' && savedBean) {
      setOnboardingStatus('completed');
      navigate(`/brew/new?beanId=${savedBean.id}&onboarding=true`);
    }
  };

  return (
    <div className="pb-20">
      <header className="p-6 bg-header-gradient">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-coffee-900">Your Beans</h1>
            <p className="text-coffee-700">
              {beans.length} bean{beans.length !== 1 ? 's' : ''} in your collection
            </p>
          </div>
          <button
            onClick={() => setShowAddBean(true)}
            className="btn-primary"
          >
            + Add Bean
          </button>
        </div>
      </header>

      <div className="p-6">
        {beans.length === 0 ? (
        <div className="card text-center items-center flex flex-col py-12">
          <div className="text-6xl mb-4">☕</div>
          <h3 className="text-xl font-bold text-coffee-900 mb-2">
            No beans yet
          </h3>
          <p className="text-coffee-600 mb-6 max-w-xs">
            Start building your coffee collection by adding your first bean
          </p>
          <button
            onClick={() => setShowAddBean(true)}
            className="btn-primary"
          >
            Add Your First Bean
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {beans.map(bean => (
            <div key={bean.id} className="card">
              <div className="flex justify-between items-start">
                <div 
                  className="flex-1 cursor-pointer"
                  onClick={() => navigate(`/bean/${bean.id}`)}
                >
                  <h3 className="font-bold text-lg text-coffee-900 mb-1">
                    {bean.name}
                  </h3>
                  <div className="text-sm text-coffee-600 space-y-1">
                    {bean.origin && (
                      <p><span className="capitalize">{bean.origin}</span> • {bean.roastLevel} roast</p>
                    )}
                    <p className="text-xs text-coffee-500">
                      {bean.brewCount} brew{bean.brewCount !== 1 ? 's' : ''}
                      {bean.lastBrew && (
                        <> • Last: {new Date(bean.lastBrew).toLocaleDateString()}</>
                      )}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => setEditingBean(bean)}
                    className="text-xl text-coffee-500 hover:text-coffee-700 transition-colors"
                    title="Edit bean"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDeleteBean(bean.id, bean.name)}
                    className="text-xl text-red-400 hover:text-red-600 transition-colors"
                    title="Delete bean"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      </div>

      {(showAddBean || editingBean) && (
        <AddBeanModal
          bean={editingBean}
          isOnboarding={isOnboarding}
          onClose={() => {
            setShowAddBean(false);
            setEditingBean(null);
            if (isOnboarding) {
              navigate('/');
            }
          }}
          onSave={handleBeanSaved}
        />
      )}
    </div>
  );
};

export default BeanList;
