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

// Save AI suggestion for a bean
export const saveBeanSuggestion = (beanId, suggestion) => {
  try {
    const beans = getBeans();
    const beanIndex = beans.findIndex(b => b.id === beanId);
    
    if (beanIndex >= 0) {
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

// Get AI suggestion for a bean
export const getBeanSuggestion = (beanId) => {
  try {
    const beans = getBeans();
    const bean = beans.find(b => b.id === beanId);
    return bean?.suggestion || null;
  } catch (error) {
    console.error('Error getting bean suggestion:', error);
    return null;
  }
};

export const getRecentBrews = (limit = 5) => {
  const allBrews = getBrews();
  return allBrews
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, limit);
};
