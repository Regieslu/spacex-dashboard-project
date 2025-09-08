import axios, { AxiosError } from "axios";
import type { AxiosResponse } from "axios";

// Create axios instance with base configuration
export const api = axios.create({
  baseURL: "/api",
  timeout: 30000, // 30 segundos timeout
});

// Interceptor of response to handle global errors (if there is an error, it will be handled here)
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Successful response - do nothing and return the response
    return response;
  },
  (error: AxiosError) => {
    // Global error handling
    console.error("API Error:", error);

    // If it is a network error (no response from the server)
    if (!error.response) {
      console.error("Network Error:", error.message);
      return Promise.reject({
        ...error,
        message: "Connection error. Check your internet connection.",
        code: "NETWORK_ERROR",
      });
    }

    // If it is an HTTP response error
    const status = error.response.status;
    let userMessage = "Unknown error";

    switch (status) {
      case 400:
        userMessage = "Invalid request";
        break;
      case 401:
        userMessage = "Unauthorized";
        break;
      case 403:
        userMessage = "Access denied";
        break;
      case 404:
        userMessage = "Resource not found";
        break;
      case 429:
        userMessage = "Too many requests. Try again later";
        break;
      case 500:
        userMessage = "Internal server error";
        break;
      case 502:
        userMessage = "Service unavailable";
        break;
      case 503:
        userMessage = "Service temporarily unavailable";
        break;
      default:
        userMessage = `Server error (${status})`;
    }

    // Create enhanced error
    const enhancedError = {
      ...error,
      message: userMessage,
      code: `HTTP_${status}`,
      originalStatus: status,
      originalData: error.response.data,
    };

    return Promise.reject(enhancedError);
  }
);

// Interceptor of request for logging (optional)
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error("Request Error:", error);
    return Promise.reject(error);
  }
);

// API functions with better error handling
export const getLaunches = () =>
  api
    .get("/launches")
    .then((res) => res.data)
    .catch((error) => {
      console.error("Error fetching launches:", error);
      throw error;
    });

export const getRockets = () =>
  api
    .get("/rockets")
    .then((res) => res.data)
    .catch((error) => {
      console.error("Error fetching rockets:", error);
      throw error;
    });

export const getStarlink = () =>
  api
    .get("/starlink")
    .then((res) => res.data)
    .catch((error) => {
      console.error("Error fetching starlink:", error);
      throw error;
    });

export const getUpcomingLaunches = () =>
  api
    .get("/launches/upcoming")
    .then((res) => res.data)
    .catch((error) => {
      console.error("Error fetching upcoming launches:", error);
      throw error;
    });
