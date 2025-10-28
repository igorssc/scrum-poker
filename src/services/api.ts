import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

// Response interceptor para tratar erros globalmente
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Se o erro já foi tratado localmente (com try/catch que chama handleApiError),
    // não precisamos fazer nada aqui. O error será re-thrown para o código que fez a chamada.
    return Promise.reject(error);
  }
);

export default api;
