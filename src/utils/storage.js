// Local storage utilities for bean profiles and brew logs

const STORAGE_KEYS = {
  BEANS: 'coffee_beans',
  BREWS: 'coffee_brews'
};

// Bean profile operations
export const getBeans = () => {
  try {
    const beans = localStorage.getItem(STORAGE_KEYS.BEANS);
    return beans ? JSON.parse(beans) : [];
  } catch (error) {
    console.error('Error loading beans:', error);
    return [];
  }
};

export const saveBean = (bean) => {
  try {
    const beans = getBeans();
    const existingIndex = beans.findIndex(b => b.id === bean.id);
    
    if (existingIndex >= 0) {
      beans[existingIndex] = bean;
    } else {
      bean.id = Date.now().toString();
      bean.createdAt = new Date().toISOString();
      beans.push(bean);
    }
    
    localStorage.setItem(STORAGE_KEYS.BEANS, JSON.stringify(beans));
    return bean;
  } catch (error) {
    console.error('Error saving bean:', error);
    throw error;
  }
};

export const deleteBean = (beanId) => {
  try {
    const beans = getBeans();
    const filteredBeans = beans.filter(b => b.id !== beanId);
    localStorage.setItem(STORAGE_KEYS.BEANS, JSON.stringify(filteredBeans));
    
    // Also delete associated brews
    const brews = getBrews();
    const filteredBrews = brews.filter(b => b.beanId !== beanId);
    localStorage.setItem(STORAGE_KEYS.BREWS, JSON.stringify(filteredBrews));
  } catch (error) {
    console.error('Error deleting bean:', error);
    throw error;
  }
};

// Brew log operations
export const getBrews = () => {
  try {
    const brews = localStorage.getItem(STORAGE_KEYS.BREWS);
    return brews ? JSON.parse(brews) : [];
  } catch (error) {
    console.error('Error loading brews:', error);
    return [];
  }
};

export const getBrewsForBean = (beanId) => {
  const allBrews = getBrews();
  return allBrews.filter(brew => brew.beanId === beanId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

export const saveBrew = (brew) => {
  try {
    const brews = getBrews();
    brew.id = Date.now().toString();
    brew.createdAt = new Date().toISOString();
    brews.push(brew);
    
    localStorage.setItem(STORAGE_KEYS.BREWS, JSON.stringify(brews));
    return brew;
  } catch (error) {
    console.error('Error saving brew:', error);
    throw error;
  }
};

// Save AI suggestion for a bean with method-specific storage
export const saveBeanSuggestion = (beanId, suggestion, method = 'pourover') => {
  try {
    const beans = getBeans();
    const beanIndex = beans.findIndex(b => b.id === beanId);
    
    if (beanIndex >= 0) {
      // Initialize suggestions object if it doesn't exist
      if (!beans[beanIndex].suggestions) {
        beans[beanIndex].suggestions = {};
      }
      
      // Store suggestion by method
      beans[beanIndex].suggestions[method] = {
        ...suggestion,
        updatedAt: new Date().toISOString()
      };
      
      // Keep legacy suggestion for backward compatibility
      beans[beanIndex].suggestion = {
        ...suggestion,
        updatedAt: new Date().toISOString()
      };
      
      localStorage.setItem(STORAGE_KEYS.BEANS, JSON.stringify(beans));
      return beans[beanIndex];
    }
    
    throw new Error('Bean not found');
  } catch (error) {
    console.error('Error saving bean suggestion:', error);
    throw error;
  }
};

// Get AI suggestion for a bean and method
export const getBeanSuggestion = (beanId, method = 'pourover') => {
  try {
    const beans = getBeans();
    const bean = beans.find(b => b.id === beanId);
    
    if (!bean) return null;
    
    // Try method-specific suggestion first
    if (bean.suggestions && bean.suggestions[method]) {
      return bean.suggestions[method];
    }
    
    // Fall back to legacy suggestion
    return bean.suggestion || null;
  } catch (error) {
    console.error('Error getting bean suggestion:', error);
    return null;
  }
};

// Migration helper for existing brews
export const migrateBrewData = () => {
  try {
    const brews = getBrews();
    let migrated = false;
    
    const migratedBrews = brews.map(brew => {
      if (!brew.method && (brew.coffeeType || brew.brewMethod)) {
        // Migrate legacy coffee type to new method
        const legacyType = brew.coffeeType || brew.brewMethod;
        const newMethod = migrateBrewMethod(legacyType);
        
        migrated = true;
        return {
          ...brew,
          method: newMethod,
          // Migrate old fields to new structure if needed
          doseG: brew.coffeeAmount || brew.doseG,
          waterMl: brew.waterAmount || brew.waterMl,
          grindSize: brew.grindSize || 'medium',
          waterTempC: brew.waterTempC || 95,
          brewTimeSec: newMethod === 'espresso' || newMethod === 'pourover' ? 
            (brew.brewTime || brew.brewTimeSec || 240) : undefined,
          brewTimeMin: newMethod === 'frenchpress' || newMethod === 'mokapot' ? 
            (brew.brewTime ? Math.round(brew.brewTime / 60 * 10) / 10 : brew.brewTimeMin || 4) : undefined
        };
      }
      return brew;
    });
    
    if (migrated) {
      localStorage.setItem(STORAGE_KEYS.BREWS, JSON.stringify(migratedBrews));
      console.log('Migrated legacy brew data to new method structure');
    }
    
    return migratedBrews;
  } catch (error) {
    console.error('Error migrating brew data:', error);
    return getBrews();
  }
};

export const getRecentBrews = (limit = 5) => {
  const allBrews = getBrews();
  return allBrews
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, limit);
};
