import { defineStore } from "pinia";
import { ref, computed } from "vue";
import {
  getLaunches,
  getRockets,
  getStarlink,
  getUpcomingLaunches,
} from "../api";

// Tipos para manejo de errores
interface ApiError {
  message: string;
  code?: string;
  details?: any;
  timestamp: Date;
}

interface LoadingState {
  isLoading: boolean;
  loadingMessage: string;
}

export const useSpacexStore = defineStore("spacex", () => {
  // state
  const launches = ref<any[]>([]);
  const rockets = ref<any[]>([]);
  const starlink = ref<any[]>([]);
  const upcomingLaunches = ref<any[]>([]);

  // Estados de carga individuales
  const loadingStates = ref<Record<string, LoadingState>>({
    launches: { isLoading: false, loadingMessage: 'Cargando lanzamientos...' },
    rockets: { isLoading: false, loadingMessage: 'Cargando cohetes...' },
    starlink: { isLoading: false, loadingMessage: 'Cargando satélites Starlink...' },
    upcomingLaunches: { isLoading: false, loadingMessage: 'Cargando próximos lanzamientos...' },
  });

  // Estados de error individuales
  const errors = ref<Record<string, ApiError | null>>({
    launches: null,
    rockets: null,
    starlink: null,
    upcomingLaunches: null,
  });

  // Estados globales (para compatibilidad)
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Cache individual por tipo de dato
  const lastFetchLaunches = ref<Date | null>(null);
  const lastFetchRockets = ref<Date | null>(null);
  const lastFetchStarlink = ref<Date | null>(null);
  const lastFetchUpcomingLaunches = ref<Date | null>(null);

  const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

  // Funciones helper para manejo de errores
  const createApiError = (err: any, context: string): ApiError => {
    let message = 'Error desconocido';
    let code = 'UNKNOWN_ERROR';
    let details = null;

    if (err?.response) {
      // Error de respuesta HTTP
      const status = err.response.status;
      code = `HTTP_${status}`;
      
      switch (status) {
        case 400:
          message = 'Solicitud inválida';
          break;
        case 401:
          message = 'No autorizado';
          break;
        case 403:
          message = 'Acceso denegado';
          break;
        case 404:
          message = 'Recurso no encontrado';
          break;
        case 429:
          message = 'Demasiadas solicitudes. Intenta más tarde';
          break;
        case 500:
          message = 'Error interno del servidor';
          break;
        case 502:
          message = 'Servicio no disponible';
          break;
        case 503:
          message = 'Servicio temporalmente no disponible';
          break;
        default:
          message = `Error del servidor (${status})`;
      }
      
      details = err.response.data;
    } else if (err?.request) {
      // Error de red
      message = 'Error de conexión. Verifica tu internet';
      code = 'NETWORK_ERROR';
    } else if (err?.message) {
      // Error personalizado
      message = err.message;
      code = err.code || 'CUSTOM_ERROR';
    }

    return {
      message: `${message} (${context})`,
      code,
      details,
      timestamp: new Date(),
    };
  };

  const setLoading = (key: string, isLoading: boolean, message?: string) => {
    loadingStates.value[key] = {
      isLoading,
      loadingMessage: message || loadingStates.value[key]?.loadingMessage || 'Cargando...'
    };
  };

  const setError = (key: string, error: ApiError | null) => {
    errors.value[key] = error;
  };

  const clearError = (key: string) => {
    errors.value[key] = null;
  };

  // Computed para verificar si cada tipo de dato está obsoleto
  const isLaunchesOutdated = computed(() => {
    if (!lastFetchLaunches.value) return true;
    return Date.now() - lastFetchLaunches.value.getTime() > CACHE_DURATION;
  });

  const isRocketsOutdated = computed(() => {
    if (!lastFetchRockets.value) return true;
    return Date.now() - lastFetchRockets.value.getTime() > CACHE_DURATION;
  });

  const isStarlinkOutdated = computed(() => {
    if (!lastFetchStarlink.value) return true;
    return Date.now() - lastFetchStarlink.value.getTime() > CACHE_DURATION;
  });

  const isUpcomingLaunchesOutdated = computed(() => {
    if (!lastFetchUpcomingLaunches.value) return true;
    return (
      Date.now() - lastFetchUpcomingLaunches.value.getTime() > CACHE_DURATION
    );
  });

  // Funtion to fetch the data
  const fetchAllData = async () => {
    isLoading.value = true;
    error.value = null;

    try {
      // make calls in parallel
      const [launchesData, rocketsData, starlinkData, upcomingData] =
        await Promise.all([
          getLaunches(),
          getRockets(),
          getStarlink(),
          getUpcomingLaunches(),
        ]);
      launches.value = launchesData;
      rockets.value = rocketsData;
      starlink.value = starlinkData;
      upcomingLaunches.value = upcomingData;
      lastFetchLaunches.value = new Date();
      lastFetchRockets.value = new Date();
      lastFetchStarlink.value = new Date();
      lastFetchUpcomingLaunches.value = new Date();
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "An unknown error occurred";
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const fetchRockets = async () => {
    if (!isRocketsOutdated.value && rockets.value.length > 0) {
      return rockets.value;
    }

    setLoading('rockets', true);
    clearError('rockets');

    try {
      const data = await getRockets();
      rockets.value = data;
      lastFetchRockets.value = new Date();
      clearError('rockets');
      return data;
    } catch (err) {
      const apiError = createApiError(err, 'cohetes');
      setError('rockets', apiError);
      throw apiError;
    } finally {
      setLoading('rockets', false);
    }
  };

  const fetchLaunches = async () => {
    if (!isLaunchesOutdated.value && launches.value.length > 0) {
      return launches.value;
    }

    setLoading('launches', true);
    clearError('launches');

    try {
      const data = await getLaunches();
      launches.value = data;
      lastFetchLaunches.value = new Date();
      clearError('launches');
      return data;
    } catch (err) {
      const apiError = createApiError(err, 'lanzamientos');
      setError('launches', apiError);
      throw apiError;
    } finally {
      setLoading('launches', false);
    }
  };

  const fetchStarlink = async () => {
    if (!isStarlinkOutdated.value && starlink.value.length > 0) {
      return starlink.value;
    }

    setLoading('starlink', true);
    clearError('starlink');

    try {
      const data = await getStarlink();
      starlink.value = data;
      lastFetchStarlink.value = new Date();
      clearError('starlink');
      return data;
    } catch (err) {
      const apiError = createApiError(err, 'satélites Starlink');
      setError('starlink', apiError);
      throw apiError;
    } finally {
      setLoading('starlink', false);
    }
  };

  const fetchUpcomingLaunches = async () => {
    if (
      !isUpcomingLaunchesOutdated.value &&
      upcomingLaunches.value.length > 0
    ) {
      return upcomingLaunches.value;
    }

    isLoading.value = true;
    error.value = null;

    try {
      const data = await getUpcomingLaunches();
      upcomingLaunches.value = data;
      lastFetchUpcomingLaunches.value = new Date();
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Error fetching upcoming launches";
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  // Helper functions para cargar solo lo necesario por vista
  const loadDashboardData = async () => {
    const promises = [];

    // Solo cargar si está obsoleto o vacío
    if (isLaunchesOutdated.value || launches.value.length === 0) {
      promises.push(fetchLaunches());
    }
    if (isRocketsOutdated.value || rockets.value.length === 0) {
      promises.push(fetchRockets());
    }
    if (isStarlinkOutdated.value || starlink.value.length === 0) {
      promises.push(fetchStarlink());
    }
    if (
      isUpcomingLaunchesOutdated.value ||
      upcomingLaunches.value.length === 0
    ) {
      promises.push(fetchUpcomingLaunches());
    }

    if (promises.length > 0) {
      await Promise.all(promises);
    }
  };

  const loadLaunchesRocketsData = async () => {
    const promises = [];

    if (isLaunchesOutdated.value || launches.value.length === 0) {
      promises.push(fetchLaunches());
    }
    if (isRocketsOutdated.value || rockets.value.length === 0) {
      promises.push(fetchRockets());
    }

    if (promises.length > 0) {
      await Promise.all(promises);
    }
  };

  const loadStarlinkData = async () => {
    if (isStarlinkOutdated.value || starlink.value.length === 0) {
      await fetchStarlink();
    }
  };

  const clearCache = () => {
    launches.value = [];
    rockets.value = [];
    starlink.value = [];
    upcomingLaunches.value = [];
    lastFetchLaunches.value = null;
    lastFetchRockets.value = null;
    lastFetchStarlink.value = null;
    lastFetchUpcomingLaunches.value = null;
    error.value = null;
    isLoading.value = false;
  };

  return {
    // state
    launches,
    rockets,
    starlink,
    upcomingLaunches,
    isLoading,
    error,
    lastFetchLaunches,
    lastFetchRockets,
    lastFetchStarlink,
    lastFetchUpcomingLaunches,

    // computed
    isLaunchesOutdated,
    isRocketsOutdated,
    isStarlinkOutdated,
    isUpcomingLaunchesOutdated,

    // actions
    fetchAllData,
    fetchRockets,
    fetchLaunches,
    fetchStarlink,
    fetchUpcomingLaunches,
    loadDashboardData,
    loadLaunchesRocketsData,
    loadStarlinkData,
    clearCache,
  };
});
