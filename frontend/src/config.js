// This will automatically point to the Render backend in production 
// if you set VITE_API_URL in Vercel's environment variables.
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005';
