const STORAGE_KEY = 'refuel_query_params';

export const saveQueryParams = () => {
  try {
    if (typeof window === 'undefined') return;
    
    const urlParams = new URLSearchParams(window.location.search);
    const params = {};
    
    if (urlParams.toString()) {
      urlParams.forEach((value, key) => {
        params[key] = value;
      });
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(params));
      console.log('✅ Parameters saved:', params);
    }
  } catch (error) {
    console.error('❌ Error saving parameters:', error);
  }
};

export const getStoredQueryParams = () => {
  try {
    if (typeof window === 'undefined') return '';
    
    const storedParams = localStorage.getItem(STORAGE_KEY);
    if (!storedParams) return '';
    
    const params = JSON.parse(storedParams);
    const urlParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      urlParams.append(key, value);
    });
    
    console.log('📦 Parameters retrieved:', params);
    return `?${urlParams.toString()}`;
  } catch (error) {
    console.error('❌ Error retrieving parameters:', error);
    return '';
  }
};

export const buildRedirectUrl = (baseUrl) => {
  const queryParams = getStoredQueryParams();
  const finalUrl = `${baseUrl}${queryParams}`;
  console.log('🔄 Redirect URL:', finalUrl);
  return finalUrl;
}; 