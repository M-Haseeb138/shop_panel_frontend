// src/config.js
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://cultural-marketplace-backend-npv2.vercel.app/api';
export const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyCcnrJzc_eila82oN703gCfCX60oQFzPVs';

console.log('🔧 Using Live Backend URL:', API_BASE_URL);
console.log('🗺️ Google Maps API Key loaded');