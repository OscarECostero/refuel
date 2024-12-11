const STORAGE_KEY = 'refuel_query_params';

const generatePayload = () => {
  const upperCase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowerCase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const allCharacters = upperCase + lowerCase + numbers;
  
  let result = '';
  result += upperCase.charAt(Math.floor(Math.random() * upperCase.length));
  result += lowerCase.charAt(Math.floor(Math.random() * lowerCase.length));
  result += numbers.charAt(Math.floor(Math.random() * numbers.length));
  
  for (let i = result.length; i < 12; i++) {
    result += allCharacters.charAt(Math.floor(Math.random() * allCharacters.length));
  }
  
  return result.split('').sort(() => Math.random() - 0.5).join('');
};

export const saveQueryParams = () => {
  try {
    if (typeof window === 'undefined') return;
    
    const urlParams = new URLSearchParams(window.location.search);
    const params = {};
    
    urlParams.forEach((value, key) => {
      params[key] = value;
    });
    
    params['afid'] = '1';
    params['payload'] = generatePayload();
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(params));
    console.log('✅ Parameters saved:', params);
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
    
    return `?${urlParams.toString()}`;
  } catch (error) {
    console.error('❌ Error retrieving parameters:', error);
    
    return '';
  }
};

export const buildRedirectUrl = (baseUrl) => {
  const queryParams = getStoredQueryParams();
  const finalUrl = `${baseUrl}${queryParams}`;

  return finalUrl;
}; 