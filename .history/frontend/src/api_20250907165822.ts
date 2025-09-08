import axios, { AxiosError, AxiosResponse } from "axios";

// Crear instancia de axios con configuración base
export const api = axios.create({ 
  baseURL: "/api",
  timeout: 30000, // 30 segundos timeout
});

// Interceptor de respuesta para manejo global de errores
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Respuesta exitosa - no hacer nada
    return response;
  },
  (error: AxiosError) => {
    // Manejo global de errores
    console.error('API Error:', error);
    
    // Si es un error de red (sin respuesta del servidor)
    if (!error.response) {
      console.error('Network Error:', error.message);
      return Promise.reject({
        ...error,
        message: 'Error de conexión. Verifica tu conexión a internet.',
        code: 'NETWORK_ERROR'
      });
    }
    
    // Si es un error de respuesta HTTP
    const status = error.response.status;
    let userMessage = 'Error desconocido';
    
    switch (status) {
      case 400:
        userMessage = 'Solicitud inválida';
        break;
      case 401:
        userMessage = 'No autorizado';
        break;
      case 403:
        userMessage = 'Acceso denegado';
        break;
      case 404:
        userMessage = 'Recurso no encontrado';
        break;
      case 429:
        userMessage = 'Demasiadas solicitudes. Intenta más tarde';
        break;
      case 500:
        userMessage = 'Error interno del servidor';
        break;
      case 502:
        userMessage = 'Servicio no disponible';
        break;
      case 503:
        userMessage = 'Servicio temporalmente no disponible';
        break;
      default:
        userMessage = `Error del servidor (${status})`;
    }
    
    // Crear error mejorado
    const enhancedError = {
      ...error,
      message: userMessage,
      code: `HTTP_${status}`,
      originalStatus: status,
      originalData: error.response.data
    };
    
    return Promise.reject(enhancedError);
  }
);

// Interceptor de request para logging (opcional)
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Funciones de API con mejor manejo de errores
export const getLaunches = () => 
  api.get("/launches")
    .then((res) => res.data)
    .catch((error) => {
      console.error('Error fetching launches:', error);
      throw error;
    });

export const getRockets = () => 
  api.get("/rockets")
    .then((res) => res.data)
    .catch((error) => {
      console.error('Error fetching rockets:', error);
      throw error;
    });

export const getStarlink = () => 
  api.get("/starlink")
    .then((res) => res.data)
    .catch((error) => {
      console.error('Error fetching starlink:', error);
      throw error;
    });

export const getUpcomingLaunches = () =>
  api.get("/launches/upcoming")
    .then((res) => res.data)
    .catch((error) => {
      console.error('Error fetching upcoming launches:', error);
      throw error;
    });
