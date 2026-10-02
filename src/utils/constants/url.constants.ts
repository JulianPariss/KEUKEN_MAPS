export const BASE_URL = import.meta.env.VITE_API_URL || 'http://dev.epekuen.com.ar:9001';
export const PROXY_URL = import.meta.env.VITE_PROXY_URL || BASE_URL;
export const ENV: 'DEV' | 'PROD' = import.meta.env.MODE === 'production' ? 'PROD' : 'DEV';