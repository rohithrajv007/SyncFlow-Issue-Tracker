import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Our backend's base URL
});

export default api;