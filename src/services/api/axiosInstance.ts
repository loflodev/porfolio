import axios from 'axios';

export default axios.create({
  baseURL: '/',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

export const supabaseClient = axios.create({
  baseURL: import.meta.env.VITE_SUPABASE_URL,
  withCredentials: true,
});
