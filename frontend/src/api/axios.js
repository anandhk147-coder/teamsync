import axios from 'axios';

let baseUrlEnv = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
if (baseUrlEnv && !baseUrlEnv.endsWith('/api')) {
  baseUrlEnv = `${baseUrlEnv}/api`;
}

const instance = axios.create({
  baseURL: baseUrlEnv,
});

instance.interceptors.request.use(
  (config) => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      const { token } = JSON.parse(userInfo);
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('userInfo');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default instance;
