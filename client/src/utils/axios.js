import axios from 'axios';

const instance = axios.create({
  withCredentials: true,
  baseURL: window.process.env.apiUrl,
  headers: { 'Content-Type': 'application/json' }
});

export default instance;