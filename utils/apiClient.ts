import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'https://cmp2023.webmini.in/api/',
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
  },
});

export default apiClient; 